'use client';

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "web-utils-components/dialog";
import { Button } from "web-utils-components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "web-utils-components/tabs";
import { Badge } from "web-utils-components/badge";
import { Separator } from "web-utils-components/separator";
import { ScrollArea } from "web-utils-components/scroll-area";
import { 
  Database, 
  Globe, 
  Settings, 
  Code, 
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Play
} from "lucide-react";

import { DataSourceConfig, DataSourceResponse } from "../../formBuilder.types";
import { dataSourceService } from "../../services/dataSourceService";
import { ManualOptionsTab } from "./tabs/ManualOptionsTab";
import { ApiConfigTab } from "./tabs/ApiConfigTab";
import { PredefinedTab } from "./tabs/PredefinedTab";
import { MappingTab } from "./tabs/MappingTab";
import { VariablesTab } from "./tabs/VariablesTab";
import { PreviewTab } from "./tabs/PreviewTab";
import { generateUniqueId } from "../../utils/FormUtils";

interface DataSourceConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: DataSourceConfig | null;
  onSave: (config: DataSourceConfig) => void;
  fieldType: 'dropdown' | 'select' | 'multiselect';
}

export const DataSourceConfigDialog: React.FC<DataSourceConfigDialogProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
  fieldType
}) => {
  const [currentConfig, setCurrentConfig] = useState<DataSourceConfig>(() => 
    config || {
      id: generateUniqueId(),
      name: '',
      type: 'manual',
      manualOptions: [{ label: '', value: '' }]
    }
  );

  const [activeTab, setActiveTab] = useState<string>('source');
  const [testResponse, setTestResponse] = useState<DataSourceResponse | null>(null);
  const [testing, setTesting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (config) {
      setCurrentConfig(config);
    } else {
      setCurrentConfig({
        id: generateUniqueId(),
        name: '',
        type: 'manual',
        manualOptions: [{ label: '', value: '' }]
      });
    }
    setTestResponse(null);
    setErrors({});
  }, [config, open]);

  const updateConfig = useCallback((updater: (prev: DataSourceConfig) => DataSourceConfig) => {
    setCurrentConfig(updater);
    setErrors({});
  }, []);

  const validateConfig = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!currentConfig.name.trim()) {
      newErrors.name = 'Name is required';
    }

    switch (currentConfig.type) {
      case 'manual':
        if (!currentConfig.manualOptions?.length || 
            currentConfig.manualOptions.some((opt: any) => !opt.label.trim() || !opt.value.trim())) {
          newErrors.manual = 'All options must have label and value';
        }
        break;
      case 'api':
        if (!currentConfig.apiConfig?.url.trim()) {
          newErrors.api = 'API URL is required';
        }
        if (!currentConfig.dataMapping?.labelKey || !currentConfig.dataMapping?.valueKey) {
          newErrors.mapping = 'Label and value keys are required';
        }
        break;
      case 'predefined':
        if (!currentConfig.presetName?.trim()) {
          newErrors.predefined = 'Preset selection is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentConfig]);

  const handleTest = async () => {
    if (!validateConfig()) return;

    setTesting(true);
    try {
      const response = await dataSourceService.fetchData(currentConfig);
      setTestResponse(response);
      if (response.success) {
        setActiveTab('preview');
      }
    } catch (error) {
      setTestResponse({
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Test failed'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (!validateConfig()) return;
    onSave(currentConfig);
    onOpenChange(false);
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'source': return <Database className="w-4 h-4" />;
      case 'mapping': return <Code className="w-4 h-4" />;
      case 'variables': return <Settings className="w-4 h-4" />;
      case 'preview': return <Play className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusBadge = () => {
    if (testing) {
      return (
        <Badge variant="secondary" className="gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
          <Loader2 className="w-3 h-3 animate-spin" />
          Testing...
        </Badge>
      );
    }

    if (testResponse) {
      return (
        <Badge 
          variant={testResponse.success ? "default" : "destructive"} 
          className={`gap-1 ${
            testResponse.success 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700'
          }`}
        >
          {testResponse.success ? (
            <>
              <CheckCircle className="w-3 h-3" />
              {testResponse.data.length} items loaded
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              Error
            </>
          )}
        </Badge>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Configure Data Source
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up dynamic data for your {fieldType} field
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={testing || !currentConfig.name}
                className="gap-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                {testing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Test
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex overflow-hidden bg-white dark:bg-gray-900">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 w-full"
            orientation="horizontal"
          >
            <div className="border-b w-full border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex-shrink-0">
              <TabsList className="h-12 p-1 bg-transparent w-full justify-start">
                <TabsTrigger value="source" className="gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:dark:border-gray-700 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:dark:text-gray-100">
                  {getTabIcon('source')}
                  Data Source
                </TabsTrigger>
                
                {(currentConfig.type === 'api' || currentConfig.type === 'predefined') && (
                  <TabsTrigger value="mapping" className="gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:dark:border-gray-700 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:dark:text-gray-100">
                    {getTabIcon('mapping')}
                    Data Mapping
                  </TabsTrigger>
                )}
                
                {currentConfig.type === 'api' && (
                  <TabsTrigger value="variables" className="gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:dark:border-gray-700 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:dark:text-gray-100">
                    {getTabIcon('variables')}
                    Variables
                  </TabsTrigger>
                )}
                
                <TabsTrigger value="preview" className="gap-2 data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:dark:border-gray-700 text-gray-600 dark:text-gray-400 data-[state=active]:text-gray-900 data-[state=active]:dark:text-gray-100">
                  {getTabIcon('preview')}
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 w-full min-h-0 overflow-auto bg-white dark:bg-gray-900">
              <div className="p-6 bg-white dark:bg-gray-900 w-full min-h-full">
                  <TabsContent value="source" className="mt-0">
                    {currentConfig.type === 'manual' && (
                      <ManualOptionsTab 
                        config={currentConfig}
                        updateConfig={updateConfig}
                        errors={errors}
                      />
                    )}
                    
                    {currentConfig.type === 'api' && (
                      <ApiConfigTab 
                        config={currentConfig}
                        updateConfig={updateConfig}
                        errors={errors}
                      />
                    )}
                    
                    {currentConfig.type === 'predefined' && (
                      <PredefinedTab 
                        config={currentConfig}
                        updateConfig={updateConfig}
                        errors={errors}
                      />
                    )}
                  </TabsContent>

                  {(currentConfig.type === 'api' || currentConfig.type === 'predefined') && (
                    <TabsContent value="mapping" className="mt-0">
                      <MappingTab 
                        config={currentConfig}
                        updateConfig={updateConfig}
                        errors={errors}
                        apiResponse={testResponse?.data}
                        onTestConnection={handleTest}
                        isLoading={testing}
                      />
                    </TabsContent>
                  )}

                  {currentConfig.type === 'api' && (
                    <TabsContent value="variables" className="mt-0">
                      <VariablesTab 
                        config={currentConfig}
                        updateConfig={updateConfig}
                        errors={errors}
                      />
                    </TabsContent>
                  )}

                  <TabsContent value="preview" className="mt-0">
                    <PreviewTab 
                      config={currentConfig}
                      response={testResponse}
                      onTest={handleTest}
                      testing={testing}
                    />
                  </TabsContent>
                </div>
            </div>
          </Tabs>
        </div>

        <Separator className="border-gray-200 dark:border-gray-800 flex-shrink-0" />
        
        <DialogFooter className="p-6 pt-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(errors).length > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  Please fix {Object.keys(errors).length} error(s) before saving
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={Object.keys(errors).length > 0 || !currentConfig.name}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500"
              >
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
