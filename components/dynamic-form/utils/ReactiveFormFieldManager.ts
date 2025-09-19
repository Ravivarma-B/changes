import { UseFormReturn } from 'react-hook-form';
import { DataSourceConfig } from '../formBuilder.types';
import { getDefaultValueForFieldType } from '../screens/generate-code-parts';

export interface FormFieldResetOptions {
  newData: any[];
  oldData: any[];
  currentValue: any;
  fieldName: string;
  variant: string;
  form: UseFormReturn;
  config: DataSourceConfig;
}

/**
 * Utility class to handle form field reset behavior when reactive data sources change
 * Implements industry best practices for UX and data consistency
 */
export class ReactiveFormFieldManager {
  
  /**
   * Determines if the current field value is still valid in the new data set
   */
  static isValueStillValid(currentValue: any, newData: any[], config: DataSourceConfig): boolean {
    if (!currentValue || !newData.length) return false;
    
    const valueKey = config.dataMapping?.valueKey || 'value';
    
    return newData.some(item => {
      const itemValue = item[valueKey] || item.value || item.id;
      return String(itemValue) === String(currentValue);
    });
  }
  
  /**
   * Gets the first available option from the new data set
   */
  static getFirstAvailableOption(newData: any[], config: DataSourceConfig): string | null {
    if (!newData.length) return null;
    
    const valueKey = config.dataMapping?.valueKey || 'value';
    const disabledKey = config.dataMapping?.disabledKey;
    
    const firstAvailable = newData.find(item => {
      if (disabledKey && item[disabledKey]) return false;
      if (item.disabled) return false;
      return true;
    });
    
    if (!firstAvailable) return null;
    
    return String(firstAvailable[valueKey] || firstAvailable.value || firstAvailable.id);
  }
  
  /**
   * Handles form field reset based on reactive configuration
   */
  static handleDataSourceChange(options: FormFieldResetOptions): {
    action: 'preserved' | 'cleared' | 'revalidated' | 'auto-selected';
    newValue: any;
    reason: string;
  } {
    const { newData, oldData, currentValue, fieldName, variant, form, config } = options;
    
    // Get reactive configuration
    const reactiveVars = config.variables?.filter(v => v.reactive?.enabled) || [];
    const onDataSourceChange = reactiveVars[0]?.reactive?.onDataSourceChange || 'preserve';
    
    const isCurrentValueValid = this.isValueStillValid(currentValue, newData, config);
    
    switch (onDataSourceChange) {
      case 'clear':
        form.setValue(fieldName, getDefaultValueForFieldType(variant), { 
          shouldValidate: true, 
          shouldDirty: true 
        });
        return {
          action: 'cleared',
          newValue: '',
          reason: 'Configuration set to always clear on data source change'
        };
        
      case 'revalidate':
        if (!isCurrentValueValid && currentValue) {
          form.setValue(fieldName, getDefaultValueForFieldType(variant), { 
            shouldValidate: true, 
            shouldDirty: true 
          });
          return {
            action: 'revalidated',
            newValue: '',
            reason: 'Current value not found in new data set'
          };
        }
        return {
          action: 'preserved',
          newValue: currentValue,
          reason: 'Current value is still valid in new data set'
        };
        
      case 'selectFirst':
        if (!isCurrentValueValid) {
          const firstOption = this.getFirstAvailableOption(newData, config);
          if (firstOption) {
            form.setValue(fieldName, firstOption, { 
              shouldValidate: true, 
              shouldDirty: true 
            });
            return {
              action: 'auto-selected',
              newValue: firstOption,
              reason: 'Auto-selected first available option'
            };
          } else {
            form.setValue(fieldName, '', { 
              shouldValidate: true, 
              shouldDirty: true 
            });
            return {
              action: 'cleared',
              newValue: '',
              reason: 'No valid options available'
            };
          }
        }
        return {
          action: 'preserved',
          newValue: currentValue,
          reason: 'Current value is still valid'
        };
        
      case 'preserve':
      default:
        // Preserve current value regardless of validity
        // This is the default and most conservative approach
        return {
          action: 'preserved',
          newValue: currentValue,
          reason: 'Value preserved as per configuration'
        };
    }
  }
  
  /**
   * Provides user feedback about data source changes
   */
  static getDataSourceChangeMessage(
    action: string, 
    reason: string, 
    fieldLabel: string
  ): string | null {
    switch (action) {
      case 'cleared':
        return `${fieldLabel} was cleared because the options have changed`;
      case 'revalidated':
        return `${fieldLabel} was cleared because your previous selection is no longer available`;
      case 'auto-selected':
        return `${fieldLabel} was automatically updated with the first available option`;
      default:
        return null;
    }
  }
  
  /**
   * Logs data source changes for debugging
   */
  static logDataSourceChange(
    fieldName: string,
    action: string,
    reason: string,
    oldData: any[],
    newData: any[]
  ): void {
    console.log(`Field "${fieldName}" data source changed:`, {
      action,
      reason,
      oldDataCount: oldData.length,
      newDataCount: newData.length,
      timestamp: new Date().toISOString()
    });
  }
}
