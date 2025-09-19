import { Button } from "web-utils-components/button";
import { Calendar } from "web-utils-components/calendar";
import { Label } from "web-utils-components/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "web-utils-components/popover";
import { CalendarIcon } from "lucide-react";
import React, { useState } from "react";
interface DatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  width?: string;
  height?: string;
  disabled?: boolean;
}
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  width,
  height,
  disabled,
}) => {
  const [date, setDate] = React.useState<Date | null>(value ?? null);

  React.useEffect(() => {
    setDate(value ?? null);
  }, [value]);

  const handleSelect = (selected: Date | undefined) => {
    const newDate = selected ?? null;
    setDate(newDate);
    onChange(newDate);
  };
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div
      className="flex flex-col items-start"
      style={{ width: width || "294px", height: height || "82px" }}
    >
      <div className="flex flex-col items-start gap-2 w-full">
        {label && (
          <Label
            htmlFor="date"
            className="text-sm font-normal flex items-center text-slate-950 dark:text-slate-50"
          >
            {label}
          </Label>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`w-full h-10 flex items-center justify-start gap-2 px-3 py-2.5 rounded-md border shadow-shadow-xs text-sm text-primary placeholder:text-primary transition-colors duration-200
                hover:bg-transparent  hover:shadow-none
                ${
                  date || isHovered || isFocused
                    ? "bg-white border-slate-300"
                    : "bg-slate-200 border-slate-200"
                }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="truncate">
                {date ? date.toDateString() : "Pick a date"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              required={true}
              selected={date ?? undefined}
              onSelect={handleSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
