import { fieldLabels, Language } from "@/app/dynamic-form/constants/locale";
import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";
import ConditionClause from "@/app/dynamic-form/screens/edit-field-panel/ConditionClause";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/ui/accordion";
import { EyeOff } from "lucide-react";
import React from "react";
import { SwitchField } from "../Wrappers/EditField";
import {
  useEditedField,
  useLang,
  useUpdateField,
} from "../Wrappers/FieldContexts";
import { UpdateFieldFn } from "../Wrappers/types";

interface ConditionalPanelProps {
  allFields: FormFieldType[];
}

const ConditionalPanel: React.FC<ConditionalPanelProps> = ({ allFields }) => {
  const field: FormFieldType = useEditedField();
  const updateField: UpdateFieldFn = useUpdateField();
  const lang: string = useLang();

  return (
    <AccordionItem value="Conditional">
      <AccordionTrigger className="overflow-x-hidden">
        <div className="flex gap-2">
          <EyeOff className="w-4 h-4" />
          <span className="font-normal text-sm">Conditional</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col space-y-3 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <SwitchField
            id="enableConditionalRender"
            label={fieldLabels.conditionalRender[lang]}
            checked={field.enableConditionalRender ?? false}
            onChange={(val) =>
              updateField({ enableConditionalRender: val }, true)
            }
          />
          {field.enableConditionalRender && (
            <ConditionClause
              allFields={allFields}
              editedField={field}
              conditionalLogicKey="conditionalRender"
              selectedLanguage={lang as Language}
              updateFieldCallback={updateField}
            />
          )}

          <SwitchField
            id="enableConditionalDisable"
            label={fieldLabels.conditionalDisable[lang]}
            checked={field.enableConditionalDisable ?? false}
            onChange={(val) =>
              updateField({ enableConditionalDisable: val }, true)
            }
          />
          {field.enableConditionalDisable && (
            <ConditionClause
              allFields={allFields}
              editedField={field}
              conditionalLogicKey="conditionalDisable"
              selectedLanguage={lang as Language}
              updateFieldCallback={updateField}
            />
          )}

          <SwitchField
            id="enableConditionalRequire"
            label={fieldLabels.conditionalRequire[lang]}
            checked={field.enableConditionalRequire ?? false}
            onChange={(val) => {
              updateField({ enableConditionalRequire: val }, true);
              if (!val)
                updateField({ conditionalRequireFulfilled: false }, true);
            }}
          />
          {field.enableConditionalRequire && (
            <ConditionClause
              allFields={allFields}
              editedField={field}
              conditionalLogicKey="conditionalRequire"
              selectedLanguage={lang as Language}
              updateFieldCallback={updateField}
            />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ConditionalPanel;
