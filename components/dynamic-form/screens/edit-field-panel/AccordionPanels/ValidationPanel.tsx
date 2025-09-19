import { fieldLabels } from "@/components/dynamic-form/constants/locale";
import { FormFieldType } from "@/components/dynamic-form/formBuilder.types";
import { CircleCheckBig } from "lucide-react";
import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "web-utils-components/accordion";
import {
  useEditedField,
  useLang,
  useUpdateField,
} from "../Wrappers/FieldContexts";
import { renderEditField } from "../Wrappers/RenderEditField";
import { UpdateFieldFn } from "../Wrappers/types";
import { validationFields } from "./EditFieldSchema";

const ValidationPanel: React.FC = React.memo(() => {
  const field: FormFieldType = useEditedField();
  const updateField: UpdateFieldFn = useUpdateField();
  const lang: string = useLang();

  if (field?.variant === "WYSIWYG") return null;

  return (
    <AccordionItem value="Validation">
      <AccordionTrigger className="overflow-x-hidden">
        <div className="flex gap-2 items-center">
          <CircleCheckBig className="w-4 h-4" />
          <span className="font-normal text-sm">
            {fieldLabels.validation[lang]}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {validationFields.map((schema) =>
            renderEditField(schema, field, lang, updateField)
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

ValidationPanel.displayName = "ValidationPanel";

export default ValidationPanel;
