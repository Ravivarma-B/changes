import { HelpCircle } from "lucide-react";
import { Label } from "web-utils-components/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "web-utils-components/tooltip";

// Helper component for labels with tooltips
export const LabelWithTooltip: React.FC<{
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
  tooltip?: string;
}> = ({ htmlFor, className, children, tooltip }) => {
  if (!tooltip) {
    return (
      <Label htmlFor={htmlFor} className={className}>
        {children}
      </Label>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Label htmlFor={htmlFor} className={className}>
        {children}
      </Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="w-3 h-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 cursor-help" />
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-xs">
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
