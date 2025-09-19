import React, { useEffect, useRef, useState } from "react";
import { Input } from "web-utils-components/input";
import { z } from "zod";
import { cn } from "../dynamic-form/utils/FormUtils";

const NameSchema = z.string().min(1, "Name cannot be empty").max(100);

interface InlineEditableProps {
  text: string;
  onSave?: (newText: string) => void;
  multiline?: boolean;
  className?: string;
  noOutline?: boolean;
  elementClassName?: string;
  placeholder?: string;
  viewOnly?: boolean;
  children?: React.ReactNode;
  textClassName?: string;
}

const InlineEditable: React.FC<InlineEditableProps> = ({
  text,
  onSave,
  multiline = false,
  className = "",
  elementClassName = "",
  placeholder = "Click to edit",
  noOutline,
  children,
  viewOnly = false,
  textClassName = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    try {
      const valid = NameSchema.parse(value);
      setError(null);
      if (valid !== text) onSave?.(valid);
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.issues[0].message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    console.log(e.key, e.key === "Enter", e.key === "Escape", e.key === " ");
    if (e.key === "Enter") {
      if (!multiline) {
        e.preventDefault(); // prevent submitting form
        inputRef.current?.blur();
      }
    } else if (e.key === "Escape") {
      setValue(text);
      setIsEditing(false);
    } else if (e.key === " ") {
      setValue((prev) => prev + " ");
    }
  };

  return (
    <div className={`inline-editable ${className}`}>
      {isEditing ? (
        multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="border px-2 py-1 rounded w-full"
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            placeholder={placeholder}
            className={cn(
              "border-none px-2 py-1 rounded",
              elementClassName,
              noOutline ? "outline-none" : ""
            )}
          />
        )
      ) : (
        <span
          onClick={(e) => {
            if (!viewOnly) {
              e.stopPropagation();
              setIsEditing(true);
            }
          }}
          className={cn(
            `${!text ? "text-gray-400" : ""}`,
            textClassName,
            viewOnly ? "" : "cursor-text"
          )}
        >
          {isEditing ? value : children || text}
        </span>
      )}
    </div>
  );
};

export default InlineEditable;
