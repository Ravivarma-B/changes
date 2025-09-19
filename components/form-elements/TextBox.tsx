import { Input } from "web-utils-components/input";
import { Label } from "web-utils-components/label";
import React, { useState } from "react";
interface TextBoxProps {
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
}
export const TextBox: React.FC<TextBoxProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  width,
  height,
  disabled,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="flex flex-col items-start"
      style={{ width: width || "294px", height: height || "82px" }}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        <Label htmlFor={name} className="text-sm font-normal flex items-center">
          <span className="text-slate-950">{label}</span>
          {required && <span className="text-red-700 font-medium ml-1">*</span>}
        </Label>

        <div className="w-full">
          <Input
            id={name}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            placeholder={placeholder}
            className={`border-slate-200 text-slate-900 text-sm placeholder:text-slate-900 shadow-shadow-xs h-10 px-3 py-2.5 rounded-md transition-colors duration-200
              ${isFocused || value || isHovered ? "bg-white" : "bg-slate-200"}`}
          />
        </div>

        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    </div>
  );
};
