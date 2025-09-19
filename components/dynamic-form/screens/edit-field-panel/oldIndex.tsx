import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";
import { ConditionalLogics } from "@/app/dynamic-form/screens/edit-field-panel/ConditionalLogics";
import ConditionClause from "@/app/dynamic-form/screens/edit-field-panel/ConditionClause";
import DynamicRenderer from "@/app/shared/DynamicRenderer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui/accordion";
import { Button } from "@/app/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/dialog";
import { Input } from "@/app/ui/input";
import { Label } from "@/app/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select"; // Import Select components
import { Separator } from "@/app/ui/separator";
import { Switch } from "@/app/ui/switch";
import { TooltipProvider } from "@/app/ui/tooltip";
import debounce from "lodash/debounce";
import {
  Braces,
  CircleCheckBig,
  EyeOff,
  Palette,
  Settings,
} from "lucide-react";
import { If, Then } from "react-if";
import { getVariantIcon } from "../../constants";
import {
  DEFAULT_LANGUAGE,
  fieldLabels,
  Language,
} from "../../constants/locale";
import { useFormBuilderStore } from "../../store/formBuilder.store";
import { searchField } from "../../utils/FormUtils";
import { DropdownOptions } from "./DropdownOptions";
import { LabelWithTooltip } from "./LabelWithTooltip";
import { RenderTreeField } from "./RenderTreeField";
import { StylePanel } from "./StylePanel";

