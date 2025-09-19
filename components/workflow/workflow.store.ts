import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { 
  Workflow, 
  WorkflowInstance, 
  WorkflowNode, 
  WorkflowEdge, 
  LayoutAlgorithm,
  WorkflowValidationResult,
  WorkflowStats
} from './workflow.types';
import { v4 as uuidv4 } from 'uuid';

interface WorkflowState {
  // Current workflow being edited
  currentWorkflow: Workflow | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  
  // UI state
  selectedNodes: string[];
  selectedEdges: string[];
  layoutAlgorithm: LayoutAlgorithm;
  isLayouting: boolean;
  viewportInitialized: boolean;
  
  // Workflow management
  workflows: Workflow[];
  workflowInstances: WorkflowInstance[];
  isLoading: boolean;
  error: string | null;
  
  // Validation
  validationResult: WorkflowValidationResult | null;
  
  // Statistics
  stats: Record<string, WorkflowStats>;
  
  // Actions
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: Omit<WorkflowNode, 'id'>) => string;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string) => string;
  toggleNodeLocked: (id: string) => void;
  toggleNodeReassignment: (id: string) => void;
  toggleNodeDelegation: (id: string) => void;
  toggleNodeNotifications: (id: string) => void;
  addEdge: (edge: Omit<WorkflowEdge, 'id'>) => string;
  updateEdge: (id: string, updates: Partial<WorkflowEdge>) => void;
  deleteEdge: (id: string) => void;
  
  // Selection
  setSelectedNodes: (nodeIds: string[]) => void;
  setSelectedEdges: (edgeIds: string[]) => void;
  clearSelection: () => void;
  
  // Layout
  setLayoutAlgorithm: (algorithm: LayoutAlgorithm) => void;
  setIsLayouting: (isLayouting: boolean) => void;
  setViewportInitialized: (initialized: boolean) => void;
  
  // Workflow CRUD
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt'>) => Promise<string>;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  duplicateWorkflow: (id: string) => Promise<string>;
  publishWorkflow: (id: string) => Promise<void>;
  
  // Workflow validation
  validateWorkflow: (workflow?: Workflow) => WorkflowValidationResult;
  
  // Import/Export
  exportWorkflow: (id: string) => Promise<string>;
  importWorkflow: (data: string) => Promise<string>;
  
  // Instance management
  createInstance: (workflowId: string, title: string, data?: Record<string, any>) => Promise<string>;
  updateInstance: (id: string, updates: Partial<WorkflowInstance>) => Promise<void>;
  cancelInstance: (id: string) => Promise<void>;
  
  // Statistics
  calculateStats: (workflowId: string) => Promise<WorkflowStats>;
  
  // Utility functions
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState = {
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  layoutAlgorithm: 'dagre' as LayoutAlgorithm,
  isLayouting: false,
  viewportInitialized: false,
  workflows: [],
  workflowInstances: [],
  isLoading: false,
  error: null,
  validationResult: null,
  stats: {},
};

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,

      // Basic setters
      setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
      setNodes: (nodes) => {
        // Ensure draggable property is set correctly based on locked state
        const nodesWithDraggable = nodes.map(node => ({
          ...node,
          draggable: !node.data?.locked
        }));
        set({ nodes: nodesWithDraggable });
      },
      setEdges: (edges) => set({ edges }),
      
      // Node management
      addNode: (node) => {
        const id = uuidv4();
        const newNode: WorkflowNode = { 
          ...node, 
          id,
          draggable: !node.data?.locked // Set draggable based on locked state
        };
        set((state) => ({
          nodes: [...state.nodes, newNode]
        }));
        return id;
      },

      updateNode: (id, updates) => {
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === id ? { 
              ...node, 
              ...updates,
              // Set draggable based on locked state
              draggable: updates.data?.locked !== undefined ? !updates.data.locked : (node.data?.locked !== undefined ? !node.data.locked : true)
            } : node
          )
        }));
      },

      deleteNode: (id) => {
        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== id),
          edges: state.edges.filter(edge => 
            edge.source !== id && edge.target !== id
          ),
          selectedNodes: state.selectedNodes.filter(nodeId => nodeId !== id)
        }));
      },

      duplicateNode: (id) => {
        const state = get();
        const node = state.nodes.find(n => n.id === id);
        if (!node) return '';
        
        const newId = uuidv4();
        const newNode: WorkflowNode = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50,
          },
          data: {
            ...node.data,
            label: `${node.data.label} (Copy)`,
          },
        };
        
        set((state) => ({
          nodes: [...state.nodes, newNode]
        }));
        
        return newId;
      },

      toggleNodeLocked: (id) => {
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    locked: !node.data.locked 
                  },
                  draggable: node.data.locked // Will be opposite of current locked state
                } 
              : node
          )
        }));
      },

      toggleNodeReassignment: (id) => {
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    allowReassignment: !node.data.allowReassignment 
                  } 
                } 
              : node
          )
        }));
      },

      toggleNodeDelegation: (id) => {
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    allowDelegation: !node.data.allowDelegation 
                  } 
                } 
              : node
          )
        }));
      },

      toggleNodeNotifications: (id) => {
        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === id 
              ? { 
                  ...node, 
                  data: { 
                    ...node.data, 
                    notifications: node.data.notifications 
                      ? undefined 
                      : {
                          onStart: true,
                          onComplete: true,
                          onSLABreach: true,
                          onEscalation: true,
                        }
                  } 
                } 
              : node
          )
        }));
      },

      // Edge management
      addEdge: (edge) => {
        const id = uuidv4();
        const newEdge: WorkflowEdge = { ...edge, id };
        set((state) => ({
          edges: [...state.edges, newEdge]
        }));
        return id;
      },

      updateEdge: (id, updates) => {
        set((state) => ({
          edges: state.edges.map(edge => 
            edge.id === id ? { ...edge, ...updates } : edge
          )
        }));
      },

      deleteEdge: (id) => {
        set((state) => ({
          edges: state.edges.filter(edge => edge.id !== id),
          selectedEdges: state.selectedEdges.filter(edgeId => edgeId !== id)
        }));
      },

      // Selection management
      setSelectedNodes: (nodeIds) => set({ selectedNodes: nodeIds }),
      setSelectedEdges: (edgeIds) => set({ selectedEdges: edgeIds }),
      clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

      // Layout management
      setLayoutAlgorithm: (algorithm) => set({ layoutAlgorithm: algorithm }),
      setIsLayouting: (isLayouting) => set({ isLayouting }),
      setViewportInitialized: (initialized) => set({ viewportInitialized: initialized }),

      // Workflow CRUD operations
      createWorkflow: async (workflowData) => {
        set({ isLoading: true, error: null });
        try {
          debugger;
          const id = uuidv4();
          const workflow: Workflow = {
            ...workflowData,
            id,
            createdAt: new Date(),
          };
          
          set((state) => ({
            workflows: [...state.workflows, workflow],
            currentWorkflow: workflow,
            isLoading: false
          }));
          
          return id;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create workflow', isLoading: false });
          throw error;
        }
      },

      updateWorkflow: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedWorkflow = {
            ...updates,
            updatedAt: new Date(),
          };
          
          set((state) => ({
            workflows: state.workflows.map(w => 
              w.id === id ? { ...w, ...updatedWorkflow } : w
            ),
            currentWorkflow: state.currentWorkflow?.id === id 
              ? { ...state.currentWorkflow, ...updatedWorkflow }
              : state.currentWorkflow,
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update workflow', isLoading: false });
          throw error;
        }
      },

      deleteWorkflow: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            workflows: state.workflows.filter(w => w.id !== id),
            currentWorkflow: state.currentWorkflow?.id === id ? null : state.currentWorkflow,
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to delete workflow', isLoading: false });
          throw error;
        }
      },

      duplicateWorkflow: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const originalWorkflow = get().workflows.find(w => w.id === id);
          if (!originalWorkflow) {
            throw new Error('Workflow not found');
          }

          const newId = uuidv4();
          const duplicatedWorkflow: Workflow = {
            ...originalWorkflow,
            id: newId,
            name: `${originalWorkflow.name} (Copy)`,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: undefined,
            publishedAt: undefined,
          };

          set((state) => ({
            workflows: [...state.workflows, duplicatedWorkflow],
            isLoading: false
          }));

          return newId;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to duplicate workflow', isLoading: false });
          throw error;
        }
      },

      publishWorkflow: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const workflow = get().workflows.find(w => w.id === id);
          if (!workflow) {
            throw new Error('Workflow not found');
          }

          // Validate before publishing
          const validationResult = get().validateWorkflow(workflow);
          if (!validationResult.isValid) {
            throw new Error(`Cannot publish workflow: ${validationResult.errors.join(', ')}`);
          }

          set((state) => ({
            workflows: state.workflows.map(w => 
              w.id === id 
                ? { ...w, status: 'active' as const, publishedAt: new Date() }
                : w
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to publish workflow', isLoading: false });
          throw error;
        }
      },

      // Validation
      validateWorkflow: (workflow) => {
        const workflowToValidate = workflow || get().currentWorkflow;
        if (!workflowToValidate) {
          return {
            isValid: false,
            errors: ['No workflow to validate'],
            warnings: [],
            nodeValidations: {}
          };
        }

        const errors: string[] = [];
        const warnings: string[] = [];
        const nodeValidations: Record<string, any> = {};

        // Basic validation
        if (!workflowToValidate.name.trim()) {
          errors.push('Workflow name is required');
        }

        if (workflowToValidate.nodes.length === 0) {
          errors.push('Workflow must have at least one node');
        }

        // Check for start and end nodes
        const startNodes = workflowToValidate.nodes.filter(n => n.data.nodeType === 'start');
        const endNodes = workflowToValidate.nodes.filter(n => n.data.nodeType === 'end' || n.data.nodeType === 'archive');

        if (startNodes.length === 0) {
          errors.push('Workflow must have a start node');
        } else if (startNodes.length > 1) {
          errors.push('Workflow can only have one start node');
        }

        if (endNodes.length === 0) {
          warnings.push('Workflow should have at least one end node');
        }

        // Validate node connections
        const nodeIds = new Set(workflowToValidate.nodes.map(n => n.id));
        const connectedNodes = new Set<string>();
        
        workflowToValidate.edges.forEach(edge => {
          if (!nodeIds.has(edge.source)) {
            errors.push(`Edge references non-existent source node: ${edge.source}`);
          }
          if (!nodeIds.has(edge.target)) {
            errors.push(`Edge references non-existent target node: ${edge.target}`);
          }
          connectedNodes.add(edge.source);
          connectedNodes.add(edge.target);
        });

        // Check for orphaned nodes (except start nodes)
        workflowToValidate.nodes.forEach(node => {
          if (node.data.nodeType !== 'start' && !connectedNodes.has(node.id)) {
            warnings.push(`Node "${node.data.label}" is not connected to any other nodes`);
          }
        });

        // Validate individual nodes
        workflowToValidate.nodes.forEach(node => {
          const nodeErrors: string[] = [];
          const nodeWarnings: string[] = [];

          if (!node.data.label.trim()) {
            nodeErrors.push('Node label is required');
          }

          // Validate assignees for task/approval nodes
          if (['task', 'approval'].includes(node.data.nodeType)) {
            if (!node.data.assignees || node.data.assignees.length === 0) {
              nodeErrors.push('Task and approval nodes must have assignees');
            }
          }

          // Validate conditions for condition nodes
          if (node.data.nodeType === 'condition') {
            if (!node.data.conditions || node.data.conditions.length === 0) {
              nodeErrors.push('Condition nodes must have conditions defined');
            }
          }

          nodeValidations[node.id] = {
            isValid: nodeErrors.length === 0,
            errors: nodeErrors,
            warnings: nodeWarnings
          };

          errors.push(...nodeErrors);
          warnings.push(...nodeWarnings);
        });

        const validationResult: WorkflowValidationResult = {
          isValid: errors.length === 0,
          errors,
          warnings,
          nodeValidations
        };

        set({ validationResult });
        return validationResult;
      },

      // Import/Export
      exportWorkflow: async (id) => {
        const workflow = get().workflows.find(w => w.id === id);
        if (!workflow) {
          throw new Error('Workflow not found');
        }

        const exportData = {
          workflow,
          version: '1.0.0',
          exportedAt: new Date(),
          exportedBy: 'current-user', // TODO: get from auth context
        };

        return JSON.stringify(exportData, null, 2);
      },

      importWorkflow: async (data) => {
        try {
          const importData = JSON.parse(data);
          const workflow = importData.workflow;
          
          // Generate new ID and reset status
          const newId = uuidv4();
          const importedWorkflow: Workflow = {
            ...workflow,
            id: newId,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: undefined,
            publishedAt: undefined,
          };

          set((state) => ({
            workflows: [...state.workflows, importedWorkflow]
          }));

          return newId;
        } catch (error) {
          throw new Error('Invalid workflow data format');
        }
      },

      // Instance management
      createInstance: async (workflowId, title, data = {}) => {
        set({ isLoading: true, error: null });
        try {
          const workflow = get().workflows.find(w => w.id === workflowId);
          if (!workflow) {
            throw new Error('Workflow not found');
          }

          if (workflow.status !== 'active') {
            throw new Error('Can only create instances from active workflows');
          }

          const instanceId = uuidv4();
          const instance: WorkflowInstance = {
            id: instanceId,
            workflowId,
            workflowVersion: workflow.version,
            title,
            status: 'pending',
            priority: workflow.priority,
            currentNodes: workflow.nodes.filter(n => n.data.nodeType === 'start').map(n => n.id),
            completedNodes: [],
            data,
            initiatedBy: 'current-user', // TODO: get from auth context
            initiatedAt: new Date(),
            slaBreached: false,
            escalationCount: 0,
            comments: [],
            auditLog: [{
              id: uuidv4(),
              action: 'instance_created',
              userId: 'current-user',
              userName: 'Current User',
              timestamp: new Date(),
            }],
            attachments: [],
          };

          set((state) => ({
            workflowInstances: [...state.workflowInstances, instance],
            isLoading: false
          }));

          return instanceId;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to create instance', isLoading: false });
          throw error;
        }
      },

      updateInstance: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          set((state) => ({
            workflowInstances: state.workflowInstances.map(instance => 
              instance.id === id ? { ...instance, ...updates } : instance
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update instance', isLoading: false });
          throw error;
        }
      },

      cancelInstance: async (id) => {
        await get().updateInstance(id, { 
          status: 'cancelled',
          completedAt: new Date()
        });
      },

      // Statistics
      calculateStats: async (workflowId) => {
        const instances = get().workflowInstances.filter(i => i.workflowId === workflowId);
        
        const stats: WorkflowStats = {
          totalInstances: instances.length,
          completedInstances: instances.filter(i => i.status === 'completed').length,
          pendingInstances: instances.filter(i => ['pending', 'in_progress'].includes(i.status)).length,
          averageCompletionTime: 0,
          slaBreachRate: 0,
          escalationRate: 0,
          nodeStats: {}
        };

        const completedInstances = instances.filter(i => i.status === 'completed' && i.completedAt);
        if (completedInstances.length > 0) {
          const totalTime = completedInstances.reduce((sum, instance) => {
            const duration = instance.completedAt!.getTime() - instance.initiatedAt.getTime();
            return sum + (duration / (1000 * 60 * 60)); // convert to hours
          }, 0);
          stats.averageCompletionTime = totalTime / completedInstances.length;
        }

        stats.slaBreachRate = instances.length > 0 
          ? (instances.filter(i => i.slaBreached).length / instances.length) * 100 
          : 0;

        stats.escalationRate = instances.length > 0 
          ? (instances.filter(i => i.escalationCount > 0).length / instances.length) * 100 
          : 0;

        set((state) => ({
          stats: { ...state.stats, [workflowId]: stats }
        }));

        return stats;
      },

      // Utility functions
      reset: () => set(initialState),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    })),
    {
      name: 'workflow-store',
    }
  )
);
