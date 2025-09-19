import React, { useState, useEffect } from 'react';
import { Button } from 'web-utils-components/button';
import { Input } from 'web-utils-components/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'web-utils-components/popover';
import { Card, CardContent } from 'web-utils-components/card';
import { Badge } from 'web-utils-components/badge';
import { toast } from 'sonner';
import { 
  Plus,
  Play, 
  Square, 
  CheckCircle, 
  GitBranch, 
  Split, 
  Merge, 
  AlertTriangle, 
  Archive,
  ShieldCheck,
  Search
} from 'lucide-react';
import { NodeType } from '../workflow.types';
import { cn } from 'web-utils-common';
import { useTheme } from 'next-themes';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'flow' | 'advanced';
  shortcut: string;
}

const nodeTypes: NodePaletteItem[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Beginning of the workflow',
    icon: Play,
    category: 'basic',
    shortcut: 'Cmd+1',
  },
  {
    type: 'task',
    label: 'Task',
    description: 'A work item to be completed',
    icon: CheckCircle,
    category: 'basic',
    shortcut: 'Cmd+2',
  },
  {
    type: 'approval',
    label: 'Approval',
    description: 'Requires approval from assignees',
    icon: ShieldCheck,
    category: 'basic',
    shortcut: 'Cmd+3',
  },
  {
    type: 'condition',
    label: 'Condition',
    description: 'Decision point based on conditions',
    icon: GitBranch,
    category: 'flow',
    shortcut: 'Cmd+4',
  },
  {
    type: 'parallel',
    label: 'Parallel',
    description: 'Split workflow into parallel branches',
    icon: Split,
    category: 'flow',
    shortcut: 'Cmd+5',
  },
  {
    type: 'merge',
    label: 'Merge',
    description: 'Merge parallel branches back together',
    icon: Merge,
    category: 'flow',
    shortcut: 'Cmd+6',
  },
  {
    type: 'escalation',
    label: 'Escalation',
    description: 'Escalate when SLA is breached',
    icon: AlertTriangle,
    category: 'advanced',
    shortcut: 'Cmd+7',
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion',
    icon: Square,
    category: 'basic',
    shortcut: 'Cmd+8',
  },
  {
    type: 'archive',
    label: 'Archive',
    description: 'Archive and close workflow',
    icon: Archive,
    category: 'basic',
    shortcut: 'Cmd+9',
  },
];

interface NodePaletteProps {
  onAddNode: (nodeType: NodeType) => void;
  disabled?: boolean;
  className?: string;
  enableKeyboardShortcuts?: boolean;
}

export const NodePalette: React.FC<NodePaletteProps> = ({
  onAddNode,
  disabled = false,
  className,
  enableKeyboardShortcuts = true,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableKeyboardShortcuts || disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if user is not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Check for Cmd/Ctrl + number combinations
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
        const number = parseInt(event.key);
        if (number >= 1 && number <= 9) {
          event.preventDefault();
          const nodeType = nodeTypes[number - 1];
          if (nodeType) {
            onAddNode(nodeType.type);
            // Show success feedback
            toast.success(`Added ${nodeType.label} node`, {
              description: `Used keyboard shortcut ${nodeType.shortcut.replace('Cmd', '⌘/ctrl')}`,
              duration: 2000,
            });
          }
        }
      }

      // Open NodePalette with Cmd/Ctrl + N
      if (event.key === 'n' && (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        setOpen(true);
        toast.info('Node Palette opened', {
          description: 'Use ⌘1-9 to quickly add nodes',
          duration: 2000,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddNode, disabled, enableKeyboardShortcuts]);

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'basic', label: 'Basic' },
    { value: 'flow', label: 'Flow Control' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const filteredNodes = nodeTypes.filter((node) => {
    const matchesSearch = node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddNode = (nodeType: NodeType) => {
    onAddNode(nodeType);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          disabled={disabled}
        >
          <Plus className="w-4 h-4" />
          Add Node
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-96 p-4", 
        isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )} side="bottom" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Add Workflow Node</h3>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-1 flex-wrap">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant={selectedCategory === category.value ? 'default' : 'secondary'}
                  className="cursor-pointer text-xs"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Node Grid */}
          <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
            {filteredNodes.map((node) => {
              const Icon = node.icon;
              return (
                <Card
                  key={node.type}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isDark 
                      ? "hover:border-blue-400 bg-gray-800 border-gray-700" 
                      : "hover:border-blue-300 bg-white border-gray-200"
                  )}
                  onClick={() => handleAddNode(node.type)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <Icon className={cn(
                        "w-5 h-5 mt-0.5 flex-shrink-0",
                        isDark ? "text-gray-300" : "text-gray-600"
                      )} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h4 className={cn(
                            "font-medium text-sm truncate",
                            isDark ? "text-gray-100" : "text-gray-900"
                          )}>
                            {node.label}
                          </h4>
                          {/* Keyboard shortcut indicator */}
                          <div className={cn(
                            "px-1 py-0 rounded text-xs font-mono flex-shrink-0",
                            isDark 
                              ? "bg-gray-700 text-gray-300 border border-gray-600" 
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          )}>
                            {node.shortcut.replace('Cmd', '⌘')}
                          </div>
                        </div>
                        <p className={cn(
                          "text-xs line-clamp-2 mt-1",
                          isDark ? "text-gray-400" : "text-gray-600"
                        )}>
                          {node.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredNodes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No nodes found matching your search.</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
