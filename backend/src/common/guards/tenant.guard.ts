import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // System admins can access everything
    if (user?.role === 'SYSTEM_ADMIN') {
      return true;
    }

    // Ensure user has a tenantId
    if (!user?.tenantId) {
      throw new ForbiddenException('No tenant associated with this user');
    }

    // If a tenantId is specified in params, verify it matches the user's tenant
    const paramTenantId = request.params?.tenantId;
    if (paramTenantId && paramTenantId !== user.tenantId) {
      throw new ForbiddenException('Access denied to this tenant');
    }

    return true;
  }
}
