'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AppRole } from '../lib/jwt';

interface User { id: string; email: string; role: AppRole; }
interface UserState { user: User | null; setUser: (user: User) => void; clearUser: () => void; }

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
