import { useEffect, useRef, useState } from "react";
import { Button } from "web-utils-components/button";
import { Input } from "web-utils-components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "web-utils-components/popover";
import { getVariantIcon } from "../../constants";
import { FieldType } from "../../formBuilder.types";

const SelectComponentPopover = ({
  fieldTypes,
  index,
  addNewColumn,
  columnCount,
//   setColumnCount,
  disabled,
}: {
  fieldTypes: FieldType[];
  index: number;
  addNewColumn: (name: string, index: number) => void;
  columnCount: number;
//   setColumnCount: (val: (prev: number) => number) => void;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = fieldTypes.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) && f.showInFormBuilder 
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightedIndex]) {
        selectItem(filtered[highlightedIndex].name);
      }
    }
  };

  const selectItem = (name: string) => {
    addNewColumn(name, index);
    // setColumnCount((prev) => prev + 1);
    setSearchTerm("");
    setHighlightedIndex(0);
    setOpen(false);
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="min-w-9 w-9 h-9 rounded-full"
          disabled={columnCount >= 4 || disabled}
        >
          +
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2"
        side="bottom"
        align="start"
        collisionPadding={10}
        >
        {/* Fixed Search Box */}
        <Input
            ref={inputRef}
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
            setSearchTerm(e.target.value);
            setHighlightedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="mb-2"
        />

        {/* Scrollable List */}
        <div
            ref={listRef}
            className="max-h-[min(500px,65vh)] overflow-auto space-y-1"
        >
            {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground px-2 py-1">
                No results found
            </div>
            ) : (
            filtered.map((field, i) => {
                const Icon = getVariantIcon(field.name);
                return (
                <button
                    key={field.name}
                    className={`w-full text-left text-sm px-3 py-1.5 flex gap-2 rounded-md ${
                    i === highlightedIndex
                        ? "bg-slate-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                    }`}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    onClick={() => selectItem(field.name)}
                >
                    {Icon && <Icon className="w-4 h-4" />}
                    {field.name}
                </button>
                );
            })
            )}
        </div>
        </PopoverContent>
    </Popover>
  );
};

export default SelectComponentPopover;