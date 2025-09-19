import { EntityType } from "@/lib/validators/entityTypeSchema";
import { create } from "zustand";

interface EntityTypeStore {
  entityTypeToEdit: EntityType | null;
  setEntityTypeToEdit: (entityType: EntityType | null) => void;
}

export const useEntityTypeStore = create<EntityTypeStore>((set) => ({
  entityTypeToEdit: null,
  setEntityTypeToEdit: (entityType) => set({ entityTypeToEdit: entityType }),
}));
