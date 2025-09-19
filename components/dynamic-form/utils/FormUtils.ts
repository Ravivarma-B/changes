import clsx, { ClassValue } from "clsx";
import { cloneDeep } from "lodash";
import { twMerge } from "tailwind-merge";
import { v7 as uuidv7 } from "uuid";
import { defaultFieldConfig } from "../constants";
import { DEFAULT_LANGUAGE } from "../constants/locale";
import { FormFieldType, FormRow } from "../formBuilder.types";
import {
  PanelPropOverride,
  PropOverride,
  userFieldConfig,
} from "../userConfigs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isNotEmpty = (value: string | undefined) =>
  value!.trim().length > 0;

export const generateUniqueId = () => {
  return (crypto.randomUUID && crypto.randomUUID()) || uuidv7();
};

export function createNewField(
  variant: string,
  rowIndex: number,
  fieldId?: string
): FormFieldType {
  const id = fieldId ?? Math.random().toString().slice(-10);
  const key = generateUniqueId();
  const newFieldName = `name_${id}`;

  const { label, description, placeholder } = defaultFieldConfig[variant] || {
    label: { en: "", ar: "" },
    description: { en: "", ar: "" },
    placeholder: { en: "", ar: "" },
  };

  return {
    key,
    checked: true,
    description: {
      en: description.en || "",
      ar: description.ar || "",
    },
    disabled: false,
    label: {
      en: label.en || newFieldName,
      ar: label.ar || newFieldName,
    },
    width: "w-full",
    showLabel: true,
    name: newFieldName,
    visibility: true,
    onChange: () => {},
    onSelect: () => {},
    placeholder: {
      en: placeholder?.en || "Placeholder",
      ar: placeholder?.ar || "Placeholder",
    },
    required: false,
    rowIndex,
    setValue: () => {},
    type: variant === "Input" ? "text" : "",
    value: "",
    variant,
    locale: DEFAULT_LANGUAGE,
    errorMessages: {},
    ...(variant === "Tree" && { tree: [] }),
  };
}

export function applyOverrides(
  field: FormFieldType,
  overrides?: Record<string, PropOverride | PanelPropOverride>
): FormFieldType {
  if (!overrides) return field;

  const newField = { ...field } as any;

  Object.entries(overrides).forEach(([prop, override]) => {
    if (override.type === "value") {
      newField[prop] = override.value;
    } else if (
      override.type === "component" &&
      override.component &&
      "panel" in override
    ) {
      newField._components = {
        ...(newField._components ?? {}),
        [prop]: { component: override.component, panel: override.panel },
      };
    }
  });

  return newField;
}

export function createNewFieldWithDynamicProps(
  variant: string,
  rowIndex: number,
  fieldId?: string
): FormFieldType | null {
  const id = fieldId ?? Math.random().toString().slice(-10);
  const key = generateUniqueId();
  const newFieldName = `name_${id}`;

  const { label, description, placeholder } = defaultFieldConfig[variant] || {
    label: { en: "", ar: "" },
    description: { en: "", ar: "" },
    placeholder: { en: "", ar: "" },
  };

  const variantConfig = userFieldConfig?.fields?.[variant.toLowerCase()];

  if (variantConfig?.enabled === false) {
    return null;
  }

  const baseField: FormFieldType = {
    key,
    checked: true,
    description: {
      en: description.en || "",
      ar: description.ar || "",
    },
    disabled: false,
    label: {
      en: label.en || newFieldName,
      ar: label.ar || newFieldName,
    },
    width: "w-full",
    showLabel: true,
    name: newFieldName,
    visibility: true,
    onChange: () => {},
    onSelect: () => {},
    placeholder: {
      en: placeholder?.en || "Placeholder",
      ar: placeholder?.ar || "Placeholder",
    },
    required: false,
    rowIndex,
    setValue: () => {},
    type: variant === "Input" ? "text" : "",
    value: "",
    variant,
    locale: DEFAULT_LANGUAGE,
    errorMessages: {},
    ...(variant === "Tree" && {
      tree: [],
      treeSettings: {
        editable: true,
        selectable: true,
        multiple: true,
        treeLines: true,
      },
    }),
  };

  const removeProps = [...(variantConfig?.removeProps ?? [])];
  removeProps.forEach((prop) => {
    delete (baseField as any)[prop];
  });

  console.log(
    "Base Field after applying overrides:",
    variantConfig?.overrides,
    applyOverrides(baseField, variantConfig?.overrides)._components
  );

  // ✅ Merge in user-defined dynamic props
  return applyOverrides(baseField, variantConfig?.overrides);
}

export const searchField = (
  rows: FormRow[],
  key: string
): FormFieldType | null => {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (let j = 0; j < row.fields.length; j++) {
      const field = row.fields[j];

      // Check if current field matches
      if (field.key === key) {
        return field;
      }

      // If it's a group field, search recursively within its nested fields
      if (field.variant === "Group") {
        const groupField = field as any; // FormGroupField type
        if (groupField.fields && Array.isArray(groupField.fields)) {
          const nestedResult = searchField(groupField.fields, key);
          if (nestedResult) {
            return nestedResult;
          }
        }
      }
    }
  }
  return null;
};

