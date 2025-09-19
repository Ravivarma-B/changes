import { fieldLabels } from "@/components/dynamic-form/constants/locale";
import { FormFieldType } from "@/components/dynamic-form/formBuilder.types";
import DynamicRenderer from "@/components/shared/DynamicRenderer";
import { useState } from "react";
import { If, Then } from "react-if";
import { Button } from "web-utils-components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "web-utils-components/dialog";
import { Input } from "web-utils-components/input";
import { Label } from "web-utils-components/label";
import { Separator } from "web-utils-components/separator";
import { DropdownOptions } from "../DropdownOptions";
import { RenderTreeField } from "../RenderTreeField";
import { StylePanel } from "../StylePanel";
import { EditFieldSchema } from "../Wrappers/RenderEditField";
import { UpdateFieldFn } from "../Wrappers/types";

export interface PropComponentField extends FormFieldType {
  propComponent?: { name: string };
}

// ✅ General Fields
export const generalFields: EditFieldSchema[] = [
  {
    kind: "input",
    id: "name",
    labelKey: "name",
    tooltip: "Unique internal name",
    getValue: (f) => f.name,
    setValue: (val) => ({ name: val }),
  },
  {
    kind: "input",
    id: "label",
    labelKey: "label",
    tooltip: "Display label",
    getValue: (f, lang) => f.label?.[lang] || "",
    setValue: (val, f, lang) => ({
      label: { ...(f.label ?? {}), [lang]: val },
    }),
  },
  {
    kind: "switch",
    id: "showLabel",
    labelKey: "showLabel",
    tooltip: "Show label",
    getValue: (f) => f.showLabel ?? false,
    setValue: (val) => ({ showLabel: val }),
    condition: (f) => f.variant === "Input" && f.type !== "file",
  },
  {
    kind: "input",
    id: "description",
    labelKey: "description",
    tooltip: "Help text",
    getValue: (f, lang) => f.description?.[lang] || "",
    setValue: (val, f, lang) => ({
      description: { ...(f.description ?? {}), [lang]: val },
    }),
  },
  {
    kind: "input",
    id: "placeholder",
    labelKey: "placeholder",
    tooltip: "Placeholder text",
    getValue: (f, lang) => f.placeholder?.[lang] || "",
    setValue: (val, f, lang) => ({
      placeholder: { ...(f.placeholder ?? {}), [lang]: val },
    }),
  },

  {
    kind: "custom",
    id: "options",
    labelKey: "selectOption",
    tooltip: "Configure options",
    condition: (f) =>
      ["Combobox", "Multi Select", "Select", "RadioGroup"].includes(f.variant),
    render: (f: FormFieldType, lang: string, updateField: UpdateFieldFn) => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            {fieldLabels.selectOption[lang]}
          </Button>
        </DialogTrigger>
        <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7">
          <DialogTitle className="sr-only">Edit Options</DialogTitle>
          <DropdownOptions
            editedField={f}
            closePopover={() => {}}
            updateField={updateField}
            selectedLanguage={lang}
          />
        </DialogContent>
      </Dialog>
    ),
  },
  {
    kind: "component",
    id: "dataSource",
    condition: (f) => f.variant === "Tree",
    render: (f: FormFieldType, lang: string, updateField: UpdateFieldFn) => {
      return (
        <DynamicRenderer
          componentName={"TreeDataSource"}
          editField={f}
          updateField={updateField}
          apiUrl={"/api/admin/lookups/departments-tree"}
        />
      );
    },
  },
  {
    kind: "component",
    id: "tree",
    condition: (f) => f.variant === "Tree",
    render: (f: FormFieldType, lang: string, updateField: UpdateFieldFn) => {
      const [open, setOpen] = useState(false);

      return (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {fieldLabels.constructTree[lang]}
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7">
            <DialogTitle className="sr-only">Construct Tree</DialogTitle>
            <RenderTreeField
              editedField={f}
              updateField={updateField}
              selectedLanguage={lang}
              closePopover={() => setOpen(false)}
              saveListener={(data) => {
                updateField?.({ tree: data });
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      );
    },
  },
  {
    kind: "switch",
    id: "repeatable",
    labelKey: "repeatable",
    tooltip: "Repeatable",
    getValue: (f) => f.repeatable ?? false,
    setValue: (val) => ({ repeatable: val }),
    condition: (f) => f.variant !== "WYSIWYG",
  },
  {
    kind: "switch",
    id: "disabled",
    labelKey: "disabled",
    tooltip: "disabled",
    getValue: (f) => f.disabled ?? false,
    setValue: (val) => ({ disabled: val }),
    condition: (f) => f.variant !== "WYSIWYG",
  },
  {
    kind: "select",
    id: "type",
    labelKey: "type",
    tooltip: "type",
    placeholderKey: "selectField",
    getValue: (f) => f.type ?? false,
    setValue: (val) => ({ type: val }),
    condition: (f) => f.variant === "Input",
    options: [
      {
        value: "text",
        label: "Text",
      },
      {
        value: "email",
        label: "Email",
      },
      {
        value: "file",
        label: "File",
      },
      {
        value: "number",
        label: "Number",
      },
    ],
  },
];

// ✅ Appearance Fields
export const appearanceFields: EditFieldSchema[] = [
  {
    kind: "component",
    id: "fieldStyles",
    render: (f: FormFieldType, lang: string, updateField: UpdateFieldFn) => {
      return (
        <>
          <StylePanel
            label="Field Styles"
            value={f.className || ""}
            onChange={(value) => updateField({ className: value })}
            target="className"
          />

          <StylePanel
            label="Container Styles"
            value={f.containerClassName || ""}
            onChange={(value) => updateField({ containerClassName: value })}
            target="containerClassName"
          />
        </>
      );
    },
  },
  {
    kind: "select",
    id: "width",
    labelKey: "width",
    placeholderKey: "selectWidth",
    tooltip: "Stretch field to container width",
    getValue: (f) => f.width ?? false,
    setValue: (val) => ({ width: val }),
    options: [
      {
        value: "w-1/4",
        label: "25%",
      },
      {
        value: "w-1/3",
        label: "33%",
      },
      {
        value: "w-1/2",
        label: "50%",
      },
      {
        value: "w-2/3",
        label: "75%",
      },
      {
        value: "w-full",
        label: "100%",
      },
    ],
  },
  {
    kind: "switch",
    id: "visibility",
    labelKey: "visibility",
    tooltip: "Hide this field from view",
    getValue: (f) => f.hidden ?? false,
    setValue: (val) => ({ hidden: val }),
  },
];

export const validationFields: EditFieldSchema[] = [
  {
    kind: "switch",
    id: "required",
    labelKey: "required",
    tooltip: "Mark field as required",
    getValue: (f) => f.required ?? false,
    setValue: (val) => ({ required: val }),
  },
  {
    id: "validation-blocks",
    kind: "component",
    render: (f: FormFieldType, lang: string, updateField: UpdateFieldFn) => {
      return (
        <div className="space-y-4">
          {/* Min/Max for text/number/email */}
          <If
            condition={
              f?.variant === "Input" &&
              ["text", "number", "email"].includes(f.type ?? "")
            }
          >
            <Then>
              <div className="flex flex-col space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Min */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500 dark:text-gray-400">
                    {fieldLabels.min[lang]}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Input
                        id="min"
                        type="number"
                        placeholder={fieldLabels.minValue[lang]}
                        value={f.min ?? ""} // ✅ always string/number
                        onChange={(e) =>
                          updateField({
                            min: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Separator orientation="vertical" />
                      <Input
                        placeholder={fieldLabels.minValueErrorMsg[lang]}
                        value={f.errorMessages?.min?.[lang] ?? ""} // ✅ fallback
                        onChange={(e) =>
                          updateField({
                            errorMessages: {
                              ...f.errorMessages,
                              min: {
                                ...(f.errorMessages?.min ?? {}),
                                [lang]: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Max */}
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500 dark:text-gray-400">
                    {fieldLabels.max[lang]}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Input
                        id="max"
                        type="number"
                        placeholder={fieldLabels.maxValue[lang]}
                        value={f.max ?? ""} // ✅
                        onChange={(e) =>
                          updateField({
                            max: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Separator orientation="vertical" />
                      <Input
                        placeholder={fieldLabels.maxValueErrorMsg[lang]}
                        value={f.errorMessages?.max?.[lang] ?? ""} // ✅
                        onChange={(e) =>
                          updateField({
                            errorMessages: {
                              ...f.errorMessages,
                              max: {
                                ...(f.errorMessages?.max ?? {}),
                                [lang]: e.target.value,
                              },
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Then>
          </If>

          {/* Step for slider */}
          <If condition={f?.variant === "Slider"}>
            <Then>
              <div className="flex gap-4 items-center">
                <Label className="text-xs text-gray-500 dark:text-gray-400">
                  {fieldLabels.step[lang]}
                </Label>
                <Input
                  id="step"
                  type="number"
                  value={f.step ?? ""} // ✅
                  onChange={(e) =>
                    updateField({
                      step: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </Then>
          </If>

          {/* Required error message */}
          <If condition={f?.required}>
            <Then>
              <div className="space-y-1">
                <Input
                  placeholder={fieldLabels.requiredErrorMsg[lang]}
                  value={f.errorMessages?.required?.[lang] ?? ""} // ✅
                  onChange={(e) =>
                    updateField({
                      errorMessages: {
                        ...f.errorMessages,
                        required: {
                          ...(f.errorMessages?.required ?? {}),
                          [lang]: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </Then>
          </If>

          {/* Pattern + error message */}
          <If
            condition={
              (f?.variant === "Input" &&
                ["text", "number"].includes(f.type ?? "")) ||
              f?.variant === "Textarea"
            }
          >
            <Then>
              <div className="flex flex-col gap-1 space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <Label
                  htmlFor="pattern"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {fieldLabels.pattern[lang]}
                </Label>
                <Input
                  type="text"
                  id="pattern"
                  placeholder={fieldLabels.patternPlaceholder[lang] ?? ""}
                  value={f.pattern ?? ""} // ✅
                  onChange={(e) => {
                    updateField({ pattern: e.target.value });
                  }}
                />

                <Label
                  htmlFor="patternMessage"
                  className="text-xs text-gray-500 dark:text-gray-400"
                >
                  {fieldLabels.patternErrMessage[lang]}
                </Label>
                <Input
                  type="text"
                  id="patternMessage"
                  placeholder={fieldLabels.patternErrPlaceHolder[lang] ?? ""}
                  value={f.errorMessages?.pattern?.[lang] ?? ""} // ✅
                  onChange={(e) =>
                    updateField({
                      errorMessages: {
                        ...f.errorMessages,
                        pattern: {
                          ...(f.errorMessages?.pattern ?? {}),
                          [lang]: e.target.value,
                        },
                      },
                    })
                  }
                />
              </div>
            </Then>
          </If>
        </div>
      );
    },
  },
];
