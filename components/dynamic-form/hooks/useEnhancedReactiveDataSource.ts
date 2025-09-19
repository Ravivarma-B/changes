import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DataSourceConfig, DataSourceResponse } from '../formBuilder.types';
import { dataSourceService } from '../services/dataSourceService';
import { useFieldDependency } from './useFieldDependency';
import { fieldDependencyService } from '../services/fieldDependencyService';

export interface UseEnhancedReactiveDataSourceOptions {
  onError?: (error: string) => void;
  onSuccess?: (response: DataSourceResponse) => void;
  onDataSourceUpdate?: (newData: any[], oldData: any[], changedVariable?: string) => void;
}

/**
 * Enhanced hook that integrates field dependencies with reactive data sources
 * Automatically watches form fields and triggers API calls when dependencies change
 */
export const useEnhancedReactiveDataSource = (
  form: UseFormReturn,
  config: DataSourceConfig | null,
  fieldKey: string,
  options: UseEnhancedReactiveDataSourceOptions = {}
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<any[]>([]);
  const isInitialLoadRef = useRef(true);
  const lastCallTimeRef = useRef<number>(0);
  const lastCallParamsRef = useRef<string>('');
  const callCountRef = useRef<number>(0);

  // Create stable refs for callbacks to prevent unnecessary re-renders
  const onErrorRef = useRef(options.onError);
  const onSuccessRef = useRef(options.onSuccess);
  const onDataSourceUpdateRef = useRef(options.onDataSourceUpdate);
  const configRef = useRef(config);
  const formRef = useRef(form);

  // Update refs when values change
  useEffect(() => {
    onErrorRef.current = options.onError;
    onSuccessRef.current = options.onSuccess;
    onDataSourceUpdateRef.current = options.onDataSourceUpdate;
    configRef.current = config;
    formRef.current = form;
  }, [options.onError, options.onSuccess, options.onDataSourceUpdate, config, form]);

  // Find reactive form field variables
  const reactiveFormFieldVariables = config?.variables?.filter(
    variable => variable.source === 'formField' && variable.reactive?.enabled
  ) || [];

  // Create a stable fetchData function using refs
  const fetchData = useCallback(async (changedVariable?: string) => {
    const currentConfig = configRef.current;
    const currentForm = formRef.current;
    
    if (!currentConfig) {
      setData([]);
      return;
    }

    // Prevent duplicate calls within 100ms window
    const now = Date.now();
    const currentCallParams = JSON.stringify({
      configId: currentConfig.id,
      changedVariable,
      formValues: currentForm.getValues()
    });

    callCountRef.current += 1;
    console.log(`[useEnhancedReactiveDataSource] fetchData called #${callCountRef.current} for field "${fieldKey}"`);

    if (
      now - lastCallTimeRef.current < 100 && 
      lastCallParamsRef.current === currentCallParams
    ) {
      console.log(`[useEnhancedReactiveDataSource] Skipping duplicate call within 100ms window (#${callCountRef.current})`);
      return;
    }

    lastCallTimeRef.current = now;
    lastCallParamsRef.current = currentCallParams;

    console.log(`[useEnhancedReactiveDataSource] Fetching data for field "${fieldKey}", triggered by variable:`, changedVariable);
    console.log(`[useEnhancedReactiveDataSource] Config variables:`, currentConfig.variables);
    console.log(`[useEnhancedReactiveDataSource] Current form state:`, currentForm.getValues());

    try {
      setLoading(true);
      setError(null);

      // Pass form instance to enable proper form field value resolution
      const response = await dataSourceService.fetchData(currentConfig, { form: currentForm });

      if (response.success) {
        const newData = response.data || [];
        
        // Store previous data for comparison
        const oldData = [...previousDataRef.current];
        previousDataRef.current = newData;
        
        setData(newData);
        
        // Call success callback
        onSuccessRef.current?.(response);
        
        // Call data source update callback if not initial load
        if (!isInitialLoadRef.current && onDataSourceUpdateRef.current) {
          onDataSourceUpdateRef.current(newData, oldData, changedVariable);
        }
        
        isInitialLoadRef.current = false;
      } else {
        const errorMessage = response.error || 'Failed to fetch data';
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array - use refs for all external values

  // Create a memoized callback for field changes that uses a ref to fetchData
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  const handleFieldChange = useCallback((variableKey: string, fieldPath: string) => {
    return (value: any) => {
      console.log(`[useEnhancedReactiveDataSource] Form field ${fieldPath} changed to:`, value);
      console.log(`[useEnhancedReactiveDataSource] Current form values:`, formRef.current.getValues());
      
      // Use the ref to call the latest fetchData function
      fetchDataRef.current(variableKey);
    };
  }, []); // Empty dependency array - use refs for all external values

  // Create stable callbacks for each variable using useMemo
  const fieldCallbacks = useMemo(() => {
    const callbacks: Record<string, (value: any) => void> = {};
    
    reactiveFormFieldVariables.forEach(variable => {
      const callbackKey = `${variable.value}-${variable.key}`;
      callbacks[callbackKey] = handleFieldChange(variable.key, variable.value);
    });
    
    return callbacks;
  }, [reactiveFormFieldVariables, handleFieldChange]);

  // Set up field dependencies for each reactive form field variable
  reactiveFormFieldVariables.forEach(variable => {
    const callbackKey = `${variable.value}-${variable.key}`;
    const stableCallback = fieldCallbacks[callbackKey];
    
    useFieldDependency(
      form,
      variable.value, // field path
      fieldKey,
      variable.key,
      config?.id || '',
      stableCallback,
      {
        enabled: true,
        debounceMs: variable.reactive?.debounceMs || 300,
        immediate: false
      }
    );
  });

  // Initial data load
  useEffect(() => {
    const currentConfig = configRef.current;
    const currentForm = formRef.current;
    const currentReactiveVariables = currentConfig?.variables?.filter(
      variable => variable.source === 'formField' && variable.reactive?.enabled
    ) || [];
    
    if (currentConfig && currentReactiveVariables.length === 0) {
      // Load immediately if no reactive variables
      fetchData();
    } else if (currentConfig && currentReactiveVariables.length > 0) {
      // For reactive variables, check if we have all required values
      const hasAllRequiredValues = currentReactiveVariables.every(variable => {
        const value = currentForm.getValues(variable.value);
        return value !== undefined && value !== null && value !== '';
      });

      if (hasAllRequiredValues) {
        fetchData();
      }
    }
  }, [config?.id]); // Only depend on config ID to trigger re-evaluation when config changes

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(),
    hasReactiveVariables: reactiveFormFieldVariables.length > 0
  };
};
