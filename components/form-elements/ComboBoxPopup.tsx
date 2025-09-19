import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "web-utils-components/button";
import { Checkbox } from "web-utils-components/checkbox";
import { Input } from "web-utils-components/input";
import { RadioGroup, RadioGroupItem } from "web-utils-components/radio-group";
import { getNodesByIds } from "../dynamic-form/utils/treeOps";
import { TreeNode } from "../dynamic-form/zod/treeSchema";
import { Tree } from "../ui/tree";

export interface ComboBoxItem {
  id: string;
  name: string;
  checked?: boolean;
}

interface ComboBoxPopupProps {
  title: string;
  items: ComboBoxItem[] | TreeNode[];
  onClose: () => void;
  onSave: (selected: ComboBoxItem[]) => void;
  multiple?: boolean; // multiple or single select
  useTree?: boolean; // use tree structure (not implemented yet)
  selectedItems?: Set<string>; // pre-selected item(s)
}

export default function ComboBoxPopup({
  title,
  items,
  onClose,
  onSave,
  multiple = false,
  useTree = false,
  selectedItems,
}: ComboBoxPopupProps) {
  const [data, setData] = useState<ComboBoxItem[]>(items);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(
    selectedItems || new Set()
  );

  // Initialize selectedId for single-select
  useEffect(() => {
    if (!useTree && !multiple) {
      const firstChecked = items.find((i) => "checked" in i && i.checked);
      setSelectedId(firstChecked ? firstChecked.id : null);
    }
  }, [items, multiple]);

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked } : item))
    );
  };

  const handleRadioChange = (id: string) => {
    setSelectedId(id);
  };

  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="flex flex-col max-w-sm min-h-screen items-start fixed bg-white border-l border-slate-200 z-[11] top-0 right-0"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex flex-col items-start pt-4 pb-1.5 px-6 relative w-full">
        <div className="absolute top-1.5 right-6">
          <Button
            variant="outline"
            size="icon"
            className="w-8 h-8"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-xs font-medium text-slate-500">
          SELECT {title.toUpperCase()}
        </div>
      </div>

      {/* Search */}
      <div className="flex flex-col items-start gap-3 px-6 py-3 flex-1 w-full">
        {!useTree && (
          <>
            <div className="flex items-center gap-1 px-3 py-2.5 bg-white rounded-md border border-slate-200 shadow-xs w-full">
              <Search className="w-4 h-4 text-slate-500" />
              <Input
                placeholder={`Search ${title.toLowerCase()}s`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 shadow-none p-0 h-auto text-sm text-primary placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="flex flex-col items-start gap-2 px-2 w-full mt-2">
              {multiple ? (
                filtered.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 w-full">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(item.id, !!checked)
                      }
                      className="w-4 h-4 data-[state=checked]:bg-slate-900"
                    />
                    <label htmlFor={item.id} className="cursor-pointer text-sm">
                      {item.name}
                    </label>
                  </div>
                ))
              ) : (
                <RadioGroup
                  value={selectedId || undefined}
                  onValueChange={(id) => setSelectedId(id)}
                  className="flex flex-col gap-2 w-full"
                >
                  {filtered.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 w-full"
                    >
                      <RadioGroupItem
                        value={item.id}
                        id={item.id}
                        className="w-4 h-4 border border-slate-400 data-[state=checked]:bg-slate-900"
                      />
                      <label
                        htmlFor={item.id}
                        className="cursor-pointer text-sm"
                      >
                        {item.name}
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          </>
        )}
        {useTree && (
          <Tree
            data={items}
            selection
            onSelect={setSelected}
            selected={selectedItems}
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col items-start gap-2 px-6 py-7 w-full border-t border-slate-100">
        <Button
          className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-slate-50 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            if (useTree) {
              const selecetdData = getNodesByIds(
                items as TreeNode[],
                selected
              ).map((node) => ({
                id: node.id.toString(),
                name: node.name,
                checked: true,
              }));
              console.log("Selected IDs:", selected, selecetdData);
              onSave(selecetdData);
            } else {
              const selectedItems = multiple
                ? data.filter((d) => d.checked)
                : data.filter((d) => d.id === selectedId);
              onSave(selectedItems);
            }
          }}
        >
          Add {title}
          {multiple ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
