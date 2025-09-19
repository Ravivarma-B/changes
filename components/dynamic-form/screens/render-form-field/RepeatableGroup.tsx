import { Button } from "web-utils-components/button";
import { FormGroupField, FormRow } from "@/components/dynamic-form/formBuilder.types";
import { Plus, Trash2 } from "lucide-react";
import { UseFormReturn, useFieldArray, useFormContext } from "react-hook-form";
import { renderFormFields } from "./index";
import { useEffect, useRef, useState } from "react";
import { cloneDeep } from "lodash";
import { cn } from "web-utils-common";

interface RepeatableFieldGroupProps {
  field: FormGroupField;
  form: UseFormReturn;
  language: string;
}

export const RepeatableFieldGroup: React.FC<RepeatableFieldGroupProps> = ({ field, form, language }) => {
  const { control } = useFormContext(); 
  const hasAppended = useRef(false); 

  const { fields, append, remove } = useFieldArray({
    control,
    name: field.name,
  });

  useEffect(() => {
    if (!hasAppended.current && fields.length === 0) {
      // Create an empty object representing one instance of the group
      // The actual field structure will be handled during rendering
      append({});
      hasAppended.current = true; 
    }
  }, [append, fields.length]);

  const handleAddMore = () => {
    // Add another empty group instance
    append({});
  };

  return (
    <div className={cn("space-y-4")}>
      {fields.map((_, index) => {
        const instanceNamePrefix = `${field.name}.${index}`;

        return (
          <div key={instanceNamePrefix} className={cn("relative group", field.className ?? '')}>
            {/* Add remove button */}
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="absolute right-0 -top-4 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

            {/* Render the group's nested rows */}
            {renderFormFields(
              field.fields.map((row: FormRow) => ({
                ...row,
                fields: row.fields.map((f) => ({
                  ...f,
                  name: `${instanceNamePrefix}.${f.name}`, // nested field name
                })),
              })),
              form,
              undefined,
              language
            )}
          </div>
        );
      })}

      <Button
        type="button"
        onClick={handleAddMore}
        className="flex gap-1"
      >
        <Plus className="h-4 w-4" /> <span>Add More</span>
      </Button>
    </div>
  );
};