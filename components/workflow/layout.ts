import dagre from 'dagre';
import ELK from 'elkjs/lib/elk.bundled.js';
import { WorkflowNode, WorkflowEdge, LayoutAlgorithm } from './workflow.types';

const elk = new ELK();

// Node dimensions
const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;

export interface LayoutOptions {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';
  spacing?: {
    node?: number;
    rank?: number;
  };
  align?: 'UL' | 'UR' | 'DL' | 'DR';
}

export const defaultLayoutOptions: LayoutOptions = {
  direction: 'LR', // Default to horizontal (Left-to-Right) layout
  spacing: {
    node: 50,
    rank: 80,
  },
  align: 'UL',
};

// Dagre layout implementation
export const layoutWithDagre = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }> => {
  return new Promise((resolve) => {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    
    // Configure graph
    g.setGraph({
      rankdir: options.direction || 'TB',
      nodesep: options.spacing?.node || 50,
      ranksep: options.spacing?.rank || 80,
      align: options.align || 'UL',
      marginx: 20,
      marginy: 20,
    });

    // Add nodes
    nodes.forEach((node) => {
      g.setNode(node.id, { 
        width: node.measured?.width || NODE_WIDTH, 
        height: node.measured?.height || NODE_HEIGHT 
      });
    });

    // Add edges
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(g);

    // Update node positions
    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - (node.measured?.width || NODE_WIDTH) / 2,
          y: nodeWithPosition.y - (node.measured?.height || NODE_HEIGHT) / 2,
        },
      };
    });

    resolve({ nodes: layoutedNodes, edges });
  });
};

// ELK layout implementations
export const layoutWithELK = async (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  algorithm: 'elk-layered' | 'elk-force' | 'elk-stress' = 'elk-layered',
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }> => {
  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: node.measured?.width || NODE_WIDTH,
    height: node.measured?.height || NODE_HEIGHT,
  }));

  const elkEdges = edges.map((edge) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  let elkOptions: any = {
    'elk.algorithm': algorithm.replace('elk-', ''),
    'elk.direction': options.direction || 'DOWN',
    'elk.spacing.nodeNode': options.spacing?.node?.toString() || '50',
    'elk.layered.spacing.nodeNodeBetweenLayers': options.spacing?.rank?.toString() || '80',
  };

  // Algorithm-specific options
  switch (algorithm) {
    case 'elk-layered':
      elkOptions = {
        ...elkOptions,
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
        'elk.layered.cycleBreaking.strategy': 'GREEDY',
      };
      break;
    case 'elk-force':
      elkOptions = {
        ...elkOptions,
        'elk.force.iterations': '300',
        'elk.force.repulsivePower': '1',
      };
      break;
    case 'elk-stress':
      elkOptions = {
        ...elkOptions,
        'elk.stress.iterations': '300',
        'elk.stress.epsilon': '0.0001',
      };
      break;
  }

  const graph = {
    id: 'root',
    layoutOptions: elkOptions,
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(graph);
    
    const layoutedNodes = nodes.map((node) => {
      const elkNode = layoutedGraph.children?.find((n) => n.id === node.id);
      if (elkNode) {
        return {
          ...node,
          position: {
            x: elkNode.x || 0,
            y: elkNode.y || 0,
          },
        };
      }
      return node;
    });

    return { nodes: layoutedNodes, edges };
  } catch (error) {
    console.error('ELK layout failed:', error);
    // Fallback to dagre if ELK fails
    return layoutWithDagre(nodes, edges, options);
  }
};

// Main layout function
export const layoutNodes = async (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  algorithm: LayoutAlgorithm = 'dagre',
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: WorkflowNode[]; edges: WorkflowEdge[] }> => {
  if (nodes.length === 0) {
    return { nodes, edges };
  }

  switch (algorithm) {
    case 'dagre':
      return layoutWithDagre(nodes, edges, options);
    case 'elk-layered':
    case 'elk-force':
    case 'elk-stress':
      return layoutWithELK(nodes, edges, algorithm, options);
    default:
      return layoutWithDagre(nodes, edges, options);
  }
};

// Auto-layout function that chooses the best algorithm based on graph characteristics
export const autoLayout = async (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  options: LayoutOptions = defaultLayoutOptions
): Promise<{ nodes: WorkflowNode[]; edges: WorkflowEdge[]; algorithm: LayoutAlgorithm }> => {
  const nodeCount = nodes.length;
  const edgeCount = edges.length;
  const complexity = edgeCount / Math.max(nodeCount, 1);

  let algorithm: LayoutAlgorithm;

  // Choose algorithm based on graph characteristics
  if (nodeCount <= 10) {
    algorithm = 'dagre'; // Simple graphs work well with dagre
  } else if (complexity > 2) {
    algorithm = 'elk-layered'; // Complex graphs benefit from layered approach
  } else if (nodeCount > 50) {
    algorithm = 'elk-force'; // Large graphs benefit from force-directed layout
  } else {
    algorithm = 'dagre'; // Default choice
  }

  const result = await layoutNodes(nodes, edges, algorithm, options);
  return { ...result, algorithm };
};

// Utilities for measuring nodes
export const measureNode = (nodeType: string, label: string): { width: number; height: number } => {
  // Rough estimation based on node type and label length
  const baseWidth = 180;
  const baseHeight = 80;
  
  // Adjust width based on label length
  const labelWidth = Math.max(label.length * 8, baseWidth);
  
  // Adjust dimensions based on node type
  switch (nodeType) {
    case 'start':
    case 'end':
      return { width: 120, height: 60 };
    case 'condition':
      return { width: 160, height: 100 };
    case 'parallel':
    case 'merge':
      return { width: 140, height: 70 };
    default:
      return { width: Math.min(labelWidth, 250), height: baseHeight };
  }
};

// Validate layout result
export const validateLayout = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for overlapping nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      const dx = Math.abs(node1.position.x - node2.position.x);
      const dy = Math.abs(node1.position.y - node2.position.y);
      
      const minWidth = Math.max(node1.measured?.width || NODE_WIDTH, node2.measured?.width || NODE_WIDTH);
      const minHeight = Math.max(node1.measured?.height || NODE_HEIGHT, node2.measured?.height || NODE_HEIGHT);
      
      if (dx < minWidth / 2 + 20 && dy < minHeight / 2 + 20) {
        issues.push(`Nodes "${node1.data.label}" and "${node2.data.label}" are overlapping`);
      }
    }
  }

  // Check for nodes outside reasonable bounds
  nodes.forEach((node) => {
    if (node.position.x < -1000 || node.position.x > 5000 || 
        node.position.y < -1000 || node.position.y > 5000) {
      issues.push(`Node "${node.data.label}" is positioned outside reasonable bounds`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
  };
};
