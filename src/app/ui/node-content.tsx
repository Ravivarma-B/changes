import { ChevronDown, ChevronRightIcon, Pen } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { Icon } from "../dynamic-form/components/Icon";
import { INDENT, NodeContentModel } from "../dynamic-form/models/tree.model";
import { ConfirmDialog } from "../dynamic-form/shared/ConfirmDialog";
import { IconPickerContextMenu } from "../dynamic-form/shared/IconPickerContextMenu";
import {
  updateAllChildrenIcons,
  updateAllParentIcons,
  updateNodeIcon,
  updateNodeName,
} from "../dynamic-form/utils/treeOps";
import { Checkbox } from "./checkbox";
import InlineEditable from "./inline-editable";

function highlightText(text: string, search: string) {
  if (!search) return text;
  const regex = new RegExp(`(${search})`, "gi");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === search.toLowerCase() ? (
      <span key={i} className="bg-yellow-200">
        {part}
      </span>
    ) : (
      part
    )
  );
}

// Leaf Node
const LeafNodeContent = React.memo(function LeafNodeContent({
  node,
  data,
  isSelected,
  multiple,
  disableSelection,
  setTreeData,
  setSelectedIds,
  treeData,
  search,
  viewOnly,
  onSelect,
  builtMode = true,
}: NodeContentModel) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isUserIcon, setIsUserIcon] = useState(false);

  // Stable toggle handler
  const handleToggle = useCallback(() => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(node.id)) {
        updated.delete(node.id);
      } else {
        if (!multiple) updated.clear();
        updated.add(node.id);
      }
      onSelect?.(updated);
      return updated;
    });
  }, [node.id, multiple, onSelect, setSelectedIds]);

  const highlightedName = useMemo(
    () => highlightText(data.name, search),
    [data.name, search]
  );

  const handleIconChange = useCallback((icon: string, isUser: boolean) => {
    setSelectedIcon(icon);
    setIsUserIcon(isUser);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirm = useCallback(
    (confirmed: boolean | null) => {
      if (confirmed !== null) {
        if (confirmed) {
          setTreeData(() =>
            updateAllChildrenIcons(treeData, selectedIcon, isUserIcon)
          );
        } else {
          setTreeData(() =>
            updateNodeIcon(treeData, node.id, selectedIcon, isUserIcon)
          );
        }
      }
      setSelectedIcon("");
      setIsUserIcon(false);
      setShowConfirmDialog(false);
    },
    [node.id, selectedIcon, isUserIcon, setTreeData, treeData]
  );

  return (
    <IconPickerContextMenu onChangeIcon={handleIconChange}>
      <div
        className="flex items-center flex-1"
        style={{ marginLeft: node.level * INDENT }}
      >
        {!disableSelection &&
          (multiple ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
              className="mr-2 self-center"
            />
          ) : (
            <input
              type="radio"
              checked={isSelected}
              onChange={handleToggle}
              onClick={(e) => e.stopPropagation()}
              className="mr-2 self-center"
            />
          ))}

        {builtMode &&
          (data.icon ? (
            <Icon
              icon={data.icon}
              size={16}
              className="mr-2"
              isUserIcon={data.isUserIcon}
            />
          ) : (
            <Pen className="w-4 h-4 mr-2 opacity-75" />
          ))}

        <ConfirmDialog open={showConfirmDialog} onConfirm={handleConfirm} />

        {!viewOnly ? (
          <InlineEditable
            text={data.name}
            noOutline
            elementClassName="h-5"
            className="text-sm"
            onSave={(newName) =>
              setTreeData((prev) => updateNodeName(prev, node.id, newName))
            }
            viewOnly={viewOnly}
            textClassName="overflow-hidden text-ellipsis"
          >
            {highlightedName}
          </InlineEditable>
        ) : (
          <div
            className="text-sm overflow-hidden text-ellipsis"
            onClick={(e) => e.stopPropagation()}
          >
            {highlightedName}
          </div>
        )}
      </div>
    </IconPickerContextMenu>
  );
});

