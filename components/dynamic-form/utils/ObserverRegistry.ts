/**
 * Observer registry utility for managing IntersectionObserver and ResizeObserver cleanup
 */

interface ObserverRegistry {
  [namespace: string]: {
    [id: string]: any[]
  } | any[]
}

/**
 * Register an observer with the global registry for cleanup
 */
export const registerObserver = (
  observer: IntersectionObserver | ResizeObserver | any,
  namespace: string = 'default',
  id?: string
): void => {
  if (typeof window === 'undefined') return

  // Initialize the global registry if it doesn't exist
  if (!(window as any).__observerRegistry__) {
    (window as any).__observerRegistry__ = {}
  }

  const registry = (window as any).__observerRegistry__ as ObserverRegistry

  // Initialize namespace if it doesn't exist
  if (!registry[namespace]) {
    registry[namespace] = id ? {} : []
  }

  if (id) {
    // ID-based storage
    const namespaceRegistry = registry[namespace] as { [id: string]: any[] }
    if (!namespaceRegistry[id]) {
      namespaceRegistry[id] = []
    }
    namespaceRegistry[id].push(observer)
  } else {
    // Array-based storage
    const namespaceRegistry = registry[namespace] as any[]
    namespaceRegistry.push(observer)
  }
}

/**
 * Manually cleanup observers for a specific namespace and optionally ID
 */
export const cleanupObservers = (namespace: string, id?: string): void => {
  if (typeof window === 'undefined') return

  const registry = (window as any).__observerRegistry__ as ObserverRegistry
  if (!registry || !registry[namespace]) return

  if (id) {
    // Clean up specific ID
    const namespaceRegistry = registry[namespace] as { [id: string]: any[] }
    const observers = namespaceRegistry[id] || []
    observers.forEach((observer: any) => {
      try {
        if (observer && typeof observer.disconnect === 'function') {
          observer.disconnect()
        }
      } catch (error) {
        console.debug(`Observer cleanup error for ${namespace}:${id}:`, error)
      }
    })
    delete namespaceRegistry[id]
  } else {
    // Clean up entire namespace
    const observers = registry[namespace] as any[]
    if (Array.isArray(observers)) {
      observers.forEach((observer: any) => {
        try {
          if (observer && typeof observer.disconnect === 'function') {
            observer.disconnect()
          }
        } catch (error) {
          console.debug(`Observer cleanup error for ${namespace}:`, error)
        }
      })
      registry[namespace] = []
    }
  }
}

/**
 * Hook for creating a safe IntersectionObserver with automatic cleanup
 */
export const createSafeIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
  namespace: string = 'default',
  id?: string
): IntersectionObserver | null => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  const observer = new IntersectionObserver(callback, options)
  registerObserver(observer, namespace, id)
  return observer
}

/**
 * Hook for creating a safe ResizeObserver with automatic cleanup
 */
export const createSafeResizeObserver = (
  callback: ResizeObserverCallback,
  namespace: string = 'default',
  id?: string
): ResizeObserver | null => {
  if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
    return null
  }

  const observer = new ResizeObserver(callback)
  registerObserver(observer, namespace, id)
  return observer
}
