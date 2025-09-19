import { useState, useCallback } from 'react'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { FormFieldType, FormRow, FormGroupField } from '../formBuilder.types'
import { cloneDeep } from 'lodash'
import { appendFieldByRowIdRecursive, findFieldByKey, findRowById, generateUniqueId, insertRowBeforeRecursive, removeFieldByKey } from '../utils/FormUtils'

export type CommonFnProps = {path?: string | null;};

export type ColumnDropState = {
  field: FormFieldType,
  rowId: string,
  colIndex: number,
  position: 'left' | 'right'
} & CommonFnProps;

export type FieldToNewRowState = {
  field: FormFieldType,
  targetRowIndex: number,
  positionRowId: string,
  position: 'above' | 'below' | 'left' | 'right'
} & CommonFnProps;

export type RowReOrderState = {
  sourceRowId: string;
  targetRowId: string;
  position: string;
} & CommonFnProps;

export type DragState = ((FieldToNewRowState | ColumnDropState | RowReOrderState) & {action: string;}) | null;

export type ColumnDropFn = (data: ColumnDropState) => void;
export type FieldToNewRowFn = (data: FieldToNewRowState) => void;
export type RowReOrderFn = (data: RowReOrderState) => void;

export type GroupFieldReorderState = {
  sourceFieldKey: string;
  targetFieldKey: string;
  groupKey: string;
  sourceRowIndex: number;
  targetRowIndex: number;
  sourceFieldIndex: number;
  targetFieldIndex: number;
}

// export type DragState = ((FieldToNewRowState | ColumnDropState | RowReOrderState | GroupFieldReorderState) & {action: string}) | null

