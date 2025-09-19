import { NodeApi } from "react-arborist";
import { TreeNode, TreeNodeSchema, TreeSchema } from "../zod/treeSchema";
import { cloneDeep, findNodeAndParent, nextId, removeIds } from "./treeUtils";

// Validate entire tree
function validateTree(nodes: TreeNode[]): TreeNode[] {
  return TreeSchema.parse(nodes);
}

/**
 * Assign new IDs recursively to a node and its children.
 */
function assignIdsRecursive(node: Omit<TreeNode, "id">): TreeNode {
  const newNode: TreeNode = {
    ...node,
    id: nextId("node"),
    children: node.children?.map(assignIdsRecursive),
  };
  return newNode;
}

/**
 * Generate a tree with fresh IDs for all nodes.
 * @param treeData Array of tree nodes without IDs
 */
export function generateTreeWithIds(
  treeData: Omit<TreeNode, "id">[]
): TreeNode[] {
  const newTree = treeData.map(assignIdsRecursive);
  return TreeSchema.parse(newTree); // validates the new tree
}

// Recursively assign new IDs to node and children
export function assignNewIds(node: TreeNode): TreeNode {
  const newNode: TreeNode = {
    ...node,
    id: nextId("node"),
    children: node.children?.map(assignNewIds),
  };
  TreeNodeSchema.parse(newNode);
  return newNode;
}

// Add sibling node
export function addSiblingNode(
  nodes: TreeNode[],
  nodeId: string,
  name: string = "New Sibling",
  isLeafNode: boolean = false
): TreeNode[] {
  const copy = cloneDeep(nodes);
  const { parent, index } = findNodeAndParent(copy, nodeId);
  const newNode: TreeNode = assignNewIds({
    id: "",
    name,
    ...(!isLeafNode && { children: [] }),
  });

  if (parent) {
    parent.children = parent.children ? [...parent.children] : [];
    parent.children.splice(index + 1, 0, newNode);
  } else {
    copy.splice(index + 1, 0, newNode);
  }
  return validateTree(copy);
}

// Add child node
export function addChildNode(
  nodes: TreeNode[],
  parentId: string,
  name: string
): TreeNode[] {
  const copy = cloneDeep(nodes);
  const { node: parent } = findNodeAndParent(copy, parentId);
  if (!parent) return copy;

  const newNode: TreeNode = assignNewIds({ id: "", name });
  parent.children = parent.children ? [...parent.children, newNode] : [newNode];

  return validateTree(copy);
}

// Duplicate node (deep-safe)
export function duplicateNode(nodes: TreeNode[], id: string): TreeNode[] {
  const copy = cloneDeep(nodes);
  const { node, parent, index } = findNodeAndParent(copy, id);
  if (!node) return copy;

  const duplicate = assignNewIds(node);

  if (parent) {
    parent.children = parent.children ? [...parent.children] : [];
    parent.children.splice(index + 1, 0, duplicate);
  } else {
    copy.splice(index + 1, 0, duplicate);
  }

  return validateTree(copy);
}

// Delete node
export function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  return validateTree(removeIds(nodes, new Set([id])));
}

// Update node name
export function updateNodeName(
  nodes: TreeNode[],
  id: string,
  newName: string
): TreeNode[] {
  console.log("salm", newName);
  const copy = cloneDeep(nodes);
  const { node } = findNodeAndParent(copy, id);
  if (node) node.name = newName;
  return validateTree(copy);
}

export function updateAllNodesIcons(
  nodes: TreeNode[],
  icon: string,
  isUserIcon: boolean = false
): TreeNode[] {
  const copy = cloneDeep(nodes);

  function dfs(node: TreeNode) {
    // Update current node
    node.icon = icon;
    node.isUserIcon = isUserIcon;

    // Recurse into children if any
    node.children?.forEach(dfs);
  }

  copy.forEach(dfs);

  return TreeSchema.parse(copy);
}

export function updateNodeIcon(
  nodes: TreeNode[],
  nodeId: string,
  icon: string,
  isUserIcon: boolean = false
) {
  const copy = cloneDeep(nodes);
  const { node } = findNodeAndParent(copy, nodeId);
  if (node) {
    node.icon = icon;
    node.isUserIcon = isUserIcon;
  }
  console.log(copy);
  return TreeSchema.parse(copy);
}

/**
 * Force update all parent nodes' icons in the tree to a given icon.
 */
export function updateAllParentIcons(
  nodes: TreeNode[],
  icon: string,
  isUserIcon: boolean = false
): TreeNode[] {
  const copy = cloneDeep(nodes);

  function dfs(node: TreeNode) {
    // If it has children, set parent icon
    if (node.children) {
      node.icon = icon;
      node.isUserIcon = isUserIcon;
      node.children.forEach(dfs);
    }
  }

  copy.forEach(dfs);

  return TreeSchema.parse(copy);
}

/**
 * Update icons of all children (recursively), but NOT the parent node itself.
 */
export function updateAllChildrenIcons(
  nodes: TreeNode[],
  icon: string,
  isUserIcon: boolean = false
): TreeNode[] {
  const copy = cloneDeep(nodes);

  function dfs(node: TreeNode) {
    if (node.children && node.children.length > 0) {
      // Update all children
      node.children.forEach((child) => {
        child.icon = icon;
        child.isUserIcon = isUserIcon;
        dfs(child); // recurse into grandchildren
      });
    }
  }

  copy.forEach(dfs);

  return TreeSchema.parse(copy);
}

