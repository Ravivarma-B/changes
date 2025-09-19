"use client";

import { IconPicker } from "@/components/ui/icon-picker";
import { Pen } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "web-utils-components/context-menu";

interface IconPickerContextMenuProps {
  children: React.ReactNode;
  onChangeIcon: (icon: string, isUserIcon: boolean) => void;
  isGrouped?: boolean;
  isDisabled?: boolean;
  isVisible?: boolean;
  isRequired?: boolean;
}

export const IconPickerContextMenu: React.FC<IconPickerContextMenuProps> = ({
  children,
  onChangeIcon,
}) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-100">
        <ContextMenuItem>
          <Pen className="w-4 h-4 mr-2" />
          Change Icon
        </ContextMenuItem>

        <ContextMenuSeparator />

        <IconPicker
          value=""
          onChange={function (icon: string, isUserIcon: boolean): void {
            // console.log(icon);
            onChangeIcon(icon, isUserIcon);
          }}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
};
