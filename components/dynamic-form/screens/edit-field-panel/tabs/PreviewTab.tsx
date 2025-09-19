'use client';

import React from "react";
import { Label } from "web-utils-components/label";
import { Button } from "web-utils-components/button";
import { Card } from "web-utils-components/card";
import { Badge } from "web-utils-components/badge";
import { ScrollArea } from "web-utils-components/scroll-area";
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Play, 
  RefreshCw,
  Database,
  Clock,
  Eye,
  Copy
} from "lucide-react";
import { DataSourceConfig, DataSourceResponse } from "../../../formBuilder.types";

interface PreviewTabProps {
  config: DataSourceConfig;
  response: DataSourceResponse | null;
  onTest: () => void;
  testing: boolean;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({
  config,
  response,
  onTest,
  testing
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (success: boolean) => {
    return success ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Data Source Preview</Label>
          <p className="text-xs text-muted-foreground">
            Test your configuration and preview the data structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            disabled={testing || !config.name}
            className="gap-2"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Test Connection
              </>
            )}
          </Button>
          
          {response && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onTest}
              disabled={testing}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Configuration Summary */}
      <Card className="p-4 bg-muted/20">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Configuration Summary</Label>
            <Badge variant="outline">{config.type}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 font-medium">{config.name || 'Untitled'}</span>
            </div>
            
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium capitalize">{config.type}</span>
            </div>

            {config.type === 'api' && config.apiConfig && (
              <>
                <div>
                  <span className="text-muted-foreground">Method:</span>
                  <span className="ml-2 font-medium">{config.apiConfig.method}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Cache:</span>
                  <span className="ml-2 font-medium">
                    {config.apiConfig.cacheEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </>
            )}

            {config.type === 'predefined' && (
              <div>
                <span className="text-muted-foreground">Preset:</span>
                <span className="ml-2 font-medium">{config.presetName}</span>
              </div>
            )}

            {config.type === 'manual' && (
              <div>
                <span className="text-muted-foreground">Options:</span>
                <span className="ml-2 font-medium">
                  {config.manualOptions?.length || 0} items
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Test Results */}
      {!response && !testing && (
        <Card className="p-6 text-center border-dashed">
          <div className="space-y-3">
            <Database className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-muted-foreground mb-1">No data preview available</p>
              <p className="text-xs text-muted-foreground">
                Click "Test Connection" to preview your data source
              </p>
            </div>
          </div>
        </Card>
      )}

      {testing && (
        <Card className="p-6 text-center">
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
            <div>
              <p className="text-muted-foreground">Testing connection...</p>
              <p className="text-xs text-muted-foreground">
                This may take a few seconds
              </p>
            </div>
          </div>
        </Card>
      )}

      {response && (
        <div className="space-y-4">
          {/* Status */}
          <Card className={`p-4 border ${
            response.success 
              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20' 
              : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(response.success)}
                <span className={`font-medium ${getStatusColor(response.success)}`}>
                  {response.success ? 'Test Successful' : 'Test Failed'}
                </span>
              </div>
              
              {response.metadata && (
                <div className="flex items-center gap-4 text-sm">
                  {response.metadata.cached && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Cached
                    </Badge>
                  )}
                  <span className="text-muted-foreground">
                    {response.metadata.total} items
                  </span>
                </div>
              )}
            </div>

            {response.error && (
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <strong>Error:</strong> {response.error}
              </div>
            )}
          </Card>

          {/* Data Preview */}
          {response.success && response.data.length > 0 && (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Data Preview</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(response.data, null, 2))}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </Button>
                    <Badge variant="outline">
                      {response.data.length} items
                    </Badge>
                  </div>
                </div>

                {/* First few items as cards */}
                <div className="space-y-2">
                  {response.data.slice(0, 3).map((item, index) => (
                    <Card key={index} className="p-3 bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm">
                            {item.label || item.name || item.title || `Item ${index + 1}`}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {item.value || item.id || item.key || `value-${index}`}
                          </div>
                        </div>
                        
                        {item.disabled && (
                          <Badge variant="secondary" className="text-xs">
                            Disabled
                          </Badge>
                        )}
                        
                        {item.group && (
                          <Badge variant="outline" className="text-xs">
                            {item.group}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}

                  {response.data.length > 3 && (
                    <div className="text-center py-2">
                      <span className="text-sm text-muted-foreground">
                        ... and {response.data.length - 3} more items
                      </span>
                    </div>
                  )}
                </div>

                {/* Raw JSON Data */}
                <details className="space-y-2">
                  <summary className="cursor-pointer text-sm font-medium hover:text-primary">
                    <span className="inline-flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      View Raw JSON Data
                    </span>
                  </summary>
                  
                  <ScrollArea className="h-64 w-full">
                    <pre className="text-xs bg-muted p-3 rounded border overflow-auto">
                      {JSON.stringify(response.data, null, 2)}
                    </pre>
                  </ScrollArea>
                </details>
              </div>
            </Card>
          )}

          {response.success && response.data.length === 0 && (
            <Card className="p-6 text-center border-dashed">
              <div className="space-y-3">
                <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
                <div>
                  <p className="text-muted-foreground mb-1">No data returned</p>
                  <p className="text-xs text-muted-foreground">
                    The API returned successfully but with no data items
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
