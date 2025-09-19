import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import { FormFieldType, FormRow, FormGroupField } from '../formBuilder.types'
import { cn } from 'web-utils-common'

import type {Modifier} from '@dnd-kit/core';
import {getEventCoordinates} from '@dnd-kit/utilities';
import { DragState } from '../hooks'
import { Group, Rows2, SquarePen } from 'lucide-react';

interface DragOverlayContentProps {
  activeField: FormFieldType | null
  activeRow: FormRow | null
  dragState: DragState | null
}


type AlteredModifierArgs = [...Parameters<Modifier>, DragState];

type AlteredModifierFn = (...args: AlteredModifierArgs) => ReturnType<Modifier>;



export const snapCursorToEdge: AlteredModifierFn = ({
  activatorEvent,
  draggingNodeRect,
  transform
}, dragState) => {
  if (draggingNodeRect && activatorEvent) {
    const activatorCoordinates = getEventCoordinates(activatorEvent);

    if (!activatorCoordinates) {
      return transform;
    }

    const offsetX = activatorCoordinates.x - draggingNodeRect.left;
    const offsetY = activatorCoordinates.y - draggingNodeRect.top;

    return {
      ...transform,
      x: transform.x + (dragState?.action !== 'rowReOrder' ? offsetX - 10 - draggingNodeRect.width / 2 : offsetX + 20 ),
      y: transform.y + (dragState?.action !== 'rowReOrder' ? offsetY : offsetY - draggingNodeRect.height ) ,
    };
  }

  return transform;
};

export function DragOverlayContent({ activeField, activeRow, dragState }: DragOverlayContentProps) {
  return (
    <DragOverlay 
      dropAnimation={{
        duration: 200,
        easing: 'ease-out',
      }}
      modifiers={[(args) => snapCursorToEdge(args, dragState)]}
      style={{
        transformOrigin: '0 0',
        zIndex: 999999, // Ensure it's above everything
      }}
      className='-rotate-3'
      zIndex={999999}
    >
      {activeField && (
        <div 
          className="flex bg-white/95 dark:bg-slate-800/95 rounded-lg shadow-xl border dark:border-gray-600 p-3 min-w-[120px] max-w-[320px] backdrop-blur-sm"
          style={{ 
            transform: 'rotate(3deg)', // Slight rotation for visual feedback
            pointerEvents: 'none' // Prevent interference with drop zones
          }}
        >
          <div className="flex gap-2 items-center">
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {activeField.variant === 'Group' ? <span className='flex flex-row items-center gap-2'><Group size={16} /><span>Group</span> </span> : <span className='flex flex-row items-center gap-2'><SquarePen size={16} /> <span>Field</span></span>}
            </div>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-medium shadow-sm",
              activeField.variant === 'Group' 
                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700" 
                : "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
            )}>
              {activeField.label?.en || activeField.variant}
              {activeField.variant === 'Group' && (
                <span className="ml-1 text-xs opacity-75">
                  ({(activeField as FormGroupField).fields.reduce((acc: number, row: FormRow) => acc + row.fields.length, 0)} fields)
                </span>
              )}
            </div>
          </div>
        </div>
      )}
      {activeRow && (
        <div 
          className="bg-white/95 w-full dark:bg-slate-800/95 rounded-lg shadow-xl border dark:border-gray-600 p-3 max-w-[400px] backdrop-blur-sm"
          style={{ 
            transform: 'rotate(2deg)', // Slight rotation for visual feedback
            pointerEvents: 'none' // Prevent interference with drop zones
          }}
        >
          <div className="flex gap-2 items-center flex-wrap">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Rows2 /> <span>Row</span></span>
            {activeRow.fields.map((f) => (
              <span 
                key={f.key} 
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded text-xs font-medium shadow-sm"
              >
                {f.label?.en || f.variant}
              </span>
            ))}
          </div>
        </div>
      )}
    </DragOverlay>
  )
}
