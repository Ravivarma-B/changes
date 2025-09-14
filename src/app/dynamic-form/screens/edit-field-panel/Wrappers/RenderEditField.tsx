import React from "react";

import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";

import { fieldLabels } from "@/app/dynamic-form/constants/locale";
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
      kind: "input";
      id: string;
      labelKey: keyof typeof fieldLabels;
      tooltip?: string;
      getValue: FieldGetter<string>;
      setValue: FieldSetter<string>;
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "switch";
      id: string;
      labelKey: keyof typeof fieldLabels;
      tooltip?: string;
      getValue: SwitchGetter;
      setValue: SwitchSetter;
      condition?: (f: FormFieldType) => boolean;
    }
  | {
      kind: "select";
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
      kind: "custom";
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
      kind: "component";
      id: string;
      render: (
        f: FormFieldType,
        lang: string,
        updateField: UpdateFieldFn
      ) => React.ReactNode;
      condition?: (f: FormFieldType) => boolean;
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
          label={fieldLabels[schema.labelKey][lang]}
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
  }
}
