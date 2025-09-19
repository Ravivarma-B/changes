import { VariableBinding } from '../formBuilder.types';

export interface ReactiveVariableEvent {
  variableKey: string;
  oldValue: string | null;
  newValue: string | null;
  source: VariableBinding['source'];
}

export type ReactiveVariableListener = (event: ReactiveVariableEvent) => void;

class ReactiveVariableService {
  private listeners = new Map<string, Set<ReactiveVariableListener>>();
  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private watchers = new Map<string, () => void>();
  
  // Current values cache for comparison
  private currentValues = new Map<string, string | null>();
  private initialized = false;

  constructor() {
    // Defer initialization until we're sure we're in the browser
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.initialized) return;
    this.setupGlobalWatchers();
    this.initialized = true;
    console.log(' ReactiveVariableService initialized');
  }

  private ensureInitialized() {
    if (!this.initialized && typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Register a reactive variable and start watching for changes
   */
  registerReactiveVariable(variable: VariableBinding, listener: ReactiveVariableListener): () => void {
    this.ensureInitialized();
    
    if (!variable.reactive?.enabled) {
      return () => {}; // No-op cleanup for non-reactive variables
    }

    const key = variable.key;
    console.log(`Registering reactive variable: ${key} (source: ${variable.source})`);
    
    // Add listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    // Start watching this variable
    this.startWatching(variable);

    // Return cleanup function
    return () => {
      console.log(`Cleaning up reactive variable: ${key}`);
      this.listeners.get(key)?.delete(listener);
      if (this.listeners.get(key)?.size === 0) {
        this.stopWatching(key);
      }
    };
  }

  /**
   * Get current value for a variable
   */
  getCurrentValue(variable: VariableBinding): string | null {
   
    switch (variable.source) {
      case 'localStorage':
        const value = typeof window !== 'undefined'
          ? localStorage.getItem(variable.value)
          : null;

        if (variable.path && variable.path.length > 0) {
          const parsedValue = JSON.parse(value || '{}');
          return variable.path.split('.').reduce((acc, key) => acc?.[key], parsedValue) || null;
        } else {
          return value;
        }

      case 'sessionStorage':
        const sessionValue = typeof window !== 'undefined'
          ? sessionStorage.getItem(variable.value)
          : null;

        if (variable.path && variable.path.length > 0) {
          const parsedValue = JSON.parse(sessionValue || '{}');
          return variable.path.split('.').reduce((acc, key) => acc?.[key], parsedValue) || null;
        } else {
          return sessionValue;
        }

      case 'cookie':
        return this.getCookieValue(variable.value);
      
      case 'urlParam':
        return this.getUrlParam(variable.value);
      
      case 'queryParam':
        return this.getQueryParam(variable.value);
      
      case 'formField':
        return this.getFormFieldValue(variable.value);
      
      case 'static':
      case 'environment':
      case 'appState':
      default:
        return variable.value;
    }
  }

  /**
   * Get current value with fallback handling
   */
  getValueWithFallback(variable: VariableBinding): string {
    const currentValue = this.getCurrentValue(variable);
    
    if (currentValue === null || currentValue === undefined || currentValue === '') {
      switch (variable.fallback?.strategy) {
        case 'throwError':
          throw new Error(`Variable '${variable.key}' not found and no fallback allowed`);
        case 'useNull':
          return '';
        case 'useDefault':
        default:
          return variable.fallback?.value || variable.value;
      }
    }
    
    return currentValue;
  }

  private startWatching(variable: VariableBinding) {
    const key = variable.key;
    
    if (this.watchers.has(key)) {
      return; // Already watching
    }

    console.log(` Starting to watch variable: ${key} (source: ${variable.source}, storageKey: ${variable.value})`);

    // Store initial value
    this.currentValues.set(key, this.getCurrentValue(variable) ?? null);

    let cleanup: (() => void) | null = null;

    switch (variable.source) {
      case 'localStorage':
      case 'sessionStorage':
        cleanup = this.watchStorage(variable);
        break;
      
      case 'urlParam':
      case 'queryParam':
        cleanup = this.watchUrl(variable);
        break;
      
      case 'cookie':
        cleanup = this.watchCookies(variable);
        break;
      
      case 'formField':
        cleanup = this.watchFormField(variable);
        break;
    }

    if (cleanup) {
      this.watchers.set(key, cleanup);
    }
  }

  private stopWatching(key: string) {
    const cleanup = this.watchers.get(key);
    if (cleanup) {
      cleanup();
      this.watchers.delete(key);
    }
    this.currentValues.delete(key);
    this.listeners.delete(key);
  }

  private notifyListeners(variable: VariableBinding, oldValue: string | null, newValue: string | null) {
    const listeners = this.listeners.get(variable.key);
    if (!listeners || listeners.size === 0) {
      console.log(` No listeners found for variable ${variable.key}`);
      return;
    }

    console.log(` Notifying ${listeners.size} listeners for ${variable.key}: ${oldValue} -> ${newValue}`);

    const debounceMs = variable.reactive?.debounceMs || 300;
    
    // Clear existing timer
    const existingTimer = this.debounceTimers.get(variable.key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(() => {
      console.log(` Debounced notification executing for ${variable.key}`);
      listeners.forEach(listener => {
        try {
          listener({
            variableKey: variable.key,
            oldValue,
            newValue,
            source: variable.source
          });
        } catch (error) {
          console.error(`Error in reactive variable listener for ${variable.key}:`, error);
        }
      });
      this.debounceTimers.delete(variable.key);
    }, debounceMs);

    this.debounceTimers.set(variable.key, timer);
  }

  private watchStorage(variable: VariableBinding): () => void {
    console.log(` Setting up storage watchers for ${variable.key} (watching: ${variable.value})`);
    
    const storageHandler = (e: StorageEvent) => {
      console.log(` Storage event received:`, { key: e.key, oldValue: e.oldValue, newValue: e.newValue });
      if (e.key === variable.value) {
        const oldValue = this.currentValues.get(variable.key) ?? null;
        const newValue = e.newValue ?? null;
        
        console.log(` Storage change detected for ${variable.key}: ${oldValue} -> ${newValue}`);
        
        if (oldValue !== newValue) {
          this.currentValues.set(variable.key, newValue);
          this.notifyListeners(variable, oldValue, newValue);
        }
      }
    };

    window.addEventListener('storage', storageHandler);
    
    // Also watch for changes in the same tab using a custom event
    const customHandler = (e: CustomEvent) => {
      console.log(` Custom storage event received:`, e.detail);
      console.log(` Looking for variable with storageKey: ${variable.value}, received key: ${e.detail.key}`);
      console.log(` Looking for source: ${variable.source}, received source: ${e.detail.source}`);
      
      if (e.detail.key === variable.value && e.detail.source === variable.source) {
        const oldValue = this.currentValues.get(variable.key) ?? null;
        const newValue = e.detail.newValue ?? null;
        
        console.log(` Custom storage change detected for ${variable.key}: ${oldValue} -> ${newValue}`);
        
        if (oldValue !== newValue) {
          this.currentValues.set(variable.key, newValue);
          this.notifyListeners(variable, oldValue, newValue);
        }
      } else {
        console.log(` Custom storage event ignored for ${variable.key} (no match)`);
      }
    };

    window.addEventListener('storage-change', customHandler as EventListener);

    return () => {
      console.log(` Removing storage watchers for ${variable.key}`);
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('storage-change', customHandler as EventListener);
    };
  }

  private watchUrl(variable: VariableBinding): () => void {
    const urlHandler = () => {
      const oldValue = this.currentValues.get(variable.key) ?? null;
      const newValue = this.getCurrentValue(variable) ?? null;
      
      if (oldValue !== newValue) {
        this.currentValues.set(variable.key, newValue);
        this.notifyListeners(variable, oldValue, newValue);
      }
    };

    // Watch for navigation changes
    window.addEventListener('popstate', urlHandler);
    window.addEventListener('pushstate', urlHandler);
    window.addEventListener('replacestate', urlHandler);

    return () => {
      window.removeEventListener('popstate', urlHandler);
      window.removeEventListener('pushstate', urlHandler);
      window.removeEventListener('replacestate', urlHandler);
    };
  }

  private watchCookies(variable: VariableBinding): () => void {
    // Poll for cookie changes (cookies don't have change events)
    const pollInterval = setInterval(() => {
      const oldValue = this.currentValues.get(variable.key) ?? null;
      const newValue = this.getCurrentValue(variable) ?? null;
      
      if (oldValue !== newValue) {
        this.currentValues.set(variable.key, newValue);
        this.notifyListeners(variable, oldValue, newValue);
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(pollInterval);
    };
  }

  private watchFormField(variable: VariableBinding): () => void {
    // TODO: Implement form field watching
    // For now, return a no-op cleanup
    return () => {};
  }

  private setupGlobalWatchers() {
    console.log(' Setting up global storage watchers...');
    
    // Override storage methods to emit custom events for same-tab changes
    if (typeof window !== 'undefined') {
      const originalSetItem = localStorage.setItem.bind(localStorage);
      const originalRemoveItem = localStorage.removeItem.bind(localStorage);
      const originalClear = localStorage.clear.bind(localStorage);

      localStorage.setItem = function(key: string, value: string) {
        const oldValue = localStorage.getItem(key);
        originalSetItem(key, value);
        console.log(` localStorage.setItem intercepted: ${key} = ${value}`);
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key, oldValue, newValue: value, source: 'localStorage' }
        }));
      };

      localStorage.removeItem = function(key: string) {
        const oldValue = localStorage.getItem(key);
        originalRemoveItem(key);
        console.log(` localStorage.removeItem intercepted: ${key}`);
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key, oldValue, newValue: null, source: 'localStorage' }
        }));
      };

      localStorage.clear = function() {
        originalClear();
        console.log(` localStorage.clear intercepted`);
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key: null, oldValue: null, newValue: null, source: 'localStorage' }
        }));
      };

      // Similar override for sessionStorage
      const originalSessionSetItem = sessionStorage.setItem.bind(sessionStorage);
      const originalSessionRemoveItem = sessionStorage.removeItem.bind(sessionStorage);
      const originalSessionClear = sessionStorage.clear.bind(sessionStorage);

      sessionStorage.setItem = function(key: string, value: string) {
        const oldValue = sessionStorage.getItem(key);
        originalSessionSetItem(key, value);
        console.log(` sessionStorage.setItem intercepted: ${key} = ${value}`);
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key, oldValue, newValue: value, source: 'sessionStorage' }
        }));
      };

      sessionStorage.removeItem = function(key: string) {
        const oldValue = sessionStorage.getItem(key);
        originalSessionRemoveItem(key);
        console.log(` sessionStorage.removeItem intercepted: ${key}`);
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key, oldValue, newValue: null, source: 'sessionStorage' }
        }));
      };

      sessionStorage.clear = function() {
        originalSessionClear();
        console.log(` sessionStorage.clear intercepted`);
        window.dispatchEvent(new CustomEvent('storage-change', {
          detail: { key: null, oldValue: null, newValue: null, source: 'sessionStorage' }
        }));
      };

      // Override history methods to catch programmatic navigation
      const originalPushState = history.pushState.bind(history);
      const originalReplaceState = history.replaceState.bind(history);

      history.pushState = function(...args) {
        originalPushState(...args);
        window.dispatchEvent(new Event('pushstate'));
      };

      history.replaceState = function(...args) {
        originalReplaceState(...args);
        window.dispatchEvent(new Event('replacestate'));
      };
      
      console.log(' Global storage watchers setup complete');
    }
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

  private getUrlParam(paramName: string): string | null {
    if (typeof window === 'undefined') return null;
    
    // Extract from current URL path
    // This is a simplified implementation - we'd integrate with router
    const pathParts = window.location.pathname.split('/');
    const paramIndex = pathParts.findIndex(part => part === `:${paramName}`);
    
    if (paramIndex !== -1 && paramIndex + 1 < pathParts.length) {
      return pathParts[paramIndex + 1];
    }
    
    return null;
  }

  private getQueryParam(paramName: string): string | null {
    if (typeof window === 'undefined') return null;
    
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
  }

  private getFormFieldValue(fieldPath: string): string | null {
    // TODO: Implement form field value retrieval
    // For now, return null
    return null;
  }

  /**
   * Debug method to show currently registered variables
   */
  getRegisteredVariables(): Array<{ key: string; listenerCount: number; isWatching: boolean }> {
    const result: Array<{ key: string; listenerCount: number; isWatching: boolean }> = [];
    
    for (const [key, listeners] of this.listeners.entries()) {
      result.push({
        key,
        listenerCount: listeners.size,
        isWatching: this.watchers.has(key)
      });
    }
    
    return result;
  }

  /**
   * Debug method to log current state
   */
  debugCurrentState(): void {
    console.log(' ReactiveVariableService Debug State:');
    console.log(' Registered variables:', this.getRegisteredVariables());
    console.log(' Current values:', Object.fromEntries(this.currentValues));
    console.log(' Active watchers:', Array.from(this.watchers.keys()));
    console.log(' Pending debounces:', Array.from(this.debounceTimers.keys()));
  }

  /**
   * Cleanup all watchers and listeners
   */
  destroy() {
    // Clear all debounce timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();

    // Stop all watchers
    this.watchers.forEach(cleanup => cleanup());
    this.watchers.clear();

    // Clear all data
    this.listeners.clear();
    this.currentValues.clear();
  }
}

// Export singleton instance
export const reactiveVariableService = new ReactiveVariableService();
