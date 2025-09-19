import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BaseFormFieldTypeSchema, FormFieldType, FormGroupField, FormRow } from '@/components/dynamic-form/formBuilder.types'
import { Button } from 'web-utils-components/button'
import { LuGripVertical, LuTrash2 } from 'react-icons/lu'
import { cn } from 'web-utils-common'
import { getVariantIcon } from '../../constants'
import { ArrowRight, Ban, EyeOff, TriangleAlert } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from 'web-utils-components/popover'
import { useState } from 'react'
import { WysiwygEditor } from '../../components/wisiwyg/WisiwygEditor'
import { ContextMenuForSelection } from './ContextMenu'
import { useFormBuilderStore } from '../../store/formBuilder.store'
import { SortableGroupField } from './SortableGroupField'
import { ColumnDropFn, FieldToNewRowFn, RowReOrderFn } from '../../hooks/useDragAndDrop'
import { DeleteFieldFn, HandleFieldClickFn } from '../../hooks/useFormActions'
import { removeFieldByKey, updateFieldByKey } from '../../utils/FormUtils'

interface SortableFieldItemProps {
  field: FormFieldType
  index: number
  rowIndex: number
  rowId: string
  isSelected: boolean
  handleGroupSelectedFields: ({ inGroup, groupKey }: { inGroup: boolean; groupKey: string }) => void
  handleFieldClick: HandleFieldClickFn
  dragOverlay?: boolean
  onDelete: DeleteFieldFn
  onDropToColumn: ColumnDropFn;
  onFieldToNewRow: FieldToNewRowFn;
  onEdit: (field: FormFieldType) => void
}

