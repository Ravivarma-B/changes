import { Loader2 } from "lucide-react";
import { Button } from "web-utils-components/button";

export function RecordLoading() {
  return (
    <div className="flex w-full justify-center">
      <Button
        variant="outline"
        className="flex items-center gap-1 opacity-50"
        disabled
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="font-text-sm-leading-6-medium text-primary text-sm leading-6 font-medium">
          Syncing DB Record. Please wait...
        </span>
      </Button>
    </div>
  );
}
