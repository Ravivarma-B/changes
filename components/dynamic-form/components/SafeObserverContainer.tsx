import React, { useRef, useEffect, ReactNode } from 'react'

interface SafeObserverContainerProps {
  children: ReactNode
  className?: string
  id?: string
  observerNamespace?: string
  as?: keyof React.JSX.IntrinsicElements
  [key: string]: any // Allow other props to be passed through
}

/**
 * A reusable component that provides safe cleanup for IntersectionObserver and ResizeObserver
 * to prevent "Failed to execute 'unobserve'" errors when components unmount.
 */
export const SafeObserverContainer: React.FC<SafeObserverContainerProps> = ({ 
  children, 
  className,
  id,
  observerNamespace = 'default',
  as = 'div',
  ...otherProps
}) => {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Cleanup function to handle any observer cleanup
    return () => {
      if (containerRef.current) {
        try {
          // Clean up observers based on namespace
          const globalObservers = (window as any).__observerRegistry__ || {}
          
          // If there's a specific ID, clean up observers for that ID
          if (id && globalObservers[observerNamespace]) {
            const observers = globalObservers[observerNamespace][id] || []
            observers.forEach((observer: any) => {
              try {
                if (observer && typeof observer.disconnect === 'function') {
                  observer.disconnect()
                }
              } catch (error) {
                console.debug(`Observer cleanup error for ${observerNamespace}:${id}:`, error)
              }
            })
            // Clear the observers for this specific ID
            delete globalObservers[observerNamespace][id]
          } else {
            // Clean up all observers in the namespace
            const observers = globalObservers[observerNamespace] || []
            if (Array.isArray(observers)) {
              observers.forEach((observer: any) => {
                try {
                  if (observer && typeof observer.disconnect === 'function') {
                    observer.disconnect()
                  }
                } catch (error) {
                  console.debug(`Observer cleanup error for ${observerNamespace}:`, error)
                }
              })
            } else {
              // If it's an object with IDs, clean up all
              Object.values(observers).forEach((observerList: any) => {
                if (Array.isArray(observerList)) {
                  observerList.forEach((observer: any) => {
                    try {
                      if (observer && typeof observer.disconnect === 'function') {
                        observer.disconnect()
                      }
                    } catch (error) {
                      console.debug(`Observer cleanup error for ${observerNamespace}:`, error)
                    }
                  })
                }
              })
            }
          }
        } catch (error) {
          console.debug(`Container cleanup error for ${observerNamespace}:`, error)
        }
      }
    }
  }, [id, observerNamespace])

  // Create the element with the specified tag
  const Element = as as React.ElementType
  
  return React.createElement(
    Element,
    {
      ref: containerRef,
      key: id,
      className,
      ...otherProps
    },
    children
  )
}
