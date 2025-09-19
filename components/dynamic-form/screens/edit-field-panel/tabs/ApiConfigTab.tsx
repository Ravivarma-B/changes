'use client';

import React, { useState } from "react";
import { Label } from "web-utils-components/label";
import { Input } from "web-utils-components/input";
import { Button } from "web-utils-components/button";
import { Card } from "web-utils-components/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "web-utils-components/select";
import { Textarea } from "web-utils-components/textarea";
import { Switch } from "web-utils-components/switch";
import { Badge } from "web-utils-components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "web-utils-components/tabs";
import { Trash2, Plus, Eye, EyeOff, Globe, Lock, Key, User } from "lucide-react";
import { DataSourceConfig, ApiHeader, ApiAuth } from "../../../formBuilder.types";

interface ApiConfigTabProps {
  config: DataSourceConfig;
  updateConfig: (updater: (prev: DataSourceConfig) => DataSourceConfig) => void;
  errors: Record<string, string>;
}

export const ApiConfigTab: React.FC<ApiConfigTabProps> = ({
  config,
  updateConfig,
  errors
}) => {
  const [showSensitive, setShowSensitive] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const apiConfig = config.apiConfig || {
    url: '',
    method: 'GET',
    headers: [],
    auth: { type: 'none' },
    timeout: 30000,
    retryCount: 3,
    cacheEnabled: false,
    cacheDuration: 300
  };

  const updateApiConfig = (updates: Partial<typeof apiConfig>) => {
    updateConfig(prev => ({
      ...prev,
      apiConfig: { ...apiConfig, ...updates }
    }));
  };

  // URL validation: allow variables in double curly braces
  const validateUrl = (url: string): string | null => {
    // Allow {{variable}} anywhere in the URL
    // Remove all {{...}} for validation
    const urlForValidation = url.replace(/\{\{[^}]+\}\}/g, 'variable');
    try {
      // Accept empty string
      if (!urlForValidation.trim()) return null;
      // Accept relative URLs
      if (/^\//.test(urlForValidation)) return null;
      // Accept valid http/https URLs
      const valid = /^https?:\/\/.+/.test(urlForValidation);
      if (!valid) return 'Enter a valid URL (http(s)://...) or relative path';
      // Try to construct URL object
      new URL(urlForValidation);
      return null;
    } catch {
      return 'Enter a valid URL';
    }
  };

  const addHeader = () => {
    const newHeaders = [...apiConfig.headers, { key: '', value: '', enabled: true }];
    updateApiConfig({ headers: newHeaders });
  };

  const updateHeader = (index: number, field: keyof ApiHeader, value: string | boolean) => {
    const newHeaders = apiConfig.headers.map((header, i) => 
      i === index ? { ...header, [field]: value } : header
    );
    updateApiConfig({ headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    const newHeaders = apiConfig.headers.filter((_, i) => i !== index);
    updateApiConfig({ headers: newHeaders });
  };

  const updateAuth = (updates: Partial<ApiAuth>) => {
    updateApiConfig({ auth: { ...apiConfig.auth, ...updates } });
  };

  // Handle URL input change and validate
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    updateApiConfig({ url });
    setUrlError(validateUrl(url));
  };

  return (
    <div className="space-y-6">
      {/* Configuration Name */}
      <div className="space-y-2">
        <Label htmlFor="api-config-name" className="text-sm font-medium">
          Configuration Name
        </Label>
        <Input
          id="api-config-name"
          placeholder="e.g., User API, Countries Data"
          value={config.name}
          onChange={(e) => updateConfig(prev => ({ ...prev, name: e.target.value }))}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <Tabs defaultValue="request" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/50">
          <TabsTrigger value="request" className="gap-2 dark:data-[state=active]:bg-gray-700/90">
            <Globe className="w-4 h-4" />
            Request
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-2 dark:data-[state=active]:bg-gray-700/90">
            <Lock className="w-4 h-4" />
            Auth
          </TabsTrigger>
          <TabsTrigger value="headers" className="gap-2 dark:data-[state=active]:bg-gray-700/90">
            <Key className="w-4 h-4" />
            Headers
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2 dark:data-[state=active]:bg-gray-700/90">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="request" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1">
              <Label className="text-sm font-medium">Method</Label>
              <Select 
                value={apiConfig.method} 
                onValueChange={(value: 'GET' | 'POST' | 'PUT' | 'DELETE') => 
                  updateApiConfig({ method: value })
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="lg:col-span-3">
              <Label className="text-sm font-medium">API URL</Label>
              <Input
                placeholder="https://api.example.com/data/{{id}}?userId={{userId}}"
                value={apiConfig.url}
                onChange={handleUrlChange}
                className={`mt-2 ${errors.api || urlError ? "border-destructive" : ""}`}
              />
              {(errors.api || urlError) && (
                <p className="text-sm text-destructive mt-1">{errors.api || urlError}</p>
              )}
            </div>
          </div>

          {(apiConfig.method === 'POST' || apiConfig.method === 'PUT') && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Request Body (JSON)</Label>
              <Textarea
                placeholder='{"param": "{{variable}}"}'
                value={apiConfig.requestBody || ''}
                onChange={(e) => updateApiConfig({ requestBody: e.target.value })}
                className="font-mono text-sm"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{variableName}}"} for dynamic variable substitution
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Authentication Type</Label>
              <Select 
                value={apiConfig.auth.type} 
                onValueChange={(value: ApiAuth['type']) => updateAuth({ type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Authentication</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {apiConfig.auth.type === 'bearer' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Bearer Token</Label>
                <div className="relative">
                  <Input
                    type={showSensitive ? "text" : "password"}
                    placeholder="Enter bearer token"
                    value={apiConfig.auth.bearerToken || ''}
                    onChange={(e) => updateAuth({ bearerToken: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowSensitive(!showSensitive)}
                  >
                    {showSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            {apiConfig.auth.type === 'basic' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Username</Label>
                  <Input
                    placeholder="Username"
                    value={apiConfig.auth.basicUsername || ''}
                    onChange={(e) => updateAuth({ basicUsername: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password</Label>
                  <Input
                    type={showSensitive ? "text" : "password"}
                    placeholder="Password"
                    value={apiConfig.auth.basicPassword || ''}
                    onChange={(e) => updateAuth({ basicPassword: e.target.value })}
                  />
                </div>
              </div>
            )}

            {apiConfig.auth.type === 'apikey' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Header Name</Label>
                  <Input
                    placeholder="X-API-Key"
                    value={apiConfig.auth.apiKeyHeader || ''}
                    onChange={(e) => updateAuth({ apiKeyHeader: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">API Key</Label>
                  <Input
                    type={showSensitive ? "text" : "password"}
                    placeholder="Your API key"
                    value={apiConfig.auth.apiKeyValue || ''}
                    onChange={(e) => updateAuth({ apiKeyValue: e.target.value })}
                  />
                </div>
              </div>
            )}

            {apiConfig.auth.type !== 'none' && (
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={showSensitive}
                  onCheckedChange={setShowSensitive}
                />
                <Label className="text-sm">Show sensitive data</Label>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="headers" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Custom Headers</Label>
            <Button variant="outline" size="sm" onClick={addHeader} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Header
            </Button>
          </div>

          {apiConfig.headers.length === 0 ? (
            <Card className="p-6 text-center border-dashed bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/90 dark:border-gray-700/50">
              <p className="text-muted-foreground mb-3">No custom headers</p>
              <Button variant="outline" onClick={addHeader} className="gap-2">
                <Plus className="w-4 h-4" />
                Add First Header
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {apiConfig.headers.map((header, index) => (
                <Card key={index} className="p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/90 dark:border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={header.enabled}
                      onCheckedChange={(checked) => updateHeader(index, 'enabled', checked)}
                    />
                    
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Header name"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                      />
                      <Input
                        placeholder="Header value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHeader(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Timeout (seconds)</Label>
              <Input
                type="number"
                min="1"
                max="300"
                value={(apiConfig.timeout || 30000) / 1000}
                onChange={(e) => updateApiConfig({ timeout: parseInt(e.target.value) * 1000 })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Retry Count</Label>
              <Input
                type="number"
                min="0"
                max="5"
                value={apiConfig.retryCount || 3}
                onChange={(e) => updateApiConfig({ retryCount: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Enable Caching</Label>
                <p className="text-xs text-muted-foreground">
                  Cache responses to improve performance
                </p>
              </div>
              <Switch
                checked={apiConfig.cacheEnabled}
                onCheckedChange={(checked) => updateApiConfig({ cacheEnabled: checked })}
              />
            </div>

            {apiConfig.cacheEnabled && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cache Duration (seconds)</Label>
                <Input
                  type="number"
                  min="60"
                  max="3600"
                  value={apiConfig.cacheDuration || 300}
                  onChange={(e) => updateApiConfig({ cacheDuration: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  How long to cache the response (60-3600 seconds)
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
