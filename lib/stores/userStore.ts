import { create } from "zustand";
import { User } from "../validators/userSchema";

interface UserStore {
  userToEdit: User | null;
  setUserToEdit: (user: User | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userToEdit: null,
  setUserToEdit: (user) => set({ userToEdit: user }),
}));
