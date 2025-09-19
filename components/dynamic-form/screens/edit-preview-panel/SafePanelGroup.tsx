import React, { ReactNode, useRef, useEffect } from 'react'
import { PanelGroup, PanelGroupProps } from 'react-resizable-panels'

interface SafePanelGroupProps extends PanelGroupProps {
  children: ReactNode
}

export const SafePanelGroup: React.FC<SafePanelGroupProps> = ({ children, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Simple cleanup that just clears any potential observers
      try {
        if (typeof window !== 'undefined') {
          // Clear any global observer registries related to panels
          const registry = (window as any).__observerRegistry__
          if (registry && registry.resizablePanels) {
            delete registry.resizablePanels
          }
        }
      } catch (error) {
        // Silently handle cleanup errors
        console.debug('Panel cleanup error:', error)
      }
    }
  }, [])

  return (
    <div ref={containerRef}>
      <PanelGroup {...props}>
        {children}
      </PanelGroup>
    </div>
  )
}
