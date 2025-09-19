import { EditForm } from "../edit-form";
import { FormFieldType } from "../../formBuilder.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "web-utils-components/tabs";
import { If, Then, Else } from 'react-if';
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues, generateZodSchema } from "../generate-code-parts";
import z from "zod";
import { Button } from "web-utils-components/button";
import { useMemo, useState, useEffect } from "react";
import { Columns2, Eye, GripVertical, LayoutPanelTop, X } from "lucide-react";
import { Devices, DeviceToggle } from "./DeviceToggle";
import { LanguageToggle } from "./LanguageToggle";
import EditableTitle from "./EditableTitle";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { SafePanelGroup } from "./SafePanelGroup";
import { PreviewForm } from "./PreviewForm";
import { useFormBuilderStore } from "../../store/formBuilder.store";
import UndoRedoReset from "./UndoRedo";
import { SplitViewWrapper } from "./SplitViewWrapper";

type EditPreviewPanelProps = {
    openEditPanel: (field: FormFieldType) => void
    onTabChange?: (tab: string) => void
}


export const EditPreviewPanel :React.FC<EditPreviewPanelProps> = ({
    openEditPanel,
    onTabChange
}) => {
        
    const { 
      formFields, 
      selectedLanguage,
      setSelectedLanguage 
    } = useFormBuilderStore();

    const [title, setTitle] = useState("Form #1");
    const [splitView, setSplitView] = useState<boolean>(false);
    const [selectedTab, setSelectedTab] = useState('design')
    const [device, setDevice] = useState<Devices>(Devices.NONE) // Default to desktop view
    
    const formSchema = useMemo(() => generateZodSchema(formFields, selectedLanguage), [formFields, selectedLanguage])
    const defaultVals = useMemo(() => generateDefaultValues(formFields), [formFields])

    const form: UseFormReturn = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultVals,
    })

    // Clean up observers when switching between split and tab view
    useEffect(() => {
        return () => {
            // Cleanup when splitView state changes
            try {
                if (typeof window !== 'undefined') {
                    // Get all potential observer registries and clean them up
                    const registries = [
                        '__observerRegistry__',
                        '__panelObservers__',
                        '__resizableObservers__',
                        '__fieldObservers__',
                        '__formObservers__'
                    ]
                    
                    registries.forEach(registryName => {
                        const registry = (window as any)[registryName]
                        if (registry) {
                            if (typeof registry === 'object') {
                                // Clear all namespaces in the registry
                                Object.keys(registry).forEach(key => {
                                    delete registry[key]
                                })
                            }
                        }
                    })

                    // Also disconnect any orphaned observers
                    const observers = (window as any).__allObservers__ || []
                    observers.forEach((observer: any) => {
                        try {
                            if (observer && typeof observer.disconnect === 'function') {
                                observer.disconnect()
                            }
                        } catch (e) {
                            // Ignore individual cleanup errors
                        }
                    })
                    if (observers.length > 0) {
                        (window as any).__allObservers__ = []
                    }
                }
            } catch (error) {
                // Silently handle cleanup errors
                console.debug('View transition cleanup error:', error)
            }
        }
    }, [splitView]) // Run cleanup when splitView changes

    const SplitViewButton: React.FC = () => (
      <Button 
        variant={splitView ? "outline" : "secondary"}
        className="w-8 h-8"
        onClick={() => {
          setSplitView(!splitView);
          setDevice(Devices.NONE);
        }}
      >
        {splitView ? <X size={16}/> : <Columns2 />}
      </Button>
    );

    return (
        <div className="relative h-full">
          {/* Enhanced gradient effects for design tab */}
          <div className="absolute -top-10 -left-10 w-[200px] h-[400px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-20 dark:opacity-30 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-[300px] h-[300px] bg-gradient-to-l from-yellow-400/5 via-orange-500/5 to-red-500/5 opacity-20 dark:opacity-30 rounded-full blur-2xl"></div>
          
          {splitView && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-2 shrink-0">
                <UndoRedoReset />
                <LanguageToggle
                  language={selectedLanguage}
                  onLanguageChange={(value) => setSelectedLanguage(value)}
                />
                <SplitViewButton />
              </div>
            </div>
          )}

          {!splitView? (
            <Tabs 
                key={`tabs-view-${splitView}`}
                defaultValue="preview"  
                className={`w-full pt-3 gap-0 ${selectedTab === 'design' ? ' bg-slate-100 dark:bg-gray-800/20 bg-[radial-gradient(circle,_#d1d5db_1px,_transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(circle,_#334155_1px,_transparent_1px)]': 'bg-white dark:bg-gray-900'}`}
                value={selectedTab}
                onValueChange={(value)=> { 
                    setSelectedTab(value)
                    onTabChange?.(value)
                }}
            >
               <div className="relative mb-4 px-4 flex items-center justify-between">
                  {/* Title on the left */}
                  <EditableTitle
                    title={title}
                    onChange={(value) => setTitle(value)}
                    className="shrink-0"
                  />

                  {/* Centered Tabs List */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <TabsList className=" bg-slate-100 dark:bg-slate-700/60 backdrop-blur-md border border-white/30 dark:border-slate-600/30">
                      <TabsTrigger value="design">
                        <LayoutPanelTop className="mr-1" />
                        Design
                      </TabsTrigger>
                      <TabsTrigger value="preview">
                        <Eye className="mr-1" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  {/* Right Side Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {selectedTab === "preview" ? (
                      <DeviceToggle
                        device={device}
                        onDeviceChange={(value) => setDevice(value)}
                      />
                    ) : (<UndoRedoReset />)}
                  
                    <LanguageToggle
                      language={selectedLanguage}
                      onLanguageChange={(value) => setSelectedLanguage(value)}
                    />
                    <SplitViewButton />
                  </div>
                </div>
                <TabsContent
                    value="design"
                    className="space-y-4 h-full w-full"
                  >
                    <div className='p-4 h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden  w-full bg-slate-100 dark:bg-gray-800/10 backdrop-blur-md  bg-[radial-gradient(circle,_#d1d5db_1px,_transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(circle,_#334155_1px,_transparent_1px)]'>
                        <EditForm
                            openEditPanel={openEditPanel}
                        />
                    </div>
                </TabsContent>
                <TabsContent
                    value="preview"
                    className="space-y-4 overflow-auto h-full w-full"
                >
                <If
                    condition={formFields.length > 0}>
                    <Then>
                        <PreviewForm formFields={formFields} device={device} selectedLanguage={selectedLanguage} />
                    </Then>
                    <Else>
                        <div className="h-[50vh] flex justify-center items-center">
                            <p>No form element selected yet.</p>
                        </div>
                    </Else>
                </If>
                </TabsContent>
            </Tabs>
             ): (
              <SplitViewWrapper isActive={splitView}>
                <div key={`split-view-${splitView}`}>
                  <SafePanelGroup direction={"horizontal"}>
                    <Panel defaultSize={50} minSize={20}>
                      <div className="h-full">
                        <div className={`p-4 pt-3 min-w-xl bg-slate-100 dark:bg-gray-800/30 backdrop-blur-sm bg-[radial-gradient(circle,_#d1d5db_1px,_transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(circle,_#334155_1px,_transparent_1px)]`}>
                          <div className="flex flex-col">
                            <div className="mb-8">
                              <EditableTitle
                                title={title}
                                onChange={(value) => setTitle(value)}
                                className="shrink-0"
                              />
                            </div>
                            <div className="mb-4 h-[calc(100vh-150px)] overflow-x-hidden overflow-y-auto">
                              <EditForm
                                openEditPanel={openEditPanel}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Panel>
                    <PanelResizeHandle className="relative w-3 flex border-l border-l-gray-200 dark:border-l-gray-800 border-r border-r-gray-100 dark:border-r-gray-950  items-center justify-center cursor-col-resize">
                      <GripVertical strokeWidth={1} />
                    </PanelResizeHandle>
                    <Panel defaultSize={50} minSize={20} style={{ overflow: 'visible' }}>
                      <div className="h-[calc(100vh-100px)] overflow-auto mt-14">
                          <If
                              condition={formFields.length > 0}>
                              <Then>
                                  <PreviewForm formFields={formFields} device={device}
                                               selectedLanguage={selectedLanguage}/>
                              </Then>
                              <Else>
                                  <div className="h-[50vh] flex justify-center items-center">
                                      <p>No form element selected yet.</p>
                                  </div>
                              </Else>
                          </If>
                      </div>
                    </Panel>
                  </SafePanelGroup>
                </div>
              </SplitViewWrapper>
            )}
            
        </div>
    );
}