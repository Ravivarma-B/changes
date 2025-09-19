import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "web-utils-components/input";
import { Label } from "web-utils-components/label";
import { getNodesByIds } from "../dynamic-form/utils/treeOps";
import { TreeNode } from "../dynamic-form/zod/treeSchema";
import ComboBoxPopup from "./ComboBoxPopup";

interface SelectComboBoxProps {
  label: string;
  name: string;
  value?: string | string[]; // can be single or multiple
  onChange: (value: string | string[]) => void;
  options: { label: string; value: string }[] | TreeNode[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  width?: string;
  height?: string;
  showListButton?: boolean;
  onListButtonClick?: () => void;
  multiple?: boolean; // NEW → decide between single & multi
  type: string;
  useTree?: boolean;
}

export const SelectComboBox: React.FC<SelectComboBoxProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Search...",
  required,
  error,
  disabled,
  width,
  height,
  showListButton = false,
  onListButtonClick,
  multiple = false,
  type,
  useTree = false,
}) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Handle display value
  let displayValue = search;
  if (!useTree) {
    if (multiple && Array.isArray(value) && value.length > 0) {
      displayValue = options
        .filter((o) => "value" in o && value.includes(o.value))
        .map((o) => ("value" in o ? o.label : (o as any).name))
        .join(", ");
    } else if (!multiple && typeof value === "string") {
      displayValue =
        (
          options.find((o) => "value" in o && o.value === value) as {
            label: string;
          }
        )?.label || "";
    }
  } else {
    displayValue = getNodesByIds(options as TreeNode[], new Set(value))
      .map((n) => n.name)
      .join(", "); // For tree, just show search
  }

  return (
    <div
      className="flex flex-col items-start gap-2 relative"
      style={{ width: width || "294px", height: height || "82px" }}
    >
      <Label
        htmlFor={name}
        className="text-sm font-normal flex items-center text-slate-950 dark:text-slate-50"
      >
        {label}
        {required && <span className="text-red-700 font-medium ml-1">*</span>}
      </Label>

      {/* Input box */}
      <div className="flex items-center gap-1 px-3 bg-slate-200 dark:bg-slate-800 rounded-md border border-slate-200 shadow-shadow-xs w-full">
        <Search className="w-4 h-4 text-slate-500 dark:bg-slate-800" />
        <Input
          id={name}
          disabled={disabled}
          value={displayValue}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 bg-transparent text-primary text-sm placeholder:text-primary h-10 px-2 py-1 focus:outline-none focus:ring-0"
          placeholder={placeholder}
        />
      </div>

      {/* Optional list button */}
      {showListButton && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPopupOpen(true);
            onListButtonClick?.();
          }}
          className="absolute -top-px left-[166px] text-sm text-blue-600 underline bg-transparent border-0 cursor-pointer"
        >
          List of {type}
        </button>
      )}

      {/* Popup */}
      {popupOpen && (
        <ComboBoxPopup
          title={type}
          items={
            useTree
              ? (options as TreeNode[])
              : (options as { label: string; value: string }[]).map((opt) => ({
                  id: opt.value,
                  name: opt.label,
                  checked: multiple
                    ? Array.isArray(value) && value.includes(opt.value)
                    : value === opt.value,
                }))
          }
          onClose={() => setPopupOpen(false)}
          onSave={(selected) => {
            console.log("Multiple selected:", selected);
            if (multiple || useTree) {
              console.log("Multiple selected:", selected);
              onChange(selected.map((s) => s.id)); // return array
            } else {
              onChange(selected.length > 0 ? selected[0].id : ""); // return single string
            }
            setPopupOpen(false);
          }}
          multiple={multiple}
          useTree={useTree}
          selectedItems={new Set(value as string[])} // for tree and multi select
        />
      )}

      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};
