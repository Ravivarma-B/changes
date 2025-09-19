import { create } from "zustand";
import { Group } from "../validators/groupSchema";

interface GroupStore {
  groupToEdit: Group | null;
  setGroupToEdit: (group: Group | null) => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groupToEdit: null,
  setGroupToEdit: (group) => set({ groupToEdit: group }),
}));