// Folder Node
const ParentNodeContent = React.memo(function FolderNodeContent({
  node,
  data,
  treeData,
  setTreeData,
  search,
  viewOnly,
  onNodeClick,
  parentSelection = true,
  disableSelection,
  multiple,
  isSelected,
  setSelectedIds,
  onSelect,
}: NodeContentModel) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("");
  const [isUserIcon, setIsUserIcon] = useState(false);

  const highlightedName = useMemo(
    () => highlightText(data.name, search),
    [data.name, search]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      node.toggle();
      onNodeClick?.(node);
    },
    [node, onNodeClick]
  );

  const onCheckedChange = useCallback(() => {
    setSelectedIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(node.id)) {
        updated.delete(node.id);
      } else {
        if (!multiple) updated.clear();
        updated.add(node.id);
      }
      onSelect?.(updated);
      return updated;
    });
  }, [node.id, multiple, onSelect, setSelectedIds]);

  const handleIconChange = useCallback((icon: string, isUser: boolean) => {
    setSelectedIcon(icon);
    setIsUserIcon(isUser);
    setShowConfirmDialog(true);
  }, []);

  const handleConfirm = useCallback(
    (confirmed: boolean | null) => {
      if (confirmed !== null) {
        if (confirmed) {
          setTreeData(() =>
            updateAllParentIcons(treeData, selectedIcon, isUserIcon)
          );
        } else {
          setTreeData(() =>
            updateNodeIcon(treeData, node.id, selectedIcon, isUserIcon)
          );
        }
      }
      setSelectedIcon("");
      setIsUserIcon(false);
      setShowConfirmDialog(false);
    },
    [node.id, selectedIcon, isUserIcon, setTreeData, treeData]
  );

  return (
    <IconPickerContextMenu onChangeIcon={handleIconChange}>
      <div
        className="flex items-center flex-1"
        style={{ marginLeft: node.level * INDENT }}
        onClick={handleToggle}
      >
        {/* Toggle button */}

        <button
          onClick={handleToggle}
          className="flex items-center justify-center cursor-pointer"
        >
          {data.icon && data.icon.length > 0 ? (
            <Icon
              icon={data.icon}
              size={16}
              className="mr-2"
              isUserIcon={data.isUserIcon}
            />
          ) : node.isOpen ? (
            <ChevronDown className="w-4 h-4 mr-2 self-center" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 mr-2 self-center" />
          )}
        </button>

        {!disableSelection &&
          parentSelection &&
          (multiple ? (
            <Checkbox
              checked={isSelected}
              onCheckedChange={onCheckedChange}
              onClick={(e) => e.stopPropagation()}
              className="mr-2 self-center"
            />
          ) : (
            <input
              type="radio"
              checked={isSelected}
              onChange={onCheckedChange}
              onClick={(e) => e.stopPropagation()}
              className="mr-2 self-center"
            />
          ))}

        {/* Icon picker confirm dialog */}
        <ConfirmDialog open={showConfirmDialog} onConfirm={handleConfirm} />

        {/* Inline editable text */}
        {!viewOnly ? (
          <InlineEditable
            text={data.name}
            noOutline
            elementClassName="h-5"
            className="text-sm"
            onSave={(newName) =>
              setTreeData((prev) => updateNodeName(prev, node.id, newName))
            }
            viewOnly={viewOnly}
            textClassName="overflow-hidden text-ellipsis"
          >
            {highlightedName}
          </InlineEditable>
        ) : (
          <div
            className="text-sm overflow-hidden text-ellipsis"
            onClick={(e) => e.stopPropagation()}
          >
            {highlightedName}
          </div>
        )}
      </div>
    </IconPickerContextMenu>
  );
});

// Main NodeContent
const NodeContent = React.memo(function NodeContent(props: NodeContentModel) {
  return props.isLeafNode ? (
    <LeafNodeContent {...props} />
  ) : (
    <ParentNodeContent {...props} />
  );
});

export default NodeContent;
