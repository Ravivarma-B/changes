import React, { useRef, useEffect, ReactNode } from 'react'

interface SplitViewWrapperProps {
  children: ReactNode
  isActive: boolean
}

export const SplitViewWrapper: React.FC<SplitViewWrapperProps> = ({ 
  children, 
  isActive 
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isActive) {
      // When split view is deactivated, ensure clean observer cleanup
      const cleanup = () => {
        try {
          if (typeof window !== 'undefined') {
            // Force disconnect all observers that might be attached to this container
            const container = wrapperRef.current
            if (container) {
              // Find all elements with observers in this container
              const elements = container.querySelectorAll('*')
              elements.forEach((element) => {
                // Clear any potential observer references
                const elementAny = element as any
                if (elementAny.__observers__) {
                  elementAny.__observers__.forEach((observer: any) => {
                    try {
                      if (observer && typeof observer.disconnect === 'function') {
                        observer.disconnect()
                      }
                    } catch (e) {
                      // Ignore individual errors
                    }
                  })
                  delete elementAny.__observers__
                }
              })
            }
          }
        } catch (error) {
          console.debug('Split view cleanup error:', error)
        }
      }

      // Use setTimeout to ensure cleanup happens after React unmounting
      const timeoutId = setTimeout(cleanup, 0)
      
      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [isActive])

  if (!isActive) {
    return null
  }

  return (
    <div ref={wrapperRef}>
      {children}
    </div>
  )
}
