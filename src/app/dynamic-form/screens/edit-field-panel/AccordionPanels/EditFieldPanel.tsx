import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";
import { Accordion } from "@/app/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/app/ui/select";
import { Separator } from "@/app/ui/separator";
import { TooltipProvider } from "@/app/ui/tooltip";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getVariantIcon } from "../../../constants";
import { DEFAULT_LANGUAGE, Language } from "../../../constants/locale";
import { useFormBuilderStore } from "../../../store/formBuilder.store";
import { searchField } from "../../../utils/FormUtils";
import { FieldProvider } from "../Wrappers/FieldContexts";
import { useEditFieldUpdater } from "../hooks/useEditFieldUpdater";

import AppearancePanel from "./AppearancePanel";
import ConditionalLogicPanel from "./ConditionalLogicPanel";
import ConditionalPanel from "./ConditionalPanel";
import GeneralPanel from "./GeneralPanel";
import ValidationPanel from "./ValidationPanel";

const extractFields = (fields: FormFieldType[]): FormFieldType[] => {
  const result: FormFieldType[] = [];
  for (const field of fields) {
    result.push(field);
    if (field.variant === "Group") {
      const groupField = field as FormFieldType & {
        fields?: { fields: FormFieldType[] }[];
      };
      if (groupField.fields) {
        for (const row of groupField.fields) {
          if (row.fields) {
            result.push(...extractFields(row.fields));
          }
        }
      }
    }
  }
  return result;
};

export const EditFieldPanel: React.FC = () => {
  const formFields = useFormBuilderStore((s) => s.formFields);
  const selectedFieldFromStore = useFormBuilderStore((s) => s.selectedField);
  const selectedLanguage = useFormBuilderStore((s) => s.selectedLanguage);
  const setSelectedField = useFormBuilderStore((s) => s.setSelectedField);
  const updateSelectedFieldProperty = useFormBuilderStore(
    (s) => s.updateSelectedFieldProperty
  );

  const [editedField, setEditedField] = useState<FormFieldType | null>(
    selectedFieldFromStore ?? null
  );

  const isMountedRef = useRef(true);

  const { updateField: updater_updateField, flush } = useEditFieldUpdater(
    updateSelectedFieldProperty,
    500
  );

  const updateField = useCallback(
    (updates: Partial<FormFieldType>, immediate = false) => {
      setEditedField((prev: Partial<FormFieldType>) =>
        prev ? { ...prev, ...updates } : prev
      );
      updater_updateField(updates, immediate);
    },
    [updater_updateField]
  );

  const allFields: FormFieldType[] = useMemo(
    () => formFields.flatMap((row) => extractFields(row.fields)),
    [formFields]
  );

  useEffect(() => {
    if (!selectedFieldFromStore) {
      setEditedField(null);
      return;
    }

    setEditedField((prev: Partial<FormFieldType>) => {
      if (!prev || prev.key !== selectedFieldFromStore.key) {
        flush();
        return selectedFieldFromStore;
      }
      return prev;
    });
  }, [selectedFieldFromStore, flush]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      flush();
    };
  }, [flush]);

  const switchSelectedField = (fieldKey: string) => {
    flush();
    const field: FormFieldType | null = searchField(formFields, fieldKey);
    if (field) {
      setSelectedField(field);
    }
  };

  const VariantIcon = useMemo(() => {
    if (!editedField) return null;
    return getVariantIcon(editedField.variant);
  }, [editedField]);

  if (!editedField) {
    return <div className="p-4 text-sm text-gray-500">No field selected</div>;
  }

  return (
    <TooltipProvider>
      <div className="px-4">
        <div className="flex justify-between mt-4">
          <div className="space-y-4 w-full">
            <Select
              value={editedField.key}
              onValueChange={(value) => switchSelectedField(value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex gap-2 items-center">
                  {VariantIcon && <VariantIcon className="w-4 h-4" />}
                  {editedField.label[selectedLanguage ?? DEFAULT_LANGUAGE] ||
                    editedField.name}
                </div>
              </SelectTrigger>
              <SelectContent>
                {allFields.map((f) => {
                  const Icon = getVariantIcon(f.variant);
                  return (
                    <SelectItem
                      key={f.key}
                      value={f.key}
                      disabled={editedField.key === f.key}
                    >
                      <div className="flex gap-2 items-center">
                        {Icon && <Icon className="w-4 h-4" />}
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {f.label[selectedLanguage ?? DEFAULT_LANGUAGE] ||
                              f.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {f.variant}
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator className="my-2" />

        <div
          className="overflow-auto ltr:pr-4 rtl:pl-4 h-[calc(100vh-180px)]"
          dir={selectedLanguage === Language.AR ? "rtl" : "ltr"}
        >
          <Accordion type="multiple" defaultValue={["General"]}>
            <FieldProvider
              field={editedField}
              updateField={updateField}
              lang={selectedLanguage ?? DEFAULT_LANGUAGE}
            >
              <GeneralPanel />
              <AppearancePanel />
              {editedField.variant !== "WYSIWYG" && <ValidationPanel />}
              <ConditionalPanel allFields={allFields} />
              {editedField.variant !== "WYSIWYG" && <ConditionalLogicPanel />}
            </FieldProvider>
          </Accordion>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EditFieldPanel;
