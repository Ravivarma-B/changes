import { useDndMonitor, useDroppable } from "@dnd-kit/core"
import { useEffect, useState } from "react"
import { cn } from "web-utils-common"
import { ColumnDropFn } from "../../hooks/useDragAndDrop"

interface ColumnDropZoneProps {
  rowId: string
  colIndex: number
  position: 'left' | 'right';
  onDropToColumn: ColumnDropFn
}

export const ColumnDropZone = ({
  rowId,
  colIndex,
  position,
  onDropToColumn,
}: ColumnDropZoneProps) => {
  const [activeData, setActiveData] = useState<any>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: `column-dropzone-${rowId}-${colIndex}-${position}`,
    data: {
      rowId,
      colIndex,
      position,
      type: 'column-dropzone'
    }
  })

  useDndMonitor({
    onDragStart: (event) => {
      setActiveData(event.active.data?.current)
    }
  })

  useEffect(() => {
    if (!isOver || !activeData) return

    if (activeData.type === "field" && activeData.field?.key) {
      onDropToColumn({
        field: activeData.field,
        rowId,
        colIndex,
        position
      })
      
    }
  }, [isOver, activeData])

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'w-2 bg-blue-500 transition-all opacity-0',
        isOver && 'opacity-60'
      )}
    />
  )
}