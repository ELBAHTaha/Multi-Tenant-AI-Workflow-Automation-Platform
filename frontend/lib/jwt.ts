export type AppRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface JwtPayload {
  userId: string;
  email: string;
  role: AppRole;
  organizationId: string;
  type: 'access' | 'refresh';
  exp?: number;
  iat?: number;
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}
