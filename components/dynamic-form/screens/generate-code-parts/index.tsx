import { z } from 'zod'

import { FormFieldType, FormGroupField, FormRow } from '@/components/dynamic-form/formBuilder.types'
import { generateFormJsonSchema } from '@/components/dynamic-form/JsonSchemaGenerator'
import { DEFAULT_LANGUAGE, Language } from '../../constants/locale'


export const generateZodSchema = (
  formFields: FormRow[],
  selectedLanguage: Language = DEFAULT_LANGUAGE
): z.ZodObject<Record<string, z.ZodType>> => {
  const schemaObject: Record<string, z.ZodType> = {}

  const processField = (field: FormFieldType): void => {
    if (field.variant === 'Label') return

    // Handle Group recursively
    if (field.variant === "Group") {
      const groupField = field as FormGroupField;
      const nestedSchema = generateZodSchema(groupField.fields, selectedLanguage);

      if (groupField.repeatable) {
        // For repeatable groups, create array of object schema
        let groupSchema = z.array(nestedSchema);
    
        schemaObject[groupField.name] = groupSchema;
      } else {
        // For non-repeatable groups, merge fields into main schema
        Object.assign(schemaObject, nestedSchema.shape);
      }

      return;
    }

    let fieldSchema: z.ZodType

    switch (field.variant) {
      case 'Checkbox':
        fieldSchema = (field.required || field.conditionalRequireFulfilled)
          ? z.boolean().refine(v => v === true, {
              error: field.errorMessages.required?.[selectedLanguage] ?? 'Required',
            })
          : z.boolean().default(false)
        break
        break
      case 'Date Picker':
        fieldSchema = z.coerce.date()
        break
      case 'Datetime Picker':
        fieldSchema = z.coerce.date()
        break
      case 'Input':
        if (field.type === 'email') {
          fieldSchema = z.email({
            error: field.errorMessages.pattern?.[selectedLanguage] ?? 'Invalid email',
          })
        } else if (field.type === 'number') {
          fieldSchema = z.coerce.number({
            error: field.errorMessages.pattern?.[selectedLanguage] ?? 'Invalid number',
          })
        } else {
          fieldSchema = z.string()
        }
        break
      case 'File Input':
        fieldSchema = z.any().refine((val) => {
          if (!field.required && !field.conditionalRequireFulfilled && (val === undefined || val === null || (Array.isArray(val) && val.length === 0))) {
            return true;
          }
          if (field.required || field.conditionalRequireFulfilled) {
            return Array.isArray(val) && val.length > 0 && val.every((f) => f instanceof File);
          }
          return Array.isArray(val) && val.every((f) => f instanceof File);
        }, {
          error: (field.required || field.conditionalRequireFulfilled)
            ? (field.errorMessages.required?.[selectedLanguage] ?? 'Please upload at least one file')
            : (field.errorMessages.pattern?.[selectedLanguage] ?? 'Invalid file(s) uploaded')
        });
        break;
      case 'Location Input':
        fieldSchema = z.tuple([
          z.string().min(1, { error: field.errorMessages.required?.[selectedLanguage] ?? 'Country is required' }),
          z.string().optional(),
        ])
        break
      case 'Signature Input':
        fieldSchema = z.string().nullable().refine((val) => {
          // If null or empty, let the required validation handle it later
          if (!val || val === '') return (!field.required && !field.conditionalRequireFulfilled)
          // If value exists, validate it's a proper base64 image
          try {
            return val.startsWith('data:image/') && val.includes(',') && val.split(',')[1].length > 0
          } catch {
            return false
          }
        }, { 
          error: field.errorMessages.pattern?.[selectedLanguage] ?? 'Please provide a valid signature'
        })
        break
      case 'Slider':
        fieldSchema = z.coerce.number()
        break
      case 'Switch':
        fieldSchema = z.boolean()
        break
      case 'Tags Input':
        if (field.required || field.conditionalRequireFulfilled) {
          fieldSchema = z
            .array(z.string())
            .min(1, {
              error:
                field.errorMessages.required?.[selectedLanguage] ??
                'Please enter at least one value',
            })
        } else {
          fieldSchema = z.array(z.string())
        }
        break
      case 'Multi Select':
        if (field.required || field.conditionalRequireFulfilled) {
          fieldSchema = z
            .array(z.string())
            .min(1, {
              error:
                field.errorMessages.required?.[selectedLanguage] ??
                'Please select at least one item',
            })
        } else {
          fieldSchema = z.array(z.string())
        }
        break
      case 'Rating':
        fieldSchema = z.coerce.number().min(1, { 
          error: field.errorMessages.required?.[selectedLanguage] ?? 'Rating is required' 
        })
        break
      case 'Credit Card':
        fieldSchema = z.union([
          z.object({
            cardholderName: z.string().min(1),
            cardNumber: z.string().min(1),
            expiryMonth: z.string().min(1),
            expiryYear: z.string().min(1),
            cvv: z.string().min(1),
          }),
          z.string().transform((val, ctx) => {
            try {
              const parsed = JSON.parse(val)
              return parsed
            } catch {
              ctx.addIssue({ code: "custom", message: 'Invalid JSON format' })
              return z.NEVER
            }
          }),
        ])
        break
      default:
        fieldSchema = z.string()
    }

    if (field.min && 'min' in fieldSchema) {
      fieldSchema = (fieldSchema as z.ZodString).min(field.min, {
        error:
          field.errorMessages.min?.[selectedLanguage] ??
          `Must be at least ${field.min}`,
      })
    }

    if (field.max && 'max' in fieldSchema) {
      fieldSchema = (fieldSchema as z.ZodString).max(field.max, {
        error:
          field.errorMessages.max?.[selectedLanguage] ??
          `Must be at most ${field.max}`,
      })
    }

    // regex multilingual
    if (field.pattern) {
      let safeRegex: RegExp | null = null;

      try {
        safeRegex = new RegExp(field.pattern);
      } catch (err) {
        // Invalid pattern, skip applying regex to avoid breaking schema
        safeRegex = null;
      }

      if (safeRegex) {
        fieldSchema = (fieldSchema as z.ZodString).refine(
          val => val === '' || safeRegex!.test(val),
          {
            error:
              typeof field.errorMessages.pattern === 'string'
                ? field.errorMessages.pattern
                : field.errorMessages.pattern?.[selectedLanguage] ?? 'Invalid format',
          }
        );
      }
    }

    // Apply global required/optional logic (skip for fields that handle their own validation)
    if (field.variant !== 'File Input' && field.variant !== 'Checkbox' && field.variant !== 'Multi Select' && field.variant !== 'Tags Input' && field.variant !== 'Rating') {
      if (field.required || field.conditionalRequireFulfilled) {
        fieldSchema = fieldSchema.refine(val => {
          if (Array.isArray(val)) return val.length > 0
          return val !== undefined && val !== null && val !== ''
        }, {
          error:
            field.errorMessages.required?.[selectedLanguage] ??
            'This field is required',
        })
      } else {
        fieldSchema = fieldSchema.optional()
      }
    }

    // if field name contains - then i add quotes around it to fix zod schema generation issue
    let fieldName = field.name
    if (field.name.includes('-')) {
      fieldName = `'${field.name}'`
    }

    if (field.repeatable) {
      fieldSchema = z.array(fieldSchema);
      if (field.required !== true && field.conditionalRequireFulfilled !== true) {
        fieldSchema = fieldSchema.optional();
      }
    } else {
      if (field.required !== true && field.conditionalRequireFulfilled !== true) {
        fieldSchema = fieldSchema.optional();
      }
    }
    schemaObject[fieldName] = fieldSchema as z.ZodType;
  }

  formFields.forEach(row => {
    if (!row?.fields || !Array.isArray(row?.fields)) return
    row.fields.forEach(processField)
  })
  return z.object(schemaObject)
}

