"use client";

import { FieldEventType } from "@/components/shared/DynamicRenderer";
import { Tree } from "@/components/ui/tree";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "web-utils-components/badge";
import { Card } from "web-utils-components/card";
import { Checkbox } from "web-utils-components/checkbox";
import { Label } from "web-utils-components/label";
import { Separator } from "web-utils-components/separator";
import { DEFAULT_LANGUAGE } from "../../constants/locale";
import { FormFieldType } from "../../formBuilder.types";
import { cn } from "../../utils/FormUtils";
import { TreeNode } from "../../zod/treeSchema";

type DropdownOptionsProps = {
  editedField: FormFieldType | null;
  selectedLanguage?: string;
  closePopover?: () => void;
  saveListener?: (data: TreeNode[]) => void;
  selectListener?: (selected: Set<string>) => void;
  updateField?: FieldEventType;
  showSettings?: boolean;
  selected?: Set<string>;
};

export const RenderTreeField: React.FC<DropdownOptionsProps> = ({
  editedField,
  selectedLanguage,
  updateField,
  closePopover,
  saveListener,
  showSettings = true,
  selectListener,
  selected,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const settings = [
    { id: "selectable", name: "Selectable" },
    { id: "multiple", name: "Multiple" },
    { id: "treeLines", name: "Show Tree Lines" },
    { id: "parentSelection", name: "Enable Parent Selection" },
  ];

  const handleCheckboxChange = useCallback(
    (settingId: string, checked: boolean) => {
      if (updateField) {
        updateField({
          treeSettings: {
            ...editedField.treeSettings,
            [settingId]: checked,
            ...(settingId === "selectable" && checked === false
              ? {
                  multiple: false,
                  parentSelection: false,
                }
              : {}), // Disable dependent settings if 'selectable' is unchecked
          },
        });
      }
    },
    [editedField]
  );

  const fieldTypeDisplay = editedField.variant;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Tree Structure Configuration
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure dynamic nodes for your {fieldTypeDisplay} field
            </p>
          </div>
          <Badge
            variant="outline"
            className="capitalize border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
          >
            <span className="text-gray-500 dark:text-gray-400">
              {editedField.label[selectedLanguage || DEFAULT_LANGUAGE]}
            </span>
          </Badge>
        </div>
      </div>

      <Separator className="border-gray-200 dark:border-gray-800" />
      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-auto !scrollbar-hide">
        {showSettings && (
          <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Tree Settings
                </Label>
                <span onClick={() => setSettingsOpen(!settingsOpen)}>
                  {!settingsOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </span>
              </div>

              {settingsOpen && (
                <>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    You can modify the settings as per your requirement. Your
                    configuration will be reset when changing types.
                  </p>

                  <div className="flex mt-5">
                    {settings.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 w-full"
                      >
                        <Checkbox
                          id={item.id}
                          checked={editedField.treeSettings[item.id]}
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(item.id, !!checked)
                          }
                          className="w-4 h-4 data-[state=checked]:bg-slate-900"
                          disabled={
                            (item.id === "multiple" ||
                              item.id === "parentSelection") &&
                            !editedField.treeSettings.selectable
                          }
                        />
                        <label
                          htmlFor={item.id}
                          className={cn(
                            "cursor-pointer text-sm",
                            (item.id === "multiple" ||
                              item.id === "parentSelection") &&
                              !editedField.treeSettings.selectable
                              ? "opacity-50"
                              : ""
                          )}
                        >
                          {item.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <Tree
            selection={editedField.treeSettings.selectable ?? false}
            treeLines={editedField.treeSettings.treeLines ?? false}
            multiple={editedField.treeSettings.multiple ?? false}
            titleEditable={true}
            editIcon={true}
            enableActions={true}
            parentSelection={editedField.treeSettings.parentSelection ?? false}
            treeHeight={200}
            data={editedField.tree}
            saveListener={saveListener}
            cancelListener={closePopover}
            onSelect={selectListener}
            {...(selected && { selected })}
          />
        </Card>
      </div>
    </div>
  );
};
