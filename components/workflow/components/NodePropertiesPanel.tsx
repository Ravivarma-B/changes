import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import debounce from 'lodash/debounce';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'web-utils-components/accordion';
import { Button } from 'web-utils-components/button';
import { Input } from 'web-utils-components/input';
import { Label } from 'web-utils-components/label';
import { Textarea } from 'web-utils-components/textarea';
import { Switch } from 'web-utils-components/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from 'web-utils-components/select';
import { X, Plus, User, Clock, Settings, Zap, AlertCircle, Merge } from 'lucide-react';
import { useWorkflowStore } from '../workflow.store';
import { NodeType, Priority, TaskType, WorkflowNodeData } from '../workflow.types';
import { getOperatorsForFieldType, getFieldsByCategory, CATEGORY_LABELS, getFieldById } from '../constants/workflowFields';

interface NodePropertiesPanelProps {
  nodeId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  nodeId,
  open,
  onOpenChange,
}) => {
  const { nodes, updateNode, validateWorkflow } = useWorkflowStore();
  const [assignees, setAssignees] = useState<string[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  
  // Refs for debounced updates
  const pendingUpdatesRef = useRef<Record<string, any>>({});
  const isUpdatingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastNodeIdRef = useRef<string | null>(null);
  
  const node = nodes.find(n => n.id === nodeId);

  const form = useForm({
    defaultValues: {
      label: '',
      description: '',
      priority: 'medium' as Priority,
      taskType: 'review' as TaskType,
      allowDelegation: false,
      allowReassignment: false,
      requireAllApprovals: false,
      optional: false,
      locked: false,
      slaEnabled: false,
      slaDuration: 24,
      slaUnit: 'hours' as 'minutes' | 'hours' | 'days' | 'weeks',
      escalationEnabled: false,
      notifyOnStart: false,
      notifyOnComplete: false,
      notifyOnSLABreach: false,
      slaReminderEnabled: false,
      slaReminderDuration: 30,
      slaReminderUnit: 'minutes' as 'minutes' | 'hours' | 'days',
      // Merge node configuration
      waitForAll: true,
      waitForOptional: false,
      minimumRequired: 0,
      timeout: 0,
      skipOnTimeout: true,
      escalateOnTimeout: false,
      // Approval node configuration
      requireRejectionPath: false,
      autoApproveOnTimeout: false,
      allowDelegateApproval: true,
      requireRejectionReason: true,
      allowConditionalApproval: false,
    },
  });

  // Create a debounced function to sync changes to the node
  const debouncedUpdateNode = useCallback(
    debounce((currentAssignees?: string[], currentConditions?: any[]) => {
      if (!isUpdatingRef.current && isMountedRef.current && node) {
        isUpdatingRef.current = true;
        
        const updates = { ...pendingUpdatesRef.current };
        const updatedNodeData: Partial<WorkflowNodeData> = {
          label: updates.label ?? node.data.label,
          description: updates.description ?? node.data.description,
          priority: updates.priority ?? node.data.priority,
          taskType: updates.taskType ?? node.data.taskType,
          allowDelegation: updates.allowDelegation ?? node.data.allowDelegation,
          allowReassignment: updates.allowReassignment ?? node.data.allowReassignment,
          requireAllApprovals: updates.requireAllApprovals ?? node.data.requireAllApprovals,
          optional: updates.optional ?? node.data.optional,
          locked: updates.locked ?? node.data.locked ?? false,
        };

        // Add merge configuration for merge nodes
        if (node.data.nodeType === 'merge') {
          updatedNodeData.mergeConfig = {
            waitForAll: updates.waitForAll ?? node.data.mergeConfig?.waitForAll ?? true,
            waitForOptional: updates.waitForOptional ?? node.data.mergeConfig?.waitForOptional ?? false,
            minimumRequired: (updates.minimumRequired && updates.minimumRequired > 0) ? updates.minimumRequired : node.data.mergeConfig?.minimumRequired,
            timeout: (updates.timeout && updates.timeout > 0) ? updates.timeout : node.data.mergeConfig?.timeout,
            skipOnTimeout: updates.skipOnTimeout ?? node.data.mergeConfig?.skipOnTimeout ?? true,
            escalateOnTimeout: updates.escalateOnTimeout ?? node.data.mergeConfig?.escalateOnTimeout ?? false,
          };
        }

        // Add approval configuration for approval nodes
        if (node.data.nodeType === 'approval') {
          updatedNodeData.approvalConfig = {
            requireRejectionPath: updates.requireRejectionPath ?? node.data.approvalConfig?.requireRejectionPath ?? false,
            autoApproveOnTimeout: updates.autoApproveOnTimeout ?? node.data.approvalConfig?.autoApproveOnTimeout ?? false,
            allowDelegateApproval: updates.allowDelegateApproval ?? node.data.approvalConfig?.allowDelegateApproval ?? true,
            requireRejectionReason: updates.requireRejectionReason ?? node.data.approvalConfig?.requireRejectionReason ?? true,
            allowConditionalApproval: updates.allowConditionalApproval ?? node.data.approvalConfig?.allowConditionalApproval ?? false,
          };
        }

        // Add SLA if enabled
        if (updates.slaEnabled ?? (node.data.sla !== undefined)) {
          updatedNodeData.sla = {
            duration: updates.slaDuration ?? node.data.sla?.duration ?? 24,
            unit: updates.slaUnit ?? node.data.sla?.unit ?? 'hours',
            escalationEnabled: updates.escalationEnabled ?? node.data.sla?.escalationEnabled ?? false,
          };
        } else {
          updatedNodeData.sla = undefined;
        }

        // Add notifications
        updatedNodeData.notifications = {
          onStart: updates.notifyOnStart ?? node.data.notifications?.onStart ?? false,
          onComplete: updates.notifyOnComplete ?? node.data.notifications?.onComplete ?? false,
          onSLABreach: updates.notifyOnSLABreach ?? node.data.notifications?.onSLABreach ?? false,
          onEscalation: false,
          slaReminder: {
            enabled: updates.slaReminderEnabled ?? node.data.notifications?.slaReminder?.enabled ?? false,
            duration: updates.slaReminderDuration ?? node.data.notifications?.slaReminder?.duration ?? 30,
            unit: updates.slaReminderUnit ?? node.data.notifications?.slaReminder?.unit ?? 'minutes',
          },
        };

        // Use current assignees (passed as parameter) or fall back to state
        const currentAssigneesArray = currentAssignees ?? assignees;
        if (currentAssigneesArray.length > 0 && currentAssigneesArray.some(name => name.trim() !== '' && name.trim() !== 'New Assignee')) {
          updatedNodeData.assignees = currentAssigneesArray
            .filter(name => name.trim() !== '' && name.trim() !== 'New Assignee')
            .map(name => ({
              type: 'user' as const,
              id: name.toLowerCase().replace(/\s+/g, '_'),
              name: name.trim(),
            }));
        } else {
          updatedNodeData.assignees = [];
        }

        // Use current conditions (passed as parameter) or fall back to state
        const currentConditionsArray = currentConditions ?? conditions;
        if (currentConditionsArray.length > 0) {
          updatedNodeData.conditions = currentConditionsArray;
        } else {
          updatedNodeData.conditions = [];
        }

        // Update the node with new data
        updateNode(node.id, {
          data: {
            ...node.data,
            ...updatedNodeData,
          },
        });
        
        // Trigger validation immediately to update validation state
        setTimeout(() => {
          validateWorkflow();
        }, 10);
        
        // Clear pending updates
        pendingUpdatesRef.current = {};
        isUpdatingRef.current = false;
      }
    }, 500), // 500ms debounce delay
    [updateNode, validateWorkflow, assignees, conditions, node]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      debouncedUpdateNode.cancel();
      lastNodeIdRef.current = null;
    };
  }, [debouncedUpdateNode]);

  // Reset tracking when nodeId changes
  useEffect(() => {
    if (!nodeId) {
      lastNodeIdRef.current = null;
    }
  }, [nodeId]);

  // Handle form field changes
  const handleFieldChange = useCallback((field: string, value: any) => {
    // Accumulate changes and trigger debounced update
    pendingUpdatesRef.current[field] = value;
    debouncedUpdateNode();
  }, [debouncedUpdateNode]);

  // Immediate update function for assignees and conditions
  const updateNodeImmediately = useCallback((newAssignees?: string[], newConditions?: any[]) => {
    if (!node) return;
    
    const currentAssignees = newAssignees ?? assignees;
    const currentConditions = newConditions ?? conditions;
    
    // Cancel any pending debounced updates
    debouncedUpdateNode.cancel();
    
    // Update immediately
    const updatedNodeData: WorkflowNodeData = {
      ...node.data,
    };

    // Handle assignees - save all assignees (including placeholder) but only meaningful ones to node data
    const nonEmptyAssignees = currentAssignees.filter(name => name.trim() !== '' && name.trim() !== 'New Assignee');
    updatedNodeData.assignees = nonEmptyAssignees.map(name => ({
      type: 'user' as const,
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name.trim(),
    }));

    // Handle conditions
    if (currentConditions.length > 0) {
      updatedNodeData.conditions = currentConditions;
    } else {
      updatedNodeData.conditions = [];
    }

    // Update the node
    updateNode(node.id, {
      data: updatedNodeData,
    });
    
    // Trigger validation
    setTimeout(() => {
      validateWorkflow();
    }, 10);
  }, [node, assignees, conditions, updateNode, validateWorkflow, debouncedUpdateNode]);

  // Update form when node changes
  useEffect(() => {
    if (node && lastNodeIdRef.current !== node.id) {
      // Only update when we switch to a different node
      lastNodeIdRef.current = node.id;
      
      form.reset({
        label: node.data.label || '',
        description: node.data.description || '',
        priority: node.data.priority || 'medium',
        taskType: node.data.taskType || 'review',
        allowDelegation: node.data.allowDelegation || false,
        allowReassignment: node.data.allowReassignment || false,
        requireAllApprovals: node.data.requireAllApprovals || false,
        optional: node.data.optional || false,
        locked: node.data.locked ?? false,
        slaEnabled: !!node.data.sla,
        slaDuration: node.data.sla?.duration || 24,
        slaUnit: node.data.sla?.unit || 'hours',
        escalationEnabled: node.data.sla?.escalationEnabled || false,
        notifyOnStart: node.data.notifications?.onStart || false,
        notifyOnComplete: node.data.notifications?.onComplete || false,
        notifyOnSLABreach: node.data.notifications?.onSLABreach || false,
        slaReminderEnabled: node.data.notifications?.slaReminder?.enabled || false,
        slaReminderDuration: node.data.notifications?.slaReminder?.duration || 30,
        slaReminderUnit: node.data.notifications?.slaReminder?.unit || 'minutes',
        // Merge node configuration
        waitForAll: node.data.mergeConfig?.waitForAll ?? true,
        waitForOptional: node.data.mergeConfig?.waitForOptional ?? false,
        minimumRequired: node.data.mergeConfig?.minimumRequired || 0,
        timeout: node.data.mergeConfig?.timeout || 0,
        skipOnTimeout: node.data.mergeConfig?.skipOnTimeout ?? true,
        escalateOnTimeout: node.data.mergeConfig?.escalateOnTimeout ?? false,
        // Approval node configuration
        requireRejectionPath: node.data.approvalConfig?.requireRejectionPath ?? false,
        autoApproveOnTimeout: node.data.approvalConfig?.autoApproveOnTimeout ?? false,
        allowDelegateApproval: node.data.approvalConfig?.allowDelegateApproval ?? true,
        requireRejectionReason: node.data.approvalConfig?.requireRejectionReason ?? true,
        allowConditionalApproval: node.data.approvalConfig?.allowConditionalApproval ?? false,
      });

      // Reset assignees to node data when switching nodes, but preserve any placeholder assignees
      const nodeAssignees = node.data.assignees ? node.data.assignees.map(a => a.name) : [];
      const hasPlaceholders = assignees.some(a => a === 'New Assignee');
      
      // If we have placeholders and we're just updating the same node, preserve the current state
      if (hasPlaceholders && assignees.length > nodeAssignees.length) {
        // Keep current state to preserve placeholders
      } else {
        setAssignees(nodeAssignees);
      }

      // Set conditions if any
      if (node.data.conditions) {
        // Ensure all conditions have IDs
        const conditionsWithIds = node.data.conditions.map((condition: any, index: number) => ({
          ...condition,
          id: condition.id || `condition-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`
        }));
        setConditions(conditionsWithIds);
      } else {
        setConditions([]);
      }
    }
  }, [node, form]);

  if (!node) return null;

  const getNodeTypeCapabilities = (nodeType: NodeType) => {
    const capabilities = {
      showAssignees: ['task', 'approval', 'escalation'].includes(nodeType),
      showSLA: ['task', 'approval'].includes(nodeType),
      showConditions: ['condition'].includes(nodeType),
      showParallelSettings: ['parallel', 'approval'].includes(nodeType),
      showFormFields: ['task'].includes(nodeType),
      showEscalation: ['task', 'approval'].includes(nodeType),
      showOptionalFlag: ['task', 'approval', 'escalation'].includes(nodeType),
      showMergeConfig: ['merge'].includes(nodeType),
      showTaskType: ['task'].includes(nodeType),
      showApprovalConfig: ['approval'].includes(nodeType),
    };
    return capabilities;
  };

  const capabilities = getNodeTypeCapabilities(node.data.nodeType);

  const addAssignee = () => {
    const updated = [...assignees, 'New Assignee']; // Add with placeholder text
    setAssignees(updated);
    // Update node immediately when adding assignee with placeholder
    setTimeout(() => {
      updateNodeImmediately(updated);
    }, 0);
  };

  const removeAssignee = (index: number) => {
    const updated = assignees.filter((_, i) => i !== index);
    setAssignees(updated);
    // Update node immediately when removing assignee
    setTimeout(() => {
      updateNodeImmediately(updated);
    }, 0);
  };

  const updateAssignee = (index: number, value: string) => {
    const updated = [...assignees];
    updated[index] = value;
    setAssignees(updated);
    // Update node immediately for assignee changes to reflect in real-time
    updateNodeImmediately(updated);
  };

  const addCondition = () => {
    const updated = [...conditions, { 
      id: `condition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      field: '', 
      operator: '', 
      value: '', 
      logicalOperator: 'AND' 
    }];
    setConditions(updated);
    // Use setTimeout to ensure state update happens first, then update node
    setTimeout(() => {
      updateNodeImmediately(undefined, updated);
    }, 0);
  };

  const removeCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    setConditions(updated);
    // Use setTimeout to ensure state update happens first, then update node
    setTimeout(() => {
      updateNodeImmediately(undefined, updated);
    }, 0);
  };

  const updateCondition = (index: number, field: string, value: any) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
    
    // Use immediate update for field selection to ensure UI responds quickly
    if (field === 'field' || field === 'operator') {
      updateNodeImmediately(undefined, updated);
    } else {
      // Use debounced update for text input to avoid too frequent updates
      debouncedUpdateNode(undefined, updated);
    }
  };

  // Sidebar mode rendering
  return (
    <div className={`absolute right-0 top-0 w-96 h-full shadow-lg border-l transition-transform duration-300 transform z-50 ${
      open ? 'translate-x-0' : 'translate-x-full'
    } bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-white/20 dark:border-gray-700/50 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100  dark:border-gray-700/50 bg-white/30 dark:bg-gray-800/30 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">
            Edit Node: {node.data.label}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="h-[calc(100%-80px)] overflow-y-auto">
        <div className="p-4">
          <Accordion type="multiple" defaultValue={["general"]} className="w-full">
            {/* General Properties */}
            <AccordionItem value="general">
              <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                      <Settings className="w-4 h-4" />
                      General Properties
                  </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                {/* Status Controls */}
                <div className="flex flex-col space-y-3 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Node Status</h4>
                  
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="locked"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('locked', checked);
                          }}
                          disabled={node?.data.locked && form.watch('locked')} // Prevent unlocking from property panel when locked via context menu
                        />
                      )}
                    />
                    <Label className="text-xs">Locked</Label>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {form.watch('locked') ? 'Node cannot be edited' : 'Node can be edited'}
                    </span>
                  </div>
                  {capabilities.showOptionalFlag && (
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="optional"
                        control={form.control}
                          render={({ field }) => (
                            <Switch
                              checked={field.value}
                              disabled={form.watch('locked')}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                handleFieldChange('optional', checked);
                              }}
                            />
                          )}
                        />
                        <Label className="text-xs">Optional Task</Label>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="label" className="text-xs">Label *</Label>
                  <Input
                    id="label"
                    placeholder="Enter node label"
                    className="text-sm"
                    disabled={form.watch('locked')}
                    {...form.register('label', { 
                      required: 'Label is required',
                      onChange: (e) => handleFieldChange('label', e.target.value)
                    })}
                  />
                  {form.formState.errors.label && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.label.message}
                    </p>
                  )}
                </div>
                  
                <div className="flex flex-col gap-1">
                  <Label htmlFor="description" className="text-xs">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter node description"
                    className="text-sm"
                    disabled={form.watch('locked')}
                    {...form.register('description', {
                      onChange: (e) => handleFieldChange('description', e.target.value)
                    })}
                    rows={2}
                  />
                </div>
                
                {/* Task Type and Priority - Side by Side */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Task Type */}
                  {capabilities.showTaskType && (
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="taskType" className="text-xs">Task Type</Label>
                      <Controller
                        name="taskType"
                        control={form.control}
                        render={({ field }) => (
                          <Select 
                            value={field.value} 
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleFieldChange('taskType', value);
                            }}
                            disabled={form.watch('locked')}
                          >
                            <SelectTrigger className="text-sm w-full">
                              <SelectValue placeholder="Select task type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="review">Review</SelectItem>
                              <SelectItem value="approve">Approve</SelectItem>
                              <SelectItem value="create_object">Create Object</SelectItem>
                              <SelectItem value="add_notes">Add Notes</SelectItem>
                              <SelectItem value="download">Download</SelectItem>
                              <SelectItem value="add_signature">Add Signature</SelectItem>
                              <SelectItem value="add_attachment">Add Attachment</SelectItem>
                              <SelectItem value="link_document">Link Document</SelectItem>
                              <SelectItem value="link_entity">Link Entity</SelectItem>
                              <SelectItem value="print">Print</SelectItem>
                              <SelectItem value="close">Close</SelectItem>
                              <SelectItem value="restricted_share">Restricted Share</SelectItem>
                              <SelectItem value="distribution">Distribution/Publish</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}

                  {/* Priority */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="priority" className="text-xs">Priority</Label>
                    <Controller
                      name="priority"
                      control={form.control}
                      render={({ field }) => (
                        <Select 
                          value={field.value} 
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleFieldChange('priority', value);
                          }}
                          disabled={form.watch('locked')}
                        >
                          <SelectTrigger className="text-sm w-full">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                
              </AccordionContent>
            </AccordionItem>

            {/* Assignees */}
            {capabilities.showAssignees && (
              <AccordionItem value="assignees">
                <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                      <User className="w-4 h-4" />
                      Assignees & Delegation
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                    <div>

                    {/* Empty State - No Assignees */}
                    {assignees.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 transition-colors hover:border-gray-400 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                            <User className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              No assignees yet
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Add team members to handle this task
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline"
                            onClick={addAssignee}
                            disabled={form.watch('locked')}
                            className="mt-2 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add First Assignee
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Normal State - With Assignees */
                      <div className='space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Assignees</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={addAssignee}
                            disabled={form.watch('locked')}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            <span className="text-xs">Add</span>
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {assignees.map((assignee, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                placeholder="Enter assignee name"
                                className="text-sm"
                                value={assignee}
                                disabled={form.watch('locked')}
                                onChange={(e) => updateAssignee(index, e.target.value)}
                                onFocus={(e) => {
                                  // Auto-select placeholder text for easy replacement
                                  if (e.target.value === 'New Assignee') {
                                    e.target.select();
                                  }
                                }}
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => removeAssignee(index)}
                                disabled={form.watch('locked')}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="allowDelegation"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('allowDelegation', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Allow Delegation</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="allowReassignment"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('allowReassignment', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Allow Reassignment</Label>
                  </div>
                  {capabilities.showParallelSettings && (
                    <div className="flex items-center space-x-2">
                      <Controller
                        name="requireAllApprovals"
                        control={form.control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            disabled={form.watch('locked')}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              handleFieldChange('requireAllApprovals', checked);
                            }}
                          />
                        )}
                      />
                      <Label className="text-xs">Require All Approvals</Label>
                    </div>
                  )}

                </AccordionContent>
              </AccordionItem>
            )}

            {/* SLA & Escalation */}
            {capabilities.showSLA && (
              <AccordionItem value="sla">
                <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                      <Clock className="w-4 h-4" />
                      SLA & Escalation                            
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  {/* SLA Empty State or Toggle */}
                  {!form.watch('slaEnabled') ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 transition-colors hover:border-gray-400 dark:hover:border-gray-500">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                          <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            No SLA configured
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Set time limits and escalation rules
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Controller
                            name="slaEnabled"
                            control={form.control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value}
                                disabled={form.watch('locked')}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleFieldChange('slaEnabled', checked);
                                }}
                              />
                            )}
                          />
                          <Label className="text-xs font-medium">Enable SLA</Label>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Normal State - SLA Enabled */
                    <>
                      <div className='space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
                        <div className="flex items-center space-x-2">
                          <Controller
                            name="slaEnabled"
                            control={form.control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value}
                                disabled={form.watch('locked')}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleFieldChange('slaEnabled', checked);
                                }}
                              />
                            )}
                          />
                          <Label className="text-xs">Enable SLA</Label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="slaDuration" className="text-xs">Duration</Label>
                            <Input
                              id="slaDuration"
                              type="number"
                              min="1"
                              className="text-sm"
                              disabled={form.watch('locked')}
                              {...form.register('slaDuration', { 
                                valueAsNumber: true,
                                onChange: (e) => handleFieldChange('slaDuration', parseInt(e.target.value) || 24)
                              })}
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label htmlFor="slaUnit" className="text-xs">Unit</Label>
                            <Controller
                              name="slaUnit"
                              control={form.control}
                              render={({ field }) => (
                                <Select 
                                  value={field.value} 
                                  disabled={form.watch('locked')}
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    handleFieldChange('slaUnit', value);
                                  }}
                                >
                                  <SelectTrigger className="text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="minutes">Minutes</SelectItem>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      {capabilities.showEscalation && (
                        <div className="flex items-center space-x-2">
                          <Controller
                            name="escalationEnabled"
                            control={form.control}
                            render={({ field }) => (
                              <Switch
                                checked={field.value}
                                disabled={form.watch('locked')}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked);
                                  handleFieldChange('escalationEnabled', checked);
                                }}
                              />
                            )}
                          />
                          <Label className="text-xs">Enable Escalation</Label>
                        </div>
                      )}
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Conditions */}
            {capabilities.showConditions && (
              <AccordionItem value="conditions">
                <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                      <Zap className="w-4 h-4" />
                      Conditional Logic
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div>
                    {/* Empty State - No Conditions */}
                    {conditions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 transition-colors hover:border-gray-400 dark:hover:border-gray-500">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700">
                            <Zap className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              No conditions defined
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Add rules to control workflow branching
                            </p>
                          </div>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={addCondition}
                            disabled={form.watch('locked')}
                            className="mt-2 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add First Condition
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Normal State - With Conditions */
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs">Conditional Logic</Label>
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            onClick={addCondition}
                            disabled={form.watch('locked')}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            <span className="text-xs">Add</span>
                          </Button>
                        </div>
                        <div className="space-y-3">
                          {conditions.map((condition, index) => {
                            const selectedField = getFieldById(condition.field);
                            const availableOperators = selectedField 
                              ? getOperatorsForFieldType(selectedField.type)
                              : getOperatorsForFieldType('text');
                            const fieldsByCategory = getFieldsByCategory();
                            
                            return (
                              <div key={`condition-${condition.id || index}`} className="border rounded-lg p-3 space-y-3 bg-gray-50/50 dark:bg-gray-800/50">
                                {/* Field Selection - Full Width */}
                                <div className="flex flex-col gap-1 w-full">
                                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Field</Label>
                                  <Select
                                    value={condition.field || ""}
                                    disabled={form.watch('locked')}
                                    onValueChange={(value) => {
                                      // Update condition immediately
                                      const updated = [...conditions];
                                      updated[index] = { 
                                        ...updated[index], 
                                        field: value,
                                        operator: '', // Reset operator when field changes
                                        value: '' // Reset value when field changes
                                      };
                                      setConditions(updated);
                                      updateNodeImmediately(undefined, updated);
                                    }}
                                  >
                                    <SelectTrigger className="text-sm w-full">
                                      <SelectValue placeholder="Select a field" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                      {Object.entries(fieldsByCategory).map(([category, fields]) => (
                                        <SelectGroup key={category}>
                                          <SelectLabel className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
                                          </SelectLabel>
                                          {fields.map((field) => (
                                            <SelectItem key={field.id} value={field.id} className="text-sm">
                                              <span className="font-medium">{field.name}</span>
                                            </SelectItem>
                                          ))}
                                        </SelectGroup>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Operator and Value Selection - 50% each */}
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="flex flex-col gap-1 w-full">
                                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Operator</Label>
                                    <Select
                                      value={condition.operator}
                                      disabled={form.watch('locked') || !condition.field}
                                      onValueChange={(value) => updateCondition(index, 'operator', value)}
                                    >
                                      <SelectTrigger className="text-sm w-full">
                                        <SelectValue placeholder="Select operator" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableOperators.map((op) => (
                                          <SelectItem key={op.value} value={op.value} className="text-sm">
                                            {op.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Value Input */}
                                  <div className="flex flex-col gap-1 w-full">
                                    <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Value</Label>
                                    {selectedField?.options ? (
                                      // Dropdown for fields with predefined options
                                      <Select
                                        value={condition.value as string}
                                        disabled={form.watch('locked') || !condition.operator}
                                        onValueChange={(value) => updateCondition(index, 'value', value)}
                                      >
                                        <SelectTrigger className="text-sm w-full">
                                          <SelectValue placeholder="Select value" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {selectedField.options.map((option: { value: string; label: string }) => (
                                            <SelectItem key={option.value} value={option.value} className="text-sm">
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    ) : selectedField?.type === 'number' ? (
                                      // Number input for numeric fields
                                      <Input
                                        type="number"
                                        placeholder="Enter number"
                                        className="text-sm w-full"
                                        value={condition.value as string}
                                        disabled={form.watch('locked') || !condition.operator}
                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                      />
                                    ) : selectedField?.type === 'boolean' ? (
                                      // Boolean operators don't need value input
                                      <Input
                                        className="text-sm w-full"
                                        value="N/A"
                                        disabled
                                        placeholder="No value needed"
                                      />
                                    ) : (
                                      // Text input for other field types
                                      <Input
                                        placeholder="Enter value"
                                        className="text-sm w-full"
                                        value={condition.value as string}
                                        disabled={form.watch('locked') || !condition.operator}
                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                      />
                                    )}
                                  </div>
                                </div>

                                {/* Remove Button and Logic Operator */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-2">
                                    {index < conditions.length - 1 && (
                                      <div className='flex items-center gap-2'>
                                        <Label className="text-xs text-gray-500 dark:text-gray-400">Next condition:</Label>
                                        <div className="w-20">
                                          <Select
                                            value={condition.logicalOperator || 'AND'}
                                            disabled={form.watch('locked')}
                                            onValueChange={(value: 'AND' | 'OR') => updateCondition(index, 'logicalOperator', value)}
                                          >
                                            <SelectTrigger className="text-xs h-7 w-full">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="AND" className="text-xs">AND</SelectItem>
                                              <SelectItem value="OR" className="text-xs">OR</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeCondition(index)}
                                    disabled={form.watch('locked')}
                                    className="h-7 w-7 p-0"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Notifications */}
            <AccordionItem value="notifications">
              <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                      <AlertCircle className="w-4 h-4" />
                      Notifications
                  </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div className="space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="notifyOnStart"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('notifyOnStart', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Notify on Start</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="notifyOnComplete"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('notifyOnComplete', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Notify on Complete</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="notifyOnSLABreach"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('notifyOnSLABreach', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Notify on SLA Breach</Label>
                  </div>
                </div>
                

                <div className="space-y-2 p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="slaReminderEnabled"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('slaReminderEnabled', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">SLA Reminder</Label>
                  </div>

                  {form.watch('slaReminderEnabled') && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Controller
                          name="slaReminderDuration"
                          control={form.control}
                          render={({ field }) => (
                            <Input
                              type="number"
                              min="1"
                              placeholder="Duration"
                              value={field.value}
                              disabled={form.watch('locked')}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 1;
                                field.onChange(value);
                                handleFieldChange('slaReminderDuration', value);
                              }}
                              className="text-xs"
                            />
                          )}
                        />
                      </div>
                      <div>
                        <Controller
                          name="slaReminderUnit"
                          control={form.control}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              disabled={form.watch('locked')}
                              onValueChange={(value) => {
                                field.onChange(value);
                                handleFieldChange('slaReminderUnit', value);
                              }}
                            >
                              <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="minutes">Minutes</SelectItem>
                                <SelectItem value="hours">Hours</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Merge Configuration */}
            {capabilities.showMergeConfig && (
              <AccordionItem value="merge">
                <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                    <Merge className="w-4 h-4" />
                    Merge Configuration
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="waitForAll"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('waitForAll', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Wait for All Required Tasks</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="waitForOptional"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('waitForOptional', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Wait for Optional Tasks</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="minimumRequired" className="text-xs">Minimum Required</Label>
                      <Input
                        id="minimumRequired"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="text-sm"
                        disabled={form.watch('locked')}
                        {...form.register('minimumRequired', { 
                          valueAsNumber: true,
                          onChange: (e) => handleFieldChange('minimumRequired', parseInt(e.target.value) || 0)
                        })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="timeout" className="text-xs">Timeout (minutes)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        min="0"
                        placeholder="0"
                        className="text-sm"
                        disabled={form.watch('locked')}
                        {...form.register('timeout', { 
                          valueAsNumber: true,
                          onChange: (e) => handleFieldChange('timeout', parseInt(e.target.value) || 0)
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="skipOnTimeout"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('skipOnTimeout', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Skip on Timeout</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="escalateOnTimeout"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('escalateOnTimeout', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Escalate on Timeout</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Approval Configuration */}
            {capabilities.showApprovalConfig && (
              <AccordionItem value="approval">
                <AccordionTrigger className="flex items-center gap-2 text-sm">
                  <div className="flex gap-2 items-center">
                    <AlertCircle className="w-4 h-4" />
                    Approval Configuration
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Controller
                      name="requireRejectionPath"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('requireRejectionPath', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Require Rejection Path</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="autoApproveOnTimeout"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('autoApproveOnTimeout', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Auto-approve on SLA Timeout</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="allowDelegateApproval"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('allowDelegateApproval', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Allow Delegate Approval</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="requireRejectionReason"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('requireRejectionReason', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Require Rejection Reason</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name="allowConditionalApproval"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          checked={field.value}
                          disabled={form.watch('locked')}
                          onCheckedChange={(checked) => {
                            field.onChange(checked);
                            handleFieldChange('allowConditionalApproval', checked);
                          }}
                        />
                      )}
                    />
                    <Label className="text-xs">Allow Conditional Approval</Label>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      </div>
    </div>
  );

};