export const SortableFieldItem = ({
  field,
  index,
  rowIndex,
  rowId,
  isSelected,
  handleFieldClick,
  handleGroupSelectedFields,
  dragOverlay = false,
  onDelete,
  onDropToColumn,
  onFieldToNewRow,
  onEdit
}: SortableFieldItemProps) => {
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
      type: 'field',
      index,
      rowId,
      field
    },
  });

  const { formFields, selectedFieldKeys, setFormFields} = useFormBuilderStore();

  const [open, setOpen] = useState<boolean>(false);
  const [editorValue, setEditorValue] = useState<string>(field.html as string);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: dragOverlay ? 'grabbing' : 'grab',
    opacity: isDragging || dragOverlay ? 0.6 : 1,
    zIndex: dragOverlay ? 9999 : 'auto',
  }

  const deleteFields = (field: FormFieldType) => {
    // If the field is not selected, delete it from the current row
    if(!selectedFieldKeys.has(field.key)) {
      setFormFields(removeFieldByKey(formFields, field.key).filter((r) => r.fields.length > 0));
      return;
    }
    if (selectedFieldKeys.size === 0) return;
    // If multiple fields are selected, delete all selected fields
    setFormFields(
      [...selectedFieldKeys].reduce((pv, cv) => {
        return removeFieldByKey(pv, cv).filter((r) => r.fields.length > 0)
      }, formFields)
    );
  }

  const toggleFieldRequired = (field: FormFieldType) => {
    if(!selectedFieldKeys.has(field.key)) {
      setFormFields(
        updateFieldByKey(formFields, field.key, {required: !field.required})
      );
      return;
    }
    if (selectedFieldKeys.size === 0) return;

    // If multiple fields are selected, toggle required for all selected fields
    const toggleRequired = !field.required;
    setFormFields(
      [...selectedFieldKeys].reduce((pv, cv) => {
        return updateFieldByKey(pv, cv, {required: toggleRequired})
      }, formFields)
    );
  }

  const toggleFieldDisabled = (field: FormFieldType) => {
    if(!selectedFieldKeys.has(field.key)) {
      setFormFields(
        updateFieldByKey(formFields, field.key, {disabled: !field.disabled})
      );
      return;
    }
    if (selectedFieldKeys.size === 0) return;
    // If multiple fields are selected, toggle disabled for all selected fields
    const toggleDisabled = !field.disabled;
    setFormFields(
      [...selectedFieldKeys].reduce((pv, cv) => {
        return updateFieldByKey(pv, cv, {disabled: toggleDisabled})
      }, formFields)
    );
  }

  const toggleFieldVisibility = (field: FormFieldType) => {
    if(!selectedFieldKeys.has(field.key)) {
      setFormFields(
        updateFieldByKey(formFields, field.key, {visibility: !field.visibility})
      );
      return;
    }
    if (selectedFieldKeys.size === 0) return;
    // If multiple fields are selected, toggle disabled for all selected fields
    const toggleVisibility = !field.visibility;
    setFormFields(
      [...selectedFieldKeys].reduce((pv, cv) => {
        return updateFieldByKey(pv, cv, {visibility: toggleVisibility})
      }, formFields)
    );
  }

  const updateWYSIWYGValue = (value: string) => {
    const updatedFields = formFields.map((row) => {
      if (row.rowId === rowId) {
        return {
          ...row,
          fields: row.fields.map((f) => {
            if (f.key === field.key) {
              return { ...f, html: value };
            }
            return f;
          }),
        };
      }
      return row;
    });
    setFormFields(updatedFields);
  }

  // Check the field key is group or the field key is part of a group
  const isPartOfGroup = (
    key: string
  ): { inGroup: boolean; groupKey: string } => {
    for (const row of formFields) {
      for (const field of row.fields) {

        // Direct match (field is itself a group or standalone field)
        if (field.key === key && field.variant === "Group") {
          return { inGroup: true, groupKey: field.key };
        }
        // Check if the field is part of a group   
        if (field.variant === "Group") {
          const group = field as FormGroupField;

          for (const innerRow of group.fields) {
            for (const innerField of innerRow.fields) {
              if (innerField.key === key) {
                return { inGroup: true, groupKey: field.key };
              }
            }
          }
        }

        
      }
    }

    return { inGroup: false, groupKey: "" };
  };

  const Icon = getVariantIcon(field.variant)
  const validationResult = BaseFormFieldTypeSchema.safeParse(field)
  const fieldErrors = !validationResult.success 
    ? validationResult.error.issues.map(e => e.message) 
    : [];
  
  // Handle Group fields specially
  if(field.variant === 'Group') {
    return (
      <div
          ref={setNodeRef}
          style={style}
          className={
            cn(
              "w-[calc(100%-54px)] flex items-center gap-2 bg-white/5 dark:bg-gray-800/5 transition-transform", 
              isSelected && 'border-slate-200 dark:border-slate-600/60 bg-slate-200/40 dark:bg-slate-700/80 backdrop-blur-md',
            )
          }
          // onClick={() => onEdit(field)}
          {...attributes}
          {...listeners}
        >
          <SortableGroupField
            field={field as FormGroupField}
            index={index}
            rowIndex={rowIndex}
            rowId={rowId}
            isSelected={isSelected}
            handleGroupSelectedFields={handleGroupSelectedFields}
            handleFieldClick={handleFieldClick}
            onDelete={onDelete}
            onDropToColumn={onDropToColumn}
            dragOverlay={dragOverlay}
            onFieldToNewRow={onFieldToNewRow}
            onEdit={onEdit}
          />
      </div>
    )
  }
  
  if(field.variant.toLowerCase() === 'wysiwyg') {
    return (
      <ContextMenuForSelection
        onToggleGroup={() => handleGroupSelectedFields(isPartOfGroup(field.key))}
        onDelete={() => deleteFields(field)}
        onToggleDisable={() => toggleFieldDisabled(field)}
        onToggleVisibility={() => toggleFieldVisibility(field)}
        onToggleRequired={() => toggleFieldRequired(field)}
        isDisabled={field.disabled}
        isVisible={field.visibility !== false}
        isRequired={field.required}
        isGrouped={isPartOfGroup(field.key).inGroup}
      >
        <div
          ref={setNodeRef}
          style={style}
          className={
            cn(
              "w-[calc(100%-54px)] group/inner flex items-center gap-2 bg-white/5 dark:bg-gray-800/5 transition-transform", 
              isSelected && 'border-slate-200 dark:border-slate-600/60 bg-slate-200/40 dark:bg-slate-700/80 backdrop-blur-md',
            )
          }
          // onClick={() => onEdit(field)}
          {...attributes}
          {...listeners}
        >
          <WysiwygEditor
            value={typeof editorValue === 'string' ? editorValue: ''}
            onChange={(val) => { setEditorValue(val); updateWYSIWYGValue(val);}}
            placeholder={field.placeholder?.['en'] || 'Enter text...'}
            disabled={field.disabled}
          />

          <div className="absolute items-center hidden group-hover/inner:block right-15">
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
          </div>
        </div>
      </ContextMenuForSelection>
    )
  }

  const partOfGroup = isPartOfGroup(field.key);

  return (
    <ContextMenuForSelection
      onToggleGroup={() => handleGroupSelectedFields(partOfGroup)}
      onDelete={() => deleteFields(field)}
      onToggleDisable={() => toggleFieldDisabled(field)}
      onToggleVisibility={() => toggleFieldVisibility(field)}
      onToggleRequired={() => toggleFieldRequired(field)}
      isDisabled={field.disabled}
      isVisible={field.visibility !== false}
      isRequired={field.required}
      isGrouped={partOfGroup.inGroup}
    >
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        onClick={(e) => {handleFieldClick(field.key, e); e.stopPropagation()}}
        className={cn(
          'relative flex justify-between group/inner h-14 items-center !cursor-pointer w-full border rounded p-2 pr-4 bg-white/40 dark:bg-gray-800/60  border-slate-300/60 dark:border-gray-700/30 shadow-sm transition-transform',
          dragOverlay && 'cursor-grabbing shadow-lg',
          isSelected && 'border-slate-200 dark:border-slate-600/60 bg-slate-200/40 dark:bg-slate-700/80 backdrop-blur-md',
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {/*  Only this icon acts as drag handle */}
          <div
            className="cursor-grab active:cursor-grabbing text-gray-400 dark:text-gray-500"
            {...attributes}
            {...listeners}
          >
            <LuGripVertical className="w-4 h-4" />
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{field.label?.en || field.variant} {field.required && '*'}</span>
        </div>

        <div className="absolute items-center hidden group-hover/inner:block right-2 ">
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
        </div>
        <div className="flex gap-4 items-center">
          {fieldErrors.length > 0 && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <div
                  className="inline-flex"
                  onMouseEnter={() => setOpen(true)}
                  onMouseLeave={() => setOpen(false)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <TriangleAlert className="w-4 h-4 text-yellow-500 cursor-pointer" />
                </div>
              </PopoverTrigger>
              <PopoverContent
                className="w-64 text-xs text-gray-700 dark:text-gray-300"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <div className="space-y-1">
                  {fieldErrors.map((err, i) => (
                    <div className="flex gap-2 items-center" key={i}>
                      <ArrowRight size={13} /> {err}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
          {field.disabled && <Ban strokeWidth={2} size={13}/>}
          {!field.visibility && <EyeOff strokeWidth={2} size={13}/>}    
          {Icon && <Icon size={15} />}
        </div>
      </div>
    </ContextMenuForSelection>
  )
}
