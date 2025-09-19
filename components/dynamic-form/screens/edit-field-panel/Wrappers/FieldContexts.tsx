import { FormFieldType } from "@/components/dynamic-form/formBuilder.types";
import React, { createContext, useContext } from "react";
import { UpdateFieldFn } from "./types";

const EditedFieldContext = createContext<FormFieldType | null>(null);
const UpdateFieldContext = createContext<UpdateFieldFn>(() => {});
const LangContext = createContext<string>("en");

export const useEditedField = (): FormFieldType => {
  const ctx = useContext(EditedFieldContext);
  if (!ctx) throw new Error("useEditedField must be used inside provider");
  return ctx;
};
export const useUpdateField = (): UpdateFieldFn =>
  useContext(UpdateFieldContext);
export const useLang = (): string => useContext(LangContext);

export const FieldProvider: React.FC<{
  field: FormFieldType;
  updateField: UpdateFieldFn;
  lang: string;
  children: React.ReactNode;
}> = ({ field, updateField, lang, children }) => (
  <EditedFieldContext.Provider value={field}>
    <UpdateFieldContext.Provider value={updateField}>
      <LangContext.Provider value={lang}>{children}</LangContext.Provider>
    </UpdateFieldContext.Provider>
  </EditedFieldContext.Provider>
);
