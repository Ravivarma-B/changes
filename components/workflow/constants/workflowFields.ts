/**
 * Simplified workflow field definitions 
 * 
 * This file contains field definitions and helper functions for workflow conditional logic.
 * Only the helper functions and types are exported - the raw data is kept internal.
 */

/**
 * Interface for workflow field definition
 */
export interface WorkflowField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean';
  category: 'task_result' | 'status' | 'form_data' | 'system';
  description: string;
  options?: { value: string; label: string; }[];
}

const WORKFLOW_FIELDS: WorkflowField[] = [
  // Previous Task Results
  {
    id: 'previous_task.result',
    name: 'Previous Task Result',
    type: 'select',
    category: 'task_result',
    description: 'Result from the previous task or approval',
    options: [
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'pending', label: 'Pending' },
      { value: 'needs_revision', label: 'Needs Revision' },
      { value: 'escalated', label: 'Escalated' },
      { value: 'delegated', label: 'Delegated' }
    ]
  },
  {
    id: 'previous_task.comments',
    name: 'Previous Task Has Comments',
    type: 'boolean',
    category: 'task_result',
    description: 'Whether the previous task has comments or feedback'
  },
  {
    id: 'approval_count',
    name: 'Number of Approvals',
    type: 'number',
    category: 'task_result',
    description: 'Count of approvals received so far'
  },
  {
    id: 'rejection_count',
    name: 'Number of Rejections',
    type: 'number',
    category: 'task_result',
    description: 'Count of rejections received'
  },

  // Status-based Conditions
  {
    id: 'workflow.status',
    name: 'Workflow Status',
    type: 'select',
    category: 'status',
    description: 'Current status of the workflow instance',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'escalated', label: 'Escalated' },
      { value: 'on_hold', label: 'On Hold' }
    ]
  },
  {
    id: 'workflow.priority',
    name: 'Workflow Priority',
    type: 'select',
    category: 'status',
    description: 'Priority level of the workflow',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' }
    ]
  },
  {
    id: 'is_overdue',
    name: 'Is Overdue',
    type: 'boolean',
    category: 'status',
    description: 'Whether the workflow has exceeded its SLA'
  },
  {
    id: 'escalation_level',
    name: 'Escalation Level',
    type: 'number',
    category: 'status',
    description: 'Number of times this workflow has been escalated'
  },

  // Form Data (Common Business Fields)
  {
    id: 'form.amount',
    name: 'Amount',
    type: 'number',
    category: 'form_data',
    description: 'Monetary amount (e.g., expense, purchase order)'
  },
  {
    id: 'form.department',
    name: 'Department',
    type: 'select',
    category: 'form_data',
    description: 'Department making the request',
    options: [
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' },
      { value: 'it', label: 'IT' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'sales', label: 'Sales' },
      { value: 'operations', label: 'Operations' },
      { value: 'legal', label: 'Legal' }
    ]
  },
  {
    id: 'form.request_type',
    name: 'Request Type',
    type: 'select',
    category: 'form_data',
    description: 'Type of request being processed',
    options: [
      { value: 'leave', label: 'Leave Request' },
      { value: 'expense', label: 'Expense Report' },
      { value: 'purchase', label: 'Purchase Order' },
      { value: 'access', label: 'System Access' },
      { value: 'document', label: 'Document Approval' },
      { value: 'training', label: 'Training Request' }
    ]
  },
  {
    id: 'form.urgency',
    name: 'Urgency',
    type: 'select',
    category: 'form_data',
    description: 'How urgent is this request',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'emergency', label: 'Emergency' }
    ]
  },

  // System Conditions
  {
    id: 'current_user.role',
    name: 'Current User Role',
    type: 'select',
    category: 'system',
    description: 'Role of the person currently handling the task',
    options: [
      { value: 'employee', label: 'Employee' },
      { value: 'manager', label: 'Manager' },
      { value: 'director', label: 'Director' },
      { value: 'hr_rep', label: 'HR Representative' },
      { value: 'finance_team', label: 'Finance Team' },
      { value: 'admin', label: 'Administrator' }
    ]
  },
  {
    id: 'business_hours',
    name: 'Is Business Hours',
    type: 'boolean',
    category: 'system',
    description: 'Whether it\'s currently within business hours'
  },
  {
    id: 'days_since_start',
    name: 'Days Since Started',
    type: 'number',
    category: 'system',
    description: 'Number of days since workflow was initiated'
  }
];

const FIELD_OPERATORS = {
  text: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'greater_equal', label: 'Greater Than or Equal' },
    { value: 'less_equal', label: 'Less Than or Equal' }
  ],
  select: [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' }
  ],
  boolean: [
    { value: 'is_true', label: 'Is True' },
    { value: 'is_false', label: 'Is False' }
  ]
};

/**
 * Get available operators for a specific field type
 * @param fieldType - The type of field ('text', 'number', 'select', 'boolean')
 * @returns Array of operator objects with value and label
 */
export const getOperatorsForFieldType = (fieldType: string) => {
  return FIELD_OPERATORS[fieldType as keyof typeof FIELD_OPERATORS] || FIELD_OPERATORS.text;
};

/**
 * Find a field by its ID
 * @param fieldId - The unique identifier of the field
 * @returns The field object or undefined if not found
 */
export const getFieldById = (fieldId: string): WorkflowField | undefined => {
  return WORKFLOW_FIELDS.find(field => field.id === fieldId);
};

/**
 * Group all fields by their category
 * @returns Object with category keys and arrays of fields as values
 */
export const getFieldsByCategory = () => {
  return WORKFLOW_FIELDS.reduce((acc, field) => {
    if (!acc[field.category]) {
      acc[field.category] = [];
    }
    acc[field.category].push(field);
    return acc;
  }, {} as Record<string, WorkflowField[]>);
};

/**
 * User-friendly labels for field categories
 */
export const CATEGORY_LABELS = {
  task_result: 'Previous Task Results',
  status: 'Workflow Status',
  form_data: 'Form Data',
  system: 'System Information'
};
