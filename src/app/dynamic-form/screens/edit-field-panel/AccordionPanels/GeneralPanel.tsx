import { fieldLabels } from "@/app/dynamic-form/constants/locale";
import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui/accordion";
import { Settings } from "lucide-react";
import React from "react";
import {
  useEditedField,
  useLang,
  useUpdateField,
} from "../Wrappers/FieldContexts";
import { renderEditField } from "../Wrappers/RenderEditField";
import { UpdateFieldFn } from "../Wrappers/types";
import { generalFields } from "./EditFieldSchema";

const GeneralPanel: React.FC = React.memo(() => {
  const field: FormFieldType = useEditedField();
  const updateField: UpdateFieldFn = useUpdateField();
  const lang: string = useLang();

  return (
    <AccordionItem value="General">
      <AccordionTrigger className="overflow-x-hidden">
        <div className="flex gap-2 items-center">
          <Settings className="w-4 h-4" />
          <span className="font-normal text-sm">
            {fieldLabels.general[lang]}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {generalFields.map((schema) =>
            renderEditField(schema, field, lang, updateField)
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

GeneralPanel.displayName = "GeneralPanel";

export default GeneralPanel;