export const findFieldPath = (
  rows: FormRow[],
  key: string
): number[] | null => {
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    for (let fieldIndex = 0; fieldIndex < row.fields.length; fieldIndex++) {
      const field = row.fields[fieldIndex];

      // Check if current field matches
      if (field.key === key) {
        return [rowIndex, fieldIndex];
      }

      // If it's a group field, search recursively within its nested fields
      if (field.variant === "Group") {
        const groupField = field as any; // FormGroupField type
        if (groupField.fields && Array.isArray(groupField.fields)) {
          const nestedPath = findFieldPath(groupField.fields, key);
          if (nestedPath) {
            // Return path with group field location included
            return [rowIndex, fieldIndex, ...nestedPath];
          }
        }
      }
    }
  }
  return null;
};

export function appendFieldByRowIdRecursive(
  formBuilder: FormRow[],
  targetRowId: string,
  updateableField: FormFieldType,
  index: number,
  position?: string
): FormRow[] {
  return formBuilder.map((row) => {
    if (row.rowId === targetRowId) {
      const newRow = cloneDeep(row);
      const newColIndex =
        index === newRow.fields.length - 1 && position === "right"
          ? index + 1
          : index;
      newRow.fields.splice(newColIndex, 0, updateableField);
      return newRow;
    }

    const updatedFields = row.fields.map((field) => {
      if (field.variant === "Group" && "fields" in field) {
        return {
          ...field,
          fields: appendFieldByRowIdRecursive(
            field.fields,
            targetRowId,
            updateableField,
            index
          ),
        };
      }
      return field;
    });

    return { ...row, fields: updatedFields };
  });
}

export function removeFieldByKey(
  formBuilder: FormRow[],
  targetFieldKey: string
): FormRow[] {
  return formBuilder.map((row) => {
    const updatedFields = row.fields
      .map((field) => {
        if (field.variant === "Group" && "fields" in field) {
          return {
            ...field,
            fields: removeFieldByKey(field.fields, targetFieldKey),
          };
        }
        return field;
      })
      .filter((field) => field.key !== targetFieldKey); // remove match

    return { ...row, fields: updatedFields };
  });
}

export function updateFieldByKey(
  formRows: FormRow[],
  key: string,
  props: Partial<FormFieldType>
): FormRow[] {
  return formRows.map((row) => ({
    ...row,
    fields: row.fields.map((field) => {
      if (field.key === key) {
        // Replace field if the key matches
        return { ...field, ...props };
      }

      // Recursively update nested group fields
      if (field.variant === "Group" && Array.isArray(field.fields)) {
        return {
          ...field,
          fields: updateFieldByKey(field.fields, key, props),
        };
      }

      return field;
    }),
  }));
}

export function findFieldByKey(
  formRows: FormRow[],
  key: string
): FormFieldType | undefined {
  for (const row of formRows) {
    for (const field of row.fields) {
      // Found the field directly
      if (field.key === key) return field;

      // If it's a group, recursively search inside its nested rows
      if (field.variant === "Group" && Array.isArray(field.fields)) {
        const nestedResult = findFieldByKey(field.fields, key);
        if (nestedResult) return nestedResult;
      }
    }
  }

  return undefined; // not found
}

export function findRowById(
  formRows: FormRow[],
  targetRowId: string
): FormRow | undefined {
  for (const row of formRows) {
    if (row.rowId === targetRowId) {
      return row;
    }

    for (const field of row.fields) {
      if (field.variant === "Group" && Array.isArray(field.fields)) {
        const nestedRow = findRowById(field.fields, targetRowId);
        if (nestedRow) return nestedRow;
      }
    }
  }

  return undefined; // not found
}

export function insertRowBeforeRecursive(
  formRows: FormRow[],
  targetRowId: string,
  newRow: FormRow,
  position: string
): FormRow[] {
  function recursiveInsert(rows: FormRow[]): FormRow[] {
    const newRows: FormRow[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      if (row.rowId === targetRowId) {
        // Insert new row before the target row
        if (position === "above") newRows.push(newRow);
        newRows.push(row);
        if (position === "below") newRows.push(newRow);
      } else {
        newRows.push(row);
      }

      // Update nested groups in fields recursively
      const newFields = newRows[newRows.length - 1].fields.map((field) => {
        if (field.variant === "Group" && Array.isArray(field.fields)) {
          return {
            ...field,
            fields: recursiveInsert(field.fields),
          };
        }
        return field;
      });

      newRows[newRows.length - 1] = {
        ...newRows[newRows.length - 1],
        fields: newFields,
      };
    }

    return newRows;
  }

  return recursiveInsert(formRows);
}

export function disableAllFields(builder: FormRow[]): FormRow[] {
  return builder.map((row) => ({
    ...row,
    fields: row.fields.map((field) => {
      if (field.variant === "Group") {
        return {
          ...field,
          disabled: true,
          fields: disableAllFields(field.fields), // recursive
        };
      }
      return {
        ...field,
        disabled: true,
      };
    }),
  }));
}
