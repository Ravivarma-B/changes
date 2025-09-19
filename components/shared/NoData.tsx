import { Hello } from "@/components/svgs/default";
import { Button } from "web-utils-components/button";
import { ReactNode } from "react";

interface NoDataProps {
  title: string;
  description: string;
  icon?: ReactNode;
  buttons?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline";
    disabled?: boolean;
    icon?: ReactNode;
    loading?: boolean;
  }[];
  className?: string;
}

export function NoData({
  title,
  description,
  icon = <Hello />,
  buttons,
  className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
}: NoDataProps) {
  return (
    <div className={`flex flex-col items-center gap-6 ${className || ""}`}>
      <header className="flex flex-col items-center gap-1.5 py-6 w-full">
        {icon}

        <h1 className="font-text-3xl-leading-none-semibold text-primary text-[30px] tracking-[-0.75px] leading-none font-semibold text-center">
          {title}
        </h1>

        <p className="font-text-sm-leading-5-normal text-slate-500 text-sm leading-5 text-center">
          {description}
        </p>
      </header>

      {buttons && buttons.length > 0 && (
        <div className="flex items-center gap-6">
          {buttons.map(
            (
              { label, onClick, variant = "default", disabled, icon, loading },
              i
            ) => (
              <Button
                key={i}
                onClick={onClick}
                variant={variant}
                disabled={disabled}
                className="flex items-center gap-1"
              >
                {loading ? icon : icon}
                <span className="font-text-sm-leading-6-medium text-slate-50 text-sm leading-6 font-medium">
                  {label}
                </span>
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}
