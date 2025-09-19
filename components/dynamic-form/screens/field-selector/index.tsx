import React, { useState } from "react";

import { SearchIcon } from "lucide-react";
import { Badge } from "web-utils-components/badge";
import { Button } from "web-utils-components/button";
import { Input } from "web-utils-components/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "web-utils-components/tooltip";
import { fieldTypes } from "../../constants";

type FieldSelectorProps = {
  addFormField: (variant: string, index?: number) => void;
};

export const FieldSelector: React.FC<FieldSelectorProps> = ({
  addFormField,
}) => {
  const [search, setSearch] = useState("");

  const filteredFields = fieldTypes.filter((field) =>
    field.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="flex flex-col w-full h-[100vh] p-3 border-r border-r-white/20 dark:border-r-gray-700/50 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md">
      {/* Search bar stays at the top */}
      <div className="relative mb-2">
        <div className="absolute left-2.5 top-2.5 text-muted-foreground">
          <SearchIcon className="h-4 w-4" />
        </div>
        <Input
          id="search"
          type="search"
          placeholder="Search field types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-background pl-8"
        />
      </div>

      {/* Scrollable content fills remaining space */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredFields
          .filter((field) => field.showInFormBuilder)
          .map((variant) => {
            const Icon = variant.icon;

            return (
              <div className="flex w-full" key={variant.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => addFormField(variant.name)}
                      className="w-full justify-start text-left items-center gap-2 px-2 py-1 cursor-pointer"
                      size="sm"
                    >
                      <div className="p-2 bg-slate-200/80 dark:bg-slate-700/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-md cursor-pointer">
                        <Icon size={14} />
                      </div>
                      <span className="truncate">{variant.name}</span>
                      {variant.isNew && (
                        <Badge
                          variant="new"
                          className="ml-auto p-1 text-[10px]"
                        >
                          New
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{variant.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
      </div>
    </div>
  );
};
