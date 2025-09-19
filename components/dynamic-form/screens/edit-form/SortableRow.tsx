import React from 'react'
import { useSortable, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { cn } from 'web-utils-common'
import { SortableFieldItem } from './SortableFieldItem'
import { FormFieldType, FormRow } from '../../formBuilder.types'
import { ColumnDropZone } from './ColumnDropZone'
import { useFormBuilderStore } from '../../store/formBuilder.store'
import { ColumnDropFn, FieldToNewRowFn } from '../../hooks/useDragAndDrop'
import { DeleteFieldFn, HandleFieldClickFn } from '../../hooks/useFormActions'

interface SortableRowProps {
  rowId: string
  rowFields: FormFieldType[]
  rowIndex: number
  handleGroupSelectedFields: ({ inGroup, groupKey }: { inGroup: boolean; groupKey: string }) => void
  onDropToColumn: ColumnDropFn
  onFieldToNewRow: FieldToNewRowFn;
  onEdit: (field: FormFieldType) => void
  onDelete: DeleteFieldFn
  handleFieldClick: HandleFieldClickFn
  dragOverlay?: boolean // for overlay visual effect
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

export const SortableRow: React.FC<SortableRowProps> = ({
  rowId,
  rowFields,
  rowIndex,
  onDropToColumn,
  onDelete,
  handleFieldClick,
  handleGroupSelectedFields,
  dragOverlay = false,
  onFieldToNewRow,
  onEdit,
}) => {
  const { selectedFieldKeys } = useFormBuilderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: rowId,
    data: {
      type: 'row',
      rowId,
      rowData: rowFields // full array of fields in this row
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: dragOverlay ? 'grabbing' : undefined,
    opacity: dragOverlay || isDragging ? 0.6 : 1,
    zIndex: dragOverlay ? 9999 : undefined,
  }

  return (
    <SortableContext
      items={rowFields.map((f) => `${rowId}-${f.key}`)}
      strategy={horizontalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'flex gap-2 items-center group/outer w-full',
          dragOverlay && 'shadow-lg bg-white dark:bg-gray-800 rounded-md p-3'
        )}
      >
        {/* Row drag handle */}
        <div
          className="flex items-center justify-center h-full "
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-grab active:cursor-grabbing group-hover/outer:opacity-100 opacity-40" />
        </div>

        <div className="flex-1 w-full space-y-2">
          <div className="w-full grid grid-cols-12 gap-0">
            {rowFields.map((field, colIndex) => (
              <div key={field.key} className={cn(getColSpan(rowFields.length))}>
                <div className="flex relative">
                  <ColumnDropZone
                    rowId={rowId}
                    colIndex={colIndex}
                    position="left"
                    onDropToColumn={onDropToColumn}
                  />
                  <SortableFieldItem
                    field={field}
                    index={colIndex}
                    rowIndex={rowIndex}
                    rowId={rowId}
                    handleGroupSelectedFields={handleGroupSelectedFields}
                    isSelected={selectedFieldKeys.has(field.key)}
                    handleFieldClick={handleFieldClick}
                    onDelete={onDelete}
                    onDropToColumn={onDropToColumn}
                    onFieldToNewRow={onFieldToNewRow}
                    onEdit={onEdit}
                  />
                  {colIndex === rowFields.length - 1 &&  <ColumnDropZone
                    rowId={rowId}
                    colIndex={colIndex}
                    position="right"
                    onDropToColumn={onDropToColumn}
                  />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SortableContext>
  )
}