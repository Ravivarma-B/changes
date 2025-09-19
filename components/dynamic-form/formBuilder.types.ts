import { LucideIcon } from "lucide-react";
import { RefinementCtx, z } from "zod";
import {
  API,
  localizedString,
  MANUAL,
  PREDEFINED,
  SUPPORTED_LANGUAGE,
} from "./constants/locale";
import { TreeSchema, TreeSettingsSchema } from "./zod/treeSchema";

// Data Source Configuration Types
export interface ApiHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiAuth {
  type: "none" | "bearer" | "basic" | "apikey";
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  apiKeyHeader?: string;
  apiKeyValue?: string;
}

export interface VariableBinding {
  key: string;
  source:
    | "static"
    | "formField"
    | "localStorage"
    | "sessionStorage"
    | "cookie"
    | "appState"
    | "environment"
    | "urlParam"
    | "queryParam";
  value: string;
  path?: string;
  description?: string;
  reactive?: {
    enabled: boolean;
    debounceMs?: number;
    /**
     * Form field reset behavior when variable changes
     * - 'preserve': Keep current field value (default)
     * - 'clear': Clear field value when data source changes
     * - 'revalidate': Clear only if current value is not in new options
     * - 'selectFirst': Auto-select first option if current value invalid
     */
    onDataSourceChange?: "preserve" | "clear" | "revalidate" | "selectFirst";
    /**
     * Whether to show loading state during data source updates
     */
    showLoadingOnUpdate?: boolean;
    /**
     * Whether to disable field during data source updates
     */
    disableOnUpdate?: boolean;
  };
  fallback?: {
    value: string;
    strategy: "useDefault" | "throwError" | "useNull";
  };
}

export interface VariableResolutionContext {
  formData?: Record<string, any>;
  localStorage?: Record<string, any>;
  sessionStorage?: Record<string, any>;
  cookies?: Record<string, any>;
  appState?: Record<string, any>;
  environment?: Record<string, any>;
  customContext?: Record<string, any>;
}

export interface DataSourceConfig {
  id: string;
  name: string;
  type: "manual" | "api" | "predefined";

  // Manual options
  manualOptions?: Array<{ label: string; value: string; disabled?: boolean }>;

  // API configuration
  apiConfig?: {
    url: string;
    method: "GET" | "POST" | "PUT" | "DELETE";
    headers: ApiHeader[];
    auth: ApiAuth;
    requestBody?: string;
    timeout?: number;
    retryCount?: number;
    cacheEnabled?: boolean;
    cacheDuration?: number;
  };

  // Data mapping
  dataMapping?: {
    labelKey: string;
    valueKey: string;
    disabledKey?: string;
    groupKey?: string;
    rootPath?: string;
  };

  // Variable bindings
  variables?: VariableBinding[];

  // Predefined preset
  presetName?: string;

  // Validation and formatting
  validation?: {
    required?: boolean;
    minItems?: number;
    maxItems?: number;
    allowCustomValues?: boolean;
  };

  // Advanced options
  searchable?: boolean;
  multiSelect?: boolean;
  grouping?: boolean;
  lazyLoading?: boolean;
  infiniteScroll?: boolean;
}

export interface DataSourceResponse {
  success: boolean;
  data: any[];
  error?: string;
  metadata?: {
    total: number;
    page: number;
    hasMore: boolean;
    cached: boolean;
  };
}
export enum operators {
  equals = "Equals",
  not_equals = "Not Equals",
  contains = "Contains",
  not_contains = "Not Contains",
  greater_than = "Greater Than",
  less_than = "Less Than",
  is_not_empty = "Is Not Empty",
  is_checked = "Is Checked",
  is_not_checked = "Is Not Checked",
  starts_with = "Starts With",
  ends_with = "Ends With",
}

export const CONDITIONAL_TEXT_OPERATORS: Array<keyof typeof operators> = [
  "equals",
  "not_equals",
  "contains",
  "not_contains",
  "starts_with",
  "ends_with",
];

export const CONDITIONAL_NUMBER_OPERATORS: Array<keyof typeof operators> = [
  "greater_than",
  "less_than",
];

export const CONDITIONAL_CHECKBOX_OPERATORS: Array<keyof typeof operators> = [
  "is_checked",
  "is_not_checked",
];

export const VARIANT_OPERATOR_MAP: Record<
  string,
  Array<keyof typeof operators>
