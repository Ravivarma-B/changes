import { Node, Edge } from '@xyflow/react';
import { z } from 'zod';

// Base workflow schemas
export const AssigneeTypeSchema = z.enum(['user', 'group', 'role']);
export const NodeTypeSchema = z.enum([
  'start',
  'task',
  'approval',
  'condition',
  'parallel',
  'merge',
  'escalation',
  'end',
  'archive'
]);

export const StatusSchema = z.enum([
  'draft',
  'active',
  'paused',
  'completed',
  'cancelled'
]);

export const PrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const TaskTypeSchema = z.enum([
  'review',
  'approve', 
  'create_object',
  'add_notes',
  'download',
  'add_signature',
  'add_attachment',
  'link_document',
  'link_entity',
  'print',
  'close',
  'restricted_share',
  'distribution'
]);

export const AssigneeSchema = z.object({
  type: AssigneeTypeSchema,
  id: z.string(),
  name: z.string(),
  email: z.email().optional(),
});

export const SLASchema = z.object({
  duration: z.number().min(1), // in hours
  unit: z.enum(['minutes', 'hours', 'days', 'weeks']),
  warningThreshold: z.number().min(0).max(100).optional(), // percentage before SLA breach
  escalationEnabled: z.boolean().default(false),
  escalationPath: z.array(AssigneeSchema).optional(),
});

// Simplified condition schema for practical workflow scenarios
export const ConditionSchema = z.object({
  id: z.string(),
  field: z.string().min(1, "Field is required"),
  operator: z.enum([
    // Basic comparison
    'equals', 'not_equals', 'contains',
    // Numeric comparison
    'greater_than', 'less_than', 'greater_equal', 'less_equal',
    // Boolean states
    'is_true', 'is_false'
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  logicalOperator: z.enum(['AND', 'OR']).optional()
});

export const ActionSchema = z.object({
  type: z.enum(['approve', 'reject', 'delegate', 'escalate', 'comment', 'custom']),
  name: z.string(),
  requireComment: z.boolean().default(false),
  nextNodeId: z.string().optional(),
  conditions: z.array(ConditionSchema).optional(),
});

// Merge node configuration for handling parallel task completion
export const MergeNodeConfigSchema = z.object({
  waitForAll: z.boolean().default(true), // wait for all non-optional tasks
  waitForOptional: z.boolean().default(false), // whether to wait for optional tasks
  minimumRequired: z.number().optional(), // minimum number of tasks that must complete
  timeout: z.number().optional(), // timeout in minutes to wait for optional tasks
  skipOnTimeout: z.boolean().default(true), // whether to proceed if timeout is reached
  escalateOnTimeout: z.boolean().default(false), // whether to escalate if timeout is reached
});

// Approval node configuration for handling approval-specific behavior
export const ApprovalNodeConfigSchema = z.object({
  requireRejectionPath: z.boolean().default(false), // whether rejection path is mandatory
  autoApproveOnTimeout: z.boolean().default(false), // automatically approve if SLA expires
  allowDelegateApproval: z.boolean().default(true), // allow delegation of approval authority
  requireRejectionReason: z.boolean().default(true), // require reason when rejecting
  allowConditionalApproval: z.boolean().default(false), // allow approval with conditions
});

export const WorkflowNodeDataSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  nodeType: NodeTypeSchema,
  taskType: TaskTypeSchema.optional(), // specific task type for task nodes
  assignees: z.array(AssigneeSchema).optional(),
  actions: z.array(ActionSchema).optional(),
  sla: SLASchema.optional(),
  priority: PrioritySchema.default('medium'),
  allowDelegation: z.boolean().default(false),
  allowReassignment: z.boolean().default(false),
  requireAllApprovals: z.boolean().default(false), // for parallel approvals
  optional: z.boolean().default(false), // marks if this task can be skipped in parallel workflows
  conditions: z.array(ConditionSchema).optional(), // for condition nodes
  mergeConfig: MergeNodeConfigSchema.optional(), // for merge nodes
  approvalConfig: ApprovalNodeConfigSchema.optional(), // for approval nodes
  formFields: z.array(z.string()).optional(), // form field IDs required
  locked: z.boolean().default(false), // whether the node is locked for editing
  notifications: z.object({
    onStart: z.boolean().default(false),
    onComplete: z.boolean().default(false),
    onSLABreach: z.boolean().default(false),
    onEscalation: z.boolean().default(false),
    slaReminder: z.object({
      enabled: z.boolean().default(false),
      duration: z.number().min(1).default(30), // minutes before SLA breach
      unit: z.enum(['minutes', 'hours', 'days']).default('minutes'),
    }).optional(),
  }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const WorkflowEdgeDataSchema = z.object({
  label: z.string().optional(),
  condition: ConditionSchema.optional(),
  probability: z.number().min(0).max(100).optional(), // for analytics
  metadata: z.record(z.string(), z.any()).optional(),
});

export const WorkflowSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  version: z.string().default('1.0.0'),
  status: StatusSchema.default('draft'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  priority: PrioritySchema.default('medium'),
  nodes: z.array(z.object({
    id: z.string(),
    type: z.string(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    data: WorkflowNodeDataSchema,
    measured: z.object({
      width: z.number(),
      height: z.number(),
    }).optional(),
  })),
  edges: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    type: z.string().optional(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
    data: WorkflowEdgeDataSchema.optional(),
  })),
  settings: z.object({
    allowParallelExecution: z.boolean().default(false),
    autoArchive: z.boolean().default(true),
    archiveAfterDays: z.number().default(30),
    maxExecutionTime: z.number().optional(), // in hours
    enableAuditLog: z.boolean().default(true),
    enableNotifications: z.boolean().default(true),
    defaultSLA: SLASchema.optional(),
  }).default({
    allowParallelExecution: false,
    autoArchive: true,
    archiveAfterDays: 30,
    enableAuditLog: true,
    enableNotifications: true,
  }),
  createdBy: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedBy: z.string().optional(),
  updatedAt: z.date().optional(),
  publishedAt: z.date().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const WorkflowInstanceSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  workflowVersion: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'escalated']),
  priority: PrioritySchema.default('medium'),
  currentNodes: z.array(z.string()), // current active node IDs
  completedNodes: z.array(z.string()),
  data: z.record(z.string(), z.any()).default({}), // instance-specific data
  initiatedBy: z.string(),
  initiatedAt: z.date().default(() => new Date()),
  completedAt: z.date().optional(),
  dueDate: z.date().optional(),
  slaBreached: z.boolean().default(false),
  escalationCount: z.number().default(0),
  comments: z.array(z.object({
    id: z.string(),
    userId: z.string(),
    userName: z.string(),
    comment: z.string(),
    timestamp: z.date().default(() => new Date()),
    nodeId: z.string().optional(),
  })).default([]),
  auditLog: z.array(z.object({
    id: z.string(),
    action: z.string(),
    userId: z.string(),
    userName: z.string(),
    nodeId: z.string().optional(),
    timestamp: z.date().default(() => new Date()),
    details: z.record(z.string(), z.any()).optional(),
  })).default([]),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
    uploadedBy: z.string(),
    uploadedAt: z.date().default(() => new Date()),
  })).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});

