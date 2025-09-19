import { FormField } from "@/components/dynamic-form/formBuilder.types";
import { LabelWithTooltip } from "@/components/dynamic-form/screens/edit-field-panel/LabelWithTooltip";
import { FieldEventType } from "@/components/shared/DynamicRenderer";
import { useCallback, useEffect, useState } from "react";
import { cn } from "web-utils-common";
import { Checkbox } from "web-utils-components/checkbox";

const TreeDataSourceProps = ({
  editField,
  updateField,
  apiUrl = "",
}: {
  editField: FormField;
  updateField: FieldEventType;
  apiUrl?: string;
}) => {
  const [loadApi, setLoadApi] = useState(apiUrl.length > 0);

  const [types, setTypes] = useState([
    { id: "unit", name: "Unit", checked: false },
    { id: "role", name: "Role", checked: false },
    { id: "user", name: "User", checked: false },
  ]);

  useEffect(() => {
    if (loadApi) {
      fetch(apiUrl)
        .then((res) => res.json())
        .then((tree) => {
          updateField({
            tree,
          });
          setLoadApi(false);
        });
    }
  }, [loadApi]);

  const handleCheckboxChange = useCallback(
    (typeId: string, checked: boolean) => {
      setTypes((prev) =>
        prev.map((type) => (type.id === typeId ? { ...type, checked } : type))
      );
      updateField({
        dataSource: typeId,
      });
    },
    []
  );

  return (
    <div className="">
      <LabelWithTooltip
        htmlFor="repeatable"
        className="text-xs text-gray-500 dark:text-gray-400"
        tooltip="Allow users to choose the organise type."
      >
        Organisation Type
      </LabelWithTooltip>
      <div className="space-y-2 mt-2 p-1">
        {types.map((item) => (
          <div key={item.id} className="flex items-center gap-2 w-full">
            <Checkbox
              id={item.id}
              checked={item.checked}
              onCheckedChange={(checked) =>
                handleCheckboxChange(item.id, !!checked)
              }
              className="w-4 h-4 data-[state=checked]:bg-slate-900"
            />
            <label htmlFor={item.id} className={cn("cursor-pointer text-sm")}>
              {item.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreeDataSourceProps;
