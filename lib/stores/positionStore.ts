import { Position } from "@/lib/validators/positionSchema";
import { create } from "zustand";

interface PositionStore {
  positionToEdit: Position | null;
  setPositionToEdit: (position: Position | null) => void;
}

export const usePositionStore = create<PositionStore>((set) => ({
  positionToEdit: null,
  setPositionToEdit: (position) => set({ positionToEdit: position }),
}));
