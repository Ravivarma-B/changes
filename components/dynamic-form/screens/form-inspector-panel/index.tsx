import React, { useCallback, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'web-utils-components/tabs'
import { Form } from 'web-utils-components/form'
import { If, Then, Else } from 'react-if';
import { FormRow, FormFieldType } from '@/components/dynamic-form/formBuilder.types'
import { EditFieldPanel } from '../edit-field-panel'
import { Braces, Check, Copy, Settings2 } from 'lucide-react'
import { Language } from '../../constants/locale'
import { Button } from 'web-utils-components/button'
import { cn } from 'web-utils-common'
import { useFormBuilderStore } from '../../store/formBuilder.store'


export type Form = {
  formFields: FormRow[]
}

type FormInspectorProps = {
  openPanel: string
  onTabChange?: (tab: string) => void
}

export const FormInspectorPanel: React.FC<FormInspectorProps> = ({ 
  openPanel, 
  onTabChange, 
}) => {

  const { 
    formFields, 
    selectedField,
  } = useFormBuilderStore();

  const [copyBtn, setCopyBtn] = useState('Copy to clipboard');
  const copyData = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(formFields, null, 2));
    setCopyBtn('Copied!!');
    setTimeout(() => setCopyBtn('Copy to clipboard'), 1000);
  }, [formFields])

  return (
    <div className={`min-w-sm h-full rounded-xl`}>
      <Tabs defaultValue="properties" value={openPanel} className="w-full gap-0" 
        onValueChange={(value)=> { 
          onTabChange?.(value) 
        }}
      >
        <TabsList className="flex justify-center w-fit mx-auto bg-slate-100 dark:bg-slate-700/60 backdrop-blur-md ">
          <TabsTrigger value="properties"><Settings2 />Properties</TabsTrigger>
          <TabsTrigger value="json"><Braces />JSON</TabsTrigger>
        </TabsList>
        <TabsContent
          value="properties"
          className="space-y-4"
        >
          {openPanel === 'properties' && (
            <EditFieldPanel />
          )}
        </TabsContent>
        <TabsContent 
          value="json"
          className="space-y-4 h-full overflow-auto px-4"
        >
            <If condition={formFields.length > 0}>
                <Then>
                    <div className="relative">
                <pre
                    className="p-4 pt-12 text-sm bg-secondary dark:bg-slate-700 text-wrap mt-4 min-w-xs rounded-lg h-full overflow-auto">
                  {JSON.stringify(formFields, null, 2)}
                </pre>
                        <div className="absolute top-3 right-2">
                            <Button
                                type="button"
                                className={cn(
                                    'text-gray-900 bg-white border border-gray-300 focus:outline-none',
                                    'hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg',
                                    'text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600',
                                    'dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700'
                                )}
                                onClick={() => copyData()}
                            >
                                {copyBtn === 'Copy to clipboard' ? <Copy/> : <Check/>}
                            </Button>
                        </div>
                    </div>
                </Then>
                <Else>
                    <div className="h-[50vh] flex mt-4 justify-center items-center">
                        <p>No form element selected yet.</p>
                    </div>
                </Else>
            </If>
        </TabsContent>
      </Tabs>
    </div>
  )
}
