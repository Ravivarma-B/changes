import { useEffect, useCallback } from 'react'
import { FormFieldType, FormGroupField, FormRow } from '../formBuilder.types'
import { removeFieldByKey, updateFieldByKey } from '../utils/FormUtils';

export const useKeyboardShortcuts = (
  selectedFieldKeys: Set<string>,
  formFields: FormRow[],
  setFormFields: (fields: FormRow[]) => void,
  setSelectedFieldKeys: (keys: Set<string>) => void,
  getFieldbyKey: (key: string) => FormFieldType | undefined,
  handleGroupSelectedFields: ({ inGroup, groupKey }: { inGroup: boolean; groupKey: string }) => void
) => {
  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in input elements or content-editable areas
      if (
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.contentEditable === 'true') ||
        (event.target instanceof HTMLElement && event.target.closest('[contenteditable="true"]')) ||
        (event.target instanceof HTMLElement && event.target.closest('.ProseMirror')) ||
        (event.target instanceof HTMLElement && event.target.closest('.tiptap')) ||
        (event.target instanceof HTMLElement && event.target.closest('[role="textbox"]'))
      ) {
        return
      }

      if (selectedFieldKeys.size === 0) {
        return
      }

      // Cmd/Ctrl + G for toggle group/ungroup
      if ((event.metaKey || event.ctrlKey) && event.key === 'g') {
        event.preventDefault()
        
        // First check if any selected field is a group or part of a group (for ungrouping)
        let isGrouped = false
        let groupKey = ''
        
        for (const key of selectedFieldKeys) {
          const field = getFieldbyKey(key)
          if (field) {
            // Check if the field itself is a group
            if (field.variant === 'Group') {
              isGrouped = true
              groupKey = field.key
              break
            }
            
            // Check if this field is part of a group
            for (const row of formFields) {
              for (const rowField of row.fields) {
                if (rowField.variant === 'Group' && rowField.key !== key) {
                  const group = rowField as FormGroupField
                  for (const innerRow of group.fields) {
                    for (const innerField of innerRow.fields) {
                      if (innerField.key === key) {
                        isGrouped = true
                        groupKey = rowField.key
                        break
                      }
                    }
                    if (isGrouped) break
                  }
                  if (isGrouped) break
                }
              }
              if (isGrouped) break
            }
            if (isGrouped) break
          }
        }
        
        // If any selected field is grouped, ungroup it
        if (isGrouped) {
          handleGroupSelectedFields({ inGroup: true, groupKey })
        }
        // Otherwise, only group if 1 or more fields are selected
        else if (selectedFieldKeys.size >= 1) {
          handleGroupSelectedFields({ inGroup: false, groupKey: '' })
        }
      }
      
      else if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        setFormFields(
          [...selectedFieldKeys].reduce((pv, cv) => {
            return removeFieldByKey(pv, cv).filter((r) => r.fields.length > 0)
          }, formFields)
        )
        setSelectedFieldKeys(new Set())
      }

      // Cmd/Ctrl + H for toggle visibility
      else if ((event.metaKey || event.ctrlKey) && event.key === 'h') {
        event.preventDefault()
        const firstSelectedKey = Array.from(selectedFieldKeys)[0]
        const firstField = getFieldbyKey(firstSelectedKey)
        const toggleVisibility = firstField ? !firstField.visibility : true
        
        setFormFields(
          [...selectedFieldKeys].reduce((pv, cv) => {
            return updateFieldByKey(pv, cv, {visibility: toggleVisibility})
          }, formFields)
        );
      }

      // Cmd/Ctrl + R for toggle required
      else if ((event.metaKey || event.ctrlKey) && event.key === 'r') {
        event.preventDefault()
        const firstSelectedKey = Array.from(selectedFieldKeys)[0]
        const firstField = getFieldbyKey(firstSelectedKey)
        const toggleRequired = firstField ? !firstField.required : true
        
        setFormFields(
          [...selectedFieldKeys].reduce((pv, cv) => {
            return updateFieldByKey(pv, cv, {required: toggleRequired})
          }, formFields)
        );
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedFieldKeys, formFields, getFieldbyKey, handleGroupSelectedFields, setFormFields, setSelectedFieldKeys])
}
