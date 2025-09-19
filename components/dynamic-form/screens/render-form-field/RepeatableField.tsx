import { useFieldArray, useFormContext, UseFormReturn } from "react-hook-form";
import { Button } from "web-utils-components/button";
import { FormFieldType } from "@/components/dynamic-form/formBuilder.types";
import { SingleFieldRenderer } from "./SingleField";
import { useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "web-utils-common";
import { Language } from "../../constants/locale";

interface RepeatableFieldProps {
    field: FormFieldType;
    form: UseFormReturn;
    language: string;
}

export const RepeatableField: React.FC<RepeatableFieldProps> = ({ field, form, language }) => {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: field.name,
    });

    useEffect(() => {
        if (fields.length === 0) {
            append(field.value ?? "");
        }

    }, [fields, append, field.value]);

    return (
        <div className="space-y-4 relative">
            {fields.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === fields.length - 1;
                return (
                    <div key={item.id} className="group/repeatable relative">
                        <SingleFieldRenderer
                            field={{ ...field, name: `${field.name}.${index}`}}
                            form={form}
                            language={language}
                            isFirst={isFirst}
                            isLast={isLast}
                            index={index}
                        />
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className={cn(
                                    "hidden group-hover/repeatable:flex absolute z-10 text-destructive hover:bg-destructive/10",
                                    index === 0 ? "top-0" : "top-[-14px]" ,
                                    language === Language.AR ? "left-0": "right-0"
                                )}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                );
            })}

            <Button
                type="button"
                onClick={() => append(field.value ?? '')}
                className="flex gap-1"
            >
                <Plus className="h-4 w-4" /> <span>Add More</span>
            </Button>
        </div>
    );
};