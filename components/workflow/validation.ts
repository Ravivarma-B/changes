import { WorkflowNode, WorkflowEdge, NodeType } from './workflow.types';

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  edgeId?: string;
  category: 'connection' | 'structure' | 'business' | 'data';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Business rules for workflow validation
export class WorkflowValidator {
  
  /**
   * Validate if a connection between two nodes is allowed
   */
  static validateConnection(
    sourceNode: WorkflowNode,
    targetNode: WorkflowNode,
    sourceHandle?: string,
    targetHandle?: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Rule 1: No self-connections
    if (sourceNode.id === targetNode.id) {
      errors.push({
        id: `self-connection-${sourceNode.id}`,
        type: 'error',
        message: 'Cannot connect a node to itself',
        nodeId: sourceNode.id,
        category: 'connection'
      });
    }

    // Rule 2: Start node can only be source
    if (targetNode.data.nodeType === 'start') {
      errors.push({
        id: `start-as-target-${targetNode.id}`,
        type: 'error',
        message: 'Start node cannot be a target (no incoming connections)',
        nodeId: targetNode.id,
        category: 'structure'
      });
    }

    // Rule 3: End/Archive nodes can only be targets
    if (['end', 'archive'].includes(sourceNode.data.nodeType)) {
      errors.push({
        id: `end-as-source-${sourceNode.id}`,
        type: 'error',
        message: 'End/Archive nodes cannot have outgoing connections',
        nodeId: sourceNode.id,
        category: 'structure'
      });
    }

    // Rule 4: Validate handle-specific connections
    if (sourceNode.data.nodeType === 'condition') {
      if (!['right-true', 'bottom-false'].includes(sourceHandle || '')) {
        errors.push({
          id: `invalid-condition-handle-${sourceNode.id}`,
          type: 'error',
          message: 'Condition node must use true/false output handles',
          nodeId: sourceNode.id,
          category: 'connection'
        });
      }
    }

    if (sourceNode.data.nodeType === 'parallel') {
      if (sourceHandle !== 'right') {
        errors.push({
          id: `invalid-parallel-handle-${sourceNode.id}`,
          type: 'error',
          message: 'Parallel node must use right output handle',
          nodeId: sourceNode.id,
          category: 'connection'
        });
      }
    }

    if (sourceNode.data.nodeType === 'merge') {
      if (targetHandle !== 'left') {
        errors.push({
          id: `invalid-merge-handle-${sourceNode.id}`,
          type: 'error',
          message: 'Merge node must use left input handle',
          nodeId: sourceNode.id,
          category: 'connection'
        });
      }
    }

    // Rule 5: Business logic validations
    
    // Approval nodes should typically come before end nodes
    if (sourceNode.data.nodeType === 'task' && targetNode.data.nodeType === 'end') {
      errors.push({
        id: `task-to-end-${sourceNode.id}`,
        type: 'warning',
        message: 'Consider adding an approval step before ending the workflow',
        nodeId: sourceNode.id,
        category: 'business'
      });
    }

    // Escalation should have proper context
    if (targetNode.data.nodeType === 'escalation') {
      if (!sourceNode.data.sla?.escalationEnabled) {
        errors.push({
          id: `escalation-without-sla-${sourceNode.id}`,
          type: 'warning',
          message: 'Source node should have SLA escalation enabled',
          nodeId: sourceNode.id,
          category: 'business'
        });
      }
    }

    return errors;
  }

  /**
   * Validate connection count limits for nodes
   */
  static validateConnectionCounts(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle?: string,
    targetHandle?: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);

    if (!sourceNode || !targetNode) return errors;

    // Count existing connections
    const sourceOutgoing = edges.filter(e => e.source === sourceNodeId);
    const targetIncoming = edges.filter(e => e.target === targetNodeId);

