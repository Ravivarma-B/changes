import { useEffect, useRef } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { fieldDependencyService, FieldDependencyOptions } from '../services/fieldDependencyService';

export interface UseFieldDependencyOptions extends FieldDependencyOptions {
  enabled?: boolean;
}

/**
 * Hook to create a field dependency that watches a form field and triggers callbacks
 */
export const useFieldDependency = (
  form: UseFormReturn,
  sourceFieldPath: string,
  dependentFieldKey: string,
  variableKey: string,
  dataSourceConfigId: string,
  onFieldChange: (value: any) => void,
  options: UseFieldDependencyOptions = {}
) => {
  const {
    enabled = true,
    debounceMs = 300,
    immediate = false
  } = options;

  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const previousValueRef = useRef<any>(undefined);
  const onFieldChangeRef = useRef(onFieldChange);
  
  // Update the callback ref when it changes
  useEffect(() => {
    onFieldChangeRef.current = onFieldChange;
  }, [onFieldChange]);

  // Watch the field value
  const watchedValue = useWatch({
    control: form.control,
    name: sourceFieldPath
  });

  useEffect(() => {
    if (!enabled) return;

    const dependencyId = `${sourceFieldPath}->${dependentFieldKey}->${variableKey}`;
    
    // Create a stable callback that won't cause re-registrations
    const stableCallback = (value: any) => {
      // Handle debouncing here
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        try {
          onFieldChangeRef.current(value);
        } catch (error) {
          console.error(`Error in field dependency handler for ${dependencyId}:`, error);
        }
      }, debounceMs);
    };
    
    // Register the dependency
    const unregister = fieldDependencyService.registerDependency(
      dependencyId,
      {
        fieldKey: sourceFieldPath,
        dependentFieldKey,
        variableKey,
        dataSourceConfigId,
        onFieldChange: stableCallback
      }
    );

    // Cleanup function
    return () => {
      unregister();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    enabled,
    sourceFieldPath,
    dependentFieldKey,
    variableKey,
    dataSourceConfigId,
    debounceMs
    // Removed onFieldChange from dependencies to prevent re-registrations
  ]);

  // Handle value changes
  useEffect(() => {
    if (!enabled) return;

    // Skip if it's the same value (strict equality check)
    if (previousValueRef.current === watchedValue) {
      return;
    }

    // Update the previous value
    const previousValue = previousValueRef.current;
    previousValueRef.current = watchedValue;

    // Skip the first render unless immediate is true
    if (previousValue === undefined && !immediate) {
      return;
    }

    console.log(`[useFieldDependency] Field "${sourceFieldPath}" changed from "${previousValue}" to "${watchedValue}"`);

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        onFieldChangeRef.current(watchedValue);
      } catch (error) {
        console.error(`Error in field dependency handler:`, error);
      }
    }, debounceMs);
  }, [watchedValue, enabled, immediate, debounceMs]);

  return {
    currentValue: watchedValue,
    isEnabled: enabled
  };
};
