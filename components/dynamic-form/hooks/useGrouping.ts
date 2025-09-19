import { useCallback } from 'react'
import { FormFieldType, FormGroupField, FormRow } from '../formBuilder.types'
import { generateUniqueId } from '../utils/FormUtils'

export const useGrouping = (
  formFields: FormRow[],
  setFormFields: (fields: FormRow[]) => void,
  setSelectedFieldKeys: (keys: Set<string>) => void,
  selectedFieldKeys: Set<string>
) => {
  const groupSelectedFields = useCallback((
    builder: FormRow[],
    selectedKeys: Set<string>
  ): FormRow[] => {
    const newBuilder: FormRow[] = []
    const groupedRows: FormRow[] = []
    let firstCompleteRowIndex = -1
    let hasPartialRows = false

    for (let i = 0; i < builder.length; i++) {
      const row = builder[i]
      const selectedFields: FormFieldType[] = []
      const unselectedFields: FormFieldType[] = []

      for (const field of row.fields) {
        if (selectedKeys.has(field.key)) {
          selectedFields.push(field)
        } else {
          unselectedFields.push(field)
        }
      }

      if (selectedFields.length > 0) {
        groupedRows.push({
          rowId: generateUniqueId(),
          fields: selectedFields,
        })

        // Check if this is a complete row selection
        if (selectedFields.length === row.fields.length) {
          // All fields in this row are selected
          if (firstCompleteRowIndex === -1) {
            firstCompleteRowIndex = newBuilder.length
          }
        } else {
          // Partial row selection
          hasPartialRows = true
        }
      }

      if (unselectedFields.length > 0) {
        newBuilder.push({
          rowId: generateUniqueId(),
          fields: unselectedFields,
        })
      }
    }

    if (groupedRows.length > 0) {
      const group: FormGroupField = {
        variant: 'Group',
        name: `group_${Date.now()}`,
        key: `group_${Date.now()}`,
        label: { en: 'Group', ar: 'مجموعة' },
        repeatable: false,
        disabled: false,
        visibility: true,
        rowIndex: 0,
        fields: groupedRows,
      }

      // If we have complete rows and no partial rows, replace at the original position
      if (firstCompleteRowIndex !== -1 && !hasPartialRows) {
        newBuilder.splice(firstCompleteRowIndex, 0, {
          rowId: generateUniqueId(),
          fields: [group],
        })
      } else {
        // For partial selections or mixed cases, insert after the first row
        const insertIndex = Math.min(1, newBuilder.length)
        newBuilder.splice(insertIndex, 0, {
          rowId: generateUniqueId(),
          fields: [group],
        })
      }
    }

    return newBuilder
  }, [])

  const unGroupFields = useCallback((
    builder: FormRow[],
    groupKey: string
  ): FormRow[] => {
    const newBuilder: FormRow[] = []

    for (const row of builder) {
      const newFields: FormRow['fields'] = []

      for (const field of row.fields) {
        if (field.key === groupKey && field.variant === 'Group') {
          const group = field as FormGroupField

          // Insert inner fields from group into newBuilder preserving row structure
          for (const innerRow of group.fields) {
            newBuilder.push({
              rowId: innerRow.rowId || generateUniqueId(),
              fields: innerRow.fields.map((innerField: FormFieldType) => ({
                ...innerField,
                // Reset name and key if needed to avoid collisions
                key: innerField.key ?? generateUniqueId(),
                name: innerField.name ?? `name_${Date.now()}`,
              })),
            })
          }
        } else {
          newFields.push(field)
        }
      }

      // Only push the modified row if it has fields
      if (newFields.length > 0) {
        newBuilder.push({
          rowId: row.rowId,
          fields: newFields,
        })
      }
    }

    return newBuilder.filter((r) => r.fields.length > 0)
  }, [])

  const handleGroupSelectedFields = useCallback(({ inGroup, groupKey }: { inGroup: boolean; groupKey: string }) => {
    const updated = inGroup ? unGroupFields(formFields, groupKey) : groupSelectedFields(formFields, selectedFieldKeys)
    setFormFields(updated)
    setSelectedFieldKeys(new Set())
  }, [formFields, selectedFieldKeys, groupSelectedFields, unGroupFields, setFormFields, setSelectedFieldKeys])

  return {
    groupSelectedFields,
    unGroupFields,
    handleGroupSelectedFields
  }
}
