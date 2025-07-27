import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiCacheStrategy } from '../strategies/api-cache.strategy';

@Injectable()
export class CacheInvalidateInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInvalidateInterceptor.name);

  constructor(private readonly apiCacheStrategy: ApiCacheStrategy) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    // Sadece mutating operation'lar için cache invalidation yap
    if (!this.isMutatingOperation(request.method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (result) => {
        // Başarılı response'lar için cache invalidation yap
        if (result && result.success !== false) {
          await this.invalidateRelatedCaches(className, methodName, request);
        }
      }),
    );
  }

  /**
   * Mutating operation olup olmadığını kontrol et
   */
  private isMutatingOperation(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  /**
   * İlgili cache'leri invalidate et
   */
  private async invalidateRelatedCaches(
    className: string,
    methodName: string,
    request: any,
  ): Promise<void> {
    try {
      const userId = request.user?.id;
      const patterns = this.getInvalidationPatterns(className, methodName, request);

      for (const pattern of patterns) {
        if (pattern.includes('{userId}') && userId) {
          // User specific invalidation
          const userPattern = pattern.replace('{userId}', userId);
          await this.apiCacheStrategy.invalidateEndpoint(userPattern);
        } else {
          // General invalidation
          await this.apiCacheStrategy.invalidateEndpoint(pattern);
        }
      }

      this.logger.debug(
        `Cache invalidated for ${className}.${methodName}: ${patterns.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(
        `Cache invalidation error for ${className}.${methodName}:`,
        error,
      );
    }
  }

  /**
   * Controller ve method'a göre invalidation pattern'lerini belirle
   */
  private getInvalidationPatterns(
    className: string,
    methodName: string,
    request: any,
  ): string[] {
    const patterns: string[] = [];

    switch (className.toLowerCase()) {
      case 'userscontroller':
        patterns.push('UsersController.findAll');
        patterns.push('UsersController.findOne');
        if (request.user?.id) {
          patterns.push(`UsersController.findOne:${request.user.id}`);
        }
        break;

      case 'groupscontroller':
        patterns.push('GroupsController.findAll');
        patterns.push('GroupsController.findUserGroups');
        if (request.params?.id) {
          patterns.push(`GroupsController.findOne:${request.params.id}`);
        }
        if (request.user?.id) {
          patterns.push(`GroupsController.findUserGroups:${request.user.id}`);
        }
        break;

      case 'taskscontroller':
        patterns.push('TasksController.findAll');
        patterns.push('TasksController.findUserTasks');
        patterns.push('TasksController.findGroupTasks');
        if (request.params?.id) {
          patterns.push(`TasksController.findOne:${request.params.id}`);
        }
        if (request.user?.id) {
          patterns.push(`TasksController.findUserTasks:${request.user.id}`);
        }
        if (request.body?.groupId) {
          patterns.push(`TasksController.findGroupTasks:${request.body.groupId}`);
        }
        break;

      case 'notificationscontroller':
        patterns.push('NotificationsController.findAll');
        if (request.user?.id) {
          patterns.push(`NotificationsController.findUserNotifications:${request.user.id}`);
        }
        break;

      default:
        // Generic invalidation
        patterns.push(`${className}.findAll`);
        patterns.push(`${className}.findOne`);
        break;
    }

    return patterns;
  }
}
