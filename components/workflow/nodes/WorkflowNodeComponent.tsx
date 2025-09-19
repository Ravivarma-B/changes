import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from 'web-utils-common';
import { WorkflowNodeData } from '../workflow.types';
import { 
  Play, 
  Square, 
  CheckCircle, 
  GitBranch, 
  Split, 
  Merge, 
  AlertTriangle, 
  Archive,
  Clock,
  Users,
  User,
  ShieldCheck,
  Settings,
  Lock
} from 'lucide-react';

import { Badge } from 'web-utils-components/badge';
import { useTheme } from 'next-themes';
import { NodeContextMenu } from '../components/NodeContextMenu';
import { useWorkflowStore } from '../workflow.store';
import { getFieldById, getOperatorsForFieldType } from '../constants/workflowFields';

const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'start':
      return Play;
    case 'end':
      return Square;
    case 'task':
      return CheckCircle;
    case 'approval':
      return ShieldCheck;
    case 'condition':
      return GitBranch;
    case 'parallel':
      return Split;
    case 'merge':
      return Merge;
    case 'escalation':
      return AlertTriangle;
    case 'archive':
      return Archive;
    default:
      return CheckCircle;
  }
};

const getNodeColors = (nodeType: string, selected: boolean, isDark: boolean) => {
  const baseClasses = "border-2 transition-all duration-200 relative backdrop-blur-sm";
  
  if (selected) {
    return cn(baseClasses, "border-blue-500 shadow-lg ring-2 ring-blue-200", 
      isDark ? "shadow-blue-500/20 ring-blue-500/20" : "shadow-blue-200 ring-blue-200");
  }

  const colors = {
    start: isDark 
      ? "border-green-600 bg-green-900/30 text-green-100 hover:bg-green-900/40" 
      : "border-green-500 bg-green-50/80 text-green-900 hover:bg-green-50",
    end: isDark 
      ? "border-red-600 bg-red-900/30 text-red-100 hover:bg-red-900/40" 
      : "border-red-500 bg-red-50/80 text-red-900 hover:bg-red-50",
    archive: isDark 
      ? "border-gray-600 bg-gray-900/30 text-gray-100 hover:bg-gray-900/40" 
      : "border-gray-500 bg-gray-50/80 text-gray-900 hover:bg-gray-50",
    task: isDark 
      ? "border-blue-600 bg-blue-900/30 text-blue-100 hover:bg-blue-900/40" 
      : "border-blue-500 bg-blue-50/80 text-blue-900 hover:bg-blue-50",
    approval: isDark 
      ? "border-purple-600 bg-purple-900/30 text-purple-100 hover:bg-purple-900/40" 
      : "border-purple-500 bg-purple-50/80 text-purple-900 hover:bg-purple-50",
    condition: isDark 
      ? "border-yellow-600 bg-yellow-900/30 text-yellow-100 hover:bg-yellow-900/40" 
      : "border-yellow-500 bg-yellow-50/80 text-yellow-900 hover:bg-yellow-50",
    parallel: isDark 
      ? "border-indigo-600 bg-indigo-900/30 text-indigo-100 hover:bg-indigo-900/40" 
      : "border-indigo-500 bg-indigo-50/80 text-indigo-900 hover:bg-indigo-50",
    merge: isDark 
      ? "border-teal-600 bg-teal-900/30 text-teal-100 hover:bg-teal-900/40" 
      : "border-teal-500 bg-teal-50/80 text-teal-900 hover:bg-teal-50",
    escalation: isDark 
      ? "border-orange-600 bg-orange-900/30 text-orange-100 hover:bg-orange-900/40" 
      : "border-orange-500 bg-orange-50/80 text-orange-900 hover:bg-orange-50",
  };

  return cn(baseClasses, colors[nodeType as keyof typeof colors] || colors.task);
};

const getAssigneeIcon = (type: string) => {
  switch (type) {
    case 'user':
      return User;
    case 'group':
    case 'role':
      return Users;
    default:
      return User;
  }
};

