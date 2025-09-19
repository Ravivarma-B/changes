import { Button } from "web-utils-components/button";
import { X } from "lucide-react";
import { JSX } from "react";

interface ContentFooterProps {
  onCancel: () => void;
  isSaving: boolean;
  isEdit: boolean;
  isReadOnly: boolean;
  formId?: string;
}

export function ContentFooter({
  onCancel,
  isSaving,
  isEdit,
  isReadOnly,
  formId,
}: ContentFooterProps): JSX.Element {
  return (
    <footer className="flex items-center justify-between px-6 py-3.5 bg-slate-200 border-t border-slate-200">
      <div>
        <Button
          variant="outline"
          className="h-10 gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-950 rounded-md border-slate-200 shadow-shadow-xs"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
          <span className="font-text-sm-leading-normal-medium font-[number:var(--text-sm-leading-normal-medium-font-weight)] text-primary text-[length:var(--text-sm-leading-normal-medium-font-size)] tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] leading-[var(--text-sm-leading-normal-medium-line-height)] [font-style:var(--text-sm-leading-normal-medium-font-style)]">
            Cancel
          </span>
        </Button>
      </div>

      {!isReadOnly && (
        <div>
          <Button
            type="submit"
            form={formId}
            className="h-10 gap-1.5 px-3.5 py-1.5 bg-blue-600 rounded-md shadow-shadow-xs"
            disabled={isSaving}
          >
            <span className="font-text-sm-leading-normal-medium font-[number:var(--text-sm-leading-normal-medium-font-weight)] text-slate-50 text-[length:var(--text-sm-leading-normal-medium-font-size)] tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] leading-[var(--text-sm-leading-normal-medium-line-height)] [font-style:var(--text-sm-leading-normal-medium-font-style)]">
              {isEdit ? "Save Changes" : "Submit"}
            </span>
          </Button>
        </div>
      )}
    </footer>
  );
}
