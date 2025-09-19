'use client';

import React from "react";
import { Label } from "web-utils-components/label";
import { Input } from "web-utils-components/input";
import { Button } from "web-utils-components/button";
import { Card } from "web-utils-components/card";
import { Switch } from "web-utils-components/switch";
import { Trash2, Plus } from "lucide-react";
import { DataSourceConfig } from "../../../formBuilder.types";

interface ManualOptionsTabProps {
  config: DataSourceConfig;
  updateConfig: (updater: (prev: DataSourceConfig) => DataSourceConfig) => void;
  errors: Record<string, string>;
}

export const ManualOptionsTab: React.FC<ManualOptionsTabProps> = ({
  config,
  updateConfig,
  errors
}) => {
  const options = config.manualOptions || [];

  const addOption = () => {
    updateConfig(prev => ({
      ...prev,
      manualOptions: [...(prev.manualOptions || []), { label: '', value: '', disabled: false }]
    }));
  };

  const removeOption = (index: number) => {
    updateConfig(prev => ({
      ...prev,
      manualOptions: prev.manualOptions?.filter((_, i) => i !== index) || []
    }));
  };

  const updateOption = (index: number, field: string, value: string | boolean) => {
    updateConfig(prev => ({
      ...prev,
      manualOptions: prev.manualOptions?.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      ) || []
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configuration Name */}
      <div className="space-y-2">
        <Label htmlFor="config-name" className="text-sm font-medium">
          Configuration Name
        </Label>
        <Input
          id="config-name"
          placeholder="e.g., Status Options, Priority Levels"
          value={config.name}
          onChange={(e) => updateConfig(prev => ({ ...prev, name: e.target.value }))}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Options List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Options</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Option
          </Button>
        </div>

        {options.length === 0 ? (
          <Card className="p-6 text-center border-dashed">
            <p className="text-muted-foreground mb-3">No options added yet</p>
            <Button variant="outline" onClick={addOption} className="gap-2">
              <Plus className="w-4 h-4" />
              Add First Option
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {options.map((option, index) => (
              <Card key={index} className="p-4 border bg-card">
                <div className="flex items-center gap-3">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Input
                        placeholder="Label e.g., Active, High Priority"
                        value={option.label}
                        onChange={(e) => updateOption(index, 'label', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Input
                        placeholder="Value e.g., active, high"
                        value={option.value}
                        onChange={(e) => updateOption(index, 'value', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={!option.disabled}
                        onCheckedChange={(checked) => updateOption(index, 'disabled', !checked)}
                        className="scale-75"
                      />
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">Enabled</Label>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {errors.manual && (
          <p className="text-sm text-destructive">{errors.manual}</p>
        )}
      </div>

      {/* Preview */}
      {options.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Preview</Label>
          <Card className="p-4 bg-muted/20">
            <div className="space-y-2">
              {options.map((option, index) => (
                <div 
                  key={index} 
                  className={`flex justify-between text-sm p-2 rounded ${
                    option.disabled ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  <span>{option.label || 'Untitled'}</span>
                  <span className="text-muted-foreground font-mono text-xs">
                    {option.value || 'no-value'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