> = {
  Checkbox: CONDITIONAL_CHECKBOX_OPERATORS,
  Combobox: [...CONDITIONAL_TEXT_OPERATORS, "is_not_empty"],
  Input: [
    ...CONDITIONAL_TEXT_OPERATORS,
    ...CONDITIONAL_NUMBER_OPERATORS,
    "is_not_empty",
  ],
  "Location Input": ["contains", "is_not_empty"], //since the value of this field is an array [country, state]
  Phone: [...CONDITIONAL_TEXT_OPERATORS, "is_not_empty"],
  Select: [...CONDITIONAL_TEXT_OPERATORS, "is_not_empty"],
  Slider: CONDITIONAL_NUMBER_OPERATORS,
  Switch: CONDITIONAL_CHECKBOX_OPERATORS,
  "Tags Input": [...CONDITIONAL_TEXT_OPERATORS, "is_not_empty"],
  Textarea: [...CONDITIONAL_TEXT_OPERATORS, "is_not_empty"],
  RadioGroup: [...CONDITIONAL_TEXT_OPERATORS, "is_not_empty"],
};

export const FALLBACK_OPERATOR = "is_not_empty";

// Utility: Safe regex check
const isValidRegex = (pattern?: string): boolean => {
  if (!pattern) return true;
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const myFunction = z.function({
  input: [
    z.object({
      name: z.string(),
      age: z.number().int(),
    }),
  ],
  output: z.string(),
});

export const BaseFormFieldTypeObjectSchema = z.object({
  key: z.string(),
  type: z.string().optional(),
  variant: z.string(),
  name: z
    .string()
    .min(1, { error: "Name is required" })
    .regex(/^[^\s]+$/, { error: "Name cannot contain spaces" }),

  showLabel: z.boolean().default(true).optional(),
  width: z.string().default("w-full").optional(),
  visibility: z.boolean().default(true).optional(),

  label: localizedString(SUPPORTED_LANGUAGE),

  placeholder: localizedString(SUPPORTED_LANGUAGE).optional(),
  description: localizedString(SUPPORTED_LANGUAGE).optional(),

  disabled: z.boolean().optional(),
  value: z.union([
    z.string(),
    z.boolean(),
    z.date(),
    z.number(),
    z.array(z.string()),
    z.array(z.number()),
  ]),

  checked: z.boolean(),

  setValue: z.any().optional(),
  onChange: z.any().optional(),
  onSelect: z.any().optional(),

  rowIndex: z.number(),
  required: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  locale: z.string().optional(),
  hour12: z.boolean().optional(),
  className: z.string().optional(),
  containerClassName: z.string().optional(),
  repeatable: z.boolean().optional(),

  html: z.string().optional(),

  options: z
    .array(
      z.object({
        label: z.string().min(1, { error: "Option label cannot be empty" }),
        value: z.string().min(1, { error: "Option value cannot be empty" }),
      })
    )
    .optional(),

  pattern: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),

  enableConditionalRender: z.boolean().optional(),
  conditionalRender: z
    .object({
      field: z.string().min(1, { error: "Conditional field is required" }),
      operator: z.enum(
        Object.keys(operators) as unknown as [
          keyof typeof operators,
          ...Array<keyof typeof operators>
        ]
      ),
      value: z.string(),
    })
    .optional(),

  enableConditionalDisable: z.boolean().optional(),
  conditionalDisable: z
    .object({
      field: z.string().min(1, { error: "Conditional field is required" }),
      operator: z.enum(
        Object.keys(operators) as unknown as [
          keyof typeof operators,
          ...Array<keyof typeof operators>
        ]
      ),
      value: z.string(),
    })
    .optional(),

  enableConditionalRequire: z.boolean().optional(),
  conditionalRequire: z
    .object({
      field: z.string().min(1, { error: "Conditional field is required" }),
      operator: z.enum(
        Object.keys(operators) as unknown as [
          keyof typeof operators,
          ...Array<keyof typeof operators>
        ]
      ),
      value: z.string(),
    })
    .optional(),
  conditionalRequireFulfilled: z.boolean().optional(),

  conditionalLogics: z
    .array(
      z.object({
        trigger: z.string(),
        action: z.string(),
      })
    )
    .optional(),

  errorMessages: z
    .object({
      min: localizedString(SUPPORTED_LANGUAGE),
      max: localizedString(SUPPORTED_LANGUAGE),
      required: localizedString(SUPPORTED_LANGUAGE),
      pattern: localizedString(SUPPORTED_LANGUAGE),
    })
    .partial()
    .default({}),

  // tree schema integration
  tree: TreeSchema.optional(),
  treeSettings: TreeSettingsSchema.optional(),
  propComponents: z.array(z.object({ name: z.string() })).optional(),

  // Enhanced data source configuration
  dataSourceType: z.enum(["manual", "api", "predefined"]).optional(),
  dataSourceConfig: z
    .object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["manual", "api", "predefined"]),

      // Manual options
      manualOptions: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
            disabled: z.boolean().optional(),
          })
        )
        .optional(),

      // API configuration
      apiConfig: z
        .object({
          url: z.string(),
          method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
          headers: z
            .array(
              z.object({
                key: z.string(),
                value: z.string(),
                enabled: z.boolean().default(true),
              })
            )
            .default([]),
          auth: z
            .object({
              type: z
                .enum(["none", "bearer", "basic", "apikey"])
                .default("none"),
              bearerToken: z.string().optional(),
              basicUsername: z.string().optional(),
              basicPassword: z.string().optional(),
              apiKeyHeader: z.string().optional(),
              apiKeyValue: z.string().optional(),
            })
            .optional(),
          requestBody: z.string().optional(),
          timeout: z.number().default(30000),
          retryCount: z.number().default(3),
          cacheEnabled: z.boolean().default(false),
          cacheDuration: z.number().default(300),
        })
        .optional(),

      // Data mapping
      dataMapping: z
        .object({
          labelKey: z.string(),
          valueKey: z.string(),
          disabledKey: z.string().optional(),
          groupKey: z.string().optional(),
          rootPath: z.string().optional(),
        })
        .optional(),

      // Variable bindings
      variables: z
        .array(
          z.object({
            key: z.string(),
            source: z.enum([
              "static",
              "formField",
              "localStorage",
              "sessionStorage",
              "cookie",
              "appState",
              "environment",
              "urlParam",
              "queryParam",
            ]),
            value: z.string(),
            description: z.string().optional(),
          })
        )
        .optional(),

      // Predefined preset
      presetName: z.string().optional(),

      // Validation and formatting
      validation: z
        .object({
          required: z.boolean().optional(),
          minItems: z.number().optional(),
          maxItems: z.number().optional(),
          allowCustomValues: z.boolean().optional(),
        })
        .optional(),

      // Advanced options
      searchable: z.boolean().default(false),
      multiSelect: z.boolean().default(false),
      grouping: z.boolean().default(false),
      lazyLoading: z.boolean().default(false),
      infiniteScroll: z.boolean().default(false),
    })
    .optional(),

  // Legacy support - to be deprecated
  dataSourceDetails: z
    .object({
      labelKey: z.string(),
      source: z.string(),
      valueKey: z.string(),
    })
    .optional(),
});

