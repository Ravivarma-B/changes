import { SegmentType } from "@/lib/validators/segmentTypeSchema";
import { create } from "zustand";

interface SegmentTypeStore {
  segmentTypeToEdit: SegmentType | null;
  setSegmentTypeToEdit: (segmentType: SegmentType | null) => void;
}

export const useSegmentTypeStore = create<SegmentTypeStore>((set) => ({
  segmentTypeToEdit: null,
  setSegmentTypeToEdit: (segmentType) =>
    set({ segmentTypeToEdit: segmentType }),
}));
