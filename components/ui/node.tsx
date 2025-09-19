"use client";

import {
  CHEVRON_CENTER,
  DefaultNodeProps,
  HALF,
  INDENT,
  NodeActionsModel,
  NodeLinesModel,
} from "@/components/dynamic-form/models/tree";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "web-utils-components/dropdown-menu";
import { cn } from "../dynamic-form/utils/FormUtils";
import {
  addChildNode,
  addSiblingNode,
  buildAncestorLastMap,
  deleteNode,
  duplicateNode,
} from "../dynamic-form/utils/treeOps";
import NodeContent from "./node-content";

function NodeLines({ node, ancestorLastMap, treeLines }: NodeLinesModel) {
  if (!treeLines || node.level === 0) return null;

  const selfCenter = node.level * INDENT + CHEVRON_CENTER;
  const parentCenter = (node.level - 1) * INDENT + HALF + CHEVRON_CENTER;

  return (
    <>
      {/* Vertical lines */}
      <div
        className="absolute top-0 left-0 h-full flex"
        style={{ width: node.level * INDENT }}
      >
        {ancestorLastMap.map((isLast, i) => (
          <div key={i} className="w-5 relative">
            <div
              className="absolute top-0 bottom-0 border-l border-gray-300"
              style={{ left: CHEVRON_CENTER + HALF }}
            />
          </div>
        ))}
      </div>

      {/* Horizontal connector */}
      <div
        className="-translate-y-1/2 absolute"
        style={{
          top: "50%",
          left: parentCenter,
          width: selfCenter - parentCenter,
        }}
      >
        <div className="w-full border-t border-gray-300 h-0" />
      </div>
    </>
  );
}

function NodeActions({
  node,
  setTreeData,
  isLeafNode,
  enableActions = false,
  customActions,
}: NodeActionsModel) {
  return (
    <div className="flex opacity-0 group-hover/inner:opacity-100 ml-auto">
      {enableActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="p-0 self-center">
            <DropdownMenuLabel>
              <MoreHorizontal className="w-4 h-4" />
            </DropdownMenuLabel>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel
              className="hover:bg-gray-100"
              onClick={(e: { preventDefault: () => void }) => {
                e.preventDefault();
                setTreeData((prev) =>
                  addSiblingNode(prev, node.id, "New Sibling", isLeafNode)
                );
              }}
            >
              Add Sibling
            </DropdownMenuLabel>
            <DropdownMenuLabel
              className="hover:bg-gray-100"
              onClick={(e: { preventDefault: () => void }) => {
                e.preventDefault();
                setTreeData((prev) => addChildNode(prev, node.id, "New Child"));
                node.open();
              }}
            >
              Add Child
            </DropdownMenuLabel>
            {!isLeafNode && (
              <DropdownMenuLabel
                className="hover:bg-gray-100"
                onClick={(e: { preventDefault: () => void }) => {
                  e.preventDefault();
                  setTreeData((prev) => duplicateNode(prev, node.id));
                }}
              >
                Duplicate
              </DropdownMenuLabel>
            )}
            <DropdownMenuLabel
              className="hover:bg-gray-100"
              onClick={(e: { preventDefault: () => void }) => {
                e.preventDefault();
                setTreeData((prev) => deleteNode(prev, node.id));
              }}
            >
              Delete
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {customActions && customActions(node)}
    </div>
  );
}

export default function DefaultNode({
  treeData,
  node,
  setTreeData,
  search,
  multiple,
  selectedIds,
  setSelectedIds,
  onNodeClick,
  onSelect,
  treeLines = true,
  editIcon = false,
  titleEditable = false,
  selection = false,
  enableActions = false,
  parentSelection = false,
  highlightActiveNode = false,
  customActions,
}: DefaultNodeProps) {
  const data = node.data;
  const isSelected = selectedIds.has(node.id);
  const isLeafNode = !node.children || node.children.length === 0;
  const ancestorLastMap = buildAncestorLastMap(node.id, treeData);

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        if (!titleEditable) node.toggle();
        onNodeClick?.(node);
      }}
    >
      <div
        className={cn(
          "relative flex items-center group/inner gap-2 p-2 rounded cursor-pointer select-none",
          `${"hover:bg-[#f1f5f9e6] hover:no-underline"}`
        )}
      >
        <NodeLines
          node={node}
          ancestorLastMap={ancestorLastMap}
          treeLines={treeLines}
        />

        <NodeContent
          node={node}
          data={data}
          isLeafNode={isLeafNode}
          isSelected={isSelected}
          setTreeData={setTreeData}
          setSelectedIds={setSelectedIds}
          treeData={treeData}
          search={search}
          onNodeClick={onNodeClick}
          onSelect={onSelect}
          selection={selection}
          titleEditable={titleEditable}
          editIcon={editIcon}
          parentSelection={parentSelection}
          multiple={multiple}
          highlightActiveNode={highlightActiveNode}
        />

        <NodeActions
          node={node}
          setTreeData={setTreeData}
          isLeafNode={isLeafNode}
          customActions={customActions}
          enableActions={enableActions}
        />
      </div>
    </span>
  );
}
