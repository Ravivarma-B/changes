import { useDndMonitor, useDroppable } from "@dnd-kit/core"
import { useEffect, useRef, useState } from "react"
import { cn } from "web-utils-common"
import { FieldToNewRowFn, RowReOrderFn } from "../../hooks/useDragAndDrop"

type DropPosition = "above" | "below"

interface RowDropZoneProps {
  rowId: string
  rowIndex: number,
  position: DropPosition
  onDropFieldToNewRow: FieldToNewRowFn;
  onDropRowReorder: RowReOrderFn
}

export const RowDropZone = ({
  rowId,
  rowIndex,
  position,
  onDropFieldToNewRow,
  onDropRowReorder,
}: RowDropZoneProps) => {
  const [activeData, setActiveData] = useState<any>(null)

  const { setNodeRef, isOver } = useDroppable({
    id: `row-dropzone-${rowId}-${position}`,
    data: {
      rowId,
      rowIndex,
      position,
      type: "dropzone",
    },
  })

  useDndMonitor({
    onDragStart: (event) => {
      const data = event.active?.data?.current
      if (data?.type === "field" || data?.type === "row") {
        setActiveData(data)
      }
    },
    onDragCancel: () => {
      setActiveData(null)
    },
    onDragEnd: () => {
      setActiveData(null)
    },
  })
    const hasDroppedRef = useRef(false)

    useEffect(() => {
      if (!isOver || !activeData || hasDroppedRef.current) return

      if (activeData.type === "field" && activeData.field?.key) {
          onDropFieldToNewRow({
            field: activeData.field,
            targetRowIndex: rowIndex,
            positionRowId: rowId,
            position
          })
      } else if (activeData.type === "row" && activeData.rowId) {
          onDropRowReorder({position, sourceRowId: activeData.rowId, targetRowId: rowId})
      }
    }, [isOver, activeData, rowId, position, onDropFieldToNewRow, onDropRowReorder])

    // Reset hasDropped when drag ends or drops somewhere else
    useEffect(() => {
      if (!isOver) {
          hasDroppedRef.current = false
      }
    }, [isOver])
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "h-2 w-full my-0 transition-all duration-150",
        isOver ? "bg-blue-500 opacity-60" : "bg-transparent"
      )}
    />
  )
}