// Configuration validation
export const BaseFormFieldTypeSchema =
  BaseFormFieldTypeObjectSchema.superRefine((data, ctx) => {
    const needsOptions = ["Select", "Combobox", "Multi Select", "RadioGroup"];
    if (needsOptions.includes(data.variant)) {
      const isManualInvalid =
        data.dataSourceType === "manual" &&
        (!Array.isArray(data.dataSourceConfig?.manualOptions) ||
          data.dataSourceConfig.manualOptions.length === 0);

      const isApiOrPredefinedInvalid =
        (data.dataSourceType === "api" ||
          data.dataSourceType === "predefined") &&
        (!data.dataSourceConfig?.dataMapping?.labelKey?.trim() ||
          !data.dataSourceConfig?.dataMapping?.valueKey?.trim());

      const isDataSourceTypeEmpty = !data.dataSourceType;

      // Fallback to legacy validation for backward compatibility
      const isLegacyManualInvalid =
        !data.dataSourceType &&
        data.dataSourceType === MANUAL &&
        (!Array.isArray(data.options) || data.options.length === 0);

      const isLegacyApiOrPredefinedInvalid =
        !data.dataSourceType &&
        (data.dataSourceType === API || data.dataSourceType === PREDEFINED) &&
        (!data.dataSourceDetails?.source?.trim() ||
          !data.dataSourceDetails?.labelKey?.trim() ||
          !data.dataSourceDetails?.valueKey?.trim());

      if (
        isManualInvalid ||
        isDataSourceTypeEmpty ||
        isApiOrPredefinedInvalid ||
        isLegacyManualInvalid ||
        isLegacyApiOrPredefinedInvalid
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["dataSourceConfig"],
          message: "Data source configuration is required for this field type",
        });
      }
    }

    if (data.pattern && !isValidRegex(data.pattern)) {
      ctx.addIssue({
        code: "custom",
        path: ["pattern"],
        message: "Invalid regex pattern",
      });
    }

    validateConditional(
      "conditionalLogic",
      data.conditionalRender,
      !!data.conditionalRender,
      ctx
    );
    validateConditional(
      "conditionalDisable",
      data.conditionalDisable,
      !!data.conditionalDisable,
      ctx
    );
    validateConditional(
      "conditionalRequire",
      data.conditionalRequire,
      !!data.conditionalRequire,
      ctx
    );

    if (
      data.min !== undefined &&
      data.max !== undefined &&
      data.min > data.max
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["min"],
        message: "Min cannot be greater than Max",
      });
    }
  });

