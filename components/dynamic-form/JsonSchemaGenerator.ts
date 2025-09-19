import { z, ZodSchema } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { FormFieldType, FormRow } from './formBuilder.types'

export interface JsonSchemaOptions {
  title?: string
  description?: string
  definitions?: Record<string, ZodSchema>
}

export const generateJsonSchema = (
  zodSchema: z.ZodType,
  options: JsonSchemaOptions = {}
) => {
  const jsonSchema = zodToJsonSchema(zodSchema, {
    name: options.title,
    definitions: options.definitions
  })
  
  if (options.description && typeof jsonSchema === 'object' && jsonSchema !== null) {
    jsonSchema.description = options.description
  }
  
  return jsonSchema
}
export const generateFormJsonSchema = (
  formRows: FormRow[],
  options: JsonSchemaOptions = {}
) => {
  const schemaObject: Record<string, z.ZodType> = {}

  formRows.forEach((row) => {
    row.fields.forEach((field) => {
      if (field.variant === 'Label') return

      let fieldSchema: z.ZodType = z.string()

      switch (field.variant) {
        case 'Checkbox':
          fieldSchema = z.boolean()
          break
        case 'Date Picker':
          fieldSchema = z.union([z.string(), z.date()])
          break
        case 'Input':
          if (field.type === 'email') {
            fieldSchema = z.email()
          } else if (field.type === 'number') {
            fieldSchema = z.coerce.number()
          } else {
            fieldSchema = z.string()
          }
          break
        case 'Number':
          fieldSchema = z.coerce.number()
          break
        case 'Switch':
          fieldSchema = z.boolean()
          break
        case 'Tags Input':
        case 'Multi Select':
          fieldSchema = z.array(z.string()).min(1)
          break
        default:
          fieldSchema = z.string()
      }

      if (field.required !== true) {
        fieldSchema = fieldSchema.optional()
      }

      schemaObject[field.name] = fieldSchema
    })
  })

  const zodSchema = z.object(schemaObject)
  return generateJsonSchema(zodSchema, options)
}

export const downloadJsonSchema = <T>(jsonSchema: T, filename: string = 'form-schema.json') => {
  const blob = new Blob([JSON.stringify(jsonSchema, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
