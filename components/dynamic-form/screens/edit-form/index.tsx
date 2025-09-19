import React from 'react'
import { DndContext, pointerWithin, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext } from '@dnd-kit/sortable'
import { FormFieldType } from '../../formBuilder.types'
import { useFormBuilderStore } from '../../store/formBuilder.store'

// Custom hooks
import { useDragAndDrop, useGrouping, useKeyboardShortcuts, useFormActions } from '../../hooks'

// Components
import { DragOverlayContent, FormRowItem } from '../../components'

interface Props {
  openEditPanel: (field: FormFieldType) => void
}


export const EditForm = ({ openEditPanel }: Props) => {
  const {
    formFields,
    selectedFieldKeys,
    setFormFields,
    setSelectedFieldKeys,
    toggleSelectedFieldKey,
  } = useFormBuilderStore()

  // Custom hooks for different functionalities
  const {
    activeField,
    activeRow,
    dragState,
    handleDragEnd,
    handleDropFieldToNewRow,
    handleDropRowReorder,
    handleDropToColumn,
    handleDragStart,
    handleDragCancel,
    resetDragState
  } = useDragAndDrop(formFields, setFormFields)

  const {
    handleGroupSelectedFields
  } = useGrouping(formFields, setFormFields, setSelectedFieldKeys, selectedFieldKeys)

  const {
    getFieldbyKey,
    handleFieldClick,
    addNewColumn,
    shouldHidePopover,
    handleFieldDelete
  } = useFormActions(
    formFields, 
    setFormFields, 
    openEditPanel, 
    selectedFieldKeys, 
    setSelectedFieldKeys, 
    toggleSelectedFieldKey
  )

  // Set up keyboard shortcuts
  useKeyboardShortcuts(
    selectedFieldKeys,
    formFields,
    setFormFields,
    setSelectedFieldKeys,
    getFieldbyKey,
    handleGroupSelectedFields
  )

  // Configure sensors for better drag experience with immediate response
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3, // Small distance to prevent accidental drags
    },
  })
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // Small delay for touch to allow scrolling
      tolerance: 5,
    },
  })
  
  const sensors = useSensors(mouseSensor, touchSensor)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragEnd={e => {
        resetDragState()
        handleDragEnd(e)
      }}
      onDragStart={handleDragStart}
      onDragCancel={handleDragCancel}
      autoScroll={{
        enabled: true, // Enable auto-scroll
        threshold: {
          x: 0, // Disable horizontal auto-scroll (no left/right expansion)
          y: 0.15, // Enable vertical auto-scroll when cursor is within 15% of top/bottom
        },
        acceleration: 1, // Smooth scrolling speed
        interval: 5, // Scroll frequency (ms)
      }}
    >
      <SortableContext items={formFields.map(r => r.rowId)}>
        {formFields.map((row, index) => (
          <FormRowItem
            key={row.rowId}
            row={row}
            index={index}
            isLast={index === formFields.length - 1}
            handleFieldClick={handleFieldClick}
            handleGroupSelectedFields={handleGroupSelectedFields}
            openEditPanel={openEditPanel}
            handleFieldDelete={handleFieldDelete}
            handleDropToColumn={handleDropToColumn}
            handleDropFieldToNewRow={handleDropFieldToNewRow}
            handleDropRowReorder={handleDropRowReorder}
            addNewColumn={addNewColumn}
            shouldHidePopover={shouldHidePopover}
          />
        ))}
      </SortableContext>

      <DragOverlayContent 
        activeField={activeField} 
        activeRow={activeRow} 
        dragState={dragState}
      />
    </DndContext>
  )
}