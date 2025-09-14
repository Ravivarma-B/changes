import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";
import { ConditionalLogics } from "@/app/dynamic-form/screens/edit-field-panel/ConditionalLogics";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui/accordion";
import { Button } from "@/app/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/ui/dialog";
import { Braces } from "lucide-react";
import React, { useState } from "react";
import { fieldLabels } from "../../../constants/locale";
import {
  useEditedField,
  useLang,
  useUpdateField,
} from "../Wrappers/FieldContexts";
import { UpdateFieldFn } from "../Wrappers/types";

const ConditionalLogicPanel: React.FC = React.memo(() => {
  const field: FormFieldType = useEditedField();
  const updateField: UpdateFieldFn = useUpdateField();
  const lang: string = useLang();
  const [open, setOpen] = useState(false);

  if (field?.variant === "WYSIWYG") return null;

  return (
    <AccordionItem value="Conditional logic">
      <AccordionTrigger className="overflow-x-hidden">
        <div className="flex gap-2">
          <Braces className="w-4 h-4" />
          <span className="font-normal text-sm">
            {fieldLabels.conditionalLogic[lang]}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
              {fieldLabels.selectOption[lang]}
            </Button>
          </DialogTrigger>
          <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7">
            <DialogTitle className="sr-only">
              Edit Conditional Logics
            </DialogTitle>
            <ConditionalLogics
              logics={field.conditionalLogics}
              onSave={(newLogics) => {
                setOpen(false);
                updateField({ conditionalLogics: newLogics });
              }}
            />
          </DialogContent>
        </Dialog>
      </AccordionContent>
    </AccordionItem>
  );
});

ConditionalLogicPanel.displayName = "ConditionalLogicPanel";

export default ConditionalLogicPanel;
