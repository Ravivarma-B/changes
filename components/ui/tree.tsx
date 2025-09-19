// "use client";

// import { ClientOnly } from "@/components/ui/client-only";
// import { useMemo, useState } from "react";
// import { Tree as ReactTree } from "react-arborist";
// import { TreeSchema } from "../dynamic-form/zod/treeSchema";

// import { Button } from "web-utils-components/button";
// import { TreeProps } from "../dynamic-form/models/tree";
// import { filterTree, generateTreeWithIds } from "../dynamic-form/utils/treeOps";
// import Node from "./node";

// export const Tree = ({
//   data = [],
//   multiple = true,
//   treeHeight = 400,
//   onSelect,
//   treeLines = true,
//   editIcon = false,
//   titleEditable = false,
//   selection = false,
//   enableActions = false,
//   parentSelection = false,
//   enableSearch = true,
//   customActions,
//   saveListener,
//   cancelListener,
//   selected = new Set<string>(),
// }: TreeProps) => {
//   console.log(data);
//   const [treeData, setTreeData] = useState(() =>
//     data.length === 0
//       ? generateTreeWithIds([{ name: "Root Node", children: [] }])
//       : TreeSchema.parse(data)
//   );
//   const [search, setSearch] = useState("");
//   const [selectedIds, setSelectedIds] = useState<Set<string>>(selected);

//   const treeProps = useMemo(
//     () => ({
//       data: treeData,
//       width: "100%",
//       height: treeHeight,
//       rowHeight: 36,
//       indent: 20,
//       overscanCount: 5,
//       selectionFollowsFocus: false,
//       multiple: true,
//     }),
//     [treeData]
//   );

//   const filteredData = filterTree(treeData, search);

//   return (
//     <ClientOnly>
//       <div className="space-y-2 w-full p-2">
//         {enableSearch && (
//           <input
//             type="text"
//             placeholder="Search..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 "
//           />
//         )}
//         <ReactTree
//           {...treeProps}
//           data={filteredData}
//           className="!scrollbar-hide"
//           openByDefault={false}
//         >
//           {(props) => (
//             <Node
//               {...props}
//               treeData={treeData}
//               setTreeData={setTreeData}
//               search={search}
//               multiple={multiple}
//               selectedIds={selectedIds}
//               setSelectedIds={setSelectedIds}
//               onSelect={onSelect}
//               customActions={customActions}
//               treeLines={treeLines}
//               editIcon={editIcon}
//               titleEditable={titleEditable}
//               selection={selection}
//               enableActions={enableActions}
//               parentSelection={parentSelection}
//             />
//           )}
//         </ReactTree>

//         {(saveListener || cancelListener) && (
//           <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
//             {cancelListener && (
//               <Button
//                 variant="outline"
//                 onClick={() => cancelListener?.()}
//                 className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
//               >
//                 Cancel
//               </Button>
//             )}

//             {saveListener && (
//               <Button
//                 onClick={() => saveListener?.(treeData)}
//                 className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500"
//               >
//                 Save Tree
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     </ClientOnly>
//   );
// };

"use client";

import { ClientOnly } from "@/components/ui/client-only";
import { forwardRef, useImperativeHandle, useMemo, useState } from "react";
import { Tree as ReactTree } from "react-arborist";
import { TreeSchema } from "../dynamic-form/zod/treeSchema";

import { Button } from "web-utils-components/button";
import { TreeProps, TreeRef } from "../dynamic-form/models/tree";
import {
  filterTree,
  generateTreeWithIds,
  updateNodeCustomProps,
} from "../dynamic-form/utils/treeOps";
import Node from "./node";

export const Tree = forwardRef<TreeRef, TreeProps>(
  (
    {
      data = [],
      multiple = true,
      treeHeight = 400,
      onSelect,
      treeLines = true,
      editIcon = false,
      titleEditable = false,
      selection = false,
      enableActions = false,
      parentSelection = false,
      enableSearch = true,
      highlightActiveNode = false,
      customActions,
      saveListener,
      cancelListener,
      selected = new Set<string>(),
    },
    ref
  ) => {
    const [treeData, setTreeData] = useState(() =>
      data.length === 0
        ? generateTreeWithIds([{ name: "Root Node", children: [] }])
        : TreeSchema.parse(data)
    );
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(selected);

    // Expose imperative methods
    useImperativeHandle(ref, () => ({
      getData: () => treeData,
      setData: (newData: any[]) => setTreeData(TreeSchema.parse(newData)),
      getSelected: () => selectedIds,
      setSelected: (ids: Set<string>) => setSelectedIds(ids),
      resetSearch: () => setSearch(""),
      addNodeProps: (nodeId: string, props: Record<string, unknown>) => {
        setTreeData((prev) => {
          const tree = updateNodeCustomProps(prev, nodeId, props);
          return tree;
        });
      },
    }));

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
      [treeData, treeHeight]
    );

    const filteredData = filterTree(treeData, search);

    return (
      <ClientOnly>
        <div className="space-y-2 w-full p-2">
          {enableSearch && (
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 "
            />
          )}
          <ReactTree
            {...treeProps}
            data={filteredData}
            className="!scrollbar-hide"
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
                onSelect={onSelect}
                customActions={(node) => customActions?.(node)}
                treeLines={treeLines}
                editIcon={editIcon}
                titleEditable={titleEditable}
                selection={selection}
                enableActions={enableActions}
                parentSelection={parentSelection}
                highlightActiveNode={highlightActiveNode}
              />
            )}
          </ReactTree>

          {(saveListener || cancelListener) && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              {cancelListener && (
                <Button
                  variant="outline"
                  onClick={() => cancelListener?.()}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
              )}

              {saveListener && (
                <Button
                  onClick={() => saveListener?.(treeData)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500"
                >
                  Save Tree
                </Button>
              )}
            </div>
          )}
        </div>
      </ClientOnly>
    );
  }
);

Tree.displayName = "Tree";