    // Connection limits based on node types
    const getConnectionLimits = (nodeType: string, nodeData: any) => {
      switch (nodeType) {
        case 'start':
          return { maxIncoming: 0, maxOutgoing: 1 };
        case 'end':
        case 'archive':
          return { maxIncoming: 1, maxOutgoing: 0 };
        case 'condition':
          return { maxIncoming: 1, maxOutgoing: 2 };
        case 'parallel':
          return { maxIncoming: 1, maxOutgoing: -1 }; // Unlimited outgoing
        case 'merge':
          return { maxIncoming: -1, maxOutgoing: 1 }; // Unlimited incoming
        case 'escalation':
          return { maxIncoming: -1, maxOutgoing: 1 }; // Can receive from multiple sources
        case 'task':
          // Check if escalation is enabled - if so, allow 2 outgoing connections
          const taskEscalationEnabled = nodeData?.sla?.escalationEnabled === true;
          return { 
            maxIncoming: 1, 
            maxOutgoing: taskEscalationEnabled ? 2 : 1 
          };
        case 'approval':
          // Approval nodes have 3 distinct handles: approved (required), rejected (optional), escalation (optional)
          // Each handle can have max 1 connection, so total max is 3
          const approvalEscalationEnabled = nodeData?.sla?.escalationEnabled === true;
          return { 
            maxIncoming: 1, 
            maxOutgoing: approvalEscalationEnabled ? 3 : 2 
          };
        default: // notification, etc.
          return { maxIncoming: 1, maxOutgoing: 1 };
      }
    };

    const sourceLimits = getConnectionLimits(sourceNode.data.nodeType, sourceNode.data);
    const targetLimits = getConnectionLimits(targetNode.data.nodeType, targetNode.data);

    // Check source outgoing limit (skip for approval nodes as they have handle-specific validation)
    if (sourceLimits.maxOutgoing !== -1 && sourceOutgoing.length >= sourceLimits.maxOutgoing && sourceNode.data.nodeType !== 'approval') {
      errors.push({
        id: `source-outgoing-limit-${sourceNodeId}`,
        type: 'error',
        message: `${sourceNode.data.nodeType} node can only have ${sourceLimits.maxOutgoing} outgoing connection(s)`,
        nodeId: sourceNodeId,
        category: 'connection'
      });
    }

    // Check target incoming limit
    if (targetLimits.maxIncoming !== -1 && targetIncoming.length >= targetLimits.maxIncoming) {
      errors.push({
        id: `target-incoming-limit-${targetNodeId}`,
        type: 'error',
        message: `${targetNode.data.nodeType} node can only have ${targetLimits.maxIncoming} incoming connection(s)`,
        nodeId: targetNodeId,
        category: 'connection'
      });
    }

    // Special validation for condition nodes - ensure we don't duplicate handle connections
    if (sourceNode.data.nodeType === 'condition') {
      const existingHandleConnection = sourceOutgoing.find(e => e.sourceHandle === sourceHandle);
      if (existingHandleConnection) {
        errors.push({
          id: `condition-handle-duplicate-${sourceNodeId}`,
          type: 'error',
          message: `Condition node already has a connection on the ${sourceHandle === 'right-true' ? 'true' : 'false'} path`,
          nodeId: sourceNodeId,
          category: 'connection'
        });
      }
    }

    // Special validation for parallel nodes - no duplication needed since single handle supports multiple connections
    if (sourceNode.data.nodeType === 'parallel') {
      // Parallel nodes can have unlimited outgoing connections from the single right handle
      // No additional validation needed
    }

