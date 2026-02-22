'use client';

import { create } from 'zustand';

interface OrgState { organizationId: string | null; setOrganizationId: (organizationId: string) => void; clearOrganization: () => void; }

export const useOrgStore = create<OrgState>((set) => ({
  organizationId: null,
  setOrganizationId: (organizationId) => set({ organizationId }),
  clearOrganization: () => set({ organizationId: null }),
}));
