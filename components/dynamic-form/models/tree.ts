import { NodeApi } from "react-arborist";
import { TreeNode } from "../zod/treeSchema";

interface TreeSettings {
  selection?: boolean;
  multiple?: boolean;
  parentSelection?: boolean;
  enableSearch?: boolean;
  editIcon?: boolean;
  titleEditable?: boolean;
  enableActions?: boolean;
  treeLines?: boolean;
  customActions?: (node: NodeApi<TreeNode>) => React.ReactNode;
  onNodeClick?: (node: NodeApi<TreeNode>) => void;
  highlightActiveNode?: boolean;
}

export interface TreeRef {
  getData: () => any[];
  setData: (data: any[]) => void;
  getSelected: () => Set<string>;
  setSelected: (ids: Set<string>) => void;
  resetSearch: () => void;
  addNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
}

export interface TreeProps extends TreeSettings {
  data?: TreeNode[];
  treeHeight?: number;
  selected?: Set<string>;
  onSelect?: (selected: Set<string>) => void;
  saveListener?: (data: TreeNode[]) => void;
  cancelListener?: () => void;
}

interface BaseNodeProps extends TreeSettings {
  treeData: TreeNode[];
  node: NodeApi<TreeNode>;
  setTreeData: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  search: string;
  onSelect?: (selected: Set<string>) => void;
}

export interface DefaultNodeProps extends BaseNodeProps {
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface NodeContentModel extends BaseNodeProps {
  data: TreeNode;
  isLeafNode: boolean;
  isSelected: boolean;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export interface NodeLinesModel {
  node: NodeApi<TreeNode>;
  ancestorLastMap: boolean[];
  treeLines: boolean;
}

export interface NodeActionsModel
  extends Pick<
    BaseNodeProps,
    "node" | "setTreeData" | "enableActions" | "customActions"
  > {
  isLeafNode: boolean;
}

export const INDENT = 20;
export const HALF = INDENT / 3;
export const CHEVRON = 16;
export const CHEVRON_CENTER = CHEVRON / 2;
