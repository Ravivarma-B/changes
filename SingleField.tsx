/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";

import { Button } from "@/app/ui/button";
import { Calendar } from "@/app/ui/calendar";
import { Checkbox } from "@/app/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/ui/command";
import { CreditCard, CreditCardValue } from "@/app/ui/extension/credit-card";
import { DatetimePicker } from "@/app/ui/extension/datetime-picker";
import {
  FileInput,
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from "@/app/ui/extension/file-upload";
import LocationSelector from "@/app/ui/extension/location-input";
import { PasswordInput } from "@/app/ui/extension/password-input";
import { PhoneInput } from "@/app/ui/extension/phone-input";
import { TagsInput } from "@/app/ui/extension/tags-input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/ui/form";
import { Input } from "@/app/ui/input";
import {
  CustomPopover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/app/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/select";
import { Rating, RatingButton } from "@/app/ui/shadcn-io/rating";
import { Slider } from "@/app/ui/slider";
import { Switch } from "@/app/ui/switch";
import { Textarea } from "@/app/ui/textarea";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Paperclip } from "lucide-react";

import { Dialog } from "@/app/ui/dialog";
import { MultiSelect } from "@/app/ui/extension/multi-select";
import { SignatureMaker } from "@/app/ui/extension/signature-maker";
import { DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { DeepPartialSkipArrayKey } from "react-hook-form";
import { DEFAULT_LANGUAGE } from "../../constants/locale";
import { DataSourceConfig, FormFieldType } from "../../formBuilder.types";
import { useEnhancedReactiveDataSource } from "../../hooks/useEnhancedReactiveDataSource";
import { useReactiveDataSource } from "../../hooks/useReactiveDataSource";
import { dataSourceService } from "../../services/dataSourceService";
import { useFormBuilderStore } from "../../store/formBuilder.store";
import { cn } from "../../utils/FormUtils";
import { ReactiveFormFieldManager } from "../../utils/ReactiveFormFieldManager";
import { RenderTreeField } from "../edit-field-panel/RenderTreeField";
// import { SignatureMaker } from '@docuseal/signature-maker-react'

const FileSvgDraw = () => {
  return (
    <>
      <svg
        className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-semibold">Click to upload</span>
        &nbsp; or drag and drop
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        SVG, PNG, JPG or GIF
      </p>
    </>
  );
};

interface SingleFieldRendererProps {
  field: FormFieldType;
  form: UseFormReturn;
  language?: string;
  index?: number;
  isFirst?: boolean;
  isLast?: boolean;
}

export const SingleFieldRenderer: React.FC<SingleFieldRendererProps> = ({
  field,
  form,
  language = DEFAULT_LANGUAGE,
  isFirst = false,
  isLast = false,
}) => {
  const [checked, setChecked] = useState<boolean>(false);
  const [value, setValue] = useState<unknown>(field.value);
  const [tagsValue, setTagsValue] = useState<string[]>([]);
  const [files, setFiles] = useState<File[] | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [datetime, setDatetime] = useState<Date | undefined>(new Date());
  const [rating, setRating] = useState<number>(0);
  const [creditCard, setCreditCard] = useState<CreditCardValue>({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  // Original state-based approach for non-reactive fields
  const [optionData, setOptionData] = useState<any[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [optionsCache, setOptionsCache] = useState<
    Map<string, { data: any[]; timestamp: number }>
  >(new Map());
  const [openTreeDialog, setOpenTreeDialog] = useState(false);

  // State for reactive field notifications
  const [fieldResetNotification, setFieldResetNotification] = useState<
    string | null
  >(null);

  // Helper to get the data source configuration
  const getDataSourceConfig = (): DataSourceConfig | null => {
    // Priority 1: New dataSourceConfig format
    if (field.dataSourceConfig) {
      return field.dataSourceConfig;
    }

    // Priority 2: Legacy dataSourceType + dataSourceDetails format
    if (field.dataSourceType && field.dataSourceDetails) {
      return {
        id: `legacy-${field.name}-${field.dataSourceType}`,
        name: `Legacy ${field.dataSourceType} source`,
        type: field.dataSourceType as any,
        dataMapping: {
          labelKey: field.dataSourceDetails.labelKey,
          valueKey: field.dataSourceDetails.valueKey,
        },
        ...(field.dataSourceType === "api" && {
          apiConfig: {
            url: field.dataSourceDetails.source,
            method: "GET",
            headers: [],
            auth: { type: "none" },
            timeout: 30000,
            retryCount: 3,
          },
        }),
        ...(field.dataSourceType === "predefined" && {
          presetName: field.dataSourceDetails.source,
        }),
      };
    }

    // Priority 3: Manual options from field.options
    if (field.options && field.options.length > 0) {
      return {
        id: `manual-${field.name}`,
        name: `Manual options for ${field.name}`,
        type: "manual",
        manualOptions: field.options.map((opt: any) => ({
          label: opt.label,
          value: opt.value,
          disabled: false,
        })),
      };
    }

    return null;
  };

  const dataSourceConfig = getDataSourceConfig();

  // Determine which reactive hook to use
  const hasReactiveVariables = dataSourceConfig?.variables?.some(
    (v) => v.reactive?.enabled
  );
  const hasFormFieldVariables = dataSourceConfig?.variables?.some(
    (v) => v.source === "formField" && v.reactive?.enabled
  );

  // Use enhanced reactive data source ONLY for form field dependencies
  const shouldUseEnhanced = hasFormFieldVariables;
  const shouldUseFallback = hasReactiveVariables && !hasFormFieldVariables;

  console.log(`🔍 [SingleField] Field "${field.name}" data source decision:`, {
    hasReactiveVariables,
    hasFormFieldVariables,
    shouldUseEnhanced,
    shouldUseFallback,
    configId: dataSourceConfig?.id,
  });

  // Use enhanced reactive data source for form field dependencies
  const enhancedReactiveResult = useEnhancedReactiveDataSource(
    form,
    shouldUseEnhanced ? dataSourceConfig : null,
    field.key,
    {
      onError: (error) => {
        console.error(
          `Enhanced reactive data source error for field ${field.name}:`,
          error
        );
        setOptionsError(error);
      },
      onSuccess: (response) => {
        console.log(
          `Enhanced reactive data loaded for field ${field.name}:`,
          response.data?.length,
          "items"
        );
      },
      onDataSourceUpdate: (newData, oldData, changedVariable) => {
        if (!dataSourceConfig) return;

        // Get current field value
        const currentValue = form.getValues(field.name);

        // Handle form field reset based on configuration
        const result = ReactiveFormFieldManager.handleDataSourceChange({
          newData,
          oldData,
          currentValue,
          fieldName: field.name,
          variant: field.variant,
          form,
          config: dataSourceConfig,
        });

        // Log the change for debugging
        ReactiveFormFieldManager.logDataSourceChange(
          field.name,
          result.action,
          result.reason,
          oldData,
          newData
        );

        // Show user notification if needed
        const message = ReactiveFormFieldManager.getDataSourceChangeMessage(
          result.action,
          result.reason,
          field.label?.[language] || field.name
        );

        if (message) {
          setFieldResetNotification(message);
          // Clear notification after 5 seconds
          setTimeout(() => setFieldResetNotification(null), 5000);
        }

        console.log(`Field "${field.name}" reset result:`, result);
      },
    }
  );

  // Fallback to original reactive data source for non-formField reactive variables
  const reactiveResult = useReactiveDataSource(
    shouldUseFallback ? dataSourceConfig : null,
    {
      onError: (error) => {
        console.error(
          `Reactive data source error for field ${field.name}:`,
          error
        );
        setOptionsError(error);
      },
      onSuccess: (response) => {
        console.log(
          `Reactive data loaded for field ${field.name}:`,
          response.data?.length,
          "items"
        );
      },
      onDataSourceUpdate: (newData, oldData, changedVariable) => {
        if (!dataSourceConfig) return;

        // Get current field value
        const currentValue = form.getValues(field.name);

        // Handle form field reset based on configuration
        const result = ReactiveFormFieldManager.handleDataSourceChange({
          newData,
          oldData,
          currentValue,
          fieldName: field.name,
          variant: field.variant,
          form,
          config: dataSourceConfig,
        });

        // Log the change for debugging
        ReactiveFormFieldManager.logDataSourceChange(
          field.name,
          result.action,
          result.reason,
          oldData,
          newData
        );

        // Show user notification if needed
        const message = ReactiveFormFieldManager.getDataSourceChangeMessage(
          result.action,
          result.reason,
          field.label?.[language] || field.name
        );

        if (message) {
          setFieldResetNotification(message);
          // Clear notification after 5 seconds
          setTimeout(() => setFieldResetNotification(null), 5000);
        }

        console.log(`Field "${field.name}" reset result:`, result);
      },
    }
  );

  // Use enhanced reactive data if available, then fallback to regular reactive data, then state-based approach
  const finalOptionData = hasFormFieldVariables
    ? enhancedReactiveResult.data
    : hasReactiveVariables
    ? reactiveResult.data
    : optionData;

  const finalLoadingOptions = hasFormFieldVariables
    ? enhancedReactiveResult.loading
    : hasReactiveVariables
    ? reactiveResult.loading
    : loadingOptions;

  const finalOptionsError = hasFormFieldVariables
    ? enhancedReactiveResult.error
    : hasReactiveVariables
    ? reactiveResult.error
    : optionsError;

  const { updateSelectedFieldProperty } = useFormBuilderStore();

  // Helper function to get properly mapped options
  const getMappedOptions = (): Array<{
    label: string;
    value: string;
    disabled?: boolean;
  }> => {
    if (!finalOptionData || finalOptionData.length === 0) {
      return [];
    }

    // Get mapping configuration
    let labelKey = "label";
    let valueKey = "value";
    let disabledKey: string | undefined;

    // Priority 1: New dataSourceConfig format
    if (field.dataSourceConfig?.dataMapping) {
      labelKey = field.dataSourceConfig.dataMapping.labelKey;
      valueKey = field.dataSourceConfig.dataMapping.valueKey;
      disabledKey = field.dataSourceConfig.dataMapping.disabledKey;
    }
    // Priority 2: Legacy dataSourceDetails format
    else if (field.dataSourceDetails) {
      labelKey = field.dataSourceDetails.labelKey || "label";
      valueKey = field.dataSourceDetails.valueKey || "value";
    }

    return finalOptionData
      .map((option: any, index: number) => {
        // Handle different data structures
        const label =
          option[labelKey] ||
          option.label ||
          option.name ||
          `Option ${index + 1}`;
        const value =
          option[valueKey] || option.value || option.id || index.toString();
        const disabled = disabledKey
          ? Boolean(option[disabledKey])
          : Boolean(option.disabled);

        return {
          label: String(label),
          value: String(value),
          disabled,
        };
      })
      .filter((option) => option.label && option.value); // Filter out invalid options
  };

  // Helper function to render loading state
  const renderLoadingState = () => {
    if (!finalLoadingOptions) return <></>;
    return (
      <div className="flex items-center justify-center p-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
        Loading options...
      </div>
    );
  };

  // Helper function to render error state
  const renderErrorState = () => {
    if (!finalOptionsError) return <></>;
    return (
      <div className="p-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
        {finalOptionsError}
      </div>
    );
  };

  // Helper function to render field reset notification
  const renderFieldResetNotification = () => {
    if (!fieldResetNotification) return <></>;
    return (
      <div className="p-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800 mb-2">
        ℹ️ {fieldResetNotification}
      </div>
    );
  };

  const watchedForm = useWatch({
    control: form.control,
  });

  const watchedRenderTarget = useWatch({
    control: form.control,
    name: field.conditionalRender?.field ?? "",
    defaultValue: "",
  });

  const watchedDisableTarget = useWatch({
    control: form.control,
    name: field.conditionalDisable?.field ?? "",
    defaultValue: "",
  });

  const watchedRequireTarget = useWatch({
    control: form.control,
    name: field.conditionalRequire?.field ?? "",
    defaultValue: "",
  });

  const fileUploadDropZoneConfig = {
    maxFiles: 5,
    maxSize: 1024 * 1024 * 4,
    multiple: true,
  };

  // Production-grade data source loading with caching and error handling (for non-reactive sources)
  useEffect(() => {
    // Skip if this field uses any reactive data sources (including enhanced form field dependencies)
    if (hasReactiveVariables || hasFormFieldVariables) {
      return;
    }

    const loadDataSourceOptions = async () => {
      // Reset states
      setOptionsError(null);

      // Only load for fields that support options
      if (
        !["Combobox", "Select", "Multi Select", "RadioGroup"].includes(
          field.variant
        )
      ) {
        return;
      }

      const currentDataSourceConfig = getDataSourceConfig();

      // If no data source configuration, clear options
      if (!currentDataSourceConfig) {
        setOptionData([]);
        return;
      }

      // Handle manual options (no API call needed)
      if (currentDataSourceConfig.type === "manual") {
        const manualOptions = currentDataSourceConfig.manualOptions || [];
        setOptionData(manualOptions);
        return;
      }

      // For API and predefined sources, check cache first
      const cacheKey = JSON.stringify({
        type: currentDataSourceConfig.type,
        url: currentDataSourceConfig.apiConfig?.url,
        preset: currentDataSourceConfig.presetName,
        mapping: currentDataSourceConfig.dataMapping,
      });

      const cached = optionsCache.get(cacheKey);
      const cacheExpiry = 5 * 60 * 1000; // 5 minutes

      if (cached && Date.now() - cached.timestamp < cacheExpiry) {
        setOptionData(cached.data);
        return;
      }

      // Load data from external source
      if (
        currentDataSourceConfig.type === "api" ||
        currentDataSourceConfig.type === "predefined"
      ) {
        setLoadingOptions(true);

        try {
          const response = await dataSourceService.fetchData(
            currentDataSourceConfig
          );

          if (response.success && Array.isArray(response.data)) {
            // Cache the result
            setOptionsCache(
              (prev) =>
                new Map(
                  prev.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now(),
                  })
                )
            );

            setOptionData(response.data);
          } else {
            throw new Error(response.error || "Failed to fetch options");
          }
        } catch (error) {
          console.error(
            `Failed to load options for field ${field.name}:`,
            error
          );
          setOptionsError(
            error instanceof Error ? error.message : "Failed to load options"
          );
          setOptionData([]);
        } finally {
          setLoadingOptions(false);
        }
      }
    };

    loadDataSourceOptions();
  }, [
    field.variant,
    field.dataSourceConfig,
    field.dataSourceType,
    field.dataSourceDetails,
    field.options,
    field.name,
    optionsCache,
    hasReactiveVariables,
    hasFormFieldVariables,
  ]);

  const renderLabel = () => {
    if (!field.label || !field.showLabel) return <></>;
    // Ignore the first and last instance logic for checkbox labels
    if (field.variant === "Checkbox") {
      return (
        <div className="flex gap-1">
          <FormLabel>{field.label[language]}</FormLabel>{" "}
          <span>
            {(field.required || field.conditionalRequireFulfilled) && "*"}{" "}
            &nbsp;
          </span>
        </div>
      );
    }

    // If the field is repeatable, show label only for the first instance
    if (!field.repeatable || isFirst) {
      return (
        <div className="flex gap-1">
          <FormLabel>
            {field.label[language]}
            {field.repeatable ? "(s)" : ""}
          </FormLabel>{" "}
          <span>
            {(field.required || field.conditionalRequireFulfilled) && "*"}{" "}
            &nbsp;
          </span>
        </div>
      );
    }
    return <div className="h-[10px]"></div>;
  };

  const renderDescription = () => {
    if (!field.description) return <></>;
    // Ignore the first and last instance logic for checkbox descriptions
    if (field.variant === "Checkbox") {
      return <FormDescription>{field.description[language]}</FormDescription>;
    }

    // If the field is repeatable, show description only for the last instance
    if (!field.repeatable || isLast) {
      return <FormDescription>{field.description[language]}</FormDescription>;
    }
    return <></>;
  };

  function triggerConditionalLogics() {
    field.conditionalLogics?.forEach(
      (logic: { trigger: string; action: string }) => {
        eval(`(data) => (async () => {
        ${logic?.trigger};
      })()
          .then((triggerResult) => {
            if (triggerResult !== true) return;
            ${logic?.action};
          })
          .then((actionResult) => saveConditionalResult(actionResult))`)(
          watchedForm
        );
      }
    );
  }

  function updateIfChangedSelectedFieldProperty<T extends keyof FormFieldType>(
    key: T,
    value: FormFieldType[T]
  ) {
    if (field[key] === undefined || field[key] === value) return;
    updateSelectedFieldProperty(key, value);
  }

  function saveConditionalResult(actionResult: any) {
    if (actionResult?.value && watchedForm[field.name] !== actionResult.value)
      form.setValue(field.name, actionResult.value);
    Object.keys(actionResult || {})
      .filter((key) => !["value"].includes(key))
      .forEach((key) =>
        updateIfChangedSelectedFieldProperty(key, actionResult[key])
      );
  }

  function closeTreeDialog(open: boolean) {
    setOpenTreeDialog(open);
  }

  triggerConditionalLogics();

  const processCondition = (
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    formValue: DeepPartialSkipArrayKey<{}>,
    conditional: any,
    defaultValue: boolean
  ): boolean => {
    try {
      const {
        field: conditionField,
        operator,
        value: conditionValue,
      } = conditional;

      console.log(
        `Checking condition for field: ${conditionField}, operator: ${operator}, value: ${conditionValue}, formValue: ${formValue}`
      );

      switch (operator) {
        case "equals":
          return formValue === conditionValue;
        case "not_equals":
          return formValue !== conditionValue;
        case "contains":
          return Array.isArray(formValue) || typeof formValue === "string"
            ? formValue.includes(conditionValue)
            : false;
        case "not_contains":
          return Array.isArray(formValue) || typeof formValue === "string"
            ? !formValue.includes(conditionValue)
            : true;
        case "starts_with":
          return typeof formValue === "string"
            ? formValue.startsWith(conditionValue)
            : false;
        case "ends_with":
          return typeof formValue === "string"
            ? formValue.endsWith(conditionValue)
            : false;
        case "greater_than":
          return Number(formValue) > Number(conditionValue);
        case "less_than":
          return Number(formValue) < Number(conditionValue);
        case "is_not_empty":
          return Array.isArray(formValue)
            ? formValue.length > 0
            : formValue !== "" && formValue != null;
        case "is_checked":
          return formValue === true;
        case "is_not_checked":
          return formValue === false;
        default:
          return true;
      }
    } catch (err) {
      console.error("Conditional error:", err);
      return defaultValue;
    }
  };

  const shouldRender = () => {
    if (!field.enableConditionalRender || !field.conditionalRender) return true;
    return processCondition(watchedRenderTarget, field.conditionalRender, true);
  };

  const shouldDisable = () => {
    if (!field.enableConditionalDisable || !field.conditionalDisable)
      return false;
    return processCondition(
      watchedDisableTarget,
      field.conditionalDisable,
      false
    );
  };

  const shouldRequire = () => {
    if (!field.enableConditionalRequire || !field.conditionalRequire)
      return false;
    const result = processCondition(
      watchedRequireTarget,
      field.conditionalRequire,
      false
    );
    if (field.conditionalRequireFulfilled != result)
      updateSelectedFieldProperty("conditionalRequireFulfilled", result);
    return result;
  };

  if (!shouldRender()) return null;
  const condDisabled = shouldDisable();
  shouldRequire();

  switch (field.variant) {
    case "WYSIWYG":
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: field.html || "" }}
        />
      );
    case "Checkbox":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              <div
                className={cn(
                  "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
                  field.className
                )}
              >
                <FormControl>
                  <Checkbox
                    checked={formField.value ?? false}
                    onCheckedChange={(newChecked) => {
                      setChecked(!!newChecked);
                      formField.onChange(!!newChecked);
                    }}
                    disabled={field.disabled || condDisabled}
                    className={cn(field.className)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  {renderLabel()} {renderDescription()}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Combobox":
      const mappedOptions = getMappedOptions();
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}{" "}
              <CustomPopover
                disabled={field.disabled || condDisabled || loadingOptions}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <div
                      className={cn(
                        field.width ?? "w-full",
                        `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                      )}
                    >
                      <Button
                        disabled={
                          field.disabled || condDisabled || loadingOptions
                        }
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !formField.value && "text-muted-foreground",
                          cn(field.className)
                        )}
                      >
                        {loadingOptions ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
                            Loading...
                          </span>
                        ) : formField.value ? (
                          mappedOptions.find(
                            (option) => option.value === formField.value
                          )?.label || formField.value
                        ) : (
                          (field.placeholder?.[language] as string)
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="p-0">
                  <Command>
                    <CommandInput placeholder={field.placeholder?.[language]} />
                    <CommandList>
                      {loadingOptions ? (
                        renderLoadingState()
                      ) : optionsError ? (
                        renderErrorState()
                      ) : mappedOptions.length === 0 ? (
                        <CommandEmpty>No options available.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {mappedOptions.map((option) => (
                            <CommandItem
                              value={option.label}
                              key={option.value}
                              disabled={option.disabled}
                              onSelect={() => {
                                if (!option.disabled) {
                                  formField.onChange(option.value);
                                }
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  option.value === formField.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span
                                className={cn(
                                  option.disabled &&
                                    "text-gray-400 dark:text-gray-600"
                                )}
                              >
                                {option.label}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </CustomPopover>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Date Picker":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={() => (
            <FormItem>
              {renderLabel()}
              <CustomPopover disabled={field.disabled || condDisabled}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div
                      className={cn(
                        field.width ?? "w-full",
                        `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                      )}
                    >
                      <Button
                        disabled={field.disabled || condDisabled}
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                          cn(field.className)
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    disabled={field.disabled || condDisabled}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      form.setValue(field.name, newDate, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </CustomPopover>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Datetime Picker":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={() => {
            const { key, ...fieldProps } = field;
            return (
              <FormItem>
                {renderLabel()}
                <DatetimePicker
                  {...fieldProps}
                  value={datetime}
                  disabled={field.disabled || condDisabled}
                  className={cn(field.className)}
                  onChange={(newDate: Date | undefined) => {
                    setDatetime(newDate);
                    form.setValue(field.name, newDate, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  format={[
                    ["months", "days", "years"],
                    ["hours", "minutes", "am/pm"],
                  ]}
                />
                {renderDescription()}
                <FormMessage />
              </FormItem>
            );
          }}
        />
      );
    case "File Input":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <FileUploader
                    value={files}
                    onValueChange={(newFiles) => {
                      setFiles(newFiles);
                      formField.onChange(newFiles);
                      console.log(newFiles);
                    }}
                    dropzoneOptions={fileUploadDropZoneConfig}
                    className={cn(
                      field.className,
                      "relative bg-background backdrop-blur-md dark:bg-gray-800/30 rounded-lg p-2",
                      field.disabled || condDisabled ? "opacity-40" : ""
                    )}
                  >
                    <FileInput
                      id="fileInput"
                      className="outline-dashed outline-1 outline-slate-500"
                      disabled={field.disabled || condDisabled}
                    >
                      <div className="flex items-center justify-center flex-col pt-3 pb-4 w-full ">
                        <FileSvgDraw />
                      </div>
                    </FileInput>
                    <FileUploaderContent>
                      {files &&
                        files.length > 0 &&
                        files.map((file, i) => (
                          <FileUploaderItem key={i} index={i}>
                            <Paperclip className="h-4 w-4 stroke-current" />
                            <span>{file.name}</span>
                          </FileUploaderItem>
                        ))}
                    </FileUploaderContent>
                  </FileUploader>
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Input":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <Input
                    {...formField}
                    value={formField.value ?? ""}
                    placeholder={field.placeholder?.[language]}
                    disabled={field.disabled || condDisabled}
                    type={field?.type}
                    className={cn(field.className)}
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Location Input":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <LocationSelector
                    disabled={field.disabled || condDisabled}
                    onCountryChange={(country) => {
                      const countryName = country?.name || "";
                      const stateName = formField.value?.[1] || "";
                      formField.onChange([countryName, stateName]);
                    }}
                    onStateChange={(state) => {
                      const countryName = formField.value?.[0] || "";
                      const stateName = state?.name || "";
                      formField.onChange([countryName, stateName]);
                    }}
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Multi Select":
      const multiSelectMappedOptions = getMappedOptions();
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  {loadingOptions ? (
                    <div className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                      {renderLoadingState()}
                    </div>
                  ) : optionsError ? (
                    <div className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                      {renderErrorState()}
                    </div>
                  ) : (
                    <MultiSelect
                      options={multiSelectMappedOptions.filter(
                        (option) => !option.disabled
                      )}
                      onValueChange={formField.onChange}
                      placeholder={
                        typeof field.placeholder === "object"
                          ? field.placeholder?.[language] ?? ""
                          : field.placeholder ?? ""
                      }
                      variant="default"
                      maxCount={2}
                      className={cn(field.className)}
                      disabled={field.disabled || condDisabled}
                      value={formField.value || []}
                    />
                  )}
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Select":
      const selectMappedOptions = getMappedOptions();
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              {renderFieldResetNotification()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`,
                    field.className
                  )}
                >
                  <Select
                    value={formField.value ?? ""}
                    onValueChange={formField.onChange}
                    disabled={field.disabled || condDisabled || loadingOptions}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            loadingOptions
                              ? "Loading options..."
                              : typeof field.placeholder === "object"
                              ? field.placeholder?.[language] ?? ""
                              : field.placeholder ?? ""
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingOptions ? (
                        <div className="p-4">{renderLoadingState()}</div>
                      ) : optionsError ? (
                        <div className="p-2">{renderErrorState()}</div>
                      ) : selectMappedOptions.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No options available
                        </div>
                      ) : (
                        selectMappedOptions.map((option, i) => (
                          <SelectItem
                            key={`select-${option.value}-option-${i}`}
                            value={option.value}
                            disabled={option.disabled}
                          >
                            <span
                              className={cn(
                                option.disabled &&
                                  "text-gray-400 dark:text-gray-600"
                              )}
                            >
                              {option.label}
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Slider":
      const min = field.min || 0;
      const max = field.max || 100;
      const step = field.step || 1;
      const defaultValue = 5;

      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <Slider
                    disabled={field.disabled || condDisabled}
                    min={min}
                    max={max}
                    step={step}
                    value={[formField.value ?? defaultValue]}
                    onValueChange={(value) => {
                      formField.onChange(value[0]);
                    }}
                    className={cn(field.className)}
                  />
                </div>
              </FormControl>
              <FormDescription className="py-3">
                {field.description?.[language]}{" "}
                {`Selected value is ${value || defaultValue},
                minimun valus is ${min}, maximim values is ${max}, step size is ${step}`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Signature Input":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <SignatureMaker
                    disabled={field.disabled || condDisabled}
                    withSubmit={false}
                    withDrawn={true}
                    withTyped={false}
                    withUpload={false}
                    placeholder={
                      field.placeholder?.[language] ||
                      "Draw your signature here..."
                    }
                    className={cn(field.className, "w-full")}
                    onChange={(signature) => {
                      console.log("Signature changed:", signature);
                      formField.onChange(signature);
                      // Also trigger validation
                      form.trigger(field.name);
                    }}
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "Switch":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <div
              className={cn(
                field.width ?? "w-full",
                `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
              )}
            >
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  {renderLabel()}
                  {renderDescription()}
                </div>
                <FormControl>
                  <Switch
                    checked={formField.value ?? false}
                    disabled={field.disabled || condDisabled}
                    onCheckedChange={formField.onChange}
                    className={cn(field.className)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </div>
          )}
        />
      );
    case "Tags Input":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={() => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <TagsInput
                    className={cn(field.className)}
                    value={tagsValue}
                    disabled={field.disabled || condDisabled}
                    onValueChange={(newTags) => {
                      setTagsValue(newTags);
                      form.setValue(field.name, newTags, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    placeholder="Enter your tags"
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Textarea":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <Textarea
                    {...formField}
                    value={formField.value ?? ""}
                    disabled={field.disabled || condDisabled}
                    placeholder={field.placeholder?.[language]}
                    className={cn(field.className, "resize-none")}
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Password":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <PasswordInput
                    {...formField}
                    value={formField.value ?? ""}
                    disabled={field.disabled || condDisabled}
                    className={cn(field.className)}
                    placeholder={field.placeholder?.[language]}
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Phone":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={() => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <div
                  className={cn(
                    field.width ?? "w-full",
                    `[@container(max-width:639px)]:w-full group-[.mobile]:w-full`
                  )}
                >
                  <PhoneInput
                    defaultCountry="AE"
                    disabled={field.disabled || condDisabled}
                    className={cn(field.className)}
                    onChange={(phoneNumber) => {
                      form.setValue(field.name, phoneNumber, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  />
                </div>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Rating":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={() => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <Rating
                  value={rating}
                  onChange={(_, value) => {
                    setRating(value);
                    form.setValue(field.name, value.toString(), {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <RatingButton key={index} />
                  ))}
                </Rating>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "RadioGroup":
      const radioGroupMappedOptions = getMappedOptions();
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={() => (
            <FormItem className="space-y-3">
              {renderLabel()}
              <FormControl>
                {loadingOptions ? (
                  <div className="p-4">{renderLoadingState()}</div>
                ) : optionsError ? (
                  <div className="p-4">{renderErrorState()}</div>
                ) : radioGroupMappedOptions.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No options available
                  </div>
                ) : (
                  <RadioGroup
                    onValueChange={(value) => {
                      form.setValue(field.name, value.toString(), {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className={cn(field.className, "flex flex-col space-y-1")}
                    disabled={field.disabled || condDisabled}
                  >
                    {radioGroupMappedOptions.map((option, i) => {
                      const key = `radio-option-${i}-${option.value}`;
                      return (
                        <FormItem
                          key={key}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={option.value}
                              disabled={field.disabled || option.disabled}
                            />
                          </FormControl>
                          <FormLabel
                            className={cn(
                              "font-normal",
                              (field.disabled ||
                                condDisabled ||
                                option.disabled) &&
                                "text-gray-400 dark:text-gray-600"
                            )}
                          >
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    })}
                  </RadioGroup>
                )}
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Credit Card":
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <CreditCard
                  value={creditCard}
                  disabled={field.disabled || condDisabled}
                  onChange={(value) => {
                    setCreditCard(value);
                    // Update form with the credit card object directly
                    formField.onChange(value);
                    form.setValue(field.name, value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                />
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    case "Tree": {
      return (
        <FormField
          control={form.control}
          name={field.name}
          render={({ field: formField }) => (
            <FormItem>
              {renderLabel()}
              <FormControl>
                <Dialog open={openTreeDialog} onOpenChange={closeTreeDialog}>
                  <DialogTrigger>
                    <Input
                      {...formField}
                      value={formField.value ?? ""}
                      placeholder={field.placeholder?.[language]}
                      disabled={field.disabled || condDisabled}
                      type={field?.type}
                      className={cn(field.className)}
                    />
                  </DialogTrigger>
                  <DialogContent className="!max-w-3xl w-full min-h-64 p-6 pt-7 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <RenderTreeField editedField={field} />
                  </DialogContent>
                </Dialog>
              </FormControl>
              {renderDescription()}
              <FormMessage />
            </FormItem>
          )}
        />
      );
    }
    default:
      return <>Unsupported field type: {field.variant}</>;
  }
};
