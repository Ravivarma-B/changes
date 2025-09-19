import { Button } from "web-utils-components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "web-utils-components/dialog";
import { AlertTriangle, EyeOff, X } from "lucide-react";
import React from "react";

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  icon: React.ReactNode;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  footerContent?: React.ReactNode;
}

export function AlertDialog({
  isOpen,
  onClose,
  icon,
  title,
  message,
  buttonText,
  onButtonClick,
  footerContent,
}: AlertDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[420px] p-0 gap-0 border border-slate-200"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "auto";
        }}
      >
        <div className="absolute top-1.5 right-1.5 z-10">
          <div className="relative w-[70px] h-[70px] flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-yellow-200 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 fill-yellow-600" />
            </div>
            </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 px-7 py-12">
          {icon}

          <DialogTitle className="text-center font-text-2xl-leading-normal-bold font-[700] text-slate-950 dark:text-slate-50 text-[24px] tracking-[0px] leading-[32px]">
            {title}
          </DialogTitle>

          <DialogDescription className="text-center font-text-base-leading-normal-medium font-[500] text-slate-950 dark:text-slate-50 text-[16px] tracking-[0px] leading-[24px]">
            {message}
          </DialogDescription>
        </div>

        <DialogFooter className="flex-col px-6 py-7 border-t border-[#f1f5f9e6]">
          <div className="flex w-full justify-end">
            <Button
              variant="outline"
              className="h-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white rounded-md border border-solid border-slate-200 shadow-shadow-xs font-text-sm-leading-normal-medium font-[number:var(--text-sm-leading-normal-medium-font-weight)] text-primary text-[length:var(--text-sm-leading-normal-medium-font-size)] tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] leading-[var(--text-sm-leading-normal-medium-line-height)] [font-style:var(--text-sm-leading-normal-medium-font-style)]"
              >
              <EyeOff className="w-4 h-4" />
              Mark as Inactive
              </Button>
            <Button
              className="h-10 bg-blue-600 text-slate-50 font-text-sm-leading-normal-medium font-[500] text-[14px] tracking-[0px] leading-[20px]"
              onClick={onButtonClick}
            >
              {buttonText}
            </Button>
          </div>
        </DialogFooter>

        {footerContent && (
          <div className="flex items-center px-7 py-4 bg-[#f1f5f9e6] w-full">
            {footerContent}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
