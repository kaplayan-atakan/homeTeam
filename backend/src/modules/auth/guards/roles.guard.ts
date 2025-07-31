import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // Debug logging
    console.log('🔍 RolesGuard Debug:');
    console.log('   Required roles:', requiredRoles);
    console.log('   User role:', user?.role);
    console.log('   User object:', JSON.stringify(user, null, 2));
    
    if (!user || !user.role) {
      console.log('❌ User or user role is missing');
      return false;
    }
    
    const hasAccess = requiredRoles.some((role) => user.role === role);
    console.log('   Access granted:', hasAccess);
    
    return hasAccess;
  }
}
