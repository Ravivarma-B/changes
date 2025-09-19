import { createContext, useContext } from 'react';

/**
 * Creates a type-safe React context and its associated provider and hook.
 * This utility ensures that context values are not null when accessed and provides
 * meaningful error messages when the context is accessed outside of its provider.
 *
 * @template ContextValue - The type of value stored in the context
 * @param errorMessage - Custom error message thrown when context is accessed outside provider
 * @returns A tuple containing the Provider component and a custom hook to access the context
 *
 * @example
 * ```typescript
 * // Create a type-safe theme context
 * const [ThemeProvider, useTheme] = createSafeContext<Theme>('useTheme must be used within ThemeProvider');
 * 
 * // Use the provider
 * const App = () => (
 *   <ThemeProvider value={theme}>
 *     <Children />
 *   </ThemeProvider>
 * );
 * 
 * // Access the context safely in any child component
 * const Component = () => {
 *   const theme = useTheme(); // Will never be null, TypeScript knows the exact type
 *   return <div style={{ color: theme.primaryColor }}>...</div>;
 * };
 * ```
 */
export function createSafeContext<ContextValue>(errorMessage: string) {
  // Create the internal context with null as initial value
  const Context = createContext<ContextValue | null>(null);

  /**
   * Custom hook that provides type-safe access to the context value.
   * Throws an error if used outside of the provider.
   *
   * @throws {Error} When used outside of the provider component
   * @returns The context value, guaranteed to be non-null
   */
  const useSafeContext = () => {
    const ctx = useContext(Context);

    if (ctx === null) {
      throw new Error(errorMessage);
    }

    return ctx;
  };

  /**
   * Provider component that accepts the context value and renders children.
   * 
   * @param props.value - The value to be provided through the context
   * @param props.children - Child components that will have access to the context
   */
  const Provider = ({ children, value }: { 
    value: ContextValue; 
    children: React.ReactNode 
  }) => (
    <Context.Provider value={value}>{children}</Context.Provider>
  );

  return [Provider, useSafeContext] as const;
}