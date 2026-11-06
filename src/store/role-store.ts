// skipHydration: rehydrated in the header after mount so SSR and first client render match
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "kam" | "customer";

type RoleState = { role: Role; setRole: (role: Role) => void };

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({ role: "kam", setRole: (role) => set({ role }) }),
    { name: "lvr-role", skipHydration: true },
  ),
);
