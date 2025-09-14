import { Input } from "@/app/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Switch } from "@/app/ui/switch";
import React from "react";
import { LabelWithTooltip } from "../LabelWithTooltip";

interface EditProps {
  id: string;
  label: string;
  tooltip?: string;
  children: React.ReactNode;
  orientation?: "vertical" | "horizontal"; // optional
}

export const EditField: React.FC<EditProps> = ({
  id,
  label,
  tooltip,
  children,
  orientation = "vertical",
}) => {
  if (orientation === "horizontal") {
    return (
      <div className="flex justify-between items-center space-x-2">
        <LabelWithTooltip
          htmlFor={id}
          className="text-xs text-gray-500 dark:text-gray-400"
          tooltip={tooltip}
        >
          {label}
        </LabelWithTooltip>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <LabelWithTooltip
        htmlFor={id}
        className="text-xs text-gray-500 dark:text-gray-400"
        tooltip={tooltip}
      >
        {label}
      </LabelWithTooltip>
      {children}
    </div>
  );
};

export const InputField = ({
  id,
  label,
  tooltip,
  value,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  tooltip?: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
}) => (
  <EditField id={id} label={label} tooltip={tooltip}>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
    />
  </EditField>
);

export const SwitchField = ({
  id,
  label,
  tooltip,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  tooltip?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) => (
  <EditField id={id} label={label} tooltip={tooltip} orientation="horizontal">
    <Switch id={id} checked={checked} onCheckedChange={onChange} />
  </EditField>
);

export const SelectField = ({
  id,
  label,
  placeholder,
  tooltip,
  value,
  onChange,
  options,
}: {
  id: string;
  label: string;
  placeholder: string;
  tooltip?: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) => (
  <EditField id={id} label={label} tooltip={tooltip} orientation="horizontal">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </EditField>
);
