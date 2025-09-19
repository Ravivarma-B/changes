import { DocumentType } from "@/lib/validators/documentTypeSchema";
import { create } from "zustand";

interface DocumentTypeStore {
  documentTypeToEdit: DocumentType | null;
  setDocumentTypeToEdit: (documentType: DocumentType | null) => void;
}

export const useDocumentTypeStore = create<DocumentTypeStore>((set) => ({
  documentTypeToEdit: null,
  setDocumentTypeToEdit: (documentType) =>
    set({ documentTypeToEdit: documentType }),
}));
