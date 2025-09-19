import React, { ReactNode } from 'react'
import { SafeObserverContainer } from '../../components/SafeObserverContainer'

interface SafeFieldContainerProps {
  children: ReactNode
  className?: string
  fieldKey: string
}

export const SafeFieldContainer: React.FC<SafeFieldContainerProps> = ({ 
  children, 
  className,
  fieldKey 
}) => {
  return (
    <SafeObserverContainer 
      id={fieldKey}
      className={className}
      observerNamespace="formFields"
    >
      {children}
    </SafeObserverContainer>
  )
}
