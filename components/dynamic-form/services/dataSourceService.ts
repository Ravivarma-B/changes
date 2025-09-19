import { ApiAuth, ApiHeader, DataSourceConfig, DataSourceResponse, VariableBinding } from '../formBuilder.types';
import { predefinedDatasetsService } from './predefinedDatasetsService';
import { reactiveVariableService } from './reactiveVariableService';
import { UseFormReturn } from 'react-hook-form';

interface DataSourceOptions {
  form?: UseFormReturn; // Add form instance for form field value resolution
}

class DataSourceService {
  private cache = new Map<string, { data: any; timestamp: number; duration: number }>();
  private reactiveCleanups = new Map<string, () => void>();
  
  constructor() {
    // Clear expired cache entries every 5 minutes
    setInterval(() => this.clearExpiredCache(), 5 * 60 * 1000);
  }

  async fetchData(config: DataSourceConfig, options: DataSourceOptions = {}): Promise<DataSourceResponse> {
    try {
      switch (config.type) {
        case 'manual':
          return this.handleManualData(config);
        case 'api':
          return await this.handleApiData(config, options);
        case 'predefined':
          return await this.handlePredefinedData(config);
        default:
          throw new Error(`Unsupported data source type: ${config.type}`);
      }
    } catch (error) {
      console.error('DataSourceService error:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Register reactive data source that automatically refetches when variables change
   */
  registerReactiveDataSource(
    config: DataSourceConfig, 
    onDataUpdate: (response: DataSourceResponse) => void
  ): () => void {
    const cleanup = this.setupReactiveVariables(config, () => {
      this.fetchData(config).then(onDataUpdate);
    });

    this.reactiveCleanups.set(config.id, cleanup);

    // Return cleanup function
    return () => {
      cleanup();
      this.reactiveCleanups.delete(config.id);
    };
  }

  /**
   * Unregister reactive data source
   */
  unregisterReactiveDataSource(configId: string) {
    const cleanup = this.reactiveCleanups.get(configId);
    if (cleanup) {
      cleanup();
      this.reactiveCleanups.delete(configId);
    }
  }

  private setupReactiveVariables(config: DataSourceConfig, onVariableChange: () => void): () => void {
    const variables = config.variables || [];
    const reactiveVariables = variables.filter(v => v.reactive?.enabled);
    
    if (reactiveVariables.length === 0) {
      return () => {}; // No reactive variables
    }

    const cleanups = reactiveVariables.map(variable => 
      reactiveVariableService.registerReactiveVariable(variable, () => {
        // Debouncing is handled by the reactive variable service
        onVariableChange();
      })
    );

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }

  private handleManualData(config: DataSourceConfig): DataSourceResponse {
    return {
      success: true,
      data: config.manualOptions || [],
      metadata: {
        total: config.manualOptions?.length || 0,
        page: 1,
        hasMore: false,
        cached: false
      }
    };
  }

  private async handleApiData(config: DataSourceConfig, options: DataSourceOptions = {}): Promise<DataSourceResponse> {
    if (!config.apiConfig) {
      throw new Error('API configuration is required for API data source');
    }

    const { url, method = 'GET', headers = [], auth, requestBody, timeout = 30000, retryCount = 3 } = config.apiConfig;
    
    // Check cache first
    if (config.apiConfig.cacheEnabled) {
      const cached = this.getFromCache(url);
      if (cached) {
        return {
          success: true,
          data: this.mapResponseData(cached, config),
          metadata: {
            total: cached.length,
            page: 1,
            hasMore: false,
            cached: true
          }
        };
      }
    }

    // Prepare request
    try {
      const finalUrl = this.interpolateVariables(url, config.variables || [], options);
      const requestHeaders = this.buildHeaders(headers, auth, config.variables || [], options);
      const finalRequestBody = requestBody ? this.interpolateVariables(requestBody, config.variables || [], options) : undefined;
    } catch (error) {
      if (error instanceof Error && error.message === 'SKIP_API_CALL_EMPTY_REQUIRED_FIELD') {
        // Return empty data set when required form fields are empty
        console.log(`[dataSourceService] API call skipped - required form field empty with no fallback`);
        return {
          success: true,
          data: [],
          metadata: {
            total: 0,
            page: 1,
            hasMore: false,
            cached: false
          }
        };
      }
      throw error;
    }

    const finalUrl = this.interpolateVariables(url, config.variables || [], options);
    const requestHeaders = this.buildHeaders(headers, auth, config.variables || [], options);
    const finalRequestBody = requestBody ? this.interpolateVariables(requestBody, config.variables || [], options) : undefined;

    // Execute request with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(finalUrl, {
          method,
          headers: requestHeaders,
          body: method !== 'GET' ? finalRequestBody : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Cache the response if enabled
        if (config.apiConfig.cacheEnabled && config.apiConfig.cacheDuration) {
          this.setCache(url, data, config.apiConfig.cacheDuration);
        }

        const mappedData = this.mapResponseData(data, config);

        return {
          success: true,
          data: mappedData,
          metadata: {
            total: mappedData.length,
            page: 1,
            hasMore: false,
            cached: false
          }
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        if (attempt < retryCount) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private async handlePredefinedData(config: DataSourceConfig): Promise<DataSourceResponse> {
    if (!config.presetName) {
      throw new Error('Preset name is required for predefined data source');
    }

    try {
      const data = await predefinedDatasetsService.fetchFullData(config.presetName);
      const mappedData = this.mapResponseData(data, config);
      
      return {
        success: true,
        data: mappedData,
        metadata: {
          total: mappedData.length,
          page: 1,
          hasMore: false,
          cached: false
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch predefined data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapResponseData(data: any, config: DataSourceConfig): any[] {
    if (!data) return [];

    let sourceData = data;

    // Apply root path if specified
    if (config.dataMapping?.rootPath) {
      sourceData = this.getNestedValue(data, config.dataMapping.rootPath);
    }

    if (!Array.isArray(sourceData)) {
      console.warn('Response data is not an array, attempting to convert');
      sourceData = [sourceData];
    }

    if (!config.dataMapping) {
      return sourceData;
    }

    const { labelKey, valueKey, disabledKey, groupKey } = config.dataMapping;

    return sourceData.map((item: any, index: number) => {
      const mapped: any = {
        label: this.getNestedValue(item, labelKey) || `Item ${index + 1}`,
        value: this.getNestedValue(item, valueKey) || item.id || index,
      };

      if (disabledKey) {
        mapped.disabled = Boolean(this.getNestedValue(item, disabledKey));
      }

      if (groupKey) {
        mapped.group = this.getNestedValue(item, groupKey);
      }

      // Include original data for reference
      mapped._original = item;

      return mapped;
    });
  }

  private buildHeaders(headers: ApiHeader[], auth: ApiAuth, variables: VariableBinding[] = [], options: DataSourceOptions = {}): Record<string, string> {
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Custom headers with variable interpolation
    // Supports variables like {{token}}, {{apiKey}}, etc.
    headers.filter(h => h.enabled).forEach(header => {
      requestHeaders[header.key] = this.interpolateVariables(header.value, variables, options);
    });

    // Authentication headers with variable interpolation
    // All auth values support variable replacement (e.g., {{env.API_TOKEN}})
    switch (auth.type) {
      case 'bearer':
        if (auth.bearerToken) {
          requestHeaders['Authorization'] = `Bearer ${this.interpolateVariables(auth.bearerToken, variables, options)}`;
        }
        break;
      case 'basic':
        if (auth.basicUsername && auth.basicPassword) {
          const username = this.interpolateVariables(auth.basicUsername, variables, options);
          const password = this.interpolateVariables(auth.basicPassword, variables, options);
          const credentials = btoa(`${username}:${password}`);
          requestHeaders['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'apikey':
        if (auth.apiKeyHeader && auth.apiKeyValue) {
          const headerName = this.interpolateVariables(auth.apiKeyHeader, variables, options);
          const headerValue = this.interpolateVariables(auth.apiKeyValue, variables, options);
          requestHeaders[headerName] = headerValue;
        }
        break;
    }

    return requestHeaders;
  }

  private interpolateVariables(template: string, variables: VariableBinding[], options: DataSourceOptions = {}): string {
    let result = template;
    let hasEmptyRequiredFormField = false;

    variables.forEach(variable => {
      const placeholder = `{{${variable.key}}}`;
      
      try {
        // Check if this is a formField source and we have form instance
        if (variable.source === 'formField' && options.form && variable.value) {
          const formValue = options.form.getValues(variable.value);
          
          if (formValue !== undefined && formValue !== null && formValue !== '') {
            console.log(`[dataSourceService] Using form value for "${variable.key}":`, formValue);
            result = result.replace(new RegExp(placeholder, 'g'), String(formValue));
            return; // Skip other resolution methods
          } else {
            // Check if there's a fallback value configured
            const hasFallback = variable.fallback?.value || variable.value;
            
            if (!hasFallback || hasFallback === variable.value) {
              // No meaningful fallback, mark as empty required field
              hasEmptyRequiredFormField = true;
              console.log(`⚠️ [dataSourceService] Form field "${variable.value}" is empty and no fallback configured`);
              result = result.replace(new RegExp(placeholder, 'g'), '');
              return;
            } else {
              console.log(`[dataSourceService] Form field "${variable.value}" empty, using fallback:`, hasFallback);
            }
          }
        }

        // Use reactive variable service to get value with fallback
        const value = reactiveVariableService.getValueWithFallback(variable);
        result = result.replace(new RegExp(placeholder, 'g'), value);
      } catch (error) {
        console.error(`[dataSourceService] Error resolving variable ${variable.key}:`, error);
        
        // Use fallback value or original placeholder
        const fallbackValue = variable.fallback?.value || variable.value;
        result = result.replace(new RegExp(placeholder, 'g'), fallbackValue);
      }
    });

    // If we have empty required form fields and no fallbacks, don't make the API call
    if (hasEmptyRequiredFormField) {
      console.log(`[dataSourceService] Skipping API call - required form field(s) empty with no fallback`);
      throw new Error('SKIP_API_CALL_EMPTY_REQUIRED_FIELD');
    }

    return result;
  }

  private getDynamicValue(path: string): string | null {
    // TODO: Implement app state access
    return null;
  }

  private getFormFieldValue(path: string): string | null {
    // TODO: Implement form field value access
    return null;
  }

  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  }

  private getAppStateValue(path: string): string | null {
    // TODO: Implement app state access
    return null;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.duration * 1000) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: any, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration
    });
  }

  private clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.duration * 1000) {
        this.cache.delete(key);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const dataSourceService = new DataSourceService();
