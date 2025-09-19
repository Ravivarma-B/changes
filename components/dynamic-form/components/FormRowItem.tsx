import React from 'react'
import { SortableRow } from '../screens/edit-form/SortableRow'
import { RowDropZone } from '../screens/edit-form/RowDropZone'
import SelectComponentPopover from '../screens/edit-form/FieldPopover'
import { FormFieldType, FormRow } from '../formBuilder.types'
import { fieldTypes } from '../constants'
import { ColumnDropFn, FieldToNewRowFn, RowReOrderFn } from '../hooks/useDragAndDrop'
import { DeleteFieldFn, HandleFieldClickFn } from '../hooks/useFormActions'

interface FormRowItemProps {
  row: FormRow
  index: number
  isLast: boolean
  handleFieldClick: HandleFieldClickFn
  handleGroupSelectedFields: ({ inGroup, groupKey }: { inGroup: boolean; groupKey: string }) => void
  openEditPanel: (field: FormFieldType) => void
  handleFieldDelete: DeleteFieldFn;
  handleDropToColumn: ColumnDropFn;
  handleDropFieldToNewRow: FieldToNewRowFn;
  handleDropRowReorder: RowReOrderFn;
  addNewColumn: (variant: string, rowIndex: number) => void
  shouldHidePopover: (fields: FormFieldType[]) => boolean
}

export const FormRowItem: React.FC<FormRowItemProps> = ({
  row,
  index,
  isLast,
  handleFieldClick,
  handleGroupSelectedFields,
  openEditPanel,
  handleFieldDelete,
  handleDropToColumn,
  handleDropFieldToNewRow,
  handleDropRowReorder,
  addNewColumn,
  shouldHidePopover
}) => {
  return (
    <div key={row.rowId} className="flex flex-col w-full gap-0">
      {/* Row DropZone - Full Width */}
      <RowDropZone
        rowIndex={index}
        rowId={row.rowId}
        position="above"
        onDropFieldToNewRow={handleDropFieldToNewRow}
        onDropRowReorder={handleDropRowReorder}
      />

      {/* Row + Popover side by side */}
      <div className="w-full flex items-center gap-2">
        <div className="flex-1">
          <SortableRow
            rowId={row.rowId}
            rowFields={row.fields}
            rowIndex={index}
            handleFieldClick={handleFieldClick}
            handleGroupSelectedFields={handleGroupSelectedFields}
            onEdit={openEditPanel}
            onDelete={(fieldKey) => handleFieldDelete(fieldKey)}
            onDropToColumn={handleDropToColumn}
            onFieldToNewRow={handleDropFieldToNewRow}
          />
        </div>
        
        {/* Right-Aligned Popover */}
        {!shouldHidePopover(row.fields) && (
          <SelectComponentPopover
            fieldTypes={fieldTypes}
            index={index}
            addNewColumn={addNewColumn}
            columnCount={row.fields.length}
          />
        )}
      </div>

      {/* Bottom DropZone - Full Width */}
      {isLast && (
        <RowDropZone
          rowIndex={index}
          rowId={row.rowId}
          position="below"
          onDropFieldToNewRow={handleDropFieldToNewRow}
          onDropRowReorder={handleDropRowReorder}
        />
      )}
    </div>
  )
}
