"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  useReactFlow,
  Panel as ReactFlowPanel,
  type ReactFlowInstance,
  BackgroundVariant,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import { WorkflowNodeComponent } from '../nodes/WorkflowNodeComponent';
import { WorkflowEdge } from '../edges/WorkflowEdge';
import { NodePalette } from './NodePalette';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { useWorkflowStore } from '../workflow.store';
import { WorkflowNodeData, NodeType, LayoutAlgorithm } from '../workflow.types';
import { WorkflowValidator, ValidationResult } from '../validation';
import { layoutNodes, autoLayout } from '../layout';
import { v4 as uuidv4 } from 'uuid';

import { Button } from 'web-utils-components/button';
import { Badge } from 'web-utils-components/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'web-utils-components/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'web-utils-components/tooltip';
import { 
  Save, 
  RotateCcw,
  Layout,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const nodeTypes = {
  workflowNode: WorkflowNodeComponent,
};

const edgeTypes = {
  workflowEdge: WorkflowEdge,
};

interface WorkflowBuilderContentProps {
  workflowId?: string;
  readOnly?: boolean;
  showMiniMap?: boolean;
  showBackground?: boolean;
  className?: string;
}

const WorkflowBuilderContent: React.FC<WorkflowBuilderContentProps> = ({
  workflowId,
  readOnly = false,
  showMiniMap = true,
  showBackground = true,
  className,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { 
    nodes: storeNodes, 
    edges: storeEdges, 
    layoutAlgorithm,
    isLayouting,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    addNode,
    updateNode,
    deleteNode,
    addEdge: addStoreEdge,
    updateEdge,
    deleteEdge,
    setLayoutAlgorithm,
    setIsLayouting,
    validateWorkflow,
    currentWorkflow,
  } = useWorkflowStore();

  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [currentValidation, setCurrentValidation] = useState<ValidationResult | null>(null);
  const [validationPanelCollapsed, setValidationPanelCollapsed] = useState(false);
  const { fitView, getViewport } = useReactFlow();
  const { theme } = useTheme();

  // Sync store changes to ReactFlow - for all changes including data updates
  useEffect(() => {
    // Always sync nodes from store to ensure updates are reflected
    setNodes(storeNodes);
  }, [storeNodes, setNodes]);

  useEffect(() => {
    // Always sync edges from store to ensure updates are reflected
    setEdges(storeEdges);
  }, [storeEdges, setEdges]);

  // Close property panel if the selected node is deleted
  useEffect(() => {
    if (selectedNode && !storeNodes.find(n => n.id === selectedNode.id)) {
      // The selected node was deleted, close the property panel
      setSelectedNode(null);
      setShowPropertiesPanel(false);
    }
  }, [selectedNode, storeNodes]);

  // Handle node changes with debounced position updates
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes as any);
      
      // For position changes, only update store after a delay (debounced)
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          // Only update store when dragging is complete
          updateNode(change.id, { position: change.position });
        } else if (change.type === 'remove') {
          deleteNode(change.id);
        }
      });
    },
    [onNodesChange, updateNode, deleteNode]
  );

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      
      // Update store for edge changes
      changes.forEach((change) => {
        if (change.type === 'remove') {
          deleteEdge(change.id);
        }
      });
    },
    [onEdgesChange, deleteEdge]
  );

  // Handle new connections with validation
  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Validate the connection before allowing it
      const sourceNode = storeNodes.find(n => n.id === params.source);
      const targetNode = storeNodes.find(n => n.id === params.target);
      
      if (sourceNode && targetNode) {
        const connectionErrors = WorkflowValidator.validateConnectionAttempt(
          storeNodes,
          storeEdges,
          params.source!,
          params.target!,
          params.sourceHandle || undefined,
          params.targetHandle || undefined
        );

        // If there are errors, show them and prevent connection
        if (connectionErrors.length > 0) {
          const errorMessages = connectionErrors
            // .filter(e => e.type === 'error')
            .map(e => e.message)
            .join('\n');
          toast.error('Connection not allowed', {
            description: errorMessages,
            duration: 5000,
          });
          return;
        }
      }

      // Use the actual source and target handles from the connection
      // This allows condition and parallel nodes to work with their specific handles
      const sourceHandle = params.sourceHandle || 'right';
      const targetHandle = params.targetHandle || 'left';
      
      const newEdge = {
        ...params,
        id: uuidv4(),
        type: 'workflowEdge',
        sourceHandle,
        targetHandle,
        data: { label: '' },
      } as any;
      
      // Only update store - let sync effect handle ReactFlow update
      addStoreEdge(newEdge);
    },
    [storeNodes, addStoreEdge]
  );

  // Handle node click
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (readOnly) return;
      setSelectedNode(node as Node<WorkflowNodeData>);
      setShowPropertiesPanel(true);
    },
    [readOnly]
  );

  // Add new node
  const handleAddNode = useCallback(
    (nodeType: NodeType) => {
      if (readOnly) return;

      const viewport = getViewport();
      // Calculate center position of current viewport
      const position = {
        x: -viewport.x + (window.innerWidth / 2) / viewport.zoom - 100,
        y: -viewport.y + (window.innerHeight / 2) / viewport.zoom - 50,
      };

      const nodeData: WorkflowNodeData = {
        label: getDefaultLabel(nodeType),
        nodeType,
        priority: 'medium',
        allowDelegation: false,
        allowReassignment: false,
        requireAllApprovals: false,
        optional: false,
        locked: false,
        ...(nodeType === 'task' && { taskType: 'review' as const }),
      };

      const newNodeId = addNode({
        type: 'workflowNode',
        position,
        data: nodeData,
      });

      // Don't auto-fit view - maintain current zoom state
    },
    [readOnly, getViewport, addNode]
  );

  // Layout functions
  const handleLayout = useCallback(
    async (algorithm?: LayoutAlgorithm) => {
      if (isLayouting) return;
      
      setIsLayouting(true);
      try {
        const layoutAlgo = algorithm || layoutAlgorithm;
        const direction = 'LR'; // Always use left-to-right for horizontal layout
        
        // Don't modify existing edge handles - preserve them
        const { nodes: layoutedNodes, edges: layoutedEdges } = await layoutNodes(
          storeNodes,
          storeEdges,
          layoutAlgo,
          { direction }
        );
        
        setStoreNodes(layoutedNodes);
        setStoreEdges(layoutedEdges);
        
        // Fit view after layout
        setTimeout(() => fitView({ duration: 500 }), 100);
      } catch (error) {
        console.error('Layout failed:', error);
      } finally {
        setIsLayouting(false);
      }
    },
    [isLayouting, layoutAlgorithm, storeNodes, storeEdges, setStoreNodes, setStoreEdges, setIsLayouting, fitView]
  );

  const handleAutoLayout = useCallback(async () => {
    if (isLayouting) return;
    
    setIsLayouting(true);
    try {
      const direction = 'LR'; // Always use left-to-right for horizontal layout
      
      // Don't modify existing edge handles - preserve them
      const { nodes: layoutedNodes, edges: layoutedEdges, algorithm } = await autoLayout(
        storeNodes,
        storeEdges,
        { direction }
      );
      
      setStoreNodes(layoutedNodes);
      setStoreEdges(layoutedEdges);
      setLayoutAlgorithm(algorithm);
      
      // Fit view after layout
      setTimeout(() => fitView({ duration: 500 }), 100);
    } catch (error) {
      console.error('Auto layout failed:', error);
    } finally {
      setIsLayouting(false);
    }
  }, [isLayouting, storeNodes, storeEdges, setStoreNodes, setStoreEdges, setLayoutAlgorithm, fitView]);

  // Validation
  const handleValidate = useCallback(() => {
    const validation = WorkflowValidator.validateWorkflow(storeNodes, storeEdges);
    setCurrentValidation(validation);
    
    // Show summary
    if (validation.isValid) {
      toast.success('Workflow validation passed!', {
        description: 'No errors found.',
        duration: 3000,
      });
    } else {
      const errorCount = validation.errors.length;
      const warningCount = validation.warnings.length;
      toast.error('Workflow validation failed!', {
        description: `${errorCount} error(s), ${warningCount} warning(s). Check the validation panel for details.`,
        duration: 5000,
      });
    }
  }, [storeNodes, storeEdges]);

  // Auto-validate when nodes or edges change (including data updates)
  const computedValidation = useMemo(() => {
    if (storeNodes.length > 0) {
      return WorkflowValidator.validateWorkflow(storeNodes, storeEdges);
    }
    return null;
  }, [storeNodes, storeEdges]);

  // Update current validation when validation result changes
  useEffect(() => {
    setCurrentValidation(computedValidation);
  }, [computedValidation]);

  // Save workflow
  const handleSave = useCallback(() => {
    if (!currentWorkflow) {
      toast.error('No workflow to save', {
        description: 'Please create a workflow first.',
        duration: 3000,
      });
      return;
    }
    
    // Create the workflow export data
    const workflowExport = {
      workflow: {
        id: currentWorkflow.id,
        name: currentWorkflow.name,
        description: currentWorkflow.description,
        version: currentWorkflow.version,
        status: currentWorkflow.status,
        category: currentWorkflow.category,
        priority: currentWorkflow.priority,
        tags: currentWorkflow.tags,
        settings: currentWorkflow.settings,
        createdAt: currentWorkflow.createdAt,
        updatedAt: new Date().toISOString(),
        createdBy: currentWorkflow.createdBy,
      },
      nodes: storeNodes,
      edges: storeEdges,
      metadata: {
        exportedAt: new Date().toISOString(),
        nodeCount: storeNodes.length,
        edgeCount: storeEdges.length,
        exportVersion: '1.0.0',
      }
    };
    
    // Create and download the JSON file
    const dataStr = JSON.stringify(workflowExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    
    // Generate filename with workflow name and timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const safeName = currentWorkflow.name.replace(/[^a-zA-Z0-9]/g, '_');
    link.download = `workflow_${safeName}_${timestamp}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(link.href);
    
    toast.success('Workflow downloaded successfully!', {
      description: `Downloaded ${storeNodes.length} nodes and ${storeEdges.length} connections as JSON.`,
      duration: 3000,
    });
  }, [currentWorkflow, storeNodes, storeEdges]);

  return (
    <div className={`w-full flex relative overflow-hidden ${className}`}>
      {/* Gradient background effects */}
      <div className="fixed -top-20 left-1/4 w-[300px] h-[700px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-10 dark:opacity-20 rounded-full blur-3xl"></div>
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-yellow-400/10 via-orange-500/10 to-red-500/10 opacity-10 dark:opacity-20 rounded-full blur-3xl"></div>
      <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-br from-green-400/10 via-teal-500/10 to-blue-500/10 opacity-20 dark:opacity-30 rounded-full blur-3xl"></div>

      {/* Main ReactFlow Container */}
      <div 
        className={`flex-1 transition-all duration-300 relative z-10 ${
          showPropertiesPanel ? 'mr-96' : 'mr-0'
        }`}
      >
        <div className={`h-[calc(100vh-130px)] w-full relative backdrop-blur-md ${
          theme === 'dark' ? 'bg-gray-900/60' : 'bg-slate-300/20'
        }`} ref={reactFlowWrapper}>
          {/* Glassmorphism overlay for ReactFlow */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}
                multiSelectionKeyCode={readOnly ? null : ['Meta', 'Ctrl']}
                connectionMode={ConnectionMode.Loose}
                fitView
                fitViewOptions={{ padding: 0.2 }}
            >
                {/* Dotted Background */}
                <Background 
                    variant={BackgroundVariant.Dots} 
                    gap={20} 
                    size={1}
                    color={theme === 'dark' ? '#999999' : '#6b7280'}
                    bgColor="transparent"
                />
                
                {/* Controls */}
                <Controls 
                    className={theme === 'dark' ? 'dark' : ''}
                    showZoom={true}
                    showFitView={true}
                    showInteractive={!readOnly}
                    style={{
                        '--xy-controls-button-background-color': theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        '--xy-controls-button-background-color-hover': theme === 'dark' ? 'rgba(31, 41, 55, 0.95)' : 'rgba(249, 250, 251, 0.95)',
                        '--xy-controls-button-border-color': theme === 'dark' ? 'rgba(75, 85, 99, 0.7)' : 'rgba(229, 231, 235, 0.5)',
                        '--xy-controls-button-color': theme === 'dark' ? '#ffffff' : '#374151',
                        'backdropFilter': 'blur(8px)',
                        'boxShadow': theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    } as React.CSSProperties}
                />
                
                {/* Mini Map */}
                {showMiniMap && (
                <MiniMap 
                    className={theme === 'dark' ? 'dark' : ''}
                    nodeColor={theme === 'dark' ? '#374151' : '#e5e7eb'}
                    maskColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)'}
                    style={{
                        '--xy-minimap-background-color': theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        '--xy-minimap-mask-background-color': theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.1)',
                        '--xy-minimap-node-background-color': theme === 'dark' ? '#374151' : '#e5e7eb',
                        '--xy-minimap-node-stroke-color': theme === 'dark' ? '#6b7280' : '#9ca3af',
                        'backdropFilter': 'blur(8px)',
                        'borderRadius': '8px',
                        'border': theme === 'dark' ? '1px solid rgba(75, 85, 99, 0.7)' : '1px solid rgba(229, 231, 235, 0.5)',
                        'boxShadow': theme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    } as React.CSSProperties}
                />
                )}

                {/* Top Panel - Toolbar */}
                <ReactFlowPanel position="top-left" className={`flex items-center gap-2 p-2 rounded-lg shadow-md backdrop-blur-md border ${
                theme === 'dark' 
                    ? 'bg-gray-800/80 border-gray-700/50 text-white' 
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                {!readOnly && (
                    <>
                    <NodePalette 
                        onAddNode={handleAddNode} 
                        enableKeyboardShortcuts={!readOnly}
                    />
                    <div className="w-px h-6 bg-gray-300" />
                    </>
                )}
                
                {/* Layout Controls */}
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAutoLayout}
                        disabled={isLayouting}
                        >
                        {isLayouting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Auto Layout</TooltipContent>
                    </Tooltip>
                    
                    <Select value={layoutAlgorithm} onValueChange={(value: LayoutAlgorithm) => setLayoutAlgorithm(value)}>
                    <SelectTrigger className="w-32">
                        <Layout className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="dagre">Dagre</SelectItem>
                        <SelectItem value="elk-layered">ELK Layered</SelectItem>
                        <SelectItem value="elk-force">ELK Force</SelectItem>
                        <SelectItem value="elk-stress">ELK Stress</SelectItem>
                    </SelectContent>
                    </Select>
                    
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLayout()}
                        disabled={isLayouting}
                        >
                        <Layout className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Apply Layout</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                
                {!readOnly && (
                    <>
                    <div className="w-px h-6 bg-gray-300" />
                    
                    {/* Validation */}
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={handleValidate}
                            >
                            <CheckCircle className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Validate Workflow</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    {/* Save */}
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSave}
                            >
                            <Save className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Workflow JSON</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    </>
                )}
                </ReactFlowPanel>

                {/* Validation Results Panel */}
                {currentValidation && (
                <ReactFlowPanel position="top-right" className={`rounded-lg shadow-md backdrop-blur-md border max-w-sm ${
                    theme === 'dark' 
                    ? 'bg-gray-800/80 border-gray-700/50 text-white' 
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                    {/* Collapsible Header */}
                    <div 
                        className="flex items-center justify-between p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => setValidationPanelCollapsed(!validationPanelCollapsed)}
                    >
                        <div className="flex items-center gap-2">
                            {currentValidation.isValid ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            <span className="font-medium text-sm">
                                {currentValidation.isValid ? 'Valid Workflow' : 'Validation Issues'}
                            </span>
                            {(currentValidation.errors.length > 0 || currentValidation.warnings.length > 0) && (
                                <div className="flex items-center gap-1">
                                    {currentValidation.errors.length > 0 && (
                                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">
                                            {currentValidation.errors.length} error{currentValidation.errors.length !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                    {currentValidation.warnings.length > 0 && (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-auto bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                                            {currentValidation.warnings.length} warning{currentValidation.warnings.length !== 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                        {validationPanelCollapsed ? (
                            <ChevronDown className="ml-2 w-4 h-4" />
                        ) : (
                            <ChevronUp className="ml-2 w-4 h-4" />
                        )}
                    </div>
                    
                    {/* Collapsible Content */}
                    {!validationPanelCollapsed && (
                        <div className="px-3 pb-3 mt-2">
                            {currentValidation.errors.length > 0 && (
                                <div className="space-y-1 mb-2">
                                    {currentValidation.errors.map((error, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                            <span className={`text-xs ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{error.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {currentValidation.warnings.length > 0 && (
                                <div className="space-y-1">
                                    {currentValidation.warnings.map((warning, index) => (
                                        <div key={index} className="flex items-start gap-2">
                                            <Info className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span className={`text-xs ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-700'}`}>{warning.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </ReactFlowPanel>
                )}

                {/* Status Panel */}
                <ReactFlowPanel position="bottom-right" className={`flex items-center gap-2 p-2 rounded-lg shadow-lg backdrop-blur-md border ${
                theme === 'dark' 
                    ? 'bg-gray-800/80 border-gray-700/50 text-white' 
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                <Badge variant="secondary" className="text-xs">
                    {nodes.length} nodes
                </Badge>
                <Badge variant="secondary" className="text-xs">
                    {edges.length} edges
                </Badge>
                {currentWorkflow && (
                    <Badge variant="outline" className="text-xs">
                    {currentWorkflow.status}
                    </Badge>
                )}
                </ReactFlowPanel>
            </ReactFlow>
        </div>
      </div>

      {/* Right Side Properties Panel */}
      <NodePropertiesPanel
        nodeId={selectedNode?.id || null}
        open={showPropertiesPanel}
        onOpenChange={setShowPropertiesPanel}
      />
    </div>
  );
};

// Helper function to get default labels
function getDefaultLabel(nodeType: NodeType): string {
  switch (nodeType) {
    case 'start':
      return 'Start';
    case 'task':
      return 'New Task';
    case 'approval':
      return 'Approval Required';
    case 'condition':
      return 'Decision Point';
    case 'parallel':
      return 'Split Process';
    case 'merge':
      return 'Merge Branches';
    case 'escalation':
      return 'Escalate';
    case 'end':
      return 'End';
    case 'archive':
      return 'Archive';
    default:
      return 'New Node';
  }
}

interface WorkflowBuilderProps extends WorkflowBuilderContentProps {}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
};