const getTaskTypeLabel = (taskType: string) => {
  switch (taskType) {
    case 'review':
      return 'Review';
    case 'approve':
      return 'Approve';
    case 'create_object':
      return 'Create Object';
    case 'add_notes':
      return 'Add Notes';
    case 'download':
      return 'Download';
    case 'add_signature':
      return 'Add Signature';
    case 'add_attachment':
      return 'Add Attachment';
    case 'link_document':
      return 'Link Document';
    case 'link_entity':
      return 'Link Entity';
    case 'print':
      return 'Print';
    case 'close':
      return 'Close';
    case 'restricted_share':
      return 'Restricted Share';
    case 'distribution':
      return 'Distribution';
    default:
      return taskType;
  }
};

export const WorkflowNodeComponent = memo<NodeProps>(({ id, data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const nodeData = data as WorkflowNodeData;
  const Icon = getNodeIcon(nodeData.nodeType);
  const nodeClasses = getNodeColors(nodeData.nodeType, !!selected, isDark);
  
  // Get store actions
    const { 
    updateNode, 
    deleteNode, 
    duplicateNode, 
    toggleNodeLocked,
    toggleNodeReassignment,
    toggleNodeDelegation,
    toggleNodeNotifications 
  } = useWorkflowStore();
  
  const showAssignees = nodeData.assignees && nodeData.assignees.length > 0;
  const showSLA = nodeData.sla !== undefined;
  const showConditions = nodeData.conditions && nodeData.conditions.length > 0;

  // Handle settings click
  const handleSettingsClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent node selection
    // This will trigger the node click handler in WorkflowBuilder
    const nodeElement = event.currentTarget.closest('[data-id]');
    if (nodeElement) {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      nodeElement.dispatchEvent(clickEvent);
    }
  };

  // Context menu handlers
  const handleOpenProperties = () => {
    // Trigger the properties panel (same as clicking settings)
    const nodeElement = document.querySelector(`[data-id="${id}"]`);
    if (nodeElement) {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      nodeElement.dispatchEvent(clickEvent);
    }
  };

  const handleDeleteNode = () => {
    deleteNode(id);
  };

  const handleDuplicateNode = () => {
    duplicateNode(id);
  };

  const handleToggleLocked = () => {
    toggleNodeLocked(id);
  };

  const handleToggleReassignment = () => {
    toggleNodeReassignment(id);
  };

  const handleToggleDelegation = () => {
    toggleNodeDelegation(id);
  };

  const handleToggleNotifications = () => {
    toggleNodeNotifications(id);
  };

  return (
    <NodeContextMenu
      nodeId={id}
      nodeData={nodeData}
      onOpenProperties={handleOpenProperties}
      onDeleteNode={handleDeleteNode}
      onDuplicateNode={handleDuplicateNode}
      onToggleLocked={handleToggleLocked}
      onToggleReassignment={handleToggleReassignment}
      onToggleDelegation={handleToggleDelegation}
      onToggleNotifications={handleToggleNotifications}
    >
    <div className={cn(
      "rounded-xl p-4 min-w-[200px] max-w-[280px] shadow-lg relative",
      nodeClasses,
      nodeData.locked && "opacity-75 cursor-not-allowed"
    )}>
      {/* Locked overlay */}
      {nodeData.locked && (
        <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 rounded-xl flex items-center justify-center z-10 pointer-events-none">
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        </div>
      )}
      
      {/* Input Handle - Left side for horizontal flow */}
      {nodeData.nodeType !== 'start' && nodeData.nodeType !== 'merge' && (
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className={cn("w-3 h-3 border-2 transition-colors", 
            isDark ? "border-gray-600 bg-gray-800" : "border-gray-400 bg-white")}
        />
      )}

      {/* Multiple input handles for merge nodes */}
      {nodeData.nodeType === 'merge' && (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            className={cn("w-4 h-4 border-2 transition-colors relative", 
              isDark ? "border-gray-600 bg-gray-800" : "border-gray-400 bg-white")}
            title="Merge input - accepts multiple connections"
          />
          {/* Multiple input indicator */}
          <div className={cn("absolute left-[-24px] top-[45%] text-xs font-bold",
            isDark ? "text-blue-300" : "text-blue-600")}
            style={{ fontSize: '10px' }}>
            1+
          </div>
        </>
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn("p-2 rounded-lg", 
            isDark ? "bg-white/10" : "bg-black/5")}>
            <Icon className="w-4 h-4 flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate leading-tight flex gap-2">
              <span>{nodeData.label}</span>
              {nodeData.optional && (
                <Badge variant="outline" style={{ fontSize: '10px' }}  className="px-1.5 py-0.5 h-auto text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/50">
                  Optional
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {nodeData.priority !== 'medium' && (
                <Badge 
                  variant={nodeData.priority === 'high' || nodeData.priority === 'critical' ? 'destructive' : 'secondary'}
                  className="text-xs px-1.5 py-0.5 h-auto"
                >
                  {nodeData.priority}
                </Badge>
              )}
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                {nodeData.nodeType}
              </Badge>
              {nodeData.taskType && nodeData.nodeType === 'task' && (
                <Badge variant="secondary" style={{ fontSize: '10px' }}  className="px-1.5 py-0.5 h-auto bg-blue-100 dark:bg-blue-100/50 border border-blue-200/60 text-blue-800 ">
                  {getTaskTypeLabel(nodeData.taskType)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Properties indicator */}
        <div 
          className={cn("p-1.5 rounded-md opacity-60 hover:opacity-100 transition-opacity cursor-pointer",
            isDark ? "hover:bg-white/10" : "hover:bg-black/5")}
          onClick={handleSettingsClick}
          title="Open properties panel"
        >
          <Settings className="w-3 h-3" />
        </div>
      </div>

      {/* Description */}
      {nodeData.description && (
        <p className={cn("text-xs mb-3 line-clamp-2 leading-relaxed",
          isDark ? "text-gray-300" : "text-gray-600")}>
          {nodeData.description}
        </p>
      )}

      {/* Property Summaries */}
      <div className="space-y-2">
        {/* Assignees Summary */}
        {showAssignees && (
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/5")}>
              <Users className="w-3 h-3" />
            </div>
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {nodeData.assignees!.slice(0, 2).map((assignee, index) => {
                const AssigneeIcon = getAssigneeIcon(assignee.type);
                return (
                  <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    <AssigneeIcon className="w-3 h-3 mr-1" />
                    {assignee.name}
                  </Badge>
                );
              })}
              {nodeData.assignees!.length > 2 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                  +{nodeData.assignees!.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* SLA Summary */}
        {showSLA && (
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/5")}>
              <Clock className="w-3 h-3" />
            </div>
            <div className="flex gap-1 text-xs">
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">SLA: {nodeData.sla?.duration} {nodeData.sla?.unit}</Badge>
              {nodeData.sla?.escalationEnabled && (
                <span className={cn("ml-1", isDark ? "text-yellow-300" : "text-yellow-600")}>
                  (escalates)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Delegation & Reassignment Settings */}
        {(nodeData.allowDelegation || nodeData.allowReassignment || nodeData.requireAllApprovals) && (
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/5")}>
              <ShieldCheck className="w-3 h-3" />
            </div>
            <div className="flex flex-wrap gap-1">
              {nodeData.allowDelegation && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  Delegable
                </Badge>
              )}
              {nodeData.allowReassignment && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  Reassignable
                </Badge>
              )}
              {nodeData.requireAllApprovals && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  All Approvals
                </Badge>
              )}
             
            </div>
          </div>
        )}

        {/* Conditions Summary */}
        {showConditions && (
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn("p-1 rounded flex-shrink-0", isDark ? "bg-white/10" : "bg-black/5")}>
              <GitBranch className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="text-xs flex-shrink-0">
                {nodeData.conditions!.length} condition{nodeData.conditions!.length !== 1 ? 's' : ''}
              </span>
              {nodeData.conditions!.length > 0 && (() => {
                const firstCondition = nodeData.conditions![0];
                const field = getFieldById(firstCondition.field);
                const fieldName = field?.name || firstCondition.field;
                const operatorLabel = field ? getOperatorsForFieldType(field.type).find(op => op.value === firstCondition.operator)?.label : firstCondition.operator;
                const conditionText = `${fieldName} ${operatorLabel || firstCondition.operator}`;
                const displayText = nodeData.conditions!.length > 1 ? `${conditionText}...` : conditionText;
                
                return (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto min-w-0 max-w-24">
                    <span className="truncate" title={conditionText}>
                      {displayText}
                    </span>
                  </Badge>
                );
              })()}
            </div>
          </div>
        )}

        {/* Notifications Summary */}
        {nodeData.notifications && (
          (nodeData.notifications.onStart || 
           nodeData.notifications.onComplete || 
           nodeData.notifications.onSLABreach || 
           nodeData.notifications.onEscalation || 
           nodeData.notifications.slaReminder?.enabled) && (
            <div className="flex items-center gap-2">
              <div className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/5")}>
                <AlertTriangle className="w-3 h-3" />
              </div>
              <div className="flex flex-wrap gap-1">
                {nodeData.notifications.onStart && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    Start
                  </Badge>
                )}
                {nodeData.notifications.onComplete && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    Complete
                  </Badge>
                )}
                {nodeData.notifications.onSLABreach && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    SLA Breach
                  </Badge>
                )}
                {nodeData.notifications.slaReminder?.enabled && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    Reminder ({nodeData.notifications.slaReminder.duration}{nodeData.notifications.slaReminder.unit?.charAt(0)})
                  </Badge>
                )}
                {nodeData.notifications.onEscalation && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                    Escalation
                  </Badge>
                )}
              </div>
            </div>
          )
        )}

        {/* Merge Configuration Summary */}
        {nodeData.nodeType === 'merge' && nodeData.mergeConfig && (
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/5")}>
              <Merge className="w-3 h-3" />
            </div>
            <div className="flex flex-wrap gap-1">
              {nodeData.mergeConfig.waitForAll && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  Wait All
                </Badge>
              )}
              {nodeData.mergeConfig.waitForOptional && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                  Wait Optional
                </Badge>
              )}
              {nodeData.mergeConfig.minimumRequired && nodeData.mergeConfig.minimumRequired > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  Min: {nodeData.mergeConfig.minimumRequired}
                </Badge>
              )}
              {nodeData.mergeConfig.timeout && nodeData.mergeConfig.timeout > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-auto">
                  {nodeData.mergeConfig.timeout}m timeout
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions Summary */}
        {nodeData.actions && nodeData.actions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className={cn("p-1 rounded", isDark ? "bg-white/10" : "bg-black/5")}>
              <CheckCircle className="w-3 h-3" />
            </div>
            <div className="flex flex-wrap gap-1">
              {nodeData.actions.slice(0, 2).map((action, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  {action.name}
                </Badge>
              ))}
              {nodeData.actions.length > 2 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto">
                  +{nodeData.actions.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Output Handle - Right side for horizontal flow */}
      {nodeData.nodeType !== 'end' && nodeData.nodeType !== 'archive' && 
       nodeData.nodeType !== 'condition' && nodeData.nodeType !== 'parallel' && 
       nodeData.nodeType !== 'approval' && (
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className={cn("w-3 h-3 border-2 transition-colors", 
            isDark ? "border-gray-600 bg-gray-800" : "border-gray-400 bg-white")}
        />
      )}

      {/* Approval node outputs - Approved/Rejected paths */}
      {nodeData.nodeType === 'approval' && (
        <>
          {/* Approved path - Right side */}
          <Handle
            type="source"
            position={Position.Right}
            id="right-approved"
            className={cn("w-3 h-3 border-2 transition-colors", 
              isDark ? "border-green-600 bg-green-800" : "border-green-500 bg-green-50")}
            style={{ top: '50%' }}
            title="Approved path"
          />
          {/* Approved label */}
          <div className={cn("absolute right-[-16px] top-[45%] text-xs font-medium",
            isDark ? "text-green-300" : "text-green-600")}
            style={{ fontSize: '10px' }}>
            ✓
          </div>
          
          {/* Rejected path - Bottom side */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom-rejected"
            className={cn("w-3 h-3 border-2 transition-colors", 
              isDark ? "border-red-600 bg-red-800" : "border-red-500 bg-red-50")}
            style={{ left: '50%' }}
            title="Rejected path"
          />
          {/* Rejected label */}
          <div className={cn("absolute bottom-[-16px] left-[48%] text-xs font-medium",
            isDark ? "text-red-300" : "text-red-600")}
            style={{ fontSize: '10px' }}>
            ✗
          </div>
        </>
      )}

      {/* Escalation handle for task and approval nodes */}
      {(nodeData.nodeType === 'task' || nodeData.nodeType === 'approval') && nodeData.sla?.escalationEnabled && (
        <>
          <Handle
            type="source"
            position={nodeData.nodeType === 'approval' ? Position.Bottom : Position.Bottom}
            id="bottom-escalation"
            className={cn("w-3 h-3 border-2 transition-colors", 
              isDark ? "border-amber-600 bg-amber-800" : "border-amber-500 bg-amber-50")}
            style={{ left: nodeData.nodeType === 'approval' ? '25%' : '75%' }}
            title="SLA Escalation path - triggered when SLA is breached"
          />
          {/* Escalation label */}
          <div className={cn("absolute bottom-[-18px] text-xs font-medium",
            isDark ? "text-amber-300" : "text-amber-600",
            nodeData.nodeType === 'approval' ? "left-[22%]" : "left-[72%]")}
            style={{ fontSize: '9px' }}>
            ⚠️
          </div>
        </>
      )}

      {/* Condition node outputs - True/False paths (3 handles total) */}
      {nodeData.nodeType === 'condition' && (
        <>
          {/* True/Success path - Right side */}
          <Handle
            type="source"
            position={Position.Right}
            id="right-true"
            className={cn("w-3 h-3 border-2 transition-colors", 
              isDark ? "border-green-600 bg-green-800" : "border-green-500 bg-green-50")}
            style={{ top: '50%' }}
            title="True/Success path"
          />
          {/* Success label */}
          <div className={cn("absolute right-[-16px] top-[45%] text-xs font-medium",
            isDark ? "text-green-300" : "text-green-600")}
            style={{ fontSize: '10px' }}>
            ✓
          </div>
          
          {/* False/Failure path - Bottom side */}
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom-false"
            className={cn("w-3 h-3 border-2 transition-colors", 
              isDark ? "border-red-600 bg-red-800" : "border-red-500 bg-red-50")}
            style={{ left: '50%' }}
            title="False/Failure path"
          />
          {/* Failure label */}
          <div className={cn("absolute bottom-[-16px] left-[48%] text-xs font-medium",
            isDark ? "text-red-300" : "text-red-600")}
            style={{ fontSize: '10px' }}>
            ✗
          </div>
        </>
      )}

      {/* Parallel node outputs - Multiple branches */}
      {nodeData.nodeType === 'parallel' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className={cn("w-4 h-4 border-2 transition-colors relative", 
              isDark ? "border-blue-600 bg-blue-800" : "border-blue-500 bg-blue-50")}
            title="Parallel output - supports multiple connections"
          />
          {/* Multiple output indicator */}
          <div className={cn("absolute right-[-28px] top-[45%] text-xs font-bold",
            isDark ? "text-purple-300" : "text-purple-600")}
            style={{ fontSize: '10px' }}>
            1:N
          </div>
        </>
      )}

      {/* Professional glow effect */}
      <div className={cn("absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-200",
        selected 
          ? "opacity-100 shadow-inner" 
          : "opacity-0",
        isDark 
          ? "shadow-blue-400/20" 
          : "shadow-blue-600/10"
      )} />
    </div>
    </NodeContextMenu>
  );
});

WorkflowNodeComponent.displayName = 'WorkflowNodeComponent';
