import { LookupType } from "@/lib/validators/lookupSchema";
import { create } from "zustand";

interface LookupStore {
    lookupToEdit: LookupType | null;
    setLookupToEdit: (position: LookupType | null) => void;
}

export const useLookupStore = create<LookupStore>((set) => ({
    lookupToEdit: null,
    setLookupToEdit: (lookup) => set({ lookupToEdit: lookup }),
}));
