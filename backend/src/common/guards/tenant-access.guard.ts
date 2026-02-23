import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import {
  TENANT_RESOURCE_KEY,
  TenantResourceMetadata,
} from '../decorators/tenant-resource.decorator';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { organizationId: string };
      tenant?: { organizationId: string };
      params: Record<string, string>;
    }>();

    const userOrganizationId = request.user?.organizationId;
    const tenantOrganizationId = request.tenant?.organizationId;

    // Always require tenant context consistency for protected routes.
    if (
      !userOrganizationId ||
      !tenantOrganizationId ||
      userOrganizationId !== tenantOrganizationId
    ) {
      throw new ForbiddenException('Tenant context mismatch');
    }

    const resourceMetadata = this.reflector.getAllAndOverride<TenantResourceMetadata>(
      TENANT_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!resourceMetadata) {
      return true;
    }

    if (resourceMetadata.type === 'workflow') {
      const workflowId = request.params[resourceMetadata.idParam];
      if (!workflowId) {
        throw new NotFoundException('Workflow id is required');
      }

      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
        select: { organizationId: true },
      });

      if (!workflow) {
        throw new NotFoundException('Workflow not found');
      }

      if (workflow.organizationId !== userOrganizationId) {
        throw new ForbiddenException('Resource does not belong to tenant');
      }
    }

    return true;
  }
}
