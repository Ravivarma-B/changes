import React, { useEffect } from 'react';
import { useFormBuilderStore } from '../../store/formBuilder.store';
import { Button } from 'web-utils-components/button';
import { Redo, RotateCcw, Undo } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from 'web-utils-components/tooltip';
import { ToggleGroup, ToggleGroupItem } from 'web-utils-components/toggle-group';

const UndoRedoReset = () => {
    const {
        undo,
        redo,
        past,
        future,
        formFields
    } = useFormBuilderStore();

    const handleUndo = () => {
        undo();
    };

    const handleRedo = () => {
        redo();
    };

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Check if it's Cmd+Z (Mac) or Ctrl+Z (Windows/Linux) for undo
            if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey) {
                event.preventDefault();
                if (past.length > 0) {
                    handleUndo();
                }
            }
            // Check if it's Cmd+Shift+Z (Mac) or Ctrl+Y (Windows/Linux) for redo
            else if (
                ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Z') ||
                ((event.metaKey || event.ctrlKey) && event.key === 'y')
            ) {
                event.preventDefault();
                if (future.length > 0) {
                    handleRedo();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [past, future, handleUndo, handleRedo]);

    return (
        <div className="flex items-center gap-2">
            <ToggleGroup type="single" variant="outline" aria-label="Undo, Redo, Reset buttons">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem
                            value="undo"
                            aria-label="Undo Last Action"
                            onClick={handleUndo}
                            disabled={past.length === 0}
                        >
                            
                            <Undo className="w-5 h-5" />
                                
                        </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Undo (⌘Z / Ctrl+Z)</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <ToggleGroupItem
                            value="redo"
                            aria-label="Redo Last Action"
                            onClick={handleRedo}
                            disabled={future.length === 0}
                        >
                            <Redo className="w-5 h-5" />
                        </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Redo (⌘⇧Z / Ctrl+Y)</p>
                    </TooltipContent>
                </Tooltip>

            </ToggleGroup>
        </div>
    );

};

export default UndoRedoReset;