export const zodSchemaToString = (schema: z.ZodType): string => {
  if (schema instanceof z.ZodDefault) {
    const defaultValue = (schema._def as any).defaultValue
    return `${zodSchemaToString(schema._def.innerType as z.ZodType)}.default(${JSON.stringify(typeof defaultValue === 'function' ? defaultValue() : defaultValue)})`
  }

  if (schema instanceof z.ZodBoolean) {
    return `z.boolean()`
  }

  if (schema instanceof z.ZodNumber) {
    let result = 'z.number()'
    if ('checks' in schema._def && schema._def.checks) {
      schema._def.checks.forEach((check: any) => {
        if (check.kind === 'min') {
          result += `.min(${check.value})`
        } else if (check.kind === 'max') {
          result += `.max(${check.value})`
        }
      })
    }
    return result
  }

  if (schema instanceof z.ZodString) {
    let result = 'z.string()'
    if ('checks' in schema._def && schema._def.checks) {
      schema._def.checks.forEach((check: any) => {
        if (check.kind === 'min') {
          result += `.min(${check.value})`
        } else if (check.kind === 'max') {
          result += `.max(${check.value})`
        }
      })
    }
    return result
  }

  if (schema instanceof z.ZodDate) {
    return `z.coerce.date()`
  }

  if (schema instanceof z.ZodArray) {
    return `z.array(${zodSchemaToString(schema.element as z.ZodType)}).min(1, { error: "Please select at least one item" })`
  }

  if (schema instanceof z.ZodTuple) {
    return `z.tuple([${(schema._def.items as z.ZodType[]).map((item: z.ZodType) => zodSchemaToString(item)).join(', ')}])`
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape
    const shapeStrs = Object.entries(shape).map(
      ([key, value]) => `${key}: ${zodSchemaToString(value as z.ZodType)}`,
    )
    return `z.object({
      ${shapeStrs.join(',\n  ')}
    })`
  }

  if (schema instanceof z.ZodOptional) {
    return `${zodSchemaToString(schema.unwrap() as z.ZodType)}.optional()`
  }

  return 'z.unknown()'
}

