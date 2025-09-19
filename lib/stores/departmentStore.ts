import { create } from "zustand";
import { Department } from "../validators/departmentSchema";

interface DepartmentStore {
  departmentToEdit: Department | null;
  setDepartmentToEdit: (department: Department | null) => void;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departmentToEdit: null,
  setDepartmentToEdit: (department) => set({ departmentToEdit: department }),
}));
