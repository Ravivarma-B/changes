"use client";
import { fieldLabels } from "@/components/dynamic-form/constants/locale";
import { FormFieldType } from "@/components/dynamic-form/formBuilder.types";
import { Palette } from "lucide-react";
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
import { appearanceFields } from "./EditFieldSchema";

const AppearancePanel: React.FC = React.memo(() => {
  const field: FormFieldType = useEditedField();
  const updateField: UpdateFieldFn = useUpdateField();
  const lang: string = useLang();

  return (
    <AccordionItem value="Appearance">
      <AccordionTrigger className="overflow-x-hidden">
        <div className="flex gap-2 items-center">
          <Palette className="w-4 h-4" />
          <span className="font-normal text-sm">
            {fieldLabels.appearance[lang]}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {appearanceFields.map((schema) =>
            renderEditField(schema, field, lang, updateField)
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});

AppearancePanel.displayName = "AppearancePanel";

export default AppearancePanel;
