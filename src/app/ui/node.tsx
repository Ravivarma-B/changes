"use client";

import { MoreHorizontal } from "lucide-react";
import { NodeApi } from "react-arborist";
import {
  CHEVRON_CENTER,
  DefaultNodeProps,
  HALF,
  INDENT,
  NodeLinesModel,
} from "../dynamic-form/models/tree.model";
import { cn } from "../dynamic-form/utils/FormUtils";
import {
  addChildNode,
  addSiblingNode,
  buildAncestorLastMap,
  deleteNode,
  duplicateNode,
} from "../dynamic-form/utils/treeOps";
import { TreeNode } from "../dynamic-form/zod/treeSchema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import NodeContent from "./node-content";

function NodeLines({
  node,
  ancestorLastMap,
  showConnectedLines,
}: NodeLinesModel) {
  if (!showConnectedLines || node.level === 0) return null;

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
}: {
  node: NodeApi<TreeNode>;
  setTreeData: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  isLeafNode: boolean;
}) {
  return (
    <div className="flex opacity-0 group-hover/inner:opacity-100 ml-auto">
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
  viewOnly = false,
  showConnectedLines = true,
  openIcons,
  collapseIcons = openIcons,
  onNodeClick,
  disableSelection = false,
  onSelect,
}: DefaultNodeProps) {
  const data = node.data;
  const isSelected = selectedIds.has(node.id);
  const isLeafNode = node.isLeaf;
  const ancestorLastMap = buildAncestorLastMap(node.id, treeData);

  return (
    <span
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (viewOnly) node.toggle();
        onNodeClick?.(node);
      }}
    >
      <div
        className={cn(
          "relative flex items-center group/inner gap-2 p-2 rounded cursor-pointer select-none",
          `${node.isSelected && !node.isLeaf ? "bg-[#f1f5f9e6]" : ""}`,
          `${"hover:bg-[#f1f5f9e6] hover:no-underline"}`
        )}
      >
        <NodeLines
          node={node}
          ancestorLastMap={ancestorLastMap}
          showConnectedLines={showConnectedLines}
        />

        <NodeContent
          node={node}
          data={data}
          isLeafNode={isLeafNode}
          isSelected={isSelected}
          multiple={multiple}
          disableSelection={disableSelection}
          setTreeData={setTreeData}
          setSelectedIds={setSelectedIds}
          treeData={treeData}
          search={search}
          viewOnly={viewOnly}
          openIcons={openIcons}
          collapseIcons={collapseIcons}
          onNodeClick={onNodeClick}
          onSelect={onSelect}
        />

        {!viewOnly && (
          <NodeActions
            node={node}
            setTreeData={setTreeData}
            isLeafNode={isLeafNode}
          />
        )}
      </div>
    </span>
  );
}
