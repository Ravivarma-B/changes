import { Badge } from "web-utils-components/badge";
import { Button } from "web-utils-components/button";
import { Sparkles } from "lucide-react";

export function ContentHeader({
  pageType,
  isReadOnly,
}: {
  pageType?: string;
  isReadOnly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-8 py-2 bg-blue-200 dark:bg-blue-900 shadow-shadow-xs">
      <div className="flex gap-4 items-center">
        {/* Tab container */}
        <div className="inline-flex items-start gap-1.5 p-1.5 bg-[#f1f5f980] rounded-lg">
          {/* Active tab */}
          <Button
            variant="default"
            className="h-auto min-w-14 px-3 py-1.5 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 rounded-md shadow-shadows-shadow-sm"
          >
            <span className="[font-family:'Geist-Medium',Helvetica] font-medium text-sm">
              Details
            </span>
          </Button>
        </div>

        {/* Create badge/button */}
        {pageType && !isReadOnly && (
          <Badge className="px-2 py-0.5 bg-blue-500 text-white border-transparent">
            <span className="font-text-xs-leading-normal-semibold font-[number:var(--text-xs-leading-normal-semibold-font-weight)] text-[length:var(--text-xs-leading-normal-semibold-font-size)] tracking-[var(--text-xs-leading-normal-semibold-letter-spacing)] leading-[var(--text-xs-leading-normal-semibold-line-height)] whitespace-nowrap [font-style:var(--text-xs-leading-normal-semibold-font-style)]">
              {pageType === "Edit" ? "Edit" : "Create"}
            </span>
          </Badge>
        )}
      </div>

      <div className="inline-flex gap-3 items-center">
        <div className="inline-flex gap-2 py-2 items-center">
          <div className="inline-flex items-start">
            <Button
              size="icon"
              className="w-8 h-8 bg-purple-600 rounded-lg shadow-shadow-xs p-0"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
