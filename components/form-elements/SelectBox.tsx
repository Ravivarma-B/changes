import { Label } from "web-utils-components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "web-utils-components/select";
import React, { useState } from "react";
interface SelectBoxProps {
  label: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
}
export const SelectBox: React.FC<SelectBoxProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
  width,
  height,
  disabled,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      className="flex flex-col items-start"
      style={{ width: width || "294px", height: height || "82px" }}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <Label
          htmlFor={name}
          className="text-sm font-normal flex items-center text-slate-950 dark:text-slate-50"
        >
          {label}
          {required && <span className="text-red-700 font-medium ml-1">*</span>}
        </Label>

        <div className="w-full">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger
              id={name}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full h-10 px-3 py-2.5 border shadow-shadow-xs rounded-md font-text-sm-leading-normal-medium 
                text-primary text-sm placeholder:text-primary transition-colors duration-200
                ${
                  error
                    ? "border-red-500"
                    : isFocused || isHovered || value
                    ? "bg-white border-slate-300"
                    : "bg-slate-200 border-slate-200"
                }`}
            >
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
        </div>

        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    </div>
  );
};
