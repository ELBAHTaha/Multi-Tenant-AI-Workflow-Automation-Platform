'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OrgState { organizationId: string | null; setOrganizationId: (organizationId: string) => void; clearOrganization: () => void; }

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      organizationId: null,
      setOrganizationId: (organizationId) => set({ organizationId }),
      clearOrganization: () => set({ organizationId: null }),
    }),
    {
      name: 'org-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
