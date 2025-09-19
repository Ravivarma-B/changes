import React from "react";

import { FormFieldType } from "@/components/dynamic-form/formBuilder.types";

import { fieldLabels } from "@/components/dynamic-form/constants/locale";
import DynamicRenderer from "@/components/shared/DynamicRenderer";
import { EditField, InputField, SelectField, SwitchField } from "./EditField";
import {
  FieldGetter,
  FieldSetter,
  SelectGetter,
  SelectSetter,
  SwitchGetter,
  SwitchSetter,
  UpdateFieldFn,
} from "./types";

export type EditFieldSchema =
  | {
      kind: "input"; // Text input field
      id: string;
      labelKey: keyof typeof fieldLabels;
      tooltip?: string;
      getValue: FieldGetter<string>;
      setValue: FieldSetter<string>;
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "switch"; // Toggle switch
      id: string;
      labelKey: keyof typeof fieldLabels;
      tooltip?: string;
      getValue: SwitchGetter;
      setValue: SwitchSetter;
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "select"; //  Single select dropdown
      id: string;
      labelKey: keyof typeof fieldLabels;
      placeholderKey: keyof typeof fieldLabels;
      tooltip?: string;
      getValue: SelectGetter;
      setValue: SelectSetter;
      options: { value: string; label: string }[];
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "custom"; // Custom field with label wrapper
      id: string;
      labelKey: keyof typeof fieldLabels;
      tooltip?: string;
      render: (
        f: FormFieldType,
        lang: string,
        updateField: UpdateFieldFn
      ) => React.ReactNode;
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "component"; // Full custom component without label wrapper
      id: string;
      render: (
        f: FormFieldType,
        lang: string,
        updateField: UpdateFieldFn
      ) => React.ReactNode;
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "dynamic"; // Dynamically loaded component by name
      // The name should correspond to a registered dynamic component
      // in the DynamicRenderer system
      condition?: (f: FormFieldType) => boolean;
      id: string;
      name: string;
    };

export function renderEditField(
  schema: EditFieldSchema,
  f: FormFieldType,
  lang: string,
  updateField: UpdateFieldFn
) {
  switch (schema.kind) {
    case "input":
      if (schema.condition && !schema.condition(f)) return null;
      return (
        <InputField
          key={schema.id}
          id={schema.id}
          label={fieldLabels[schema.labelKey][lang]}
          tooltip={schema.tooltip}
          value={schema.getValue(f, lang)}
          onChange={(val) => updateField(schema.setValue(val, f, lang))}
        />
      );
    case "switch":
      if (schema.condition && !schema.condition(f)) return null;
      return (
        <SwitchField
          key={schema.id}
          id={schema.id}
          label={fieldLabels[schema.labelKey][lang]}
          tooltip={schema.tooltip}
          checked={schema.getValue(f)}
          onChange={(val) => updateField(schema.setValue(val, f), true)}
        />
      );
    case "select":
      if (schema.condition && !schema.condition(f)) return null;
      return (
        <SelectField
          key={schema.id}
          id={schema.id}
          label={fieldLabels[schema.labelKey][lang]}
          placeholder={fieldLabels[schema.placeholderKey][lang]}
          tooltip={schema.tooltip}
          value={schema.getValue(f)}
          onChange={(val) => updateField(schema.setValue(val, f), true)}
          options={schema.options}
        />
      );
    case "custom":
      if (schema.condition && !schema.condition(f)) return null;
      return (
        <EditField
          key={schema.id}
          id={schema.id}
          label={fieldLabels[schema.labelKey]?.[lang] || schema.labelKey}
          tooltip={schema.tooltip}
        >
          {schema.render(f, lang, updateField)}
        </EditField>
      );
    case "component":
      if (schema.condition && !schema.condition(f)) return null;
      return (
        <React.Fragment key={schema.id}>
          {schema.render(f, lang, updateField)}
        </React.Fragment>
      );
    case "dynamic":
      if (schema.condition && !schema.condition(f)) return null;
      return (
        <React.Fragment key={schema.id}>
          <DynamicRenderer
            componentName={schema.name}
            editField={f}
            updateField={updateField}
          />
        </React.Fragment>
      );
  }
}
