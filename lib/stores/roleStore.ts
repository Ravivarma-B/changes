import { Role } from "@/lib/validators/roleSchema";
import { create } from "zustand";

interface RoleStore {
  roleToEdit: Role | null;
  setRoleToEdit: (role: Role | null) => void;
}

export const useRoleStore = create<RoleStore>((set) => ({
  roleToEdit: null,
  setRoleToEdit: (role) => set({ roleToEdit: role }),
}));
