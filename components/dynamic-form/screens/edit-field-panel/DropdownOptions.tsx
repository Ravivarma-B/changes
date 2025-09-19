'use client';

import { useState, useCallback, useEffect } from "react";
import { Settings, Database, Globe, Code, Plus, Edit, AlertTriangle } from "lucide-react";
import { Label } from "web-utils-components/label";
import { Button } from "web-utils-components/button";
import { Card } from "web-utils-components/card";
import { Badge } from "web-utils-components/badge";
import { Separator } from "web-utils-components/separator";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from "web-utils-components/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "web-utils-components/dialog";
import { FormFieldType, DataSourceConfig } from "../../formBuilder.types";
import { DEFAULT_LANGUAGE, fieldLabels } from "../../constants/locale";
import { DataSourceConfigDialog } from "./DataSourceConfigDialog";
import { DataMappingConfig } from "./DataMappingConfig";
import { dataSourceService } from "../../services/dataSourceService";
import { generateUniqueId } from "../../utils/FormUtils";

type DropdownOptionsProps = {
  editedField: FormFieldType | null;
  selectedLanguage?: string;
  closePopover?: () => void;
  updateField: (updater: (prev: FormFieldType) => FormFieldType) => void;
};

export const DropdownOptions: React.FC<DropdownOptionsProps> = ({
  editedField,
  selectedLanguage,
  updateField,
  closePopover
}) => {
  const [dataSourceType, setDataSourceType] = useState<string>('manual');
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState<string>('');
  const [currentConfig, setCurrentConfig] = useState<DataSourceConfig | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from editedField
  useEffect(() => {
    if (editedField?.dataSourceConfig) {
      // Use new dataSourceConfig format
      setCurrentConfig(editedField.dataSourceConfig);
      setDataSourceType(editedField.dataSourceConfig.type);
      loadPreviewData(editedField.dataSourceConfig);
    } else if (editedField?.dataSourceType && editedField.dataSourceDetails) {
      // Convert legacy dataSourceDetails to new format
      const legacyConfig: DataSourceConfig = {
        id: generateUniqueId(),
        name: 'Legacy Configuration',
        type: editedField.dataSourceType as any,
        dataMapping: {
          labelKey: editedField.dataSourceDetails.labelKey,
          valueKey: editedField.dataSourceDetails.valueKey
        },
        ...(editedField.dataSourceType === 'api' && {
          apiConfig: {
            url: editedField.dataSourceDetails.source,
            method: 'GET',
            headers: [],
            auth: { type: 'none' },
            timeout: 30000,
            retryCount: 3,
            cacheEnabled: false,
            cacheDuration: 300
          }
        }),
        ...(editedField.dataSourceType === 'predefined' && {
          presetName: editedField.dataSourceDetails.source
        })
      };
      setCurrentConfig(legacyConfig);
      setDataSourceType(editedField.dataSourceType);
      loadPreviewData(legacyConfig);
    } else if (editedField?.options && editedField.options.length > 0) {
      // Convert legacy options to manual config
      const legacyConfig: DataSourceConfig = {
        id: generateUniqueId(),
        name: 'Legacy Options',
        type: 'manual',
        manualOptions: editedField.options.map((opt: any) => ({
          label: opt.label,
          value: opt.value,
          disabled: false
        }))
      };
      setCurrentConfig(legacyConfig);
      setDataSourceType('manual');
      setPreviewData(legacyConfig.manualOptions || []);
    } else {
      // No configuration exists
      setCurrentConfig(null);
      setDataSourceType('manual');
      setPreviewData([]);
    }
  }, [editedField]);

  const loadPreviewData = async (config: DataSourceConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await dataSourceService.fetchData(config);
      if (response.success) {
        setPreviewData(response.data.slice(0, 5)); // Show first 5 items
      } else {
        setError(response.error || 'Failed to load data');
        setPreviewData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPreviewData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSave = (config: DataSourceConfig) => {
    setCurrentConfig(config);
    setDataSourceType(config.type);
    
    updateField((prev) => ({
      ...prev,
      dataSourceType: config.type,
      dataSourceConfig: config,
      // Clear legacy options when using new config
      options: config.type === 'manual' && config.manualOptions 
        ? config.manualOptions.map(opt => ({ label: opt.label, value: opt.value }))
        : []
    }));

    loadPreviewData(config);
  };

  const handleTypeChange = (newType: string) => {
    if (currentConfig && currentConfig.type !== newType) {
      // Show confirmation dialog if changing from an existing configuration
      setPendingType(newType);
      setConfirmDialogOpen(true);
    } else {
      confirmTypeChange(newType);
    }
  };

  const confirmTypeChange = (newType: string) => {
    setDataSourceType(newType);
    
    // Create a new config for the selected type
    const newConfig: DataSourceConfig = {
      id: generateUniqueId(),
      name: `${newType.charAt(0).toUpperCase() + newType.slice(1)} Configuration`,
      type: newType as any,
      ...(newType === 'manual' && { manualOptions: [{ label: '', value: '' }] }),
      ...(newType === 'api' && { 
        apiConfig: {
          url: '',
          method: 'GET',
          headers: [],
          auth: { type: 'none' },
          timeout: 30000,
          retryCount: 3,
          cacheEnabled: false,
          cacheDuration: 300
        },
        dataMapping: { labelKey: 'label', valueKey: 'value' }
      }),
      ...(newType === 'predefined' && { 
        presetName: '',
        dataMapping: { labelKey: 'label', valueKey: 'value' }
      })
    };
    
    setCurrentConfig(newConfig);
    setConfigDialogOpen(true);
    setConfirmDialogOpen(false);
  };

  const handleCreateNew = (type: string) => {
    confirmTypeChange(type);
  };

  const handleEdit = () => {
    if (currentConfig) {
      setConfigDialogOpen(true);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'manual': return <Edit className="w-4 h-4" />;
      case 'api': return <Globe className="w-4 h-4" />;
      case 'predefined': return <Database className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-500';
      case 'api': return 'bg-green-500';
      case 'predefined': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!editedField) return null;

  const fieldTypeDisplay = editedField.variant;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Data Source Configuration
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure dynamic options for your {fieldTypeDisplay} field
            </p>
          </div>
          <Badge variant="outline" className="capitalize border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800">
            <span className="text-gray-500 dark:text-gray-400">{editedField.label[selectedLanguage || DEFAULT_LANGUAGE] }</span>
          </Badge>
        </div>
      </div>

      <Separator className="border-gray-200 dark:border-gray-800" />
      <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-auto">
        {/* Current Configuration */}
        {currentConfig ? (
          <div className="space-y-4">
            {/* Type Switcher */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Data Source Type</Label>
                <Select value={currentConfig.type} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual Options</SelectItem>
                    <SelectItem value="api">API Endpoint</SelectItem>
                    <SelectItem value="predefined">Predefined Dataset</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You can switch between different data source types. Your configuration will be reset when changing types.
                </p>
              </div>
            </Card>

            {/* Data Mapping Configuration */}
            {(currentConfig.type === 'api' || currentConfig.type === 'predefined') && (
              <DataMappingConfig
                config={currentConfig}
                onConfigUpdate={(updatedConfig) => {
                  setCurrentConfig(updatedConfig);
                  updateField((prev) => ({
                    ...prev,
                    dataSourceType: updatedConfig.type,
                    dataSourceConfig: updatedConfig
                  }));
                }}
                onPreview={() => loadPreviewData(currentConfig)}
              />
            )}

            {/* Current Configuration Details */}
            <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${getTypeColor(currentConfig.type)} text-white shadow-sm`}>
                      {getTypeIcon(currentConfig.type)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {currentConfig.name || 'Untitled Configuration'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                        {currentConfig.type} data source
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleEdit}
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                {loading && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">Loading preview...</div>
                )}
                
                {error && (
                  <div className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/20 p-2 rounded border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                {previewData.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Preview ({previewData.length} of {currentConfig.manualOptions?.length || '?'} items)</Label>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {previewData.map((item, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm"
                        >
                          <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                          <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          /* New Configuration Selection */
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Choose Data Source Type
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                {
                  type: 'manual',
                  title: 'Manual Options',
                  description: 'Define options manually with labels and values',
                  icon: <Edit className="w-5 h-5" />,
                  color: 'blue'
                },
                {
                  type: 'api',
                  title: 'API Endpoint',
                  description: 'Fetch options from a REST API with authentication',
                  icon: <Globe className="w-5 h-5" />,
                  color: 'green'
                },
                {
                  type: 'predefined',
                  title: 'Predefined Dataset',
                  description: 'Use built-in datasets like countries, states',
                  icon: <Database className="w-5 h-5" />,
                  color: 'purple'
                }
              ].map((option) => (
                <Card 
                  key={option.type}
                  className="p-4 cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all bg-white dark:bg-gray-900"
                  onClick={() => handleCreateNew(option.type)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-md bg-${option.color}-500 text-white shadow-sm`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Options */}
        {currentConfig && (
          <Card className="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">Field Behavior</Label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Field Type:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">{fieldTypeDisplay}</span>
                </div>
                
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Data Source:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100 capitalize">{currentConfig.type}</span>
                </div>
                
                {currentConfig.type === 'api' && currentConfig.apiConfig?.cacheEnabled && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Caching:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                      {currentConfig.apiConfig.cacheDuration}s
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Options Count:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
                    {previewData.length > 0 ? `${previewData.length}+` : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Configuration Dialog */}
        <DataSourceConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          config={currentConfig}
          onSave={handleConfigSave}
          fieldType={fieldTypeDisplay as any}
        />

        {/* Type Change Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
          <DialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Change Data Source Type
              </DialogTitle>
              <DialogDescription className="text-gray-600 dark:text-gray-400">
                Changing the data source type will reset your current configuration. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setConfirmDialogOpen(false)}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => confirmTypeChange(pendingType)}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button 
          variant="outline" 
          onClick={() => closePopover?.()}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </Button>
        
        <Button 
          onClick={() => closePopover?.()} 
          disabled={!currentConfig}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-500"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
