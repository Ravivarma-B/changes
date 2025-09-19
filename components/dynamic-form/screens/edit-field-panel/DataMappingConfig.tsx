'use client';

import React, { useState, useEffect } from 'react';
import { Card } from 'web-utils-components/card';
import { Label } from 'web-utils-components/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'web-utils-components/select';
import { Button } from 'web-utils-components/button';
import { Badge } from 'web-utils-components/badge';
import { Eye, Database, Globe } from 'lucide-react';
import { DataSourceConfig } from '../../formBuilder.types';
import { predefinedDatasetsService, PredefinedDataset } from '../../services/predefinedDatasetsService';

interface DataMappingConfigProps {
  config: DataSourceConfig;
  onConfigUpdate: (config: DataSourceConfig) => void;
  onPreview: () => void;
}

export const DataMappingConfig: React.FC<DataMappingConfigProps> = ({
  config,
  onConfigUpdate,
  onPreview
}) => {
  const [availableKeys, setAvailableKeys] = useState<string[]>([]);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config.type === 'predefined' && config.presetName) {
      const keys = predefinedDatasetsService.getDatasetKeys(config.presetName);
      const sample = predefinedDatasetsService.getSampleData(config.presetName);
      setAvailableKeys(keys);
      setSampleData(sample);
    } else if (config.type === 'api' && sampleData.length > 0) {
      // Extract keys from sample API data
      const keys = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
      setAvailableKeys(keys);
    } else {
      setAvailableKeys([]);
      setSampleData([]);
    }
  }, [config.type, config.presetName, sampleData.length]);

  const handleMappingChange = (field: string, value: string) => {
    const updatedConfig = {
      ...config,
      dataMapping: {
        labelKey: '',
        valueKey: '',
        ...config.dataMapping,
        [field]: value
      }
    };
    onConfigUpdate(updatedConfig);
  };

  const handlePresetChange = (presetName: string) => {
    const updatedConfig = {
      ...config,
      presetName,
      dataMapping: {
        labelKey: 'name',
        valueKey: 'id',
        ...config.dataMapping
      }
    };
    onConfigUpdate(updatedConfig);
  };

  const renderKeySelector = (field: string, label: string, required: boolean = true) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={config.dataMapping?.[field as keyof typeof config.dataMapping] || ''}
        onValueChange={(value) => handleMappingChange(field, value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {availableKeys.map((key) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{key}</span>
                {sampleData.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
                    e.g., {String(sampleData[0]?.[key] || '').substring(0, 20)}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (config.type === 'manual') {
    return null; // Manual doesn't need data mapping
  }

  return (
    <Card className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        {config.type === 'api' ? (
          <Globe className="w-4 h-4 text-green-500" />
        ) : (
          <Database className="w-4 h-4 text-purple-500" />
        )}
        <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Data Mapping Configuration
        </Label>
      </div>

      {config.type === 'predefined' && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Predefined Dataset <span className="text-red-500">*</span>
          </Label>
          <Select value={config.presetName || ''} onValueChange={handlePresetChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a dataset" />
            </SelectTrigger>
            <SelectContent>
              {predefinedDatasetsService.getAvailableDatasets().map((dataset: PredefinedDataset) => (
                <SelectItem key={dataset.id} value={dataset.id}>
                  <div className="space-y-1">
                    <div className="font-medium">{dataset.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {dataset.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {availableKeys.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderKeySelector('labelKey', 'Label Field')}
            {renderKeySelector('valueKey', 'Value Field')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderKeySelector('disabledKey', 'Disabled Field', false)}
            {renderKeySelector('groupKey', 'Group Field', false)}
          </div>

          {config.type === 'api' && renderKeySelector('rootPath', 'Root Path (JSONPath)', false)}

          {sampleData.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Sample Data Preview
              </Label>
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md p-3 max-h-32 overflow-auto">
                <pre className="text-xs text-gray-700 dark:text-gray-300">
                  {JSON.stringify(sampleData.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {availableKeys.length} fields available
              </Badge>
              {config.dataMapping?.labelKey && config.dataMapping?.valueKey && (
                <Badge className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  Mapping configured
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              disabled={!config.dataMapping?.labelKey || !config.dataMapping?.valueKey}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Eye className="w-4 h-4 mr-2" />
              Test Mapping
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};
