import { create } from 'zustand';
import { produce } from 'immer';
import { FormFieldType, FormRow } from '../formBuilder.types';
import { Language } from '../constants/locale';

interface FormState {
    formFields: FormRow[];
    past: FormRow[][];
    future: FormRow[][];
    selectedLanguage: Language;
    selectedField: FormFieldType | null;
    selectedFieldKeys: Set<string>; // Set to track selected field keys for multi-select functionality
    setFormFields: (fields: FormRow[]) => void;
    setSelectedLanguage: (language: Language) => void;
    setSelectedField: (field: FormFieldType) => void;
    updateSelectedFieldProperty: <T extends keyof FormFieldType>(key: T, value: FormFieldType[T]) => void;
    toggleSelectedFieldKey: (key: string) => void;
    setSelectedFieldKeys: (keys: Set<string>) => void;
    undo: () => void;
    redo: () => void;
    resetHistory: () => void;
    clearHistory: () => void;
    reset: () => void;
}

const MAX_HISTORY_SIZE = 100;

export const useFormBuilderStore = create<FormState>((set, get) => ({
    formFields: [],
    past: [],
    future: [],
    selectedLanguage: Language.EN, // Default language
    selectedField: null,
    selectedFieldKeys: new Set(),

    setFormFields: (newFields) => {
        const { formFields, past } = get();
        set(
            produce((state: FormState) => {
                state.formFields = newFields;
                if (past.length >= MAX_HISTORY_SIZE) {
                    state.past = past.slice(1);
                }
                state.past.push(formFields);
                state.future = [];
            })
        );
    },

    setSelectedLanguage: (language: Language) => {
        set({ selectedLanguage: language });
    },

    setSelectedField: (field: FormFieldType) => {
        set({ selectedField: field });
    },

    updateSelectedFieldProperty: <T extends keyof FormFieldType>(key: T, value: FormFieldType[T]) => {
        const { selectedField, formFields } = get();
        if (!selectedField) return; 

        const updatedField = { ...selectedField, [key]: value };

        // Helper function to recursively update fields in nested structures
        const updateFieldRecursively = (fields: FormFieldType[]): FormFieldType[] => {
            return fields.map((field) => {
                if (field.key === selectedField.key) {
                    return updatedField;
                }
                
                // If it's a group field, recursively update its nested fields
                if (field.variant === 'Group') {
                    const groupField = field as any; // FormGroupField type
                    if (groupField.fields && Array.isArray(groupField.fields)) {
                        const updatedGroupFields = groupField.fields.map((row: any) => ({
                            ...row,
                            fields: updateFieldRecursively(row.fields)
                        }));
                        
                        return {
                            ...field,
                            fields: updatedGroupFields
                        };
                    }
                }
                
                return field;
            });
        };

        const updatedFormFields = formFields.map((row) => ({
            ...row,
            fields: updateFieldRecursively(row.fields)
        }));

        set({
            selectedField: updatedField,
            formFields: updatedFormFields,
        });
    },

    toggleSelectedFieldKey: (key: string) => {
        const { selectedFieldKeys } = get();
        const newSelectedFieldKeys = new Set(selectedFieldKeys);

        if (newSelectedFieldKeys.has(key)) {
            newSelectedFieldKeys.delete(key); // Deselect if already selected
        } else {
            newSelectedFieldKeys.add(key); // Add key if not selected
        }

        set({ selectedFieldKeys: newSelectedFieldKeys });
    },
    setSelectedFieldKeys: (keys: Set<string>) => {
        set({ selectedFieldKeys: keys });
    },
    undo: () => {
        const { past, formFields, future } = get();
        if (past.length === 0) return;

        const previous = past[past.length - 1];
        set(
            produce((state: FormState) => {
                state.formFields = previous;
                state.past = past.slice(0, -1);
                state.future = [formFields, ...future];
            })
        );
    },

    redo: () => {
        const { past, formFields, future } = get();
        if (future.length === 0) return;

        const next = future[0];
        set(
            produce((state: FormState) => {
                state.formFields = next;
                state.past = [...past, formFields];
                state.future = future.slice(1);
            })
        );
    },

    resetHistory: () => set({ past: [], future: [] }),

    clearHistory: () => {
        const { formFields } = get();
        set({ past: [formFields], future: [] });
    },
    reset: () => set({
        formFields: [],
        past: [],
        future: [],
        selectedField: null,
        selectedFieldKeys: new Set(),
    })
}));