    // Special validation for task/approval nodes with escalation
    if (['task', 'approval'].includes(sourceNode.data.nodeType)) {
      const escalationEnabled = sourceNode.data.sla?.escalationEnabled === true;
      
      // Approval nodes have specific handle validation
      if (sourceNode.data.nodeType === 'approval') {
        // Validate that the source handle is one of the allowed handles
        const allowedHandles = ['right-approved', 'bottom-rejected'];
        if (escalationEnabled) {
          allowedHandles.push('bottom-escalation');
        }
        
        if (!allowedHandles.includes(sourceHandle || '')) {
          errors.push({
            id: `approval-invalid-handle-${sourceNodeId}`,
            type: 'error',
            message: `Invalid connection handle for approval node. Use approved path, rejected path${escalationEnabled ? ', or escalation path' : ''}.`,
            nodeId: sourceNodeId,
            category: 'connection'
          });
          return errors; // Return early to avoid further validation
        }

        if (sourceHandle === 'right-approved') {
          const existingApprovedConnection = sourceOutgoing.find(e => e.sourceHandle === 'right-approved');
          if (existingApprovedConnection) {
            errors.push({
              id: `approval-approved-duplicate-${sourceNodeId}`,
              type: 'error',
              message: `Approval node already has an approved path connection`,
              nodeId: sourceNodeId,
              category: 'connection'
            });
          }
        } else if (sourceHandle === 'bottom-rejected') {
          const existingRejectedConnection = sourceOutgoing.find(e => e.sourceHandle === 'bottom-rejected');
          if (existingRejectedConnection) {
            errors.push({
              id: `approval-rejected-duplicate-${sourceNodeId}`,
              type: 'error',
              message: `Approval node already has a rejected path connection`,
              nodeId: sourceNodeId,
              category: 'connection'
            });
          }
        } else if (sourceHandle === 'bottom-escalation') {
          if (!escalationEnabled) {
            errors.push({
              id: `approval-escalation-disabled-${sourceNodeId}`,
              type: 'error',
              message: `Escalation is not enabled for this approval node. Enable SLA escalation in properties to use this connection.`,
              nodeId: sourceNodeId,
              category: 'business'
            });
          } else {
            const existingEscalationConnection = sourceOutgoing.find(e => e.sourceHandle === 'bottom-escalation');
            if (existingEscalationConnection) {
              errors.push({
                id: `approval-escalation-duplicate-${sourceNodeId}`,
                type: 'error',
                message: `Approval node already has an escalation connection`,
                nodeId: sourceNodeId,
                category: 'connection'
              });
            }
          }
        }
      }
      // Task node validation (original logic)
      else if (sourceNode.data.nodeType === 'task') {
        if (escalationEnabled) {
          // Ensure escalation connections use the correct handle
          if (sourceHandle === 'bottom-escalation') {
            const existingEscalationConnection = sourceOutgoing.find(e => e.sourceHandle === 'bottom-escalation');
            if (existingEscalationConnection) {
              errors.push({
                id: `escalation-handle-duplicate-${sourceNodeId}`,
                type: 'error',
                message: `${sourceNode.data.nodeType} node already has an escalation connection`,
                nodeId: sourceNodeId,
                category: 'connection'
              });
            }
          } else if (sourceHandle === 'right') {
            const existingNormalConnection = sourceOutgoing.find(e => e.sourceHandle === 'right');
            if (existingNormalConnection) {
              errors.push({
                id: `normal-handle-duplicate-${sourceNodeId}`,
                type: 'error',
                message: `${sourceNode.data.nodeType} node already has a normal flow connection`,
                nodeId: sourceNodeId,
                category: 'connection'
              });
            }
          }
        } else {
          // If escalation is not enabled, only allow normal connections
          if (sourceHandle === 'bottom-escalation') {
            errors.push({
              id: `escalation-disabled-${sourceNodeId}`,
              type: 'error',
              message: `Escalation is not enabled for this ${sourceNode.data.nodeType} node. Enable SLA escalation in properties to use this connection.`,
              nodeId: sourceNodeId,
              category: 'business'
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate the entire workflow structure
   */
  static validateWorkflow(nodes: WorkflowNode[], edges: WorkflowEdge[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Rule 1: Must have exactly one start node
    const startNodes = nodes.filter(node => node.data.nodeType === 'start');
    if (startNodes.length === 0) {
      errors.push({
        id: 'no-start-node',
        type: 'error',
        message: 'Workflow must have exactly one start node',
        category: 'structure'
      });
    } else if (startNodes.length > 1) {
      errors.push({
        id: 'multiple-start-nodes',
        type: 'error',
        message: 'Workflow can only have one start node',
        category: 'structure'
      });
    }

    // Rule 2: Must have at least one end node
    const endNodes = nodes.filter(node => ['end', 'archive'].includes(node.data.nodeType));
    if (endNodes.length === 0) {
      errors.push({
        id: 'no-end-node',
        type: 'error',
        message: 'Workflow must have at least one end or archive node',
        category: 'structure'
      });
    }

    // Rule 3: All nodes (except start) must have incoming connections
    nodes.forEach(node => {
      if (node.data.nodeType !== 'start') {
        const hasIncoming = edges.some(edge => edge.target === node.id);
        if (!hasIncoming) {
          errors.push({
            id: `no-incoming-${node.id}`,
            type: 'error',
            message: `Node "${node.data.label}" has no incoming connections`,
            nodeId: node.id,
            category: 'structure'
          });
        }
      }
    });

    // Rule 4: All nodes (except end/archive/approval) must have outgoing connections
    // Note: Approval nodes are handled separately with specific path validation
    nodes.forEach(node => {
      if (!['end', 'archive', 'approval'].includes(node.data.nodeType)) {
        const hasOutgoing = edges.some(edge => edge.source === node.id);
        if (!hasOutgoing) {
          errors.push({
            id: `no-outgoing-${node.id}`,
            type: 'error',
            message: `Node "${node.data.label}" has no outgoing connections`,
            nodeId: node.id,
            category: 'structure'
          });
        }
      }
    });

    // Rule 5: Condition nodes must have both true and false paths
    nodes.forEach(node => {
      if (node.data.nodeType === 'condition') {
        const trueEdge = edges.find(edge => 
          edge.source === node.id && edge.sourceHandle === 'right-true'
        );
        const falseEdge = edges.find(edge => 
          edge.source === node.id && edge.sourceHandle === 'bottom-false'
        );

        if (!trueEdge) {
          errors.push({
            id: `condition-no-true-${node.id}`,
            type: 'error',
            message: `Condition node "${node.data.label}" must have a true path connection`,
            nodeId: node.id,
            category: 'structure'
          });
        }

        if (!falseEdge) {
          errors.push({
            id: `condition-no-false-${node.id}`,
            type: 'error',
            message: `Condition node "${node.data.label}" must have a false path connection`,
            nodeId: node.id,
            category: 'structure'
          });
        }
      }
    });

    // Rule 5.1: Approval nodes must have approved path, rejected path validation based on configuration
    nodes.forEach(node => {
      if (node.data.nodeType === 'approval') {
        const approvedEdge = edges.find(edge => 
          edge.source === node.id && edge.sourceHandle === 'right-approved'
        );
        const rejectedEdge = edges.find(edge => 
          edge.source === node.id && edge.sourceHandle === 'bottom-rejected'
        );

        // Approved path is always required
        if (!approvedEdge) {
          errors.push({
            id: `approval-no-approved-${node.id}`,
            type: 'error',
            message: `Approval node "${node.data.label}" must have an approved path connection`,
            nodeId: node.id,
            category: 'structure'
          });
        }

        // Rejected path validation based on configuration
        const requireRejectionPath = node.data.approvalConfig?.requireRejectionPath ?? false;
        const autoApproveOnTimeout = node.data.approvalConfig?.autoApproveOnTimeout ?? false;
        
        if (!rejectedEdge) {
          if (requireRejectionPath) {
            errors.push({
              id: `approval-no-rejected-required-${node.id}`,
              type: 'error',
              message: `Approval node "${node.data.label}" is configured to require a rejected path connection`,
              nodeId: node.id,
              category: 'business'
            });
          } else if (!autoApproveOnTimeout) {
            warnings.push({
              id: `approval-no-rejected-${node.id}`,
              type: 'warning',
              message: `Approval node "${node.data.label}" should have a rejected path connection for better workflow handling`,
              nodeId: node.id,
              category: 'business'
            });
          }
          // If autoApproveOnTimeout is true and no rejected path, that's acceptable
        }
      }
    });

    // Rule 6: Parallel nodes should have multiple branches
    nodes.forEach(node => {
      if (node.data.nodeType === 'parallel') {
        const branches = edges.filter(edge => edge.source === node.id);
        if (branches.length < 2) {
          warnings.push({
            id: `parallel-few-branches-${node.id}`,
            type: 'warning',
            message: `Parallel node "${node.data.label}" should have at least 2 branches`,
            nodeId: node.id,
            category: 'business'
          });
        }
      }
    });

    // Rule 7: Business validations
    
    // Check for proper assignees
    nodes.forEach(node => {
      if (['task', 'approval'].includes(node.data.nodeType)) {
        if (!node.data.assignees || node.data.assignees.length === 0) {
          warnings.push({
            id: `no-assignees-${node.id}`,
            type: 'warning',
            message: `${node.data.nodeType} node "${node.data.label}" should have assignees`,
            nodeId: node.id,
            category: 'business'
          });
        }
      }
    });

    // Check for SLA configuration
    nodes.forEach(node => {
      if (['task', 'approval'].includes(node.data.nodeType)) {
        if (!node.data.sla) {
          warnings.push({
            id: `no-sla-${node.id}`,
            type: 'warning',
            message: `${node.data.nodeType} node "${node.data.label}" should have SLA configured`,
            nodeId: node.id,
            category: 'business'
          });
        }
      }
    });

    // Rule 8: Check for circular dependencies
    const hasCycles = this.detectCycles(nodes, edges);
    if (hasCycles.length > 0) {
      hasCycles.forEach(cycle => {
        errors.push({
          id: `cycle-${cycle.join('-')}`,
          type: 'error',
          message: `Circular dependency detected: ${cycle.map(id => 
            nodes.find(n => n.id === id)?.data.label || id
          ).join(' → ')}`,
          category: 'structure'
        });
      });
    }

    // Separate errors and warnings
    const allValidations = [...errors, ...warnings];
    const finalErrors = allValidations.filter(v => v.type === 'error');
    const finalWarnings = allValidations.filter(v => v.type === 'warning');

    return {
      isValid: finalErrors.length === 0,
      errors: finalErrors,
      warnings: finalWarnings
    };
  }

  /**
   * Detect circular dependencies using DFS
   */
  private static detectCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const currentPath: string[] = [];

    const buildAdjacencyList = (): Map<string, string[]> => {
      const adj = new Map<string, string[]>();
      nodes.forEach(node => adj.set(node.id, []));
      edges.forEach(edge => {
        const neighbors = adj.get(edge.source) || [];
        neighbors.push(edge.target);
        adj.set(edge.source, neighbors);
      });
      return adj;
    };

    const dfs = (nodeId: string, adjacencyList: Map<string, string[]>): void => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      currentPath.push(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, adjacencyList);
        } else if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStartIndex = currentPath.indexOf(neighbor);
          const cycle = currentPath.slice(cycleStartIndex);
          cycle.push(neighbor); // Complete the cycle
          cycles.push([...cycle]);
        }
      }

      recursionStack.delete(nodeId);
      currentPath.pop();
    };

    const adjacencyList = buildAdjacencyList();
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        dfs(node.id, adjacencyList);
      }
    });

