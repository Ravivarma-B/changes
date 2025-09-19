'use client';

import React, { useState } from "react";
import { Label } from "web-utils-components/label";
import { Input } from "web-utils-components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web-utils-components/select";
import { Card } from "web-utils-components/card";
import { Badge } from "web-utils-components/badge";
import { Button } from "web-utils-components/button";
import { AlertCircle, Code, ChevronDown, ChevronRight, HelpCircle, MapPin } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "web-utils-components/tooltip";
import { DataSourceConfig } from "../../../formBuilder.types";

interface MappingTabProps {
  config: DataSourceConfig;
  updateConfig: (updater: (prev: DataSourceConfig) => DataSourceConfig) => void;
  errors: Record<string, string>;
  onTestConnection?: () => Promise<any>; // Function to test the actual API
  isLoading?: boolean;
  apiResponse?: any; // Direct API response
}

export const MappingTab: React.FC<MappingTabProps> = ({
  config,
  updateConfig,
  errors,
  onTestConnection,
  isLoading = false,
  apiResponse
}) => {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);

  const dataMapping = config.dataMapping || {
    labelKey: '',
    valueKey: '',
    disabledKey: '',
    groupKey: '',
    rootPath: ''
  };

  const updateMapping = (updates: Partial<typeof dataMapping>) => {
    updateConfig(prev => ({
      ...prev,
      dataMapping: { ...dataMapping, ...updates }
    }));
  };

  // Extract available keys from API response
  const getAvailableKeys = () => {
    if (!apiResponse) return [];
    
    // Check if this is transformed data with _original wrapper (legacy support)
    const isTransformedData = Array.isArray(apiResponse) && 
      apiResponse.length > 0 && 
      apiResponse[0]._original;
    
    if (isTransformedData) {
      // Extract keys from the _original object (legacy support)
      const firstOriginal = apiResponse[0]._original;
      const itemKeys = Object.keys(firstOriginal);
      const nestedItemKeys = getNestedKeys(firstOriginal, '', 0);
      return [...new Set([...itemKeys, ...nestedItemKeys])];
    }
    
    // If root path is specified, get keys from the target array items
    if (dataMapping.rootPath) {
      const arrayData = getArrayFromPath(apiResponse, dataMapping.rootPath);
      if (arrayData.length > 0) {
        // Get keys from the first item in the target array
        const firstItem = arrayData[0];
        const itemKeys = Object.keys(firstItem);
        const nestedItemKeys = getNestedKeys(firstItem, '', 0);
        return [...new Set([...itemKeys, ...nestedItemKeys])];
      }
      return [];
    } else {
      // If no root path, treat data source as direct array or get all keys
      if (Array.isArray(apiResponse) && apiResponse.length > 0) {
        const firstItem = apiResponse[0];
        const itemKeys = Object.keys(firstItem);
        const nestedItemKeys = getNestedKeys(firstItem, '', 0);
        return [...new Set([...itemKeys, ...nestedItemKeys])];
      } else {
        // Fallback to all keys from data source
        const availableKeys = Object.keys(apiResponse);
        const nestedKeys = getNestedKeys(apiResponse, '', 0);
        return [...new Set([...availableKeys, ...nestedKeys])];
      }
    }
  };

  // Function to test API connection and get real data
  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    
    setIsTestingApi(true);
    try {
      await onTestConnection();
    } catch (error) {
      console.error('API test failed:', error);
    } finally {
      setIsTestingApi(false);
    }
  };

  const allKeys = getAvailableKeys();

  function getNestedKeys(obj: any, prefix: string, depth: number = 0): string[] {
    const keys: string[] = [];
    
    // Limit depth to prevent infinite recursion
    if (depth > 4) return keys;
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      keys.push(fullKey);
      
      if (obj[key] && typeof obj[key] === 'object') {
        if (Array.isArray(obj[key])) {
          // Handle arrays - check first item if it exists
          if (obj[key].length > 0 && typeof obj[key][0] === 'object') {
            // Add keys from array items
            const arrayItemKeys = getNestedKeys(obj[key][0], fullKey, depth + 1);
            keys.push(...arrayItemKeys);
          }
        } else {
          // Handle nested objects
          keys.push(...getNestedKeys(obj[key], fullKey, depth + 1));
        }
      }
    }
    
    return keys;
  }

  // Helper function to get the actual array from nested structure
  function getArrayFromPath(obj: any, rootPath: string): any[] {
    if (!rootPath) return Array.isArray(obj) ? obj : [];
    
    const parts = rootPath.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object') {
        current = current[part];
      } else {
        return [];
      }
    }
    
    return Array.isArray(current) ? current : [];
  }

  const renderKeySelector = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    required = false,
    tooltip?: string
  ) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="w-full">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            className={`w-full ${required && errors.mapping ? "border-destructive" : ""}`}
          >
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="w-full min-w-[200px]">
            {allKeys.map((key) => {
              // Get sample value from the correct context
              let sampleValue = null;
              if (apiResponse) {
            // Check if this is transformed data with _original wrapper (legacy)
            const isTransformedData = Array.isArray(apiResponse) && 
              apiResponse.length > 0 && 
              apiResponse[0]._original;
            
            if (isTransformedData) {
              // Get value from _original object (legacy support)
              sampleValue = getValueByPath(apiResponse[0]._original, key);
            } else if (dataMapping.rootPath) {
              const arrayData = getArrayFromPath(apiResponse, dataMapping.rootPath);
              if (arrayData.length > 0) {
                sampleValue = getValueByPath(arrayData[0], key);
              }
            } else if (Array.isArray(apiResponse) && apiResponse.length > 0) {
              sampleValue = getValueByPath(apiResponse[0], key);
            } else {
              sampleValue = getValueByPath(apiResponse, key);
            }
              }

              return (
            <SelectItem key={key} value={key}>
              <div className="flex items-center justify-between w-full">
                <span className="font-mono text-sm">{key}</span>
                {sampleValue !== null && (
                  <div className="ml-2 flex items-center gap-1">
                <Badge variant="outline" className="text-xs">
                  {typeof sampleValue}
                </Badge>
                <code className="text-xs bg-muted px-1 rounded max-w-20 truncate">
                  {String(sampleValue)}
                </code>
                  </div>
                )}
              </div>
            </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      
    </div>
  );

  function getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* API Connection Section */}
        {!apiResponse && (
          <Card className="p-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="w-4 h-4" />
                <div>
                  <p className="text-sm font-medium">Connect to your API to see available fields</p>
                  <p className="text-xs">Test your API endpoint to automatically detect available fields for mapping.</p>
                </div>
              </div>
              {onTestConnection && (
                <Button
                  onClick={handleTestConnection}
                  disabled={isTestingApi}
                  size="sm"
                  className="ml-4"
                >
                  {isTestingApi ? (
                    <>
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    'Test API'
                  )}
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Show success indicator for direct API data */}
        {apiResponse && (
          <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Code className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium">✓ API connected successfully</p>
                <p className="text-xs">
                  Showing fields directly from your API response. No sample data needed!
                </p>
              </div>
            </div>
          </Card>
        )}
       
      {/* Collapsible Common Mapping Examples */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Common Mapping Examples
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExamplesOpen(!isExamplesOpen)}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
            >
              {isExamplesOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <span className="ml-1 text-xs">
                {isExamplesOpen ? 'Hide' : 'Show'} examples
              </span>
            </Button>
          </div>
          
          {isExamplesOpen && (
            <div className="space-y-4 text-sm animate-in slide-in-from-top-2 duration-200">
              <div>
                <p className="font-medium">1. Simple nested array (like yours):</p>
                <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto">
{`{
  "pageSize": 10,
  "data": [
    { "id": 1, "name": "Security", "code": "D006" }
  ]
}`}
                </pre>
                <div className="mt-2 space-y-1 text-xs">
                  <p>• <strong>Root Path:</strong> <code className="bg-muted px-1 rounded">data</code></p>
                  <p>• <strong>Label Key:</strong> <code className="bg-muted px-1 rounded">name</code></p>
                  <p>• <strong>Value Key:</strong> <code className="bg-muted px-1 rounded">id</code></p>
                </div>
              </div>
              
              <div>
                <p className="font-medium">2. Deeper nested structure:</p>
                <pre className="text-xs bg-background p-2 rounded mt-1">
{`{
  "response": {
    "departments": {
      "list": [
        { "id": 1, "title": "HR", "active": true }
      ]
    }
  }
}`}
                </pre>
                <div className="mt-2 space-y-1 text-xs">
                  <p>• <strong>Root Path:</strong> <code className="bg-muted px-1 rounded">response.departments.list</code></p>
                  <p>• <strong>Label Key:</strong> <code className="bg-muted px-1 rounded">title</code></p>
                  <p>• <strong>Value Key:</strong> <code className="bg-muted px-1 rounded">id</code></p>
                </div>
              </div>

              <div>
                <p className="font-medium">3. Direct array response:</p>
                <pre className="text-xs bg-background p-2 rounded mt-1">
{`[
  { "id": 1, "title": "Option 1" },
  { "id": 2, "title": "Option 2" }
]`}
                </pre>
                <div className="mt-2 space-y-1 text-xs">
                  <p>• <strong>Root Path:</strong> <em>(leave empty)</em></p>
                  <p>• <strong>Label Key:</strong> <code className="bg-muted px-1 rounded">title</code></p>
                  <p>• <strong>Value Key:</strong> <code className="bg-muted px-1 rounded">id</code></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Root Path for Nested Data */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">Root Path (Optional)</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                Use dot notation to navigate to the array containing your options.
                <br />
                Examples: <code>data</code>, <code>response.items</code>, <code>api.v1.departments</code>
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          placeholder="e.g., data"
          value={dataMapping.rootPath}
          onChange={(e) => updateMapping({ rootPath: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty if your API response is already an array at the root level
        </p>
      </div>

      {/* Field Mappings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {dataMapping.rootPath && (
          <Card className="col-span-full p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1"> <MapPin /> Context: Mapping from array items</p>
              <p className="text-xs">
                Since you've set <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">rootPath: {dataMapping.rootPath}</code>, 
                the keys below refer to properties within each item of that array, not the root response.
              </p>
            </div>
          </Card>
        )}

        {renderKeySelector(
          'Label Key',
          dataMapping.labelKey,
          (value) => updateMapping({ labelKey: value }),
          true,
          'The field that contains the text displayed to users in the dropdown'
        )}

        {renderKeySelector(
          'Value Key',
          dataMapping.valueKey,
          (value) => updateMapping({ valueKey: value }),
          true,
          'The field that contains the actual value submitted when the option is selected'
        )}

        {renderKeySelector(
          'Disabled Key',
          dataMapping.disabledKey || '',
          (value) => updateMapping({ disabledKey: value }),
          false,
          'Optional: A boolean field that determines if the option should be disabled'
        )}

        {renderKeySelector(
          'Group Key',
          dataMapping.groupKey || '',
          (value) => updateMapping({ groupKey: value }),
          false,
          'Optional: Field used to group related options together in the dropdown'
        )}
      </div>

      {errors.mapping && (
        <p className="text-sm text-destructive">{errors.mapping}</p>
      )}

      {/* API Response Preview */}
      {apiResponse && (
        <Card className="p-4 bg-muted/20">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <Label className="text-sm font-medium">API Response Structure</Label>
            </div>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-32 bg-background p-3 rounded border">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </Card>
      )}

      {/* Mapping Preview */}
      {apiResponse && dataMapping.labelKey && dataMapping.valueKey && (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="space-y-3">
            <Label className="text-sm font-medium text-green-800 dark:text-green-200">
              Mapping Preview
            </Label>
            <div className="space-y-2">
              {(() => {
                // Check if this is transformed data with _original wrapper (legacy)
                const isTransformedData = Array.isArray(apiResponse) && 
                  apiResponse.length > 0 && 
                  apiResponse[0]._original;
                
                let firstItem;
                let arrayLength;
                
                if (isTransformedData) {
                  firstItem = apiResponse[0]._original;
                  arrayLength = apiResponse.length;
                } else {
                  const arrayData = getArrayFromPath(apiResponse, dataMapping.rootPath || '');
                  firstItem = arrayData[0];
                  arrayLength = arrayData.length;
                }
                
                if (!firstItem) {
                  return (
                    <p className="text-sm text-muted-foreground">
                      No data found at root path: {dataMapping.rootPath || '(root)'}
                    </p>
                  );
                }

                return (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Label:</span>{' '}
                        <code className="bg-background px-1 rounded text-xs">
                          {getValueByPath(firstItem, dataMapping.labelKey) || 'undefined'}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Value:</span>{' '}
                        <code className="bg-background px-1 rounded text-xs">
                          {getValueByPath(firstItem, dataMapping.valueKey) || 'undefined'}
                        </code>
                      </div>
                    </div>
                    
                    {dataMapping.disabledKey && (
                      <div>
                        <span className="font-medium">Disabled:</span>{' '}
                        <code className="bg-background px-1 rounded text-xs">
                          {String(getValueByPath(firstItem, dataMapping.disabledKey))}
                        </code>
                      </div>
                    )}
                    
                    {dataMapping.groupKey && (
                      <div>
                        <span className="font-medium">Group:</span>{' '}
                        <code className="bg-background px-1 rounded text-xs">
                          {getValueByPath(firstItem, dataMapping.groupKey) || 'undefined'}
                        </code>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mt-2">
                      Preview from first item in array ({arrayLength} total items found)
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </Card>
      )}
      </div>
    </TooltipProvider>
  );
};
