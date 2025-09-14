"use client";

import { ClientOnly } from "@/app/ui/clientOnly";
import { useMemo, useState } from "react";
import { Tree as ReactTree } from "react-arborist";
import { TreeNode, TreeSchema } from "../dynamic-form/zod/treeSchema";

import { filterTree, generateTreeWithIds } from "../dynamic-form/utils/treeOps";
import Node from "./node";

interface TreeProps {
  data?: TreeNode[];
  multiple?: boolean;
  viewOnly?: boolean;
  showConnectedLines?: boolean;
  openIcons?: React.ReactNode;
  collapseIcons?: React.ReactNode;
  disableSelection?: boolean;
  treeHeight?: number;
  onSelect?: (selected: Set<string>) => void;
}

export const Tree = ({
  data = [],
  multiple = true,
  viewOnly = false,
  showConnectedLines = true,
  openIcons,
  collapseIcons,
  disableSelection = false,
  treeHeight = 400,
  onSelect,
}: TreeProps) => {
  const [treeData, setTreeData] = useState(() =>
    data.length === 0
      ? generateTreeWithIds([{ name: "Root Node", children: [] }])
      : TreeSchema.parse(data)
  );
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const treeProps = useMemo(
    () => ({
      data: treeData,
      width: "100%",
      height: treeHeight,
      rowHeight: 36,
      indent: 20,
      overscanCount: 5,
      selectionFollowsFocus: false,
      multiple: true,
    }),
    [treeData]
  );

  const filteredData = filterTree(treeData, search);

  return (
    <ClientOnly>
      <div className="space-y-2 w-full p-2">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 "
        />
        <ReactTree
          {...treeProps}
          data={filteredData}
          className="!scrollbar-hide"
          selectionFollowsFocus={false}
          disableEdit
          openByDefault={false}
        >
          {(props) => (
            <Node
              {...props}
              treeData={treeData}
              setTreeData={setTreeData}
              search={search}
              multiple={multiple}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              viewOnly={viewOnly}
              showConnectedLines={showConnectedLines}
              openIcons={openIcons}
              collapseIcons={collapseIcons}
              disableSelection={disableSelection}
              onSelect={onSelect}
            />
          )}
        </ReactTree>
      </div>
    </ClientOnly>
  );
};
