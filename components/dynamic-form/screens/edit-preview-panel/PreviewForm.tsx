'use client'

import {DEFAULT_LANGUAGE, Language} from "@/components/dynamic-form/constants/locale";
import {FormRow} from "@/components/dynamic-form/formBuilder.types";
import {If, Then, Else } from 'react-if';
import {Form} from "web-utils-components/form";
import {useForm, UseFormReturn} from "react-hook-form";
import {renderFormFields} from "@/components/dynamic-form/screens/render-form-field";
import {Button} from "web-utils-components/button";
import {toast} from "sonner";
import {Devices} from "@/components/dynamic-form/screens/edit-preview-panel/DeviceToggle";
import {useMemo} from "react";
import {generateDefaultValues, generateZodSchema} from "@/components/dynamic-form/screens/generate-code-parts";
import z, {ZodError} from "zod";

type FormProps = {
    formFields: FormRow[];
    selectedLanguage?: Language;
    device?: Devices;
}

/**
 * Custom error parser that handles both flat and nested field paths
 */
function mapZodErrors(error: ZodError): Record<string, { message: string }> {
    const errorMap: Record<string, { message: string }> = {};

    for (const issue of error.issues) {
        // Convert path array to dot notation string (e.g., ['group', 0, 'field'] -> 'group.0.field')
        const fieldPath = issue.path.join('.');
        errorMap[fieldPath] = {message: issue.message};
    }

    return errorMap;
}

export const PreviewForm = ({formFields, selectedLanguage = DEFAULT_LANGUAGE, device = Devices.DESKTOP}: FormProps) => {
    const formSchema = useMemo(() => generateZodSchema(formFields, selectedLanguage), [formFields, selectedLanguage])
    const defaultVals = useMemo(() => generateDefaultValues(formFields), [formFields])

    const form: UseFormReturn = useForm<z.infer<typeof formSchema>>({
        resolver: async (values) => {
            const result = formSchema.safeParse(values);
            if (result.success) {
                return {
                    values: result.data,
                    errors: {},
                };
            }

            return {
                values: {},
                errors: mapZodErrors(result.error),
            };
        },
        mode: 'onChange',
        defaultValues: defaultVals
    })

    function getContainerClasses(device: string) {
        switch (device) {
            case Devices.TABLET:
                return "border rounded-lg mx-auto w-[768px] h-[1024px]";
            case Devices.MOBILE:
                return "border rounded-lg mx-auto w-[375px] h-[667px]";
            default:
                return "w-full";
        }
    }

    function onSubmit<T>(data: T) {
        try {
            toast(
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 dark:bg-slate-900 p-4">
                    <code className="text-white dark:text-gray-100">{JSON.stringify(data, null, 2)}</code>
                </pre>,
            )
        } catch (error) {
            console.error('Form submission error', error)
            toast.error('Failed to submit the form. Please try again.')
        }
    }


    return <If condition={formFields.length > 0}>
        <Then>
            <div
                className={`h-[calc(100vh-120px)] bg-white/60 dark:bg-gray-900/60 backdrop-blur-md group min-w-sm @container ${device} ${getContainerClasses(device)} p-5 overflow-auto`}
                dir={selectedLanguage === Language.AR ? 'rtl' : 'ltr'}>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 mx-auto"
                    >
                        {renderFormFields(formFields, form, device, selectedLanguage)}
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </div>
        </Then>
        <Else>
            <div className="h-[50vh] flex justify-center items-center">
                <p>No form element selected yet.</p>
            </div>
        </Else>
    </If>;
}
