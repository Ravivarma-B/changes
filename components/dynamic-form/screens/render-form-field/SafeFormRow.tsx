import React, { ReactNode } from 'react'
import { SafeObserverContainer } from '../../components/SafeObserverContainer'

interface SafeFormRowProps {
  children: ReactNode
  className?: string
  rowId?: string
  rowIndex?: number
}

export const SafeFormRow: React.FC<SafeFormRowProps> = ({ 
  children, 
  className = "grid grid-cols-12 gap-4",
  rowId,
  rowIndex 
}) => {
  return (
    <SafeObserverContainer 
      id={rowId ?? `row-${rowIndex}`}
      className={className}
      observerNamespace="formRows"
    >
      {children}
    </SafeObserverContainer>
  )
}
