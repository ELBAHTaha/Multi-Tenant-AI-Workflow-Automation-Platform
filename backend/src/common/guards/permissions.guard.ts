import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY, Permission } from '../decorators/permissions.decorator';

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  ADMIN: new Set<Permission>([
    Permission.WORKFLOW_VIEW,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_UPDATE,
    Permission.WORKFLOW_DELETE,
    Permission.WORKFLOW_RUN,
  ]),
  MANAGER: new Set<Permission>([
    Permission.WORKFLOW_VIEW,
    Permission.WORKFLOW_CREATE,
    Permission.WORKFLOW_UPDATE,
    Permission.WORKFLOW_RUN,
  ]),
  MEMBER: new Set<Permission>([Permission.WORKFLOW_VIEW, Permission.WORKFLOW_RUN]),
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: { role?: Role } }>();
    const role = request.user?.role;

    if (!role || !ROLE_PERMISSIONS[role]) {
      throw new ForbiddenException('Missing role for permission check');
    }

    const rolePermissions = ROLE_PERMISSIONS[role];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      rolePermissions.has(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Missing required permission');
    }

    return true;
  }
}
