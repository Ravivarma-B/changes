import { UseFormReturn, useWatch } from 'react-hook-form';
import { DataSourceConfig, FormFieldType, FormRow, VariableBinding } from '../formBuilder.types';

export interface FieldDependency {
  fieldKey: string;
  dependentFieldKey: string;
  variableKey: string;
  dataSourceConfigId: string;
  onFieldChange: (value: any) => void;
  cleanup?: () => void;
}

export interface FieldDependencyOptions {
  debounceMs?: number;
  immediate?: boolean;
}

export interface FormFieldInfo {
  key: string;
  name: string;
  label: string;
  variant: string;
  path: string; // dot notation path like "address.street" for nested fields
}

export interface FieldWatchConfig {
  form: UseFormReturn;
  fieldPath: string;
  onFieldChange: (value: any) => void;
  debounceMs?: number;
}

/**
 * Service to manage form field dependencies and reactive data sources
 * Handles watching form fields for changes and triggering API fetches accordingly
 */
class FieldDependencyService {
  private dependencies = new Map<string, FieldDependency>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();

  /**
   * Register a field dependency for reactive data sources
   * Note: This should be called from within a React component that uses the form
   */
  registerDependency(
    dependencyId: string,
    dependency: Omit<FieldDependency, 'cleanup'>,
    cleanupFn?: () => void
  ): () => void {
    // Clean up existing dependency if exists
    this.unregisterDependency(dependencyId);

    const fullDependency: FieldDependency = {
      ...dependency,
      cleanup: cleanupFn
    };

    this.dependencies.set(dependencyId, fullDependency);

    // Return cleanup function
    return () => this.unregisterDependency(dependencyId);
  }

  /**
   * Unregister a specific dependency
   */
  unregisterDependency(dependencyId: string): void {
    const dependency = this.dependencies.get(dependencyId);
    if (dependency?.cleanup) {
      dependency.cleanup();
    }

    const timer = this.debounceTimers.get(dependencyId);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(dependencyId);
    }

    this.dependencies.delete(dependencyId);
  }

  /**
   * Unregister all dependencies for a specific dependent field
   */
  unregisterDependenciesForField(dependentFieldKey: string): void {
    const dependencyIds = Array.from(this.dependencies.keys()).filter(id => 
      this.dependencies.get(id)?.dependentFieldKey === dependentFieldKey
    );

    dependencyIds.forEach(id => this.unregisterDependency(id));
  }

  /**
   * Unregister all dependencies that depend on a specific source field
   */
  unregisterDependenciesForSourceField(sourceFieldKey: string): string[] {
    const dependencyIds = Array.from(this.dependencies.keys()).filter(id => 
      this.dependencies.get(id)?.fieldKey === sourceFieldKey
    );

    const affectedFields = dependencyIds.map(id => 
      this.dependencies.get(id)?.dependentFieldKey
    ).filter(Boolean) as string[];

    dependencyIds.forEach(id => this.unregisterDependency(id));

    return affectedFields;
  }

  /**
   * Get all dependencies for a specific field
   */
  getDependenciesForField(fieldKey: string): FieldDependency[] {
    return Array.from(this.dependencies.values()).filter(
      dep => dep.dependentFieldKey === fieldKey || dep.fieldKey === fieldKey
    );
  }

  /**
   * Get all source fields that a field depends on
   */
  getSourceFieldsForField(dependentFieldKey: string): string[] {
    return Array.from(this.dependencies.values())
      .filter(dep => dep.dependentFieldKey === dependentFieldKey)
      .map(dep => dep.fieldKey);
  }

  /**
   * Get all fields that depend on a specific source field
   */
  getDependentFields(sourceFieldKey: string): string[] {
    return Array.from(this.dependencies.values())
      .filter(dep => dep.fieldKey === sourceFieldKey)
      .map(dep => dep.dependentFieldKey);
  }

  /**
   * Extract all available form fields from form structure
   */
  extractAvailableFields(formFields: FormRow[]): FormFieldInfo[] {
    const fields: FormFieldInfo[] = [];

    const extractFromFields = (fieldsList: FormFieldType[], pathPrefix = ''): void => {
      fieldsList.forEach(field => {
        const fieldPath = pathPrefix ? `${pathPrefix}.${field.name}` : field.name;
        
        // Add the field itself (skip WYSIWYG and Group fields as they don't have values)
        if (field.variant !== 'WYSIWYG' && field.variant !== 'Group') {
          fields.push({
            key: field.key,
            name: field.name,
            label: field.label?.en || field.name,
            variant: field.variant,
            path: fieldPath
          });
        }

        // Handle Group fields - recursively extract nested fields
        if (field.variant === 'Group') {
          const groupField = field as any; // FormGroupField type
          if (groupField.fields && Array.isArray(groupField.fields)) {
            groupField.fields.forEach((row: any) => {
              if (row.fields && Array.isArray(row.fields)) {
                extractFromFields(row.fields, fieldPath);
              }
            });
          }
        }
      });
    };

    formFields.forEach(row => {
      extractFromFields(row.fields);
    });

    return fields;
  }

  /**
   * Validate if a field path exists in the current form structure
   */
  validateFieldPath(fieldPath: string, formFields: FormRow[]): boolean {
    const availableFields = this.extractAvailableFields(formFields);
    return availableFields.some(field => field.path === fieldPath);
  }

  /**
   * Check if removing a field would break any dependencies
   */
  checkFieldRemovalImpact(fieldKey: string): {
    hasImpact: boolean;
    affectedFields: string[];
    dependencies: FieldDependency[];
  } {
    const dependencies = this.getDependenciesForField(fieldKey);
    const affectedFields = this.getDependentFields(fieldKey);
    
    return {
      hasImpact: dependencies.length > 0 || affectedFields.length > 0,
      affectedFields,
      dependencies
    };
  }

  /**
   * Clean up all dependencies
   */
  cleanup(): void {
    const dependencyIds = Array.from(this.dependencies.keys());
    dependencyIds.forEach(id => this.unregisterDependency(id));
  }

  private handleFieldChange(
    dependencyId: string,
    value: any,
    options: FieldDependencyOptions
  ): void {
    const dependency = this.dependencies.get(dependencyId);
    if (!dependency) return;

    const debounceMs = options.debounceMs ?? 300;

    // Clear existing timer
    const existingTimer = this.debounceTimers.get(dependencyId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set up debounced execution
    const timer = setTimeout(() => {
      try {
        dependency.onFieldChange(value);
      } catch (error) {
        console.error(`Error in field dependency handler for ${dependencyId}:`, error);
      }
      this.debounceTimers.delete(dependencyId);
    }, debounceMs);

    this.debounceTimers.set(dependencyId, timer);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export const fieldDependencyService = new FieldDependencyService();
