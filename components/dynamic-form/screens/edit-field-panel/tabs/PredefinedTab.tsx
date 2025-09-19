'use client';

import React from "react";
import { Label } from "web-utils-components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web-utils-components/select";
import { Card } from "web-utils-components/card";
import { Badge } from "web-utils-components/badge";
import { DataSourceConfig } from "../../../formBuilder.types";
import { DropdownPresets } from "../../../constants";

interface PredefinedTabProps {
  config: DataSourceConfig;
  updateConfig: (updater: (prev: DataSourceConfig) => DataSourceConfig) => void;
  errors: Record<string, string>;
}

export const PredefinedTab: React.FC<PredefinedTabProps> = ({
  config,
  updateConfig,
  errors
}) => {
  return (
    <div className="space-y-6">
      {/* Configuration Name */}
      <div className="space-y-2">
        <Label htmlFor="predefined-config-name" className="text-sm font-medium">
          Configuration Name
        </Label>
        <input
          id="predefined-config-name"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="e.g., Countries List, States Data"
          value={config.name}
          onChange={(e) => updateConfig(prev => ({ ...prev, name: e.target.value }))}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      {/* Preset Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select Predefined Dataset</Label>
        <Select
          value={config.presetName || ''}
          onValueChange={(value) => updateConfig(prev => ({ ...prev, presetName: value }))}
        >
          <SelectTrigger className={errors.predefined ? "border-destructive" : ""}>
            <SelectValue placeholder="Choose a predefined dataset" />
          </SelectTrigger>
          <SelectContent>
            {DropdownPresets.map((preset) => (
              <SelectItem key={preset.name} value={preset.name}>
                <div className="flex items-center justify-between w-full">
                  <span>{preset.name}</span>
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {preset.location}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.predefined && (
          <p className="text-sm text-destructive">{errors.predefined}</p>
        )}
      </div>

      {/* Selected Preset Info */}
      {config.presetName && (
        <Card className="p-4 bg-muted/20">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Selected Dataset</Label>
              <Badge variant="outline">{config.presetName}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              This dataset will be loaded from our predefined collection.
              The data structure and mapping will be automatically configured.
            </p>
          </div>
        </Card>
      )}

      {/* Available Presets Info */}
      <Card className="p-4 border-dashed">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Available Datasets</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {DropdownPresets.map((preset) => (
              <div 
                key={preset.name}
                className={`p-2 rounded text-sm border transition-colors cursor-pointer hover:bg-muted/50 ${
                  config.presetName === preset.name 
                    ? 'bg-primary/10 border-primary' 
                    : 'border-border'
                }`}
                onClick={() => updateConfig(prev => ({ ...prev, presetName: preset.name }))}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-xs text-muted-foreground">{preset.location}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
