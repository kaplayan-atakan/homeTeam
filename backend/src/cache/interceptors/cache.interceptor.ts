import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiCacheStrategy } from '../strategies/api-cache.strategy';
import { CACHE_KEY_METADATA } from '../decorators/cache-key.decorator';
import { CACHE_TTL_METADATA } from '../decorators/cache-ttl.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly apiCacheStrategy: ApiCacheStrategy,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    // GET request'leri için cache kontrol et
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Cache key pattern'ini al
    const cacheKeyPattern = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      handler,
    );

    // TTL'yi al
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, handler);

    // Cache key oluştur
    const cacheKey = this.generateCacheKey(
      className,
      methodName,
      request,
      cacheKeyPattern,
    );

    try {
      // Cache'den veri kontrol et
      const cachedResult = await this.apiCacheStrategy.getCachedApiResponse(
        cacheKey,
        request.user?.id,
        this.extractParams(request),
      );

      if (cachedResult !== null) {
        this.logger.debug(`Cache HIT: ${cacheKey}`);
        return of(cachedResult);
      }

      this.logger.debug(`Cache MISS: ${cacheKey}`);

      // Cache miss, veriyi getir ve cache'le
      return next.handle().pipe(
        tap(async (result) => {
          if (result && result.success !== false) {
            await this.apiCacheStrategy.cacheApiResponse(
              cacheKey,
              result,
              {
                ttl: cacheTTL || this.apiCacheStrategy.getRecommendedTTL(cacheKey),
                byUser: this.shouldCacheByUser(request),
              },
              request.user?.id,
              this.extractParams(request),
            );
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache interceptor error for ${cacheKey}:`, error);
      // Cache hatası durumunda normal akışa devam et
      return next.handle();
    }
  }

  /**
   * Cache key oluştur
   */
  private generateCacheKey(
    className: string,
    methodName: string,
    request: any,
    pattern?: string,
  ): string {
    if (pattern) {
      // Pattern'de placeholder'ları değiştir
      return this.interpolatePattern(pattern, request);
    }

    // Default key format: ClassName.methodName
    return `${className}.${methodName}`;
  }

  /**
   * Pattern'deki placeholder'ları gerçek değerlerle değiştir
   */
  private interpolatePattern(pattern: string, request: any): string {
    let result = pattern;

    // URL parametrelerini değiştir: {id} -> request.params.id
    result = result.replace(/\{(\w+)\}/g, (match, paramName) => {
      return request.params?.[paramName] || match;
    });

    // Query parametrelerini değiştir: {query.page} -> request.query.page
    result = result.replace(/\{query\.(\w+)\}/g, (match, paramName) => {
      return request.query?.[paramName] || match;
    });

    // User ID'yi değiştir: {userId} -> request.user.id
    result = result.replace(/\{userId\}/g, request.user?.id || 'anonymous');

    return result;
  }

  /**
   * Request'ten parametreleri çıkar
   */
  private extractParams(request: any): any {
    return {
      params: request.params || {},
      query: request.query || {},
      headers: {
        'user-agent': request.headers['user-agent'],
        'accept-language': request.headers['accept-language'],
      },
    };
  }

  /**
   * User bazlı cache yapılıp yapılmayacağını belirle
   */
  private shouldCacheByUser(request: any): boolean {
    // Authorization header'ı varsa user bazlı cache yap
    return !!request.user?.id;
  }
}
