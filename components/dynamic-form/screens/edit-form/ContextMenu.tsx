'use client'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "web-utils-components/context-menu"

import {
  Eye,
  EyeOff,
  Ban,
  Check,
  Trash2,
  Star,
  StarOff,
  Group,
  Ungroup,
} from "lucide-react"

interface SelectionContextMenuProps {
    children: React.ReactNode
    onToggleGroup: () => void
    onDelete: () => void
    onToggleDisable: () => void
    onToggleVisibility: () => void
    onToggleRequired?: () => void
    isGrouped?: boolean
    isDisabled?: boolean
    isVisible?: boolean
    isRequired?: boolean
}

export const ContextMenuForSelection: React.FC<SelectionContextMenuProps> = ({
    children,
    onToggleGroup,
    onDelete,
    onToggleDisable,
    onToggleVisibility,
    onToggleRequired,
    isGrouped = false,
    isDisabled = false,
    isVisible = true,
    isRequired = false,
}) => {
  return (
    <ContextMenu>
            <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
            <ContextMenuContent className="w-56">
                {isGrouped ? (
                    <ContextMenuItem onClick={onToggleGroup}>
                        <Ungroup className="w-4 h-4 mr-2" />
                        Ungroup Selected
                        <span className="ml-auto text-xs text-muted-foreground">⌘G</span>
                    </ContextMenuItem>
                ) : (
                    <ContextMenuItem onClick={onToggleGroup}>
                        <Group className="w-4 h-4 mr-2" />
                        Group Selected
                        <span className="ml-auto text-xs text-muted-foreground">⌘G</span>
                    </ContextMenuItem>
                )}

                <ContextMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                    <span className="ml-auto text-xs text-muted-foreground">Del</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onToggleDisable}>
                    <Ban className="w-4 h-4 mr-2" />
                    {isDisabled ? "Enable" : "Disable"}
                    <div className="ml-auto flex items-center gap-2">
                        {isDisabled && <Check className="w-4 h-4 opacity-60" />}
                    </div>
                </ContextMenuItem>
                <ContextMenuItem onClick={onToggleVisibility}>
                    {isVisible ? (
                        <Eye className="w-4 h-4 mr-2" />
                    ) : (
                        <EyeOff className="w-4 h-4 mr-2" />
                    )}
                    {isVisible ? "Hide" : "Show"}
                    <div className="ml-auto flex items-center gap-2">
                        {!isVisible && <Check className="w-4 h-4 opacity-60" />}
                        <span className="text-xs text-muted-foreground">⌘H</span>
                    </div>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={onToggleRequired}>
                    {isRequired ? (
                        <StarOff className="w-4 h-4 mr-2" />
                    ) : (
                        <Star className="w-4 h-4 mr-2" />
                    )}
                    {isRequired ? "Remove Required" : "Required"}
                    <div className="ml-auto flex items-center gap-2">
                        {isRequired && <Check className="w-4 h-4 opacity-60" />}
                        <span className="text-xs text-muted-foreground">⌘R</span>
                    </div>
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    )
}