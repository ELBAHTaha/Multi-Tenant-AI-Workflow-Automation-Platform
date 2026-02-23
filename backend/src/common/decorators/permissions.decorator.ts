import { SetMetadata } from '@nestjs/common';

export enum Permission {
  WORKFLOW_VIEW = 'workflow:view',
  WORKFLOW_CREATE = 'workflow:create',
  WORKFLOW_UPDATE = 'workflow:update',
  WORKFLOW_DELETE = 'workflow:delete',
  WORKFLOW_RUN = 'workflow:run',
}

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]): ReturnType<typeof SetMetadata> =>
  SetMetadata(PERMISSIONS_KEY, permissions);
