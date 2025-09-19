import { Button } from "web-utils-components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "web-utils-components/dialog";
import { Check, CheckCircle2, ChevronLeft, DoorClosed, X } from "lucide-react";
import { Card, CardContent } from "web-utils-components/card";
import { Badge } from "web-utils-components/badge";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  viewButtonText?: string;
  backButtonText?: string;
  onBackButtonClick?: () => void;
  onViewButtonClick?: () => void;
  changedBy?: string;

  cardTitle?: string;
  cardDescription?: string;
  cardDateTime?: string;
  type?: string; // "alert" | "delete" | "success"  
  level?: string; // "start" | "final"
  backList?:boolean;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  viewButtonText,
  backButtonText,
  onBackButtonClick,
  onViewButtonClick,
  changedBy,
  cardTitle,
  cardDescription,
  cardDateTime,
  type,
  level,
  backList
}: SuccessModalProps) {
  console.log("🚀 ~ SuccessModal_New ~  isOpen:", isOpen);
  console.log("🚀 ~ SuccessModal_New ~  title:", title);
  console.log("🚀 ~ SuccessModal_New ~  message:", message);
  console.log("🚀 ~ SuccessModal_New ~  viewButtonText:", viewButtonText);
  console.log("🚀 ~ SuccessModal_New ~  backButtonText:", backButtonText);
  console.log("🚀 ~ SuccessModal_New ~  onBackButtonClick:", onBackButtonClick);
  console.log("🚀 ~ SuccessModal_New ~  onViewButtonClick:", onViewButtonClick);
  console.log("🚀 ~ SuccessModal_New ~  changedBy:", changedBy);
  console.log("🚀 ~ SuccessModal_New ~  cardTitle:", cardTitle);
  console.log("🚀 ~ SuccessModal_New ~  cardDescription:", cardDescription);
  console.log("🚀 ~ SuccessModal_New ~  cardDateTime:", cardDateTime);
  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent
        className="sm:max-w-[420px] p-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          document.body.style.pointerEvents = "auto";
        }}
      >
        <DialogHeader className="p-4">
          <div className="flex justify-center mb-4">
            {type === "delete" && (
             <div className="w-[70px] h-[70px] rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-8 h-8 text-red-600" />
                </div>
            )}
              {type === "success" && (
           <div className="relative w-[70px] h-[70px] bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600 stroke-[3]" />
              </div>
              )}
         
          </div>

          {title && <DialogTitle className="text-center">{title}</DialogTitle>}
          {message && (
            <DialogDescription className="text-center">
              {message}
            </DialogDescription>
          )}
        </DialogHeader>
          <div className="p-5">
        {(cardTitle || cardDescription || cardDateTime) && (
          <>
          <Card className={`flex items-start gap-4 px-4 py-3  rounded-xl border-0 ${level === "final" ? "bg-[#E2E8F0]" : "bg-green-700 text-slate-50"}`}>
              <CardContent className="p-0 flex items-start gap-4 w-full">
              <DoorClosed className="w-10 h-10 flex-shrink-0" />
              <div className="flex flex-col gap-3 flex-1">
              <div className="flex flex-col gap-1">
                 {cardTitle && (
              <h3 className="font-text-base-leading-normal-bold font-[number:var(--text-base-leading-normal-bold-font-weight)] text-[length:var(--text-base-leading-normal-bold-font-size)] tracking-[var(--text-base-leading-normal-bold-letter-spacing)] leading-[var(--text-base-leading-normal-bold-line-height)] [font-style:var(--text-base-leading-normal-bold-font-style)]">
              {cardTitle}
              </h3>
               )}
               {cardDescription && (
              <p className="font-text-xs-leading-normal-normal font-[number:var(--text-xs-leading-normal-normal-font-weight)] text-[length:var(--text-xs-leading-normal-normal-font-size)] tracking-[var(--text-xs-leading-normal-normal-letter-spacing)] leading-[var(--text-xs-leading-normal-normal-line-height)] [font-style:var(--text-xs-leading-normal-normal-font-style)]">
              {cardDescription}
              </p>
               )}
              </div>
              <div className="flex items-center gap-2">
                {level !== "final" && (
              <Badge className="bg-neutral-100 text-neutral-900 border-transparent hover:bg-neutral-100">
              <span className="font-text-xs-leading-normal-semibold font-[number:var(--text-xs-leading-normal-semibold-font-weight)] text-[length:var(--text-xs-leading-normal-semibold-font-size)] tracking-[var(--text-xs-leading-normal-semibold-letter-spacing)] leading-[var(--text-xs-leading-normal-semibold-line-height)] [font-style:var(--text-xs-leading-normal-semibold-font-style)]">
              Active
              </span>
              </Badge>
              )}
              {cardDateTime && (
              <span className="font-text-xs-leading-normal-normal font-[number:var(--text-xs-leading-normal-normal-font-weight)] text-[length:var(--text-xs-leading-normal-normal-font-size)] tracking-[var(--text-xs-leading-normal-normal-letter-spacing)] leading-[var(--text-xs-leading-normal-normal-line-height)] [font-style:var(--text-xs-leading-normal-normal-font-style)]">
              {cardDateTime}
              </span>
              )}
              </div>
              </div>
              </CardContent>
              </Card>
          </>
          
        )}
      </div>
        {(backButtonText || viewButtonText) && (
          <>
          <DialogFooter className="flex flex-col w-full items-start gap-2 px-6 py-4 border-t border-solid border-[#f1f5f9e6]">
            <div className="flex w-full items-center justify-between">
              {backButtonText && onBackButtonClick  && !backList && (
              <Button
                onClick={onBackButtonClick}
              variant="outline"
              className="h-auto px-3.5 py-2 cursor-pointer font-text-sm-leading-normal-medium font-[number:var(--text-sm-leading-normal-medium-font-weight)] text-[length:var(--text-sm-leading-normal-medium-font-size)] tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] leading-[var(--text-sm-leading-normal-medium-line-height)] [font-style:var(--text-sm-leading-normal-medium-font-style)]"
              >
              No, go back
              </Button>
              )}
              {backButtonText && backList && (
                <div className="inline-flex flex-[0_0_auto] rounded-md items-start relative cursor-pointer"  onClick={onBackButtonClick}>
                    <div className="inline-flex items-center justify-center gap-1.5 relative flex-[0_0_auto] rounded-lg overflow-hidden">
                    <ChevronLeft className="!relative !w-4 !h-4 !aspect-[1]" />
                    <div className="relative w-fit mt-[-1.00px] font-text-sm-leading-normal-medium font-[number:var(--text-sm-leading-normal-medium-font-weight)] text-blue-600 text-[length:var(--text-sm-leading-normal-medium-font-size)] tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] leading-[var(--text-sm-leading-normal-medium-line-height)] whitespace-nowrap [font-style:var(--text-sm-leading-normal-medium-font-style)]">
                   {backButtonText}
                    </div>
                    </div>
                    </div>
              )}
              
              {viewButtonText && onViewButtonClick && (
                 <Button onClick={onViewButtonClick} 
                 className={`h-auto px-3.5 py-1.5 ${type === "delete"? "bg-red-600 hover:bg-red-700": "bg-blue-600 hover:bg-blue-700"} font-text-sm-leading-normal-medium 
                 font-[number:var(--text-sm-leading-normal-medium-font-weight)] text-slate-50 
                 text-[length:var(--text-sm-leading-normal-medium-font-size)] 
                 tracking-[var(--text-sm-leading-normal-medium-letter-spacing)] 
                 leading-[var(--text-sm-leading-normal-medium-line-height)] 
                 [font-style:var(--text-sm-leading-normal-medium-font-style)] cursor-pointer`}>
              {viewButtonText}
              </Button>
              )}
            </div>
          </DialogFooter>
</>
        )}

        {changedBy && (
          <Card className="bg-[#f1f5f9e6] border-0 rounded-b-lg p-0">
            <CardContent className="flex items-center px-7 py-4">
            <div className="relative flex-1 mt-[-1.00px] font-text-xs-leading-normal-normal font-[number:var(--text-xs-leading-normal-normal-font-weight)] text-slate-500 text-[length:var(--text-xs-leading-normal-normal-font-size)] tracking-[var(--text-xs-leading-normal-normal-letter-spacing)] leading-[var(--text-xs-leading-normal-normal-line-height)] [font-style:var(--text-xs-leading-normal-normal-font-style)]">
            {changedBy}
            </div>
            </CardContent>
            </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
