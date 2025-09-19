import React from 'react';
import {
    CONDITIONAL_NUMBER_OPERATORS,
    CONDITIONAL_TEXT_OPERATORS,
    VARIANT_OPERATOR_MAP,
    FormFieldType,
    operators,
    FALLBACK_OPERATOR
} from "@/components/dynamic-form/formBuilder.types";
import {Separator} from "web-utils-components/separator";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "web-utils-components/select";
import {DEFAULT_LANGUAGE, fieldLabels, Language} from "@/components/dynamic-form/constants/locale";
import { If, Then } from 'react-if';
import {Input} from "web-utils-components/input";

interface Props {
    allFields: any[];
    editedField: FormFieldType;
    conditionalLogicKey: keyof FormFieldType;
    selectedLanguage: Language;
    updateFieldCallback: (updates: (Partial<FormFieldType> | ((prev: FormFieldType) => Partial<FormFieldType>))) => void;
}

const ConditionClause: React.FC<Props> = ({ allFields, editedField, conditionalLogicKey, selectedLanguage, updateFieldCallback }) => {
    const getTargetVariant = (fieldName: string | undefined | null) => {
        if (!editedField || !fieldName) return '';

        const targetField = allFields
            .find(f => f.name === fieldName);

        return targetField?.variant ?? '';
    }

    const conditionalLogicObject = editedField?.[conditionalLogicKey];

    return (
        <div className="space-y-2">
            <Separator />
            <div className="flex items-center gap-2">
                <div className="w-1/2">
                    <Select
                        value={conditionalLogicObject?.field || ''}
                        onValueChange={(value) => {
                            const targetVariant = getTargetVariant(value);
                            updateFieldCallback({
                                [conditionalLogicKey]: {
                                    ...conditionalLogicObject,
                                    field: value ?? '',
                                    operator: (targetVariant in VARIANT_OPERATOR_MAP) ? VARIANT_OPERATOR_MAP[targetVariant][0] : FALLBACK_OPERATOR
                                }
                            });
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={fieldLabels?.selectField[selectedLanguage ?? DEFAULT_LANGUAGE]} />
                        </SelectTrigger>
                        <SelectContent>
                            {allFields
                                .filter(f => f.name !== editedField.name) // avoid self-reference
                                .map(f => (
                                    <SelectItem key={f.name} value={f.name}>
                                        {f.label[selectedLanguage ?? DEFAULT_LANGUAGE] || f.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="w-1/2">
                    <Select
                        value={conditionalLogicObject?.operator || ''}
                        onValueChange={(value) =>
                            updateFieldCallback({
                                [conditionalLogicKey]: {
                                    field: conditionalLogicObject?.field,
                                    operator: value ?? '',
                                    ...( [...CONDITIONAL_TEXT_OPERATORS, ...CONDITIONAL_NUMBER_OPERATORS].includes(value as keyof typeof operators)
                                        ? { value: conditionalLogicObject?.value }
                                        : {} )
                                }
                            })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={fieldLabels?.selectCondition[selectedLanguage ?? DEFAULT_LANGUAGE]} />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.entries(operators) as [keyof typeof operators, string][])
                                .filter(([key]) => (VARIANT_OPERATOR_MAP[getTargetVariant(conditionalLogicObject?.field)] ?? [FALLBACK_OPERATOR]).includes(key))
                                .map(([key, value]) => (
                                    <SelectItem key={key} value={key}>
                                        {value}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <If
                condition={
                    !!conditionalLogicObject?.field &&
                    !!conditionalLogicObject?.operator &&
                    [...CONDITIONAL_TEXT_OPERATORS, ...CONDITIONAL_NUMBER_OPERATORS].includes(conditionalLogicObject?.operator as keyof typeof operators)
                }>
                <Then>
                    <div className="flex">
                        <Input
                            placeholder={fieldLabels?.enterComparsionValue[selectedLanguage ?? DEFAULT_LANGUAGE]}
                            type={[...CONDITIONAL_TEXT_OPERATORS].includes(conditionalLogicObject?.operator as keyof typeof operators) ? 'text' : 'number'}
                            value={conditionalLogicObject?.value || ''}
                            onChange={(e) =>
                                updateFieldCallback({
                                    [conditionalLogicKey]: {
                                        ...conditionalLogicObject,
                                        value: e.target.value ?? ''
                                    }
                                })
                            }
                        />
                    </div>
                </Then>
            </If>
        </div>
    );
};

export default ConditionClause;