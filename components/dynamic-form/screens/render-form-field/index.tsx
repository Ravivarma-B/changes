import React from "react";
import { FormFieldType, FormRow } from "@/components/dynamic-form/formBuilder.types";
import { cn } from 'web-utils-common';
import { RepeatableField } from "./RepeatableField";
import { SingleFieldRenderer } from "./SingleField";
import { UseFormReturn } from "react-hook-form";
import { DEFAULT_LANGUAGE } from "../../constants/locale";
import { RepeatableFieldGroup } from "./RepeatableGroup";
import { SafeFormRow } from "./SafeFormRow";
import { SafeFieldContainer } from "./SafeFieldContainer";

export const renderFormFields = (
  rows: FormRow[],
  form: UseFormReturn,
  device?: string,
  language: string = DEFAULT_LANGUAGE
) => {
  const getResponsiveColSpan = (totalFields: number): string => {
    if (device === 'mobile') return 'w-full col-span-12'
    if (device === 'tablet' && totalFields > 3) return 'w-full @md:col-span-6'

    switch (totalFields) {
      case 2: return 'w-full @md:col-span-6 [@container(max-width:639px)]:col-span-12'
      case 3: return 'w-full @md:col-span-4 [@container(max-width:639px)]:col-span-12'
      case 4: return 'w-full col-span-3 [@container(max-width:1023px)]:col-span-6 [@container(max-width:639px)]:col-span-12'
      default: return 'w-full col-span-12'
    }
  }
  
  return rows.map((row, rowIndex) => (
    <SafeFormRow key={row.rowId ?? rowIndex} rowId={row.rowId} rowIndex={rowIndex}>
      {row.fields.map((field) => (
        <SafeFieldContainer
          key={field.key}
          fieldKey={field.key}
          className={cn(
            getResponsiveColSpan(row.fields.length),
            field.visibility ? '' : 'hidden',
            field.containerClassName?.trim() || undefined
          )}
        >
          {renderFormField(field, form, language)}
        </SafeFieldContainer>
      ))}
    </SafeFormRow>
  ));
}

export const renderFormField = (
  field: FormFieldType,
  form: UseFormReturn,
  language: string = DEFAULT_LANGUAGE,
  options: { skipRepeatable?: boolean } = {}
) => {
  if (field.variant === "Group") {
    if (field.repeatable && !options.skipRepeatable) {
      return <RepeatableFieldGroup key={field.name} field={field} form={form} language={language} />;
    } else {
      return renderFormFields(field.fields, form, undefined, language);
    }
  }

  if (field.repeatable && !options.skipRepeatable) {
    return <RepeatableField key={field.name} field={field} form={form} language={language} />;
  }

  return <SingleFieldRenderer key={field.name} field={field} form={form} language={language} />;
};