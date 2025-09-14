import { NodeApi } from "react-arborist";
import { TreeNode } from "../zod/treeSchema";

interface BaseNodeProps {
  treeData: TreeNode[];
  node: NodeApi<TreeNode>;
  setTreeData: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  multiple: boolean;
  search: string;
  viewOnly?: boolean;
  showConnectedLines?: boolean;
  openIcons?: React.ReactNode;
  collapseIcons?: React.ReactNode;
  onNodeClick?: (node: NodeApi<TreeNode>) => void;
  disableSelection?: boolean;
  builtMode?: boolean;
  onSelect?: (selected: Set<string>) => void;
  parentSelection?: boolean;
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
  showConnectedLines: boolean;
}

export const INDENT = 20;
export const HALF = INDENT / 3;
export const CHEVRON = 16;
export const CHEVRON_CENTER = CHEVRON / 2;