// Filter tree by search term
export function filterTree(nodes: TreeNode[], term: string): TreeNode[] {
  if (!term.trim()) return nodes;

  const lower = term.toLowerCase();
  return nodes
    .map((node) => {
      const children = filterTree(node.children ?? [], term);
      if (node.name.toLowerCase().includes(lower) || children.length > 0) {
        return { ...node, ...(children.length > 0 && { children }) };
      }
      return null;
    })
    .filter(Boolean) as TreeNode[];
}

// Toggle selection
export function toggleNodeSelection(
  nodes: TreeNode[],
  nodeId: string,
  selectedIds: Set<string>,
  multiple: boolean
): Set<string> {
  const newSet = new Set(selectedIds);

  const updateChildren = (node: TreeNode, checked: boolean) => {
    if (checked) newSet.add(node.id);
    else newSet.delete(node.id);
    node.children?.forEach((child) => updateChildren(child, checked));
  };

  const traverse = (nodes: TreeNode[]) => {
    for (const node of nodes) {
      if (node.id === nodeId) {
        const isChecked = newSet.has(node.id);
        const checked = multiple ? !isChecked : true;
        if (!multiple) newSet.clear();
        updateChildren(node, checked);
        break;
      }
      if (node.children) traverse(node.children);
    }
  };

  traverse(nodes);
  return newSet;
}

// Compute indeterminate state
export function isIndeterminate(
  node: TreeNode,
  selectedIds: Set<string>
): boolean {
  if (!node.children || node.children.length === 0) return false;
  const allChildrenSelected = node.children.every((child) =>
    selectedIds.has(child.id)
  );
  const someChildrenSelected = node.children.some(
    (child) => selectedIds.has(child.id) || isIndeterminate(child, selectedIds)
  );
  return someChildrenSelected && !allChildrenSelected;
}

/**
 * Returns an array of booleans representing whether each ancestor of the node
 * is the last child in its parent. The array is ordered from root -> parent.
 */
export function buildAncestorLastMap(
  nodeId: string,
  treeData: TreeNode[]
): boolean[] {
  const path: boolean[] = [];
  let currentId = nodeId;

  while (true) {
    const { node, parent } = findNodeAndParent(treeData, currentId);
    if (!node) break;

    if (parent) {
      const siblings = parent.children ?? [];
      const lastChildId =
        siblings.length > 0 ? siblings[siblings.length - 1].id : null;
      const isLast = node.id === lastChildId;
      path.unshift(isLast);
      currentId = parent.id;
    } else {
      break; // reached root
    }
  }

  return path;
}

// Collect all descendants of a node
export function collectDescendants(node: NodeApi<TreeNode>): string[] {
  let ids: string[] = [];
  if (node.children) {
    for (const child of node.children) {
      ids.push(child.id);
      ids = ids.concat(collectDescendants(child));
    }
  }
  return ids;
}

// Collect all ancestors of a node (walk upward using parent reference)
export function collectAncestors(node: NodeApi<TreeNode>): string[] {
  const ids: string[] = [];
  let parent = node.parent;
  while (parent) {
    ids.push(parent.id);
    parent = parent.parent;
  }
  return ids;
}

export function getSelectionState(
  node: NodeApi<TreeNode>,
  selectedIds: Set<string>
): boolean | "indeterminate" {
  if (!node.children || node.children.length === 0) {
    return selectedIds.has(node.id);
  }

  let allSelected = true;
  let anySelected = false;

  for (const child of node.children) {
    const childState = getSelectionState(child, selectedIds);
    if (childState === true) {
      anySelected = true;
    } else if (childState === "indeterminate") {
      anySelected = true;
      allSelected = false;
    } else {
      allSelected = false;
    }
  }

  if (allSelected) return true;
  if (anySelected) return "indeterminate";
  return false;
}

/**
 * Recursively find and return nodes that match any of the given IDs.
 *
 * @param nodes - The full tree (array of TreeNodes)
 * @param ids - A Set of selected node IDs
 * @returns Array of matching TreeNode objects
 */
export function getNodesByIds(nodes: TreeNode[], ids: Set<string>): TreeNode[] {
  const result: TreeNode[] = [];

  function dfs(node: TreeNode) {
    if (ids.has(node.id.toString())) {
      result.push(node);
    }
    node.children?.forEach(dfs);
  }

  nodes.forEach(dfs);

  return result;
}

/**
 * Add or update custom props on a specific node.
 *
 * @param nodes - The tree data
 * @param nodeId - ID of the node to update
 * @param props - Custom properties to merge into the node
 * @returns A new validated tree with the updated node
 */
export function updateNodeCustomProps(
  nodes: TreeNode[],
  nodeId: string,
  props: Record<string, unknown>
): TreeNode[] {
  const copy = cloneDeep(nodes);
  const { node } = findNodeAndParent(copy, nodeId);

  if (node) {
    Object.assign(node, props); // merge props directly into the node
  }

  return TreeSchema.parse(copy); // validate after modification
}
