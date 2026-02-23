import { SetMetadata } from '@nestjs/common';

export interface TenantResourceMetadata {
  type: 'workflow';
  idParam: string;
}

export const TENANT_RESOURCE_KEY = 'tenant_resource';
export const TenantResource = (metadata: TenantResourceMetadata): ReturnType<typeof SetMetadata> =>
  SetMetadata(TENANT_RESOURCE_KEY, metadata);
