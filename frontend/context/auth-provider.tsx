'use client';

import { useEffect } from 'react';
import { parseJwt } from '../lib/jwt';
import { useAuthStore } from '../store/auth.store';
import { useOrgStore } from '../store/org.store';
import { useUserStore } from '../store/user.store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const clearAuth = useAuthStore((state) => state.clear);
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const setOrganizationId = useOrgStore((state) => state.setOrganizationId);
  const clearOrganization = useOrgStore((state) => state.clearOrganization);

  useEffect(() => {
    if (!accessToken) {
      clearUser();
      clearOrganization();
      return;
    }

    const payload = parseJwt(accessToken);
    if (!payload || payload.type !== 'access') {
      clearAuth();
      clearUser();
      clearOrganization();
      return;
    }

    setUser({
      id: payload.userId,
      email: payload.email,
      role: payload.role,
    });
    setOrganizationId(payload.organizationId);
  }, [
    accessToken,
    clearAuth,
    clearOrganization,
    clearUser,
    setOrganizationId,
    setUser,
  ]);

  return <>{children}</>;
}