// TypeScript types derived from Zod schemas
export type AssigneeType = z.infer<typeof AssigneeTypeSchema>;
export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type TaskType = z.infer<typeof TaskTypeSchema>;
export type Assignee = z.infer<typeof AssigneeSchema>;
export type SLA = z.infer<typeof SLASchema>;
export type Condition = z.infer<typeof ConditionSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type WorkflowNodeData = z.infer<typeof WorkflowNodeDataSchema>;
export type WorkflowEdgeData = z.infer<typeof WorkflowEdgeDataSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowInstance = z.infer<typeof WorkflowInstanceSchema>;

// React Flow types with our custom data
export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge<WorkflowEdgeData>;

// Layout algorithms
export type LayoutAlgorithm = 'custom' | 'dagre' | 'elk-layered' | 'elk-force' | 'elk-stress';

// Workflow execution context
export interface WorkflowExecutionContext {
  instanceId: string;
  workflowId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    roles: string[];
    groups: string[];
  };
  instanceData: Record<string, any>;
  environmentVariables: Record<string, any>;
}

// Node validation result
export interface NodeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Workflow validation result
export interface WorkflowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  nodeValidations: Record<string, NodeValidationResult>;
}

// Statistics and analytics
export interface WorkflowStats {
  totalInstances: number;
  completedInstances: number;
  pendingInstances: number;
  averageCompletionTime: number; // in hours
  slaBreachRate: number; // percentage
  escalationRate: number; // percentage
  nodeStats: Record<string, {
    completionRate: number;
    averageTime: number;
    escalationCount: number;
  }>;
}

// Export/Import formats
export interface WorkflowExport {
  workflow: Workflow;
  version: string;
  exportedAt: Date;
  exportedBy: string;
}

export interface WorkflowImportResult {
  success: boolean;
  workflow?: Workflow;
  errors: string[];
  warnings: string[];
}
