"use client";

import { Badge } from "@/app/ui/badge";
import { Button } from "@/app/ui/button";
import { Card } from "@/app/ui/card";
import { Checkbox } from "@/app/ui/checkbox";
import { Label } from "@/app/ui/label";
import { Separator } from "@/app/ui/separator";
import { CustomTree } from "@/app/ui/tree";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useState } from "react";
import { DEFAULT_LANGUAGE } from "../../constants/locale";
import { FormFieldType } from "../../formBuilder.types";

import { FieldEventType } from "@/app/shared/DynamicRenderer";
import { cn } from "../../utils/FormUtils";

type DropdownOptionsProps = {
  editedField: FormFieldType | null;
  selectedLanguage?: string;
  closePopover?: () => void;
  updateField?: FieldEventType;
};

export const RenderTreeField: React.FC<DropdownOptionsProps> = ({
  editedField,
  selectedLanguage,
  updateField,
  closePopover,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const settings = [
    { id: "editable", name: "Editable" },
    { id: "selectable", name: "Selectable" },
    { id: "multiple", name: "Multiple" },
    { id: "treeLines", name: "Show Tree Lines" },
  ];

  const handleCheckboxChange = useCallback(
    (settingId: string, checked: boolean) => {
      if (updateField) {
        updateField({
          treeSettings: {
            ...editedField.treeSettings,
            [settingId]: checked,
          },
        });
      }
    },
    []
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
                          item.id === "multiple" &&
                          !editedField.treeSettings.selectable
                        }
                      />
                      <label
                        htmlFor={item.id}
                        className={cn(
                          "cursor-pointer text-sm",
                          item.id === "multiple" &&
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
        <Card className="p-4 border border-gray-200 dark:border-gray-700">
          <CustomTree
            disableSelection={!(editedField.treeSettings.selectable ?? true)}
            showConnectedLines={editedField.treeSettings.treeLines ?? false}
            multiple={editedField.treeSettings.multiple ?? false}
            viewOnly={!(editedField.treeSettings.editable ?? false)}
            treeHeight={200}
            data={editedField.tree}
          />
        </Card>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          onClick={() => closePopover?.()}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </Button>

        <Button
          onClick={() => closePopover?.()}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500"
        >
          Save Tree
        </Button>
      </div>
    </div>
  );
};
