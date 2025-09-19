'use client';

import React, { useEffect, useMemo } from "react";
import { Label } from "web-utils-components/label";
import { Input } from "web-utils-components/input";
import { Button } from "web-utils-components/button";
import { Card } from "web-utils-components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web-utils-components/select";
import { Textarea } from "web-utils-components/textarea";
import { Badge } from "web-utils-components/badge";
import { Switch } from "web-utils-components/switch";
import { Trash2, Plus, Variable, Info, Database, Cookie, HardDrive, Settings, Server, Pencil, Link, Globe, Search, Zap, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { DataSourceConfig, VariableBinding } from "../../../formBuilder.types";
import { useFormBuilderStore } from "../../../store/formBuilder.store";
import { fieldDependencyService } from "../../../services/fieldDependencyService";
import { Alert, AlertDescription, AlertTitle } from "web-utils-components/alert";
import path from "path";

interface VariablesTabProps {
  config: DataSourceConfig;
  updateConfig: (updater: (prev: DataSourceConfig) => DataSourceConfig) => void;
  errors: Record<string, string>;
}

// Variable source configurations
const VARIABLE_SOURCES = {
  static: {
    label: 'Static Value',
    description: 'A fixed value that you define',
    icon: <Pencil className="w-4 h-4" />,
    placeholder: 'Enter static value',
    inputLabel: 'Value',
    example: 'API_VERSION=v1',
    supportsReactive: false
  },
  formField: {
    label: 'Form Field',
    description: 'Reference another field in the form',
    icon: <Link className="w-4 h-4" />,
    placeholder: 'e.g., firstName, address.city',
    inputLabel: 'Select Field',
    example: 'USER_ID={{userId}}',
    supportsReactive: true,
    reactiveByDefault: true
  },
  // urlParam: {
  //   label: 'URL Parameter',
  //   description: 'Get value from URL route parameters',
  //   icon: <Globe className="w-4 h-4" />,
  //   placeholder: 'e.g., userId, productId',
  //   inputLabel: 'Parameter Name',
  //   example: 'USER_ID={{userId}} from /users/:userId',
  //   supportsReactive: true
  // },
  queryParam: {
    label: 'Query Parameter',
    description: 'Get value from URL query parameters',
    icon: <Search className="w-4 h-4" />,
    placeholder: 'e.g., category, filter',
    inputLabel: 'Query Key',
    example: 'CATEGORY={{category}} from ?category=electronics',
    supportsReactive: true
  },
  localStorage: {
    label: 'Local Storage',
    path: 'If localStorage value is a object, to access the inner property',
    description: 'Get value from browser local storage',
    icon: <HardDrive className="w-4 h-4" />,
    placeholder: 'e.g., userPreferences, theme',
    inputLabel: 'Storage Key',
    example: 'THEME={{theme}}',
    supportsReactive: true
  },
  sessionStorage: {
    label: 'Session Storage',
    path: 'If sessionStorage value is a object, to access the inner property',
    description: 'Get value from browser session storage',
    icon: <Database className="w-4 h-4" />,
    placeholder: 'e.g., sessionData, tempSettings',
    inputLabel: 'Storage Key',
    example: 'SESSION={{sessionId}}',
    supportsReactive: true
  },
  cookie: {
    label: 'Cookie',
    description: 'Read value from browser cookies',
    icon: <Cookie className="w-4 h-4" />,
    placeholder: 'e.g., authToken, preferences',
    inputLabel: 'Cookie Name',
    example: 'AUTH={{authToken}}',
    supportsReactive: true
  },
  // appState: {
  //   label: 'Application State',
  //   description: 'Access global application state',
  //   icon: <Settings className="w-4 h-4" />,
  //   placeholder: 'e.g., user.id, tenant.name',
  //   inputLabel: 'State Path',
  //   example: 'TENANT={{tenant.id}}',
  //   supportsReactive: false
  // },
  // environment: {
  //   label: 'Environment Variable',
  //   description: 'Server environment variables (secure)',
  //   icon: <Server className="w-4 h-4" />,
  //   placeholder: 'e.g., API_KEY, DATABASE_URL',
  //   inputLabel: 'Environment Key',
  //   example: 'KEY={{API_SECRET}}',
  //   supportsReactive: false
  // }
} as const;

// Type for available variable sources (only the ones actually defined)
type AvailableVariableSource = keyof typeof VARIABLE_SOURCES;

export const VariablesTab: React.FC<VariablesTabProps> = ({
  config,
  updateConfig,
  errors
}) => {
  const variables = config.variables || [];
  const { formFields, selectedField } = useFormBuilderStore();

  // Get available form fields for formField source type
  const availableFormFields = useMemo(() => {
    return fieldDependencyService.extractAvailableFields(formFields)
      .filter(field => field.key !== selectedField?.key); // Exclude current field
  }, [formFields, selectedField?.key]);

  // Collapsible state for each variable
  const [openStates, setOpenStates] = React.useState<boolean[]>(() => variables.map(() => true));

  const [pathError, setPathError] = React.useState<string | null>(null);

  // Sync openStates when variables change
  useEffect(() => {
    setOpenStates(prev => {
      if (variables.length === prev.length) return prev;
      // If variables added, open new ones by default
      if (variables.length > prev.length) {
        return [...prev, ...Array(variables.length - prev.length).fill(true)];
      }
      // If variables removed, trim state
      return prev.slice(0, variables.length);
    });
  }, [variables.length]);

  const toggleOpen = (idx: number) => {
    setOpenStates(prev => prev.map((open, i) => i === idx ? !open : open));
  };

  const validateObjectPath = (path: string): string | null => {
    if (!path.trim()) return null; // Allow empty (optional)
    // Only allow dot-separated valid JS identifiers
    const segments = path.split(".");
    for (const seg of segments) {
      if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(seg)) {
        return "Invalid path segment: " + seg;
      }
    }
    return null;
  }

  const addVariable = () => {
    const newVariable: VariableBinding = {
      key: '',
      source: 'static',
      value: '',
      path: '',
      description: '',
      reactive: {
        enabled: false,
        debounceMs: 300,
        onDataSourceChange: 'preserve'
      },
      fallback: {
        value: '',
        strategy: 'useDefault'
      }
    };
    updateConfig(prev => ({
      ...prev,
      variables: [...variables, newVariable]
    }));
  };


  const updateVariable = (index: number, updates: Partial<VariableBinding>) => {
    updateConfig(prev => ({
      ...prev,
      variables: prev.variables?.map((variable, i) => {
        if (i === index) {
          const updatedVariable = { ...variable, ...updates };

          // Auto-enable reactive for formField source type
          if (updates.source === 'formField') {
            updatedVariable.reactive = {
              enabled: true,
              debounceMs: variable.reactive?.debounceMs || 300,
              ...updates.reactive
            };
          }

          return updatedVariable;
        }
        return variable;
      }) || []
    }));
  };

  const removeVariable = (index: number) => {
    updateConfig(prev => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index) || []
    }));
  };

  const getSourceBadgeColor = (source: VariableBinding['source']) => {
    switch (source) {
      case 'static': return 'default';
      case 'formField': return 'secondary';
      case 'urlParam': return 'secondary';
      case 'queryParam': return 'secondary';
      case 'localStorage': return 'outline';
      case 'sessionStorage': return 'outline';
      case 'cookie': return 'outline';
      case 'appState': return 'secondary';
      case 'environment': return 'outline';
      default: return 'default';
    }
  };

  const getSourceIcon = (source: VariableBinding['source']) => {
    const config = VARIABLE_SOURCES[source as AvailableVariableSource];
    return config?.icon || '📝';
  };

  const getSourceConfig = (source: VariableBinding['source']) => {
    return VARIABLE_SOURCES[source as AvailableVariableSource] || VARIABLE_SOURCES.static;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Dynamic Variables</Label>
            <p className="text-xs text-muted-foreground">
              Define variables for dynamic URL and request body substitution
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={addVariable} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Variable
          </Button>
        </div>
      </div>

      {/* Usage Info */}
      <Card className="p-4 bg-blue-50/50 dark:bg-blue-950/30 backdrop-blur-sm border-blue-200/90 dark:border-blue-800/50">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium">How to use variables:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">{"{{variableName}}"}</code> in API URL or request body</li>
              <li>• Static: Fixed values you define here</li>
              <li>• Form Fields: Values from form fields or application state</li>
              <li>• Environment: Server environment variables (secure)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Variables List */}
      {variables.length === 0 ? (
        <Card className="p-6 text-center border-dashed bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/90 dark:border-gray-700/50">
          <div className="space-y-3">
            <Variable className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-muted-foreground mb-2">No variables defined</p>
              <p className="text-xs text-muted-foreground mb-3">
                Variables allow you to create dynamic, reusable API configurations
              </p>
              <Button variant="outline" onClick={addVariable} className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Variable
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {variables.map((variable, index) => (
            <Card key={index} className="p-0 border bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/90 dark:border-gray-700/50">
              {/* Collapsible Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleOpen(index)}
                    className="mr-2"
                    aria-label={openStates[index] ? 'Collapse' : 'Expand'}
                  >
                    {openStates[index] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                  <span className="text-lg">{getSourceIcon(variable.source)}</span>
                  <Badge variant={getSourceBadgeColor(variable.source)}>
                    {getSourceConfig(variable.source).label}
                  </Badge>
                  {variable.key && (
                    <code className="text-xs bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm px-1.5 py-0.5 rounded">
                      {"{{" + variable.key + "}}"}
                    </code>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVariable(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              {/* Collapsible Content */}
              {openStates[index] && (
                <div className="space-y-4 p-4">
                  {/* Variable Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Variable Key</Label>
                      <Input
                        placeholder="e.g., userId, apiVersion"
                        value={variable.key}
                        onChange={(e) => updateVariable(index, { key: e.target.value })}
                        className="h-9"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use in templates as: <code>{"{{" + (variable.key || "key") + "}}"}</code>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Source Type</Label>
                      <Select
                        value={variable.source}
                        onValueChange={(value: VariableBinding['source']) =>
                          updateVariable(index, { source: value })
                        }
                      >
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(VARIABLE_SOURCES).map(([key, config]) => (
                            <SelectItem key={key} value={key as AvailableVariableSource}>
                              <div className="flex items-center gap-2">
                                <span>{config.icon}</span>
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        {getSourceConfig(variable.source).inputLabel}
                      </Label>
                      {variable.source === 'formField' ? (
                        <>
                          <Select
                            value={variable.value}
                            onValueChange={(value) => updateVariable(index, { value })}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Select a form field" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableFormFields.length === 0 ? (
                                <SelectItem value="None" disabled>
                                  No available fields
                                </SelectItem>
                              ) : (
                                availableFormFields.map((field) => (
                                  <SelectItem key={field.key} value={field.path}>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-xs">
                                        {field.variant}
                                      </Badge>
                                      <span>{field.label}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({field.path})
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {availableFormFields.length === 0 && (
                            <Alert className="mt-2">
                              <AlertTriangle className="h-4 w-4" />
                              <AlertTitle>No Available Fields</AlertTitle>
                              <AlertDescription>
                                Add other form fields first to create dependencies.
                              </AlertDescription>
                            </Alert>
                          )}
                        </>
                      ) : (
                        <Input
                          placeholder={getSourceConfig(variable.source).placeholder}
                          value={variable.value}
                          onChange={(e) => updateVariable(index, { value: e.target.value })}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        {getSourceConfig(variable.source).description}
                      </p>
                    </div>
                    {variable.source === 'localStorage' || variable.source === 'sessionStorage' ? (
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Path (Optional)</Label>
                        <Input
                          placeholder="Enter the path to the variable..."
                          value={variable.path || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPathError(validateObjectPath(value));
                            updateVariable(index, { path: value });
                          }}
                        />
                        {pathError && (
                          <p className="text-xs text-destructive mt-1">{pathError}</p>
                        )}
                      </div>
                    ) : <></>}
                  </div>
                  {/* Description Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Description (Optional)</Label>
                    <Textarea
                      placeholder="Describe what this variable is used for..."
                      value={variable.description || ''}
                      onChange={(e) => updateVariable(index, { description: e.target.value })}
                      className="h-16 text-sm"
                    />
                  </div>
                  {/* Reactive Configuration */}
                  {getSourceConfig(variable.source).supportsReactive && (
                    <div className="space-y-3 p-3 bg-muted/20 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-500" />
                          <Label className="text-xs font-medium">Reactive Variable</Label>
                          {variable.source === 'formField' && (
                            <Badge variant="secondary" className="text-xs">
                              Always On
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={
                            variable.source === 'formField'
                              ? true
                              : variable.reactive?.enabled || false
                          }
                          disabled={variable.source === 'formField'}
                          onCheckedChange={(checked) =>
                            updateVariable(index, {
                              reactive: {
                                enabled: checked,
                                debounceMs: variable.reactive?.debounceMs || 300
                              }
                            })
                          }
                        />
                      </div>
                      {(variable.reactive?.enabled || variable.source === 'formField') && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            {variable.source === 'formField'
                              ? 'Form field variables are always reactive and will trigger API calls when the field value changes'
                              : 'Variable will automatically update when the source changes'
                            }
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">Debounce (ms)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="5000"
                                step="100"
                                placeholder="300"
                                value={variable.reactive?.debounceMs || 300}
                                onChange={(e) =>
                                  updateVariable(index, {
                                    reactive: {
                                      enabled: variable.source === 'formField' ? true : variable.reactive?.enabled || true,
                                      debounceMs: parseInt(e.target.value) || 300
                                    }
                                  })
                                }
                                className="h-8 w-full"
                              />
                              <p className="text-xs text-muted-foreground">
                                Delay before updating to avoid excessive requests
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-medium">On Data Source Change</Label>
                              <Select
                                value={variable.reactive?.onDataSourceChange || 'preserve'}
                                onValueChange={(value: "preserve" | "clear" | "revalidate" | "selectFirst") =>
                                  updateVariable(index, {
                                    reactive: {
                                      enabled: variable.reactive?.enabled ?? false,
                                      debounceMs: variable.reactive?.debounceMs,
                                      showLoadingOnUpdate: variable.reactive?.showLoadingOnUpdate,
                                      disableOnUpdate: variable.reactive?.disableOnUpdate,
                                      onDataSourceChange: value
                                    }
                                  })
                                }
                              >
                                <SelectTrigger className="h-8 w-full">
                                  <SelectValue placeholder="Select an option" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="preserve">Preserve</SelectItem>
                                  <SelectItem value="clear">Clear</SelectItem>
                                  <SelectItem value="revalidate">Revalidate</SelectItem>
                                  <SelectItem value="selectFirst">Select First</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium">Fallback Value</Label>
                            <Input
                              placeholder="Default value if source is unavailable"
                              value={variable.fallback?.value || ''}
                              onChange={(e) =>
                                updateVariable(index, {
                                  fallback: {
                                    value: e.target.value,
                                    strategy: variable.fallback?.strategy || 'useDefault'
                                  }
                                })
                              }
                              className="h-8"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Usage Examples */}
                  {variable.key && (
                    <Card className="p-3 bg-muted/30 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                      <div className="space-y-2">
                        <Label className="text-xs font-medium">Usage Examples</Label>
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="text-muted-foreground">URL:</span>
                            <code className="ml-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-1 rounded">
                              https://api.example.com/users/{"{{" + variable.key + "}}"}
                            </code>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Body:</span>
                            <code className="ml-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-1 rounded">
                              {"{"}"userId": "{"{{" + variable.key + "}}"}"{"}"}
                            </code>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Template Example */}
      {variables.length > 0 && (
        <Card className="p-4 bg-muted/20 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Template Example</Label>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted-foreground">API URL with variables:</span>
                <code className="block mt-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded text-xs">
                  https://api.example.com/data?
                  {variables.map((v, i) => (
                    v.key ? `${i > 0 ? '&' : ''}param${i + 1}={{${v.key}}}` : ''
                  )).filter(Boolean).join('')}
                </code>
              </div>

              <div>
                <span className="text-muted-foreground">Request body with variables:</span>
                <code className="block mt-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-2 rounded text-xs">
                  {JSON.stringify(
                    variables.reduce((acc, v) => {
                      if (v.key) acc[v.key] = `{{${v.key}}}`;
                      return acc;
                    }, {} as Record<string, string>),
                    null,
                    2
                  )}
                </code>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