export const useDragAndDrop = (
  formFields: FormRow[],
  setFormFields: (fields: FormRow[]) => void
) => {
  const [activeField, setActiveField] = useState<FormFieldType | null>(null)
  const [activeRow, setActiveRow] = useState<FormRow | null>(null)
  const [dragState, setDragState] = useState<DragState | null>(null)

  // Helper function to remove field from groups recursively
  const removeFieldFromGroups = useCallback((fields: FormFieldType[], targetKey: string): FormFieldType[] => {
    return fields.map(f => {
      if (f.variant === 'Group') {
        const group = f as FormGroupField;
        return {
          ...f,
          fields: group.fields.map((row: FormRow) => ({
            ...row,
            fields: removeFieldFromGroups(row.fields, targetKey)
          })).filter((row: FormRow) => row.fields.length > 0)
        } as FormGroupField;
      }
      return f;
    }).filter(f => f.key !== targetKey);
  }, []);

  // Handle field to new row drag action
  const handleFieldToNewRowDrag = useCallback((state: FieldToNewRowState) => {
    const row = findRowById(formFields, state.positionRowId);
    if (row && state.position === 'above' && row.fields.length === 1 && findFieldByKey([row], state.field.key)) 
      return
    const flds = removeFieldByKey(formFields, state.field.key).filter((r) => r.fields.length > 0);
    setFormFields(insertRowBeforeRecursive(flds, state.positionRowId, {rowId: generateUniqueId(), fields: [state.field]}, state.position).filter((r) => r.fields.length > 0));
  }, [formFields, removeFieldFromGroups, setFormFields]);

  // Handle column drop to row drag action
  const handleColumnDropToRowDrag = useCallback((state: ColumnDropState) => {
    if (state.field.variant === 'Group') {
      return;
    }
    const row = findRowById(formFields, state.rowId);
    if (row?.fields.some((f) => f.variant === 'Group')) {
      return
    }
    setFormFields(
      appendFieldByRowIdRecursive(
        removeFieldByKey(
          formFields, 
          state.field.key
        ), 
        state.rowId, 
        state.field, 
        state.colIndex, 
        state.position
      ).filter(row => row.fields.length > 0)
    );
  }, [formFields, setFormFields]);

  // Handle row reorder drag action
  const handleRowReorderDrag = useCallback((state: RowReOrderState) => {
    const cloned = cloneDeep(formFields);
    
    if (!state.sourceRowId || !state.targetRowId || state.sourceRowId === state.targetRowId) {
      return;
    }

    const sourceIndex = cloned.findIndex(row => row.rowId === state.sourceRowId);
    const targetIndex = cloned.findIndex(row => row.rowId === state.targetRowId);
    
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    // Remove the source row
    const [movingRow] = cloned.splice(sourceIndex, 1);
    
    // Calculate new target index after removal
    let newTargetIndex = targetIndex;
    if (sourceIndex < targetIndex) {
      newTargetIndex = targetIndex - 1;
    }
    
    // Insert based on position
    if (state.position === 'below') {
      newTargetIndex += 1;
    }
    
    cloned.splice(newTargetIndex, 0, movingRow);
    setFormFields(cloned);
  }, [formFields, setFormFields]);

  // Handle direct row reordering without dragState
  const handleDirectRowReorder = useCallback((activeId: string, overId: string) => {
    const isRowDrag = formFields.some(row => row.rowId === activeId);
    const isRowDrop = formFields.some(row => row.rowId === overId);
    
    if (isRowDrag && isRowDrop) {
      const cloned = cloneDeep(formFields);
      const sourceIndex = cloned.findIndex(row => row.rowId === activeId);
      const targetIndex = cloned.findIndex(row => row.rowId === overId);
      
      if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
        const [movingRow] = cloned.splice(sourceIndex, 1);
        
        // Calculate new target index after removal
        let newTargetIndex = targetIndex;
        if (sourceIndex < targetIndex) {
          newTargetIndex = targetIndex - 1;
        }
        
        cloned.splice(newTargetIndex, 0, movingRow);
        setFormFields(cloned);
      }
      return true; // Indicates this case was handled
    }
    return false;
  }, [formFields, setFormFields]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!active || !over) {
      setDragState(null);
      return;
    }

    
    // Handle existing drag state operations first
    if (dragState) {
      switch (dragState.action) {
        case 'fieldToNewRow':
          handleFieldToNewRowDrag(dragState as FieldToNewRowState);
          break;
        case 'columDropToRow':
          handleColumnDropToRowDrag(dragState as ColumnDropState);
          break;
        case 'rowReOrder':
          handleRowReorderDrag(dragState as RowReOrderState);
          break;
      }
      setDragState(null);
      return;
    }
    
    // Handle direct drag and drop without explicit dragState
    if (active && over && active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;
      
      // Try row reordering first
      if (handleDirectRowReorder(activeId, overId)) {
        return;
      }
    }
    
    // Reset drag state if we reach here
    setDragState(null);
  }, [
    dragState, 
    handleFieldToNewRowDrag, 
    handleColumnDropToRowDrag, 
    handleRowReorderDrag,
    handleDirectRowReorder
  ])

  const handleGroupFieldReorder: RowReOrderFn = useCallback((data) => {
    setDragState({ ...data, action: "groupRowReOrder" })
  }, [])

  const handleDropFieldToNewRow: FieldToNewRowFn = useCallback((data) => {
    setDragState({ ...data, action: "fieldToNewRow" })
  }, [])

  const handleDropRowReorder: RowReOrderFn = useCallback((data) => {
    setDragState({ ...data, action: "rowReOrder" })
  }, [])

  const handleDropToColumn: ColumnDropFn = useCallback((data) => {
    setDragState({ ...data, action: "columDropToRow" })
  }, [])

  const handleDragStart = useCallback((e: any) => {
    const { rowId, index, field, groupKey } = e.active.data?.current ?? {}
    
    // If dragging a row (no index, but rowId exists)
    if (rowId && (index === undefined || index === null)) {
      const row = formFields.find(r => r.rowId === rowId)
      setActiveRow(row ?? null)
      setActiveField(null)
    } else {
      let targetField = field;
      
      // If no field in data, find it by key
      if (!targetField) {
        const fieldKey = e.active.id.toString().includes('-') ? 
          e.active.id.toString().split('-').pop() : e.active.id.toString();
        
        // Search in main form fields
        for (const row of formFields) {
          const foundField = row.fields.find(f => f.key === fieldKey);
          if (foundField) {
            targetField = foundField;
            break;
          }
          
          // Search in groups
          for (const formField of row.fields) {
            if (formField.variant === 'Group') {
              const group = formField as FormGroupField;
              for (const groupRow of group.fields) {
                const groupField = groupRow.fields.find((gf: FormFieldType) => gf.key === fieldKey);
                if (groupField) {
                  targetField = groupField;
                  break;
                }
              }
              if (targetField) break;
            }
          }
          if (targetField) break;
        }
      }
      
      setActiveField(targetField ?? null)
      setActiveRow(null)
    }
  }, [formFields])

  const handleDragCancel = useCallback(() => {
    setActiveField(null)
    setActiveRow(null)
  }, [])

  const resetDragState = useCallback(() => {
    setActiveField(null)
    setActiveRow(null)
  }, [])

  return {
    activeField,
    activeRow,
    dragState,
    handleDragEnd,
    handleDropFieldToNewRow,
    handleDropRowReorder,
    handleDropToColumn,
    handleGroupFieldReorder,
    handleDragStart,
    handleDragCancel,
    resetDragState
  }
}