export const EditFieldPanel: React.FC = () => {
  const {
    formFields,
    selectedField,
    selectedLanguage,
    setSelectedField,
    updateSelectedFieldProperty,
  } = useFormBuilderStore();
  const [editedField, setEditedField] = useState<FormFieldType | null>(null);
  const [fieldType, setFieldType] = useState<string>(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sourceDialogOpen, setSourceDialogOpen] = useState(false);
  const [logicsDialogOpen, setLogicsDialogOpen] = useState(false);

  // Ref to track pending updates for debouncing
  const pendingUpdatesRef = useRef<Partial<FormFieldType>>({});
  const isUpdatingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Create a debounced function to sync changes to the store
  const debouncedSyncToStore = useCallback(
    debounce(() => {
      if (
        Object.keys(pendingUpdatesRef.current).length > 0 &&
        !isUpdatingRef.current &&
        isMountedRef.current
      ) {
        isUpdatingRef.current = true;

        // Apply all pending updates to the store
        Object.entries(pendingUpdatesRef.current).forEach(([key, value]) => {
          updateSelectedFieldProperty(key, value);
        });

        // Clear pending updates
        pendingUpdatesRef.current = {};
        isUpdatingRef.current = false;
      }
    }, 500), // 500ms debounce delay
    [updateSelectedFieldProperty]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSyncToStore.cancel();
    };
  }, [debouncedSyncToStore]);

  const allFields = useMemo(() => {
    const extractFields = (fields: FormFieldType[]): FormFieldType[] => {
      const result: FormFieldType[] = [];

      for (const field of fields) {
        // Always add the field itself first (including Group fields)
        result.push(field);

        if (field.variant === "Group") {
          // For group fields, also recursively extract nested fields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const groupField = field as any; // FormGroupField type
          if (groupField.fields && Array.isArray(groupField.fields)) {
            // Recursively process nested rows and fields
            for (const row of groupField.fields) {
              if (row.fields && Array.isArray(row.fields)) {
                result.push(...extractFields(row.fields));
              }
            }
          }
        }
      }

      return result;
    };

    return formFields.flatMap((row) => extractFields(row.fields));
  }, [formFields]);

  useEffect(() => {
    let currentField: FormFieldType | null =
      editedField?.key !== selectedField?.key ? selectedField : editedField;

    // Sync any pending updates before switching fields
    if (
      Object.keys(pendingUpdatesRef.current).length > 0 &&
      editedField?.key !== selectedField?.key
    ) {
      // Schedule the update for the next tick to avoid render-time state updates
      setTimeout(() => {
        Object.entries(pendingUpdatesRef.current).forEach(([key, value]) => {
          updateSelectedFieldProperty(key, value);
        });
        pendingUpdatesRef.current = {};
      }, 0);
    }

    if (
      (selectedField === null && allFields.length > 0) ||
      (selectedField && !allFields.some((f) => f.key === selectedField.key))
    ) {
      currentField = allFields[0] as FormFieldType;
    }

    setEditedField(currentField);
    setFieldType(currentField?.type || "");
  }, [
    selectedField,
    formFields,
    allFields,
    editedField,
    updateSelectedFieldProperty,
  ]);

  // Cleanup effect to sync any remaining updates on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (Object.keys(pendingUpdatesRef.current).length > 0) {
        // Schedule cleanup for next tick to avoid render-time updates
        setTimeout(() => {
          if (isMountedRef.current) return; // Skip if component remounted

          Object.entries(pendingUpdatesRef.current).forEach(([key, value]) => {
            updateSelectedFieldProperty(key, value);
          });
        }, 0);
      }
    };
  }, [updateSelectedFieldProperty]);

  const VariantIcon = useMemo(() => {
    if (!editedField) return null;
    return getVariantIcon(editedField.variant);
  }, [editedField]);

  const updateField = (
    updates:
      | Partial<FormFieldType>
      | ((prev: FormFieldType) => Partial<FormFieldType>),
    immediate = false
  ) => {
    setEditedField((prev: FormFieldType | null) => {
      if (!prev) return prev;

      const newUpdates =
        typeof updates === "function" ? updates(prev) : updates;

      // Always update local state immediately for responsive UI
      const updatedField = { ...prev, ...newUpdates };

      if (immediate) {
        // For immediate updates (like switching between fields), schedule for next tick
        setTimeout(() => {
          if (!isMountedRef.current) return; // Skip if component unmounted

          Object.entries(newUpdates).forEach(([key, value]) => {
            updateSelectedFieldProperty(key, value);
          });
        }, 0);
      } else {
        // For text input updates, accumulate changes and debounce store updates
        Object.entries(newUpdates).forEach(([key, value]) => {
          pendingUpdatesRef.current[key] = value;
        });

        // Trigger debounced sync to store
        debouncedSyncToStore();
      }

      return updatedField;
    });
  };

  // Force sync any pending updates to the store
  const syncPendingUpdates = useCallback(() => {
    if (Object.keys(pendingUpdatesRef.current).length > 0) {
      // Use setTimeout to avoid render-time state updates
      setTimeout(() => {
        if (!isMountedRef.current) return; // Skip if component unmounted

        Object.entries(pendingUpdatesRef.current).forEach(([key, value]) => {
          updateSelectedFieldProperty(key, value);
        });
        pendingUpdatesRef.current = {};
        debouncedSyncToStore.cancel(); // Cancel any pending debounced calls
      }, 0);
    }
  }, [updateSelectedFieldProperty, debouncedSyncToStore]);

  const switchSelectedField = (fieldKey: string) => {
    // Sync any pending updates before switching
    syncPendingUpdates();

    const field = searchField(formFields, fieldKey);
    if (field) {
      setSelectedField(field);
    }
  };

  if (!editedField) return <div className="p-4">No field selected</div>;
  return (
    <TooltipProvider>
      <div className="px-4">
        <div className="flex justify-between mt-4">
          <div className="space-y-4 w-full">
            <Select
              value={editedField.conditionalRender?.field || ""}
              onValueChange={(value) => switchSelectedField(value)}
            >
              <SelectTrigger className="w-full">
                <div className="flex gap-2 items-center">
                  {VariantIcon && <VariantIcon className="w-4 h-4" />}
                  {editedField.label[selectedLanguage || DEFAULT_LANGUAGE] ||
                    editedField.name}
                </div>
              </SelectTrigger>
              <SelectContent>
                {allFields.map((f) => {
                  const Icon = getVariantIcon(f.variant);
                  return (
                    <SelectItem
                      key={f.name}
                      value={f.key}
                      disabled={editedField.key === f.key}
                    >
                      <div className="flex gap-2">
                        {Icon && <Icon className="w-4 h-4" />}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium">
                          {f.label[selectedLanguage || DEFAULT_LANGUAGE] ||
                            f.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {f.variant}
                        </span>
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
            <AccordionItem value="General">
              <AccordionTrigger className="overflow-x-hidden">
                <div className="flex gap-2 items-center">
                  <Settings className="w-4 h-4" />
                  <span className="font-normal text-sm">
                    {fieldLabels?.general[selectedLanguage ?? DEFAULT_LANGUAGE]}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <LabelWithTooltip
                      htmlFor="name"
                      className="text-xs text-gray-500 dark:text-gray-400"
                      tooltip="The internal name used for form data. Should be unique and contain no spaces."
                    >
                      {fieldLabels?.name[selectedLanguage ?? DEFAULT_LANGUAGE]}
                    </LabelWithTooltip>
                    <Input
                      id="name"
                      value={editedField.name}
                      onChange={(e) => updateField({ name: e.target.value })}
                      onBlur={syncPendingUpdates}
                    />
                  </div>
                  <div className="space-y-1">
                    <LabelWithTooltip
                      htmlFor="label"
                      className="text-xs text-gray-500 dark:text-gray-400"
                      tooltip="The display label shown to users. Can be different for each language."
                    >
                      {fieldLabels?.label[selectedLanguage ?? DEFAULT_LANGUAGE]}
                    </LabelWithTooltip>
                    <Input
                      id="label"
                      value={
                        editedField.label?.[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                      onChange={(e) =>
                        updateField({
                          label: {
                            ...editedField.label,
                            [selectedLanguage ?? DEFAULT_LANGUAGE]:
                              e.target.value,
                          },
                        })
                      }
                      onBlur={syncPendingUpdates}
                    />
                  </div>
                  <If
                    condition={
                      editedField.variant === "Input" &&
                      editedField.type !== "file"
                    }
                  >
                    <Then>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <LabelWithTooltip
                            htmlFor="showLabel"
                            className="text-xs text-gray-500 dark:text-gray-400"
                            tooltip="Controls whether the field label is displayed to users."
                          >
                            {
                              fieldLabels?.showLabel[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                          </LabelWithTooltip>
                          <Switch
                            id="showLabel"
                            checked={editedField.showLabel ?? false}
                            onCheckedChange={(checked) =>
                              updateField(
                                { showLabel: checked as boolean },
                                true
                              )
                            }
                            className="rtl:[&_[data-state=checked]>span]:translate-x-0"
                          />
                        </div>
                      </div>
                    </Then>
                  </If>

                  <div className="space-y-1">
                    <LabelWithTooltip
                      htmlFor="description"
                      className="text-xs text-gray-500 dark:text-gray-400"
                      tooltip="Optional help text displayed below the field to guide users."
                    >
                      {
                        fieldLabels?.description[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </LabelWithTooltip>
                    <Input
                      id="description"
                      value={
                        editedField.description?.[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ] || ""
                      }
                      onChange={(e) =>
                        updateField({
                          description: {
                            ...editedField.description,
                            [selectedLanguage ?? DEFAULT_LANGUAGE]:
                              e.target.value,
                          },
                        })
                      }
                      onBlur={syncPendingUpdates}
                    />
                  </div>
                  <div className="space-y-1">
                    <LabelWithTooltip
                      htmlFor="placeholder"
                      className="text-xs text-gray-500 dark:text-gray-400"
                      tooltip="Placeholder text shown inside the input field when empty."
                    >
                      {
                        fieldLabels?.placeholder[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </LabelWithTooltip>
                    <Input
                      id="placeholder"
                      value={
                        editedField.placeholder?.[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ] || ""
                      }
                      onChange={(e) =>
                        updateField({
                          placeholder: {
                            ...editedField.placeholder,
                            [selectedLanguage ?? DEFAULT_LANGUAGE]:
                              e.target.value,
                          },
                        })
                      }
                      onBlur={syncPendingUpdates}
                    />
                  </div>
                  <If
                    condition={[
                      "Combobox",
                      "Multi Select",
                      "Select",
                      "RadioGroup",
                    ].includes(editedField.variant)}
                  >
                    <Then>
                      <div className="space-y-2">
                        <Dialog
                          open={sourceDialogOpen}
                          onOpenChange={setSourceDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSourceDialogOpen(true);
                              }}
                            >
                              {
                                fieldLabels?.selectOption[
                                  selectedLanguage ?? DEFAULT_LANGUAGE
                                ]
                              }
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <DialogTitle className="sr-only">
                              Edit Field:{" "}
                              {editedField?.label?.en ||
                                editedField?.variant ||
                                "Form Field"}
                            </DialogTitle>
                            <DropdownOptions
                              editedField={editedField}
                              closePopover={() => {
                                setSourceDialogOpen(false);
                              }}
                              updateField={updateField}
                              selectedLanguage={selectedLanguage}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Then>
                  </If>
                  <If condition={["Tree"].includes(editedField.variant)}>
                    <Then>
                      <div className="space-y-2">
                        <If
                          condition={
                            Object.hasOwn(editedField, "propComponent") &&
                            editedField.propComponent.name
                          }
                        >
                          <Then>
                            {editedField.propComponent &&
                              editedField.propComponent.name && (
                                <DynamicRenderer
                                  componentName={editedField.propComponent.name}
                                  editField={editedField}
                                  updateField={updateField}
                                />
                              )}
                          </Then>
                        </If>
                      </div>
                      <div className="space-y-2">
                        <Dialog
                          open={sourceDialogOpen}
                          onOpenChange={setSourceDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSourceDialogOpen(true);
                              }}
                            >
                              {
                                fieldLabels?.constructTree[
                                  selectedLanguage ?? DEFAULT_LANGUAGE
                                ]
                              }
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                            <DialogTitle className="sr-only">
                              Edit Field:{" "}
                              {editedField?.label?.en ||
                                editedField?.variant ||
                                "Form Field"}
                            </DialogTitle>
                            {/* <CustomTree /> */}
                            <RenderTreeField
                              editedField={editedField}
                              closePopover={() => {
                                setSourceDialogOpen(false);
                              }}
                              updateField={updateField}
                              selectedLanguage={selectedLanguage}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Then>
                  </If>
                  <If condition={editedField.variant !== "WYSIWYG"}>
                    <Then>
                      <>
                        <div className="flex justify-between">
                          <LabelWithTooltip
                            htmlFor="repeatable"
                            className="text-xs text-gray-500 dark:text-gray-400"
                            tooltip="Allow users to add multiple instances of this field."
                          >
                            {
                              fieldLabels?.repeatable[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                          </LabelWithTooltip>
                          <Switch
                            checked={editedField.repeatable ?? false}
                            onCheckedChange={(checked) =>
                              updateField(
                                {
                                  repeatable: checked as boolean,
                                },
                                true
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <LabelWithTooltip
                              htmlFor="disabled"
                              className="text-xs text-gray-500 dark:text-gray-400"
                              tooltip="Make this field read-only and prevent user interaction."
                            >
                              {
                                fieldLabels?.disabled[
                                  selectedLanguage ?? DEFAULT_LANGUAGE
                                ]
                              }
                            </LabelWithTooltip>
                            <Switch
                              checked={editedField.disabled ?? false}
                              onCheckedChange={(checked) =>
                                updateField(
                                  {
                                    disabled: checked as boolean,
                                  },
                                  true
                                )
                              }
                            />
                          </div>
                        </div>
                      </>
                    </Then>
                  </If>
                  <If condition={selectedField?.variant === "Input"}>
                    <Then>
                      <div className="grid grid-cols-3 gap-4">
                        <Label
                          htmlFor="type"
                          className="text-xs  text-gray-500 dark:text-gray-400"
                        >
                          {
                            fieldLabels?.type[
                              selectedLanguage ?? DEFAULT_LANGUAGE
                            ]
                          }
                        </Label>
                        <div className="col-span-2">
                          <Select
                            value={editedField.type}
                            onValueChange={(value) => {
                              setFieldType(value);
                              updateField({ type: value }, true);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={
                                  fieldLabels?.selectField[
                                    selectedLanguage ?? DEFAULT_LANGUAGE
                                  ]
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Then>
                  </If>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem
              value={
                fieldLabels?.appearance[selectedLanguage ?? DEFAULT_LANGUAGE]
              }
            >
              <AccordionTrigger className="overflow-x-hidden">
                <div className="flex gap-2 items-center">
                  <Palette className="w-4 h-4" />
                  <span className="font-normal text-sm">
                    {
                      fieldLabels?.appearance[
                        selectedLanguage ?? DEFAULT_LANGUAGE
                      ]
                    }
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <StylePanel
                    label="Field Styles"
                    value={editedField.className || ""}
                    onChange={(value) => updateField({ className: value })}
                    target="className"
                  />

                  <StylePanel
                    label="Container Styles"
                    value={editedField.containerClassName || ""}
                    onChange={(value) =>
                      updateField({ containerClassName: value })
                    }
                    target="containerClassName"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Label
                      htmlFor="width"
                      className="text-xs  text-gray-500 dark:text-gray-400"
                    >
                      {fieldLabels?.width[selectedLanguage ?? DEFAULT_LANGUAGE]}
                    </Label>
                    <div className="col-span-2">
                      <Select
                        value={editedField.width}
                        onValueChange={(value) => {
                          updateField({ width: value }, true);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              fieldLabels?.selectWidth[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="w-1/4">25%</SelectItem>
                          <SelectItem value="w-1/3">33%</SelectItem>
                          <SelectItem value="w-1/2">50%</SelectItem>
                          <SelectItem value="w-2/3">75%</SelectItem>
                          <SelectItem value="w-full">100%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <LabelWithTooltip
                      htmlFor="visibility"
                      className="text-xs text-gray-500 dark:text-gray-400"
                      tooltip="Control whether this field is visible in the form. Hidden fields can still store data."
                    >
                      {
                        fieldLabels?.visibility[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </LabelWithTooltip>
                    <Switch
                      checked={editedField.visibility ?? true}
                      onCheckedChange={(checked) =>
                        updateField(
                          {
                            visibility: checked as boolean,
                          },
                          true
                        )
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {editedField?.variant !== "WYSIWYG" && (
              <AccordionItem value="Validation">
                <AccordionTrigger className="overflow-x-hidden">
                  <div className="flex gap-2">
                    <CircleCheckBig className="w-4 h-4" />
                    <span className="font-normal text-sm">
                      {
                        fieldLabels?.validation[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 mb-4">
                    <div className="flex justify-between">
                      <LabelWithTooltip
                        htmlFor="required"
                        className="text-xs text-gray-500 dark:text-gray-400"
                        tooltip="Make this field mandatory. Users must fill it before submitting the form."
                      >
                        {
                          fieldLabels?.required[
                            selectedLanguage ?? DEFAULT_LANGUAGE
                          ]
                        }
                      </LabelWithTooltip>
                      <Switch
                        checked={editedField.required ?? false}
                        onCheckedChange={(checked) =>
                          updateField(
                            {
                              required: checked as boolean,
                            },
                            true
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <If
                      condition={
                        selectedField?.variant === "Input" &&
                        ["text", "number", "email"].includes(
                          editedField.type ?? ""
                        )
                      }
                    >
                      <Then>
                        <div className="flex flex-col space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <div className="space-y-1">
                            <Label className="text-xs  text-gray-500 dark:text-gray-400">
                              {
                                fieldLabels?.min[
                                  selectedLanguage ?? DEFAULT_LANGUAGE
                                ]
                              }
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-1">
                                <Input
                                  id="min"
                                  type="number"
                                  placeholder={
                                    fieldLabels?.minValue[
                                      selectedLanguage ?? DEFAULT_LANGUAGE
                                    ]
                                  }
                                  value={editedField.min}
                                  onChange={(e) =>
                                    updateField({
                                      min: Number(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div className="col-span-2 flex gap-2">
                                <Separator orientation="vertical" />
                                <Input
                                  placeholder={
                                    fieldLabels?.minValueErrorMsg[
                                      selectedLanguage ?? DEFAULT_LANGUAGE
                                    ]
                                  }
                                  value={
                                    editedField.errorMessages.min?.[
                                      selectedLanguage ?? DEFAULT_LANGUAGE
                                    ] ?? ""
                                  }
                                  onChange={(e) =>
                                    updateField({
                                      errorMessages: {
                                        ...editedField.errorMessages,
                                        min: {
                                          ...editedField.errorMessages.min,
                                          [selectedLanguage ??
                                          DEFAULT_LANGUAGE]: e.target.value,
                                        },
                                      },
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs  text-gray-500 dark:text-gray-400">
                              {
                                fieldLabels?.max[
                                  selectedLanguage ?? DEFAULT_LANGUAGE
                                ]
                              }
                            </Label>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-1">
                                <Input
                                  id="max"
                                  type="number"
                                  placeholder={
                                    fieldLabels?.maxValue[
                                      selectedLanguage ?? DEFAULT_LANGUAGE
                                    ]
                                  }
                                  value={editedField.max}
                                  onChange={(e) =>
                                    updateField({
                                      max: Number(e.target.value),
                                    })
                                  }
                                />
                              </div>
                              <div className="col-span-2 flex gap-2">
                                <Separator orientation="vertical" />
                                <Input
                                  placeholder={
                                    fieldLabels?.maxValueErrorMsg[
                                      selectedLanguage ?? DEFAULT_LANGUAGE
                                    ]
                                  }
                                  value={
                                    editedField.errorMessages?.max?.[
                                      selectedLanguage ?? DEFAULT_LANGUAGE
                                    ] ?? ""
                                  }
                                  onChange={(e) =>
                                    updateField({
                                      errorMessages: {
                                        ...editedField.errorMessages,
                                        max: {
                                          ...editedField.errorMessages.max,
                                          [selectedLanguage ??
                                          DEFAULT_LANGUAGE]: e.target.value,
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
                    <If condition={selectedField?.variant === "Slider"}>
                      <Then>
                        <div className="flex gap-15">
                          <Label className="text-xs  text-gray-500 dark:text-gray-400">
                            {
                              fieldLabels?.step[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                          </Label>
                          <Input
                            id="step"
                            type="number"
                            value={editedField.step}
                            onChange={(e) =>
                              updateField({
                                step: Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      </Then>
                    </If>

                    <If condition={selectedField?.required}>
                      <Then>
                        <div className="space-y-1">
                          <Input
                            placeholder={
                              fieldLabels?.requiredErrorMsg[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                            value={
                              editedField.errorMessages?.required?.[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ] ?? ""
                            }
                            onChange={(e) =>
                              updateField({
                                errorMessages: {
                                  ...editedField?.errorMessages,
                                  required: {
                                    ...editedField.errorMessages.required,
                                    [selectedLanguage ?? DEFAULT_LANGUAGE]:
                                      e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </Then>
                    </If>
                    <If
                      condition={
                        (selectedField?.variant === "Input" &&
                          ["text", "number"].includes(
                            editedField.type ?? ""
                          )) ||
                        selectedField?.variant === "Textarea"
                      }
                    >
                      <Then>
                        <div className="flex flex-col gap-1 space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                          <Label
                            htmlFor="pattern"
                            className="text-xs text-gray-500 dark:text-gray-400"
                          >
                            {
                              fieldLabels?.pattern[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                          </Label>
                          <Input
                            type="text"
                            id="pattern"
                            placeholder={
                              fieldLabels?.patternPlaceholder[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ] ?? ""
                            }
                            value={editedField.pattern || ""}
                            onChange={(e) => {
                              updateField({
                                pattern: e.target.value,
                              });
                            }}
                          />

                          <Label
                            htmlFor="patternMessage"
                            className="text-xs  text-gray-500 dark:text-gray-400"
                          >
                            {
                              fieldLabels?.patternErrMessage[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ]
                            }
                          </Label>
                          <Input
                            type="text"
                            id="patternMessage"
                            placeholder={
                              fieldLabels?.patternErrPlaceHolder[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ] ?? ""
                            }
                            value={
                              editedField.errorMessages.pattern?.[
                                selectedLanguage ?? DEFAULT_LANGUAGE
                              ] ?? ""
                            }
                            onChange={(e) =>
                              updateField({
                                errorMessages: {
                                  ...editedField.errorMessages,
                                  pattern: {
                                    ...editedField.errorMessages.pattern,
                                    [selectedLanguage ?? DEFAULT_LANGUAGE]:
                                      e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </Then>
                    </If>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            <AccordionItem value="Conditional">
              <AccordionTrigger className="overflow-x-hidden">
                <div className="flex gap-2">
                  <EyeOff className="w-4 h-4" />
                  <span className="font-normal text-sm">Conditional</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <LabelWithTooltip
                      htmlFor="enableConditionalRender"
                      className="text-xs text-gray-500 dark:text-gray-400"
                      tooltip="Show/hide this field based on values of other fields in the form."
                    >
                      {
                        fieldLabels?.conditionalRender[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </LabelWithTooltip>
                    <Switch
                      checked={editedField.enableConditionalRender ?? false}
                      onCheckedChange={(checked) =>
                        updateField(
                          {
                            enableConditionalRender: checked as boolean,
                          },
                          true
                        )
                      }
                    />
                  </div>
                  <If condition={editedField.enableConditionalRender}>
                    <Then>
                      <ConditionClause
                        allFields={allFields}
                        editedField={editedField}
                        conditionalLogicKey={"conditionalRender"}
                        selectedLanguage={selectedLanguage}
                        updateFieldCallback={updateField}
                      />
                    </Then>
                  </If>
                  <div className="flex justify-between">
                    <Label
                      htmlFor="enableConditionalDisable"
                      className="text-xs  text-gray-500"
                    >
                      {
                        fieldLabels?.conditionalDisable[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </Label>
                    <Switch
                      checked={editedField.enableConditionalDisable ?? false}
                      onCheckedChange={(checked) =>
                        updateField({
                          enableConditionalDisable: checked as boolean,
                        })
                      }
                    />
                  </div>
                  <If condition={editedField.enableConditionalDisable}>
                    <Then>
                      <ConditionClause
                        allFields={allFields}
                        editedField={editedField}
                        conditionalLogicKey={"conditionalDisable"}
                        selectedLanguage={selectedLanguage}
                        updateFieldCallback={updateField}
                      />
                    </Then>
                  </If>
                  <div className="flex justify-between">
                    <Label
                      htmlFor="enableConditionalRequire"
                      className="text-xs  text-gray-500"
                    >
                      {
                        fieldLabels?.conditionalRequire[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </Label>
                    <Switch
                      checked={editedField.enableConditionalRequire ?? false}
                      onCheckedChange={(checked) => {
                        const value = checked as boolean;
                        updateField({
                          enableConditionalRequire: value,
                        });
                        if (!value) {
                          updateField({
                            conditionalRequireFulfilled: false,
                          });
                        }
                      }}
                    />
                  </div>
                  <If condition={editedField.enableConditionalRequire}>
                    <Then>
                      <ConditionClause
                        allFields={allFields}
                        editedField={editedField}
                        conditionalLogicKey={"conditionalRequire"}
                        selectedLanguage={selectedLanguage}
                        updateFieldCallback={updateField}
                      />
                    </Then>
                  </If>
                </div>
              </AccordionContent>
            </AccordionItem>
            {editedField?.variant !== "WYSIWYG" && (
              <AccordionItem value="Conditional logic">
                <AccordionTrigger className="overflow-x-hidden">
                  <div className="flex gap-2">
                    <Braces className="w-4 h-4" />
                    <span className="font-normal text-sm">
                      {
                        fieldLabels?.conditionalLogic[
                          selectedLanguage ?? DEFAULT_LANGUAGE
                        ]
                      }
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <Dialog
                      open={logicsDialogOpen}
                      onOpenChange={setLogicsDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setLogicsDialogOpen(true);
                          }}
                        >
                          {
                            fieldLabels?.selectOption[
                              selectedLanguage ?? DEFAULT_LANGUAGE
                            ]
                          }
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                        <DialogTitle className="sr-only">
                          Edit Field:{" "}
                          {editedField?.label?.en ||
                            editedField?.variant ||
                            "Form Field"}
                        </DialogTitle>
                        <ConditionalLogics
                          logics={editedField?.conditionalLogics}
                          onSave={(newLogics) => {
                            setLogicsDialogOpen(false);
                            updateField({ conditionalLogics: newLogics });
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </TooltipProvider>
  );
};
