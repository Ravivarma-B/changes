import { useCallback } from 'react'
import { FormFieldType, FormGroupField, FormRow } from '../formBuilder.types'
import { createNewField, findFieldByKey, removeFieldByKey } from '../utils/FormUtils'

export type HandleFieldClickFn = (fieldKey: string, event: React.MouseEvent) => void;
export type GetFieldByKeyFn = (key: string) => FormFieldType | undefined;
export type DeleteFieldFn = (fieldKey: string) => void;

export const useFormActions = (
  formFields: FormRow[],
  setFormFields: (fields: FormRow[]) => void,
  openEditPanel: (field: FormFieldType) => void,
  selectedFieldKeys: Set<string>,
  setSelectedFieldKeys: (keys: Set<string>) => void,
  toggleSelectedFieldKey: (key: string) => void
) => {
  const getFieldbyKey: GetFieldByKeyFn = useCallback((key) => {
    return findFieldByKey(formFields, key)
  }, [formFields])

  const handleFieldClick: HandleFieldClickFn = useCallback((fieldKey, event) => {
    if (event.metaKey || event.ctrlKey) {
      toggleSelectedFieldKey(fieldKey)
    } else {
      const _selectedField = findFieldByKey(formFields, fieldKey)
      if (_selectedField) {
        setSelectedFieldKeys(new Set([fieldKey]))
        openEditPanel(_selectedField)
      }
    }
  }, [formFields, getFieldbyKey, toggleSelectedFieldKey, setSelectedFieldKeys, openEditPanel])

  const addNewColumn = useCallback((variant: string, rowIndex: number) => {
    const updated = [...formFields]
    const currentRow = { ...updated[rowIndex], fields: [...updated[rowIndex].fields] }

    if (currentRow.fields.length < 4) {
      currentRow.fields.push(createNewField(variant, rowIndex))
      updated[rowIndex] = currentRow
    }
    setFormFields(updated)
  }, [formFields, setFormFields])

  const shouldHidePopover = useCallback((fields: FormFieldType[]) => {
    return fields.some(field => field.variant === 'WYSIWYG' || field.variant === 'Group')
  }, [])

  const handleFieldDelete: DeleteFieldFn = useCallback((fieldKey) => {
    setFormFields(removeFieldByKey(formFields, fieldKey).filter((r => r.fields.length > 0)))
  }, [formFields, setFormFields])

  return {
    getFieldbyKey,
    handleFieldClick,
    addNewColumn,
    shouldHidePopover,
    handleFieldDelete
  }
}
