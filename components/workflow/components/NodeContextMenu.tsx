import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from 'web-utils-components/context-menu';
import {
  Copy,
  Trash2,
  Edit3,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  Share2,
  Bell,
  Check,
} from 'lucide-react';
import { NodeType, WorkflowNodeData } from '../workflow.types';

interface NodeContextMenuProps {
  children: React.ReactNode;
  nodeId: string;
  nodeData: WorkflowNodeData;
  onOpenProperties: () => void;
  onDeleteNode: () => void;
  onDuplicateNode: () => void;
  onToggleLocked: () => void;
  onToggleReassignment: () => void;
  onToggleDelegation: () => void;
  onToggleNotifications: () => void;
}

const getNodeActions = (nodeType: NodeType) => {
  const baseActions = {
    canEdit: true,
    canDelete: true,
    canDuplicate: true,
    canToggleLocked: true,
    canReassign: true,
    canToggleDelegation: true,
    canToggleNotifications: true,
  };

  switch (nodeType) {
    case 'start':
      return {
        ...baseActions,
        canReassign: false, // Start nodes don't have assignees
        canToggleDelegation: false, // Start nodes don't support delegation
      };
    case 'end':
    case 'archive':
      return {
        ...baseActions,
        canReassign: false, // End nodes don't have assignees
        canToggleDelegation: false, // End nodes don't support delegation
      };
    case 'task':
    case 'approval':
      return {
        ...baseActions,
        // All actions available for task and approval nodes
      };
    case 'condition':
      return {
        ...baseActions,
        canReassign: false, // Logic nodes don't have assignees
        canToggleDelegation: false, // Logic nodes don't support delegation
      };
    case 'parallel':
    case 'merge':
      return {
        ...baseActions,
        canReassign: false, // Flow control nodes don't have assignees
        canToggleDelegation: false, // Flow control nodes don't support delegation
      };
    case 'escalation':
      return {
        ...baseActions,
        // All actions available for escalation nodes
      };
    default:
      return baseActions;
  }
};

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  children,
  nodeId,
  nodeData,
  onOpenProperties,
  onDeleteNode,
  onDuplicateNode,
  onToggleLocked,
  onToggleReassignment,
  onToggleDelegation,
  onToggleNotifications,
}) => {
  const actions = getNodeActions(nodeData.nodeType);
  const isLocked = nodeData.locked === true; // Default to unlocked if not specified

  const handleAction = (action: () => void) => {
    return () => {
      action();
    };
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-2xl">
        {/* Properties */}
        <ContextMenuItem onClick={handleAction(onOpenProperties)}>
          <div className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            Properties
          </div>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Lock toggle */}
        {actions.canToggleLocked && (
          <ContextMenuItem onClick={handleAction(onToggleLocked)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                {isLocked ? (
                  <Lock className="w-4 h-4 mr-2" />
                ) : (
                  <Unlock className="w-4 h-4 mr-2" />
                )}
                {isLocked ? 'Locked' : 'Unlocked'}
              </div>
              {isLocked && <Check className="w-4 h-4" />}
            </div>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Node actions */}
        {actions.canDuplicate && (
          <ContextMenuItem onClick={handleAction(onDuplicateNode)}>
            <div className="flex items-center">
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Node
            </div>
          </ContextMenuItem>
        )}

        {/* Assignment and delegation actions */}
        {actions.canReassign && (
          <ContextMenuItem onClick={handleAction(onToggleReassignment)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <UserCheck className="w-4 h-4 mr-2" />
                Allow Reassignment
              </div>
              {nodeData.allowReassignment && <Check className="w-4 h-4" />}
            </div>
          </ContextMenuItem>
        )}

        {actions.canToggleDelegation && (
          <ContextMenuItem onClick={handleAction(onToggleDelegation)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Allow Delegation
              </div>
              {nodeData.allowDelegation && <Check className="w-4 h-4" />}
            </div>
          </ContextMenuItem>
        )}

        {/* Notification settings */}
        {actions.canToggleNotifications && (
          <ContextMenuItem onClick={handleAction(onToggleNotifications)}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Bell className="w-4 h-4 mr-2" />
                Enable Notifications
              </div>
              {!!nodeData.notifications && <Check className="w-4 h-4" />}
            </div>
          </ContextMenuItem>
        )}

        {/* Node type specific actions */}
        {nodeData.nodeType === 'condition' && (
          <ContextMenuItem>
            <div className="flex items-center">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Conditions
            </div>
          </ContextMenuItem>
        )}

        {(nodeData.nodeType === 'task' || nodeData.nodeType === 'approval') && nodeData.sla && (
          <ContextMenuItem>
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              SLA Settings
            </div>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* Dangerous actions */}
        {actions.canDelete && (
          <ContextMenuItem 
            onClick={handleAction(onDeleteNode)}
            className="text-red-600 dark:text-red-400"
          >
            <div className="flex items-center">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </div>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