    return cycles;
  }

  /**
   * Validate a specific connection attempt in real-time
   */
  static validateConnectionAttempt(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle?: string,
    targetHandle?: string
  ): ValidationError[] {
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);

    if (!sourceNode || !targetNode) {
      return [{
        id: 'node-not-found',
        type: 'error',
        message: 'Source or target node not found',
        category: 'connection'
      }];
    }

    // Check basic connection rules
    const connectionErrors = this.validateConnection(
      sourceNode, 
      targetNode, 
      sourceHandle, 
      targetHandle
    );

    // Check connection count limits
    const countErrors = this.validateConnectionCounts(
      nodes,
      edges,
      sourceNodeId,
      targetNodeId,
      sourceHandle,
      targetHandle
    );

    // Check if connection would create a cycle
    const tempEdges = [...edges, {
      id: 'temp',
      source: sourceNodeId,
      target: targetNodeId,
      sourceHandle,
      targetHandle,
      data: {}
    } as WorkflowEdge];

    const cycles = this.detectCycles(nodes, tempEdges);
    if (cycles.length > 0) {
      connectionErrors.push({
        id: 'would-create-cycle',
        type: 'error',
        message: 'This connection would create a circular dependency',
        category: 'structure'
      });
    }

    return [...connectionErrors, ...countErrors];
  }
}