const validateConditional = (
  key: string,
  condition: any,
  enable: boolean,
  ctx: RefinementCtx
): void => {
  if (enable) {
    if (!condition || !condition.field || !condition.operator) {
      ctx.addIssue({
        code: "custom",
        path: [key],
        message: `${key} requires field and operator`,
      });
    } else {
      if (
        condition?.operator &&
        CONDITIONAL_TEXT_OPERATORS.includes(
          condition.operator as keyof typeof operators
        ) &&
        (!condition.value || condition.value.trim() === "")
      ) {
        ctx.addIssue({
          code: "custom",
          path: [key, "value"],
          message: `${key} value is required for this operator`,
        });
      }
    }
  }
};

const FormGroupFieldSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    key: z.string(),
    variant: z.literal("Group"),
    name: z.string(),
    label: localizedString(SUPPORTED_LANGUAGE),
    description: localizedString(SUPPORTED_LANGUAGE).optional(),
    visibility: z.boolean().optional(),
    disabled: z.boolean().optional(),
    repeatable: z.boolean().optional(),
    fields: FormBuilderRowSchema, // nested FormRow[]
    rowIndex: z.number(),
    className: z.string().optional(),
    containerClassName: z.string().optional(),
    showLabel: z.boolean().optional(),
    errorMessages: z
      .object({
        required: localizedString(SUPPORTED_LANGUAGE),
      })
      .partial()
      .optional(),
  })
);

export const FormFieldTypeSchema: z.ZodType<any> = z.union([
  BaseFormFieldTypeObjectSchema,
  FormGroupFieldSchema,
]);

export const FormBuilderRowSchema = z.array(
  z.object({
    rowId: z.string(), // unique per row
    fields: z.array(FormFieldTypeSchema),
  })
);

export type FormGroupField = z.infer<typeof FormGroupFieldSchema>;
export type FormFieldType =
  | z.infer<typeof FormFieldTypeSchema>
  | FormGroupField;
export type FormRow = z.infer<typeof FormBuilderRowSchema>[number];
export type FormBuilder = z.infer<typeof FormBuilderRowSchema>;

const SafeImportableFormFieldTypeSchema = BaseFormFieldTypeObjectSchema.omit({
  setValue: true,
  onChange: true,
  onSelect: true,
});
export const ImportableFormFieldTypeSchema = z.union([
  SafeImportableFormFieldTypeSchema,
  FormGroupFieldSchema,
]);
export const ImportableFormRowSchema = z.array(
  z.object({
    rowId: z.string(), // unique per row
    fields: z.array(ImportableFormFieldTypeSchema),
  })
);
export const ImportableFormBuilderPropsSchema = z.array(
  ImportableFormRowSchema
);

export type ImportableFormFieldType =
  | z.infer<typeof SafeImportableFormFieldTypeSchema>
  | FormGroupField;
export type ImportableFormRow = z.infer<typeof ImportableFormRowSchema>[number];
export type ImportableFormBuilderProps = z.infer<
  typeof ImportableFormBuilderPropsSchema
>;

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export type FieldType = {
  id: string;
  name: string;
  isNew: boolean;
  index?: number;
  icon: LucideIcon;
  showInFormBuilder?: boolean;
};

export interface EditorColumn {
  id: string;
  content: string;
  width: number;
}

export interface EditorBlock {
  id: string;
  type: "text" | "heading" | "checkbox" | "columns";
  content: string;
  columns?: EditorColumn[];
}

export interface EditorHistoryState {
  blocks: EditorBlock[];
  timestamp: number;
}

// Form field type alias
export type FormField = FormFieldType;
