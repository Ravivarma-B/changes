import { useState, useEffect, useCallback, useRef } from 'react';
import { DataSourceConfig, DataSourceResponse } from '../formBuilder.types';
import { dataSourceService } from '../services/dataSourceService';

export interface UseReactiveDataSourceOptions {
  enabled?: boolean;
  onError?: (error: string) => void;
  onSuccess?: (response: DataSourceResponse) => void;
  /**
   * Callback when data source updates due to variable changes
   * Provides old and new data for comparison
   */
  onDataSourceUpdate?: (newData: any[], oldData: any[], changedVariable: string) => void;
}

export interface UseReactiveDataSourceResult {
  data: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  response: DataSourceResponse | null;
}

/**
 * React hook for reactive data sources that automatically refetch when variables change
 */
export function useReactiveDataSource(
  config: DataSourceConfig | null,
  options: UseReactiveDataSourceOptions = {}
): UseReactiveDataSourceResult {
  const { enabled = true, onError, onSuccess, onDataSourceUpdate } = options;
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<DataSourceResponse | null>(null);
  
  // Use refs to avoid dependency issues
  const onErrorRef = useRef(onError);
  const onSuccessRef = useRef(onSuccess);
  const onDataSourceUpdateRef = useRef(onDataSourceUpdate);
  const configRef = useRef(config);
  const previousDataRef = useRef<any[]>([]);
  
  // Update refs when values change
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  
  useEffect(() => {
    onDataSourceUpdateRef.current = onDataSourceUpdate;
  }, [onDataSourceUpdate]);
  
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const fetchData = useCallback(async () => {
    const currentConfig = configRef.current;
    if (!currentConfig || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await dataSourceService.fetchData(currentConfig);
      
      setResponse(result);
      
      if (result.success) {
        setData(result.data || []);
        onSuccessRef.current?.(result);
      } else {
        const errorMsg = result.error || 'Failed to fetch data';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      onErrorRef.current?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!config || !enabled) {
      setData([]);
      setError(null);
      setResponse(null);
      return;
    }

    // Initial fetch
    const performInitialFetch = async () => {
      if (!config || !enabled) return;

      setLoading(true);
      setError(null);

      try {
        const result = await dataSourceService.fetchData(config);
        
        setResponse(result);
        
        if (result.success) {
          const newData = result.data || [];
          setData(newData);
          previousDataRef.current = newData; // Store initial data
          onSuccessRef.current?.(result);
        } else {
          const errorMsg = result.error || 'Failed to fetch data';
          setError(errorMsg);
          onErrorRef.current?.(errorMsg);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    performInitialFetch();

    // Register reactive data source if there are reactive variables
    const hasReactiveVariables = config.variables?.some(v => v.reactive?.enabled);
    
    if (!hasReactiveVariables) {
      return; // No cleanup needed for non-reactive sources
    }

    console.log(' Registering reactive data source:', config.id);
    
    const cleanup = dataSourceService.registerReactiveDataSource(config, (result) => {
      console.log(' Reactive data source update triggered:', result);
      
      setResponse(result);
      
      if (result.success) {
        const newData = result.data || [];
        const oldData = previousDataRef.current;
        
        // Store new data
        setData(newData);
        setError(null);
        
        // Notify about data source update for form field handling
        if (onDataSourceUpdateRef.current && oldData.length > 0) {
          onDataSourceUpdateRef.current(newData, oldData, 'reactive-variable-change');
        }
        
        // Update previous data reference
        previousDataRef.current = newData;
        
        onSuccessRef.current?.(result);
      } else {
        const errorMsg = result.error || 'Failed to fetch data';
        setError(errorMsg);
        onErrorRef.current?.(errorMsg);
      }
    });

    return () => {
      console.log(' Cleaning up reactive data source:', config.id);
      cleanup();
    };
  }, [config?.id, enabled]); // Removed fetchData from dependencies

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    response
  };
}
