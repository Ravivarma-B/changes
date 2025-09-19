import React from 'react'
import { useSortable, SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FormGroupField, FormFieldType, FormRow } from '@/components/dynamic-form/formBuilder.types'
import { cn } from 'web-utils-common'
import { SortableFieldItem } from './SortableFieldItem'
import { LuGripVertical, LuTrash2 } from 'react-icons/lu'
import { Group } from 'lucide-react'
import { useFormBuilderStore } from '../../store/formBuilder.store'
import { ContextMenuForSelection } from './ContextMenu'
import { ColumnDropZone } from './ColumnDropZone'
import { ColumnDropFn, FieldToNewRowFn } from '../../hooks/useDragAndDrop'
import { DeleteFieldFn, HandleFieldClickFn } from '../../hooks/useFormActions'
import { RowDropZone } from './RowDropZone'
import { Button } from 'web-utils-components/button'

interface SortableGroupFieldProps {
  field: FormGroupField
  index: number
  rowIndex: number
  rowId: string
  isSelected: boolean
  handleGroupSelectedFields: ({ inGroup, groupKey }: { inGroup: boolean; groupKey: string }) => void
  handleFieldClick: HandleFieldClickFn
  onEdit: (field: FormFieldType) => void
  onDelete: DeleteFieldFn
  onDropToColumn: ColumnDropFn
  onFieldToNewRow: FieldToNewRowFn;
  dragOverlay?: boolean
}

const getColSpan = (count: number) => {
  switch (count) {
    case 2:
      return 'col-span-6'
    case 3:
      return 'col-span-4'
    case 4:
      return 'col-span-3'
    default:
      return 'col-span-12'
  }
}

