import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantContext {
  organizationId: string;
  userId?: string;
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ tenant?: TenantContext }>();
    return request.tenant;
  },
);
