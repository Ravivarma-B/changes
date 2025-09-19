import { Label } from "web-utils-components/label";
import { Textarea } from "web-utils-components/textarea";
import React, { useState } from "react";

interface TextAreaProps {
  label: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
}

export const TextAreaField: React.FC<TextAreaProps> = ({
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
      className="flex flex-col items-start w-full"
      style={{ width: width || "100%" }}
    >
      <div
        className="flex flex-col items-start gap-2 w-full"
        style={{ height: height || "126px" }}
      >
        <Label
          htmlFor={name}
          className="font-text-sm-leading-none-normal text-slate-950 text-[14px] leading-[100%] flex items-center"
        >
          {label}
          {required && <span className="text-red-700 font-medium ml-1">*</span>}
        </Label>

        <Textarea
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`min-h-[60px] px-3 py-2 flex-1 w-full rounded-lg border shadow-shadow-xs text-slate-900 text-[14px] leading-[20px] placeholder:text-slate-900 transition-colors duration-200
            ${
              isFocused || isHovered || value
                ? "bg-white border-slate-300"
                : "bg-slate-200 border-slate-200"
            }`}
        />

        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    </div>
  );
};