export const SortableGroupField: React.FC<SortableGroupFieldProps> = ({
  field,
  index,
  rowIndex,
  rowId,
  isSelected,
  handleGroupSelectedFields,
  handleFieldClick,
  onDelete,
  onDropToColumn,
  onFieldToNewRow,
  onEdit,
  dragOverlay = false,
}) => {
  const { selectedFieldKeys, formFields, setFormFields } = useFormBuilderStore();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.key,
    data: {
      type: 'group',
      index,
      rowId,
      field
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: dragOverlay ? 'grabbing' : 'grab',
    opacity: isDragging || dragOverlay ? 0.6 : 1,
    zIndex: dragOverlay ? 9999 : 'auto',
  }

  // Toggle functions for context menu
  const toggleGroupField = () => {
    handleGroupSelectedFields({ inGroup: true, groupKey: field.key });
  };

  const deleteField = () => {
    onDelete(field.key);
  };

  const toggleFieldRequired = () => {
    setFormFields(
      formFields.map((row) => ({
        ...row,
        fields: row.fields.map((f) =>
          f.key === field.key ? { ...f, required: !f.required } : f
        )
      }))
    );
  };

  const toggleFieldDisabled = () => {
    setFormFields(
      formFields.map((row) => ({
        ...row,
        fields: row.fields.map((f) =>
          f.key === field.key ? { ...f, disabled: !f.disabled } : f
        )
      }))
    );
  };

  const toggleFieldVisibility = () => {
    setFormFields(
      formFields.map((row) => ({
        ...row,
        fields: row.fields.map((f) =>
          f.key === field.key ? { ...f, visibility: !f.visibility } : f
        )
      }))
    );
  };

  return (
    <ContextMenuForSelection
      onToggleGroup={toggleGroupField}
      onDelete={deleteField}
      onToggleRequired={toggleFieldRequired}
      onToggleDisable={toggleFieldDisabled}
      onToggleVisibility={toggleFieldVisibility}
      isGrouped={true}
      isDisabled={field.disabled ?? false}
      isVisible={field.visibility ?? true}
      isRequired={field.required ?? false}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'w-[calc(100%-5px)] border rounded-md p-3 bg-white/20 dark:bg-slate-900/50 backdrop-blur-sm border-slate-200 dark:border-slate-700/30',
          dragOverlay && 'cursor-grabbing shadow-lg',
          isSelected && 'border-slate-200 dark:border-slate-600/60 bg-slate-200/20 dark:bg-slate-700/40 backdrop-blur-md',
        )}
        onClick={(e) => handleFieldClick(field.key, e)}
      >
      {/* Group Header */}
        <div 
          className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700/60"
        >
        <div
          className="cursor-grab active:cursor-grabbing text-slate-500 dark:text-slate-400"
          {...attributes}
          {...listeners}
        >
          <LuGripVertical className="w-4 h-4" />
        </div>
        <Group className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {field.label?.en || 'Group'} {field.required && '*'}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400 ml-auto flex gap-2 items-center">
          {field.fields.reduce((acc: number, row: FormRow) => acc + row.fields.length, 0)} fields
           <div className="flex gap-1">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className='cursor-pointer hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation(); // Prevent accidental drag
                onDelete(field.key)
              }}
            >
              <LuTrash2 className="w-4 h-4" />
            </Button>
          </div>
        </span>
      </div>

      {/* Group Fields */}
      <div>
        {field.fields.filter((row: FormRow) => row.fields.length > 0).map((row: FormRow, groupRowIndex: number) => (
          <SortableContext 
            key={row.rowId || groupRowIndex} 
            items={row.fields.map(f => `${field.key}-${f.key}`)} 
            strategy={horizontalListSortingStrategy}
          >
            <RowDropZone
              rowIndex={groupRowIndex}
              rowId={row.rowId}
              position="above"
              onDropFieldToNewRow={onFieldToNewRow}
              onDropRowReorder={() => null}
            />
            <div className="w-full grid grid-cols-12" onMouseOver={(e) => e.stopPropagation()}>
              {row.fields.map((groupField: FormFieldType, groupFieldIndex: number) => (
                <div key={groupField.key} className={cn(getColSpan(row.fields.length))}>
                  <div className="flex relative">
                    {onDropToColumn && (
                      <ColumnDropZone
                        rowId={row.rowId || `group-${groupRowIndex}`}
                        colIndex={groupFieldIndex}
                        position="left"
                        onDropToColumn={onDropToColumn}
                      />
                    )}
                    {groupField.variant === 'Group' ? (
                      // Nested group - recursive rendering
                      <SortableGroupField
                        field={groupField as FormGroupField}
                        index={groupFieldIndex}
                        rowIndex={groupRowIndex}
                        rowId={row.rowId || `group-${groupRowIndex}`}
                        isSelected={selectedFieldKeys.has(groupField.key)}
                        handleGroupSelectedFields={handleGroupSelectedFields}
                        handleFieldClick={handleFieldClick}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onDropToColumn={onDropToColumn}
                        onFieldToNewRow={onFieldToNewRow}
                      />
                    ) : (
                      // Regular field within group
                      <SortableFieldItem
                        field={groupField}
                        index={groupFieldIndex}
                        rowIndex={groupRowIndex}
                        rowId={row.rowId || `group-${groupRowIndex}`}
                        isSelected={selectedFieldKeys.has(groupField.key)}
                        handleGroupSelectedFields={handleGroupSelectedFields}
                        handleFieldClick={handleFieldClick}
                        onDelete={onDelete}
                        onDropToColumn={onDropToColumn}
                        onFieldToNewRow={onFieldToNewRow}
                        onEdit={onEdit}
                      />
                    )}
                    {onDropToColumn && groupFieldIndex === row.fields.length - 1 && (
                      <ColumnDropZone
                        rowId={row.rowId || `group-${groupRowIndex}`}
                        colIndex={groupFieldIndex}
                        position="right"
                        onDropToColumn={onDropToColumn}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {
              groupRowIndex === field.fields.filter((row: FormRow) => row.fields.length > 0).length - 1 && <RowDropZone
                rowIndex={groupRowIndex}
                rowId={row.rowId}
                position="below"
                onDropFieldToNewRow={onFieldToNewRow}
                onDropRowReorder={() => null}
              />
            }
          </SortableContext>
        ))}
      </div>

      {/* Group Footer - Optional actions */}
      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Group: {field.key}</span>
          {field.repeatable && <span>Repeatable</span>}
        </div>
      </div>
      </div>
    </ContextMenuForSelection>
  )
}