export const getZodSchemaString = (formFields: FormRow[], selectedLanguage: Language = DEFAULT_LANGUAGE): string => {
  const schema = generateZodSchema(formFields, selectedLanguage)
  const schemaEntries = Object.entries(schema.shape)
    .map(([key, value]) => {
      return `  ${key}: ${zodSchemaToString(value as z.ZodType)}`
    })
    .join(',\n')

  return `const formSchema = z.object({\n${schemaEntries}\n});`
}


export const generateDefaultValues = (
  rows: FormRow[],
  existingDefaultValues: Record<string, unknown> = {},
): Record<string, unknown> => {
  const defaultValues: Record<string, unknown> = { ...existingDefaultValues };

  for (const row of rows) {
    for (const field of row.fields) {
      // If already present
      if (field.name in defaultValues) continue;

      // Handle group
      if (field.variant === "Group") {
        const groupField = field as FormGroupField;

        if (groupField.repeatable) {
          defaultValues[groupField.name] = [
            generateDefaultValues(groupField.fields),
          ];
        } else {
          // Flatten group fields into top-level
          const innerDefaults = generateDefaultValues(groupField.fields);
          Object.assign(defaultValues, innerDefaults);
        }

        continue;
      }

      // Handle normal fields
      const isRepeatable = field.repeatable;
      let value: unknown;

      switch (field.variant) {
        case "Checkbox":
        case "Switch":
          value = false;
          break;
        case "Multi Select":
        case "Tags Input":
          value = [];
          break;
        case "Datetime Picker":
        case "Date Picker":
          value = new Date();
          break;
        case "Rating":
          value = "0";
          break;
        case "Slider":
          value = 5;
          break;
        case "File Input":
          value = null;
          break;
        case "Credit Card":
          value = JSON.stringify({
            cardholderName: "",
            cardNumber: "",
            expiryMonth: "",
            expiryYear: "",
            cvv: "",
            cvvLabel: "CVC",
          });
          break;
        case "Signature Input":
          value = null; // Use null for signatures to avoid validation issues
          break;
        default:
          value = "";
      }

      defaultValues[field.name] = isRepeatable ? [value] : value;
    }
  }

  return defaultValues;
};

export const generateDefaultValuesString = (
  formRows: FormRow[],
): string => {
  const defaultValues: Record<string, string[]> = {}
  const dateFields: string[] = []

  formRows.forEach((row) => {
    row.fields.forEach((field) => {
      if (field.variant === 'Multi Select' || field.variant === 'Tags Input') {
        defaultValues[field.name] = []
      } else if (
        field.variant === 'Datetime Picker' ||
        field.variant === 'Smart Datetime Input' ||
        field.variant === 'Date Picker'
      ) {
        dateFields.push(field.name)
        delete defaultValues[field.name]
      }
    })
  })

  if (Object.keys(defaultValues).length === 0 && dateFields.length === 0) {
    return ''
  }

  const regularValuesString =
    Object.keys(defaultValues).length > 0
      ? JSON.stringify(defaultValues).slice(1, -1)
      : ''

  const dateFieldsString = dateFields
    .map((fieldName) => `"${fieldName}": new Date()`)
    .join(',')

  const combinedString = [regularValuesString, dateFieldsString]
    .filter(Boolean)
    .join(',')

  return `defaultValues: {${combinedString}},`
}

export const getDefaultValueForFieldType = (variant: string): unknown => {
  switch (variant) {
    case "Checkbox":
    case "Switch":
      return false;
    case "Multi Select":
    case "Tags Input":
      return [];
    case "Datetime Picker":
    case "Date Picker":
      return new Date();
    case "Rating":
      return "0";
    case "Slider":
      return 5;
    case "File Input":
      return null;
    case "Credit Card":
      return JSON.stringify({
        cardholderName: "",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cvvLabel: "CVC",
      });
    case "Signature Input":
      return null; // Use null for signatures to avoid validation issues
    default:
      return "";
  }
};

export const generateJsonSchemaCode = (formFields: FormRow[]): string => {
  const jsonSchema = generateFormJsonSchema(formFields, {
    title: 'Generated Form Schema',
    description: 'JSON Schema generated from form builder',
  })
  return JSON.stringify(jsonSchema, null, 2)
}
