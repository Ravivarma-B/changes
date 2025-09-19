import { create } from "zustand";
import { UserGroup } from "../validators/userGroupSchema";

interface UserGroupState {
  userGroups: UserGroup[];
  setUserGroups: (data: UserGroup[]) => void;
}

export const useUserGroupsStore = create<UserGroupState>((set) => ({
  userGroups: [],
  setUserGroups: (data: UserGroup[]) => set({ userGroups: data }),
}));
