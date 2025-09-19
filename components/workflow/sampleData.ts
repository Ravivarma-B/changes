import { useEffect } from 'react';
import { useWorkflowStore } from './workflow.store';
import { Workflow, WorkflowNodeData, NodeType } from './workflow.types';
import { v4 as uuidv4 } from 'uuid';

// Sample workflow templates
export const sampleWorkflows: Partial<Workflow>[] = [
  {
    name: 'Leave Request Approval',
    description: 'Employee leave request approval workflow with manager and HR review',
    category: 'HR',
    priority: 'medium',
    "nodes": [
    {
      "type": "workflowNode",
      "position": {
        "x": 391.7868942503666,
        "y": 396.89291416276
      },
      "data": {
        "label": "Start",
        "nodeType": "start",
        "priority": "medium",
        "allowDelegation": false,
        "allowReassignment": false,
        "requireAllApprovals": false,
        "optional": false,
        "locked": false
      },
      "id": "adae9796-01e1-45a0-9c83-48755a8db884",
    },
    {
      "type": "workflowNode",
      "position": {
        "x": 695.5451759167573,
        "y": 327.28241575598565
      },
      "data": {
        "label": "Raise Request",
        "nodeType": "task",
        "priority": "medium",
        "allowDelegation": true,
        "allowReassignment": true,
        "requireAllApprovals": false,
        "optional": false,
        "locked": false,
        "taskType": "link_document",
        "sla": {
          "duration": 1,
          "unit": "weeks",
          "escalationEnabled": false
        },
        "notifications": {
          "onStart": true,
          "onComplete": true,
          "onSLABreach": true,
          "onEscalation": false,
          "slaReminder": {
            "enabled": true,
            "duration": 4,
            "unit": "hours"
          }
        },
        "assignees": [
          {
            "type": "user",
            "id": "users",
            "name": "Users"
          }
        ],
        "conditions": []
      },
      "id": "1b89c6e7-8da2-4058-ba55-eb90d05512e6",
      
    },
    {
      "type": "workflowNode",
      "position": {
        "x": 1478.4119309076357,
        "y": 326.6714946998599
      },
      "data": {
        "label": "Approval Required",
        "nodeType": "approval",
        "priority": "medium",
        "allowDelegation": true,
        "allowReassignment": true,
        "requireAllApprovals": false,
        "optional": false,
        "locked": false,
        "assignees": [
          {
            "type": "user",
            "id": "managers",
            "name": "Managers"
          },
          {
            "type": "user",
            "id": "hr_managers",
            "name": "HR Managers"
          }
        ],
        "conditions": [],
        "approvalConfig": {
          "requireRejectionPath": false,
          "autoApproveOnTimeout": false,
          "allowDelegateApproval": true,
          "requireRejectionReason": true,
          "allowConditionalApproval": false
        },
        "sla": {
          "duration": 1,
          "unit": "weeks",
          "escalationEnabled": false
        },
        "notifications": {
          "onStart": true,
          "onComplete": true,
          "onSLABreach": true,
          "onEscalation": false,
          "slaReminder": {
            "enabled": true,
            "duration": 1,
            "unit": "days"
          }
        }
      },
      "id": "d913c850-3866-4fed-a556-79267bb41934",
      
    },
    {
      "type": "workflowNode",
      "position": {
        "x": 1685.5368789499319,
        "y": 678.2923565715995
      },
      "data": {
        "label": "End",
        "nodeType": "end",
        "priority": "medium",
        "allowDelegation": false,
        "allowReassignment": false,
        "requireAllApprovals": false,
        "optional": false,
        "locked": false
      },
      "id": "376e646a-e874-466e-9913-43881901ae10",
      
    },
    {
      "type": "workflowNode",
      "position": {
        "x": 1107.6636255831475,
        "y": 327.5731639288936
      },
      "data": {
        "label": "Sign Document",
        "nodeType": "task",
        "priority": "medium",
        "allowDelegation": true,
        "allowReassignment": true,
        "requireAllApprovals": false,
        "optional": false,
        "locked": false,
        "taskType": "add_signature",
        "sla": {
          "duration": 2,
          "unit": "days",
          "escalationEnabled": false
        },
        "notifications": {
          "onStart": true,
          "onComplete": true,
          "onSLABreach": true,
          "onEscalation": false,
          "slaReminder": {
            "enabled": true,
            "duration": 4,
            "unit": "hours"
          }
        },
        "assignees": [
          {
            "type": "user",
            "id": "managers",
            "name": "Managers"
          }
        ],
        "conditions": []
      },
      "id": "e474e8da-9cd8-4200-8034-609c6d6c3d32",
      
    },
    {
      "type": "workflowNode",
      "position": {
        "x": 1850.8696802558436,
        "y": 395.2953824917531
      },
      "data": {
        "label": "End",
        "nodeType": "end",
        "priority": "medium",
        "allowDelegation": false,
        "allowReassignment": false,
        "requireAllApprovals": false,
        "optional": false,
        "locked": false
      },
      "id": "02270a7a-d572-45a5-b366-9bd02d9ad6a7",
      
    }
  ],
  "edges": [
    {
      "source": "adae9796-01e1-45a0-9c83-48755a8db884",
      "sourceHandle": "right",
      "target": "1b89c6e7-8da2-4058-ba55-eb90d05512e6",
      "targetHandle": "left",
      "id": "26bc23e7-6575-4b6f-bec4-b063337d4e2e",
      "type": "workflowEdge",
      "data": {
        "label": ""
      }
    },
    {
      "source": "d913c850-3866-4fed-a556-79267bb41934",
      "sourceHandle": "bottom-rejected",
      "target": "376e646a-e874-466e-9913-43881901ae10",
      "targetHandle": "left",
      "id": "4d23c304-3e21-4464-9570-b59262147ba0",
      "type": "workflowEdge",
      "data": {
        "label": ""
      }
    },
    {
      "source": "1b89c6e7-8da2-4058-ba55-eb90d05512e6",
      "sourceHandle": "right",
      "target": "e474e8da-9cd8-4200-8034-609c6d6c3d32",
      "targetHandle": "left",
      "id": "1f58f992-d047-4a17-80d7-e397f1ba23a7",
      "type": "workflowEdge",
      "data": {
        "label": ""
      }
    },
    {
      "source": "e474e8da-9cd8-4200-8034-609c6d6c3d32",
      "sourceHandle": "right",
      "target": "d913c850-3866-4fed-a556-79267bb41934",
      "targetHandle": "left",
      "id": "b5746576-d610-4b80-84b7-31c457b981a8",
      "type": "workflowEdge",
      "data": {
        "label": ""
      }
    },
    {
      "source": "d913c850-3866-4fed-a556-79267bb41934",
      "sourceHandle": "right-approved",
      "target": "02270a7a-d572-45a5-b366-9bd02d9ad6a7",
      "targetHandle": "left",
      "id": "0c0f778e-756b-4109-aeb9-ecbd5dd3106d",
      "type": "workflowEdge",
      "data": {
        "label": ""
      }
    }
  ],
  "metadata": {
    "exportedAt": "2025-08-21T08:12:11.570Z",
    "nodeCount": 6,
    "edgeCount": 5,
    "exportVersion": "1.0.0"
  }
  },
  {
    name: 'Purchase Order Approval',
    description: 'Multi-level purchase order approval based on amount',
    category: 'Finance',
    priority: 'high',
    nodes: [
      {
        id: 'start-2',
        type: 'workflowNode',
        position: { x: 250, y: 50 },
        data: {
          label: 'Purchase Request Submitted',
          nodeType: 'start' as NodeType,
          description: 'Employee submits purchase order request',
          priority: 'medium',
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'condition-2',
        type: 'workflowNode',
        position: { x: 250, y: 200 },
        data: {
          label: 'Amount Check',
          nodeType: 'condition' as NodeType,
          description: 'Check purchase order amount',
          priority: 'medium',
          conditions: [
            {
              field: 'amount',
              operator: 'greater_than',
              value: 10000,
            },
          ],
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'task-3',
        type: 'workflowNode',
        position: { x: 100, y: 350 },
        data: {
          label: 'Manager Approval',
          nodeType: 'approval' as NodeType,
          description: 'Department manager approval for lower amounts',
          priority: 'medium',
          assignees: [
            {
              type: 'role',
              id: 'dept-manager',
              name: 'Department Manager',
            },
          ],
          sla: {
            duration: 1,
            unit: 'days',
            escalationEnabled: true,
          },
          allowDelegation: true,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'parallel-1',
        type: 'workflowNode',
        position: { x: 400, y: 350 },
        data: {
          label: 'Executive Approvals',
          nodeType: 'parallel' as NodeType,
          description: 'Split to multiple executives for high-value purchases',
          priority: 'high',
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'task-4',
        type: 'workflowNode',
        position: { x: 300, y: 500 },
        data: {
          label: 'CFO Approval',
          nodeType: 'approval' as NodeType,
          description: 'Chief Financial Officer approval',
          priority: 'critical',
          assignees: [
            {
              type: 'user',
              id: 'cfo',
              name: 'Chief Financial Officer',
            },
          ],
          sla: {
            duration: 2,
            unit: 'days',
            escalationEnabled: true,
          },
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'task-5',
        type: 'workflowNode',
        position: { x: 500, y: 500 },
        data: {
          label: 'CEO Approval',
          nodeType: 'approval' as NodeType,
          description: 'Chief Executive Officer approval',
          priority: 'critical',
          assignees: [
            {
              type: 'user',
              id: 'ceo',
              name: 'Chief Executive Officer',
            },
          ],
          sla: {
            duration: 3,
            unit: 'days',
            escalationEnabled: true,
          },
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'merge-1',
        type: 'workflowNode',
        position: { x: 400, y: 650 },
        data: {
          label: 'Merge Approvals',
          nodeType: 'merge' as NodeType,
          description: 'Wait for all executive approvals',
          priority: 'medium',
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: true,
        } as WorkflowNodeData,
      },
      {
        id: 'end-2',
        type: 'workflowNode',
        position: { x: 250, y: 800 },
        data: {
          label: 'Purchase Approved',
          nodeType: 'end' as NodeType,
          description: 'Purchase order has been approved',
          priority: 'medium',
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
    ],
    edges: [
      {
        id: 'edge-6',
        source: 'start-2',
        target: 'condition-2',
        type: 'workflowEdge',
        data: { label: 'Submit' },
      },
      {
        id: 'edge-7',
        source: 'condition-2',
        target: 'task-3',
        type: 'workflowEdge',
        sourceHandle: 'false',
        data: { label: '≤ $10,000' },
      },
      {
        id: 'edge-8',
        source: 'condition-2',
        target: 'parallel-1',
        type: 'workflowEdge',
        sourceHandle: 'true',
        data: { label: '> $10,000' },
      },
      {
        id: 'edge-9',
        source: 'parallel-1',
        target: 'task-4',
        type: 'workflowEdge',
        sourceHandle: 'branch1',
        data: { label: 'CFO Review' },
      },
      {
        id: 'edge-10',
        source: 'parallel-1',
        target: 'task-5',
        type: 'workflowEdge',
        sourceHandle: 'branch2',
        data: { label: 'CEO Review' },
      },
      {
        id: 'edge-11',
        source: 'task-4',
        target: 'merge-1',
        type: 'workflowEdge',
        data: { label: 'Approved' },
      },
      {
        id: 'edge-12',
        source: 'task-5',
        target: 'merge-1',
        type: 'workflowEdge',
        data: { label: 'Approved' },
      },
      {
        id: 'edge-13',
        source: 'task-3',
        target: 'end-2',
        type: 'workflowEdge',
        data: { label: 'Approved' },
      },
      {
        id: 'edge-14',
        source: 'merge-1',
        target: 'end-2',
        type: 'workflowEdge',
        data: { label: 'All Approved' },
      },
    ],
  },
  {
    name: 'Document Review Process',
    description: 'Document review and approval workflow with version control',
    category: 'Documentation',
    priority: 'medium',
    nodes: [
      {
        id: 'start-3',
        type: 'workflowNode',
        position: { x: 250, y: 50 },
        data: {
          label: 'Document Submitted',
          nodeType: 'start' as NodeType,
          description: 'Author submits document for review',
          priority: 'medium',
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'task-6',
        type: 'workflowNode',
        position: { x: 250, y: 200 },
        data: {
          label: 'Peer Review',
          nodeType: 'task' as NodeType,
          description: 'Colleagues review the document',
          priority: 'medium',
          assignees: [
            {
              type: 'group',
              id: 'peer-reviewers',
              name: 'Peer Reviewers',
            },
          ],
          sla: {
            duration: 5,
            unit: 'days',
            escalationEnabled: true,
          },
          allowDelegation: true,
          allowReassignment: true,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'condition-3',
        type: 'workflowNode',
        position: { x: 250, y: 350 },
        data: {
          label: 'Review Decision',
          nodeType: 'condition' as NodeType,
          description: 'Check if revisions are needed',
          priority: 'medium',
          conditions: [
            {
              field: 'review_status',
              operator: 'equals',
              value: 'needs_revision',
            },
          ],
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'task-7',
        type: 'workflowNode',
        position: { x: 450, y: 500 },
        data: {
          label: 'Author Revision',
          nodeType: 'task' as NodeType,
          description: 'Author makes requested revisions',
          priority: 'medium',
          assignees: [
            {
              type: 'user',
              id: 'document-author',
              name: 'Document Author',
            },
          ],
          sla: {
            duration: 3,
            unit: 'days',
            escalationEnabled: false,
          },
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'task-8',
        type: 'workflowNode',
        position: { x: 100, y: 500 },
        data: {
          label: 'Final Approval',
          nodeType: 'approval' as NodeType,
          description: 'Manager gives final approval',
          priority: 'medium',
          assignees: [
            {
              type: 'role',
              id: 'content-manager',
              name: 'Content Manager',
            },
          ],
          sla: {
            duration: 2,
            unit: 'days',
            escalationEnabled: true,
          },
          allowDelegation: true,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
      {
        id: 'archive-1',
        type: 'workflowNode',
        position: { x: 250, y: 650 },
        data: {
          label: 'Publish & Archive',
          nodeType: 'archive' as NodeType,
          description: 'Document is published and archived',
          priority: 'low',
          allowDelegation: false,
          allowReassignment: false,
          requireAllApprovals: false,
        } as WorkflowNodeData,
      },
    ],
    edges: [
      {
        id: 'edge-15',
        source: 'start-3',
        target: 'task-6',
        type: 'workflowEdge',
        data: { label: 'Submit' },
      },
      {
        id: 'edge-16',
        source: 'task-6',
        target: 'condition-3',
        type: 'workflowEdge',
        data: { label: 'Review Complete' },
      },
      {
        id: 'edge-17',
        source: 'condition-3',
        target: 'task-7',
        type: 'workflowEdge',
        sourceHandle: 'true',
        data: { label: 'Needs Revision' },
      },
      {
        id: 'edge-18',
        source: 'condition-3',
        target: 'task-8',
        type: 'workflowEdge',
        sourceHandle: 'false',
        data: { label: 'Approved' },
      },
      {
        id: 'edge-19',
        source: 'task-7',
        target: 'task-6',
        type: 'workflowEdge',
        data: { label: 'Resubmit' },
      },
      {
        id: 'edge-20',
        source: 'task-8',
        target: 'archive-1',
        type: 'workflowEdge',
        data: { label: 'Final Approval' },
      },
    ],
  },
];

// Function to initialize sample workflows
export const initializeSampleWorkflows = () => {
  const { createWorkflow } = useWorkflowStore.getState();
  
  sampleWorkflows.forEach(async (workflowTemplate) => {
    try {
      await createWorkflow({
        name: workflowTemplate.name!,
        description: workflowTemplate.description,
        category: workflowTemplate.category,
        priority: workflowTemplate.priority!,
        version: '1.0.0',
        status: 'draft',
        nodes: workflowTemplate.nodes!,
        edges: workflowTemplate.edges!,
        tags: [],
        settings: {
          allowParallelExecution: false,
          autoArchive: true,
          archiveAfterDays: 30,
          enableAuditLog: true,
          enableNotifications: true,
        },
        createdBy: 'system',
      });
    } catch (error) {
      console.error('Failed to create sample workflow:', workflowTemplate.name, error);
    }
  });
};

// Hook to initialize sample data on first load
export const useSampleData = () => {
  const { workflows, createWorkflow } = useWorkflowStore();
  
  useEffect(() => {
    if (workflows.length === 0) {
      initializeSampleWorkflows();
    }
  }, [workflows.length]);
};

export default initializeSampleWorkflows;
