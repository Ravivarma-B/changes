import { Label } from "web-utils-components/label";
import { Switch } from "web-utils-components/switch";
import React from "react";

interface SwitchFieldProps {
  label: string;
  name: string;
  description?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  width?: string;
  height?: string;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  label,
  name,
  description,
  checked,
  onChange,
  required,
  error,
  width,
  height,
}) => {
  return (
    <div
      className="flex flex-col items-start"
      style={{ width: width || "294px", height: height || "82px" }}
    >
      <div className="flex items-start justify-between w-full h-full">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor={name}
            className="font-medium text-sm text-slate-950 flex items-center"
          >
            {label}
            {required && (
              <span className="text-red-700 font-medium ml-1">*</span>
            )}
          </Label>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
          {error && <span className="text-red-500 text-xs">{error}</span>}
        </div>

        <Switch
          id={name}
          checked={checked}
          onCheckedChange={onChange}
          className="mt-1"
        />
      </div>
    </div>
  );
};
