import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'ADMIN' | 'MEMBER'>): ReturnType<typeof SetMetadata> => SetMetadata(ROLES_KEY, roles);
