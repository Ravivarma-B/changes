"use client";

import { GripVertical, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Else, If, Then } from "react-if";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Button } from "web-utils-components/button";
import { FormFieldType, FormRow } from "../../formBuilder.types";
import { useFormBuilderStore } from "../../store/formBuilder.store";
import {
  createNewFieldWithDynamicProps,
  generateUniqueId,
} from "../../utils/FormUtils";
import { EditPreviewPanel } from "../edit-preview-panel";
import { FieldSelector } from "../field-selector";
import { FormInspectorPanel } from "../form-inspector-panel";

type FormBuilderProps = {
  schema?: FormRow[];
};

export default function FormBuilder({ schema = [] }: FormBuilderProps) {
  const { formFields, setFormFields, setSelectedField } = useFormBuilderStore();

  const [selectedInspectorTab, setSelectedInspectorTab] =
    useState("properties");
  const [selectedPreviewTab, setSelectedPreviewTab] = useState("design");
  const leftRef = useRef<ImperativePanelHandle>(null);
  const rightRef = useRef<ImperativePanelHandle>(null);
  const [containerWidth, setContainerWidth] = useState(1200); // Set a reasonable default
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateWidth = () => {
      if (groupRef.current && groupRef.current.offsetWidth) {
        setContainerWidth(groupRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    if (schema.length > 0) {
      setFormFields(schema);
      const firstField = schema[0].fields[0];
      if (firstField) {
        setSelectedField(firstField);
      }
    }

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  // Calculate panel sizes with safeguards
  const minPercentLeftPanel =
    containerWidth > 0 ? Math.min((70 / containerWidth) * 100, 5) : 5;
  const minPercentRightPanel =
    containerWidth > 0 ? Math.min((400 / containerWidth) * 100, 25) : 25;

  // Cleanup effect to prevent IntersectionObserver errors
  useEffect(() => {
    return () => {
      // Ensure proper cleanup to prevent IntersectionObserver errors on unmount
      try {
        if (leftRef.current) {
          leftRef.current = null;
        }
        if (rightRef.current) {
          rightRef.current = null;
        }
        if (groupRef.current) {
          groupRef.current = null;
        }
      } catch (error) {
        console.warn("Cleanup error:", error);
      }
    };
  }, []);

  const addFormField = (variant: string, index: number) => {
    const newField = createNewFieldWithDynamicProps(variant, index);
    console.log(newField);
    setFormFields([
      ...formFields,
      { rowId: generateUniqueId(), fields: [newField] },
    ]);
    if (formFields.length === 0) {
      setSelectedField(newField);
    }
  };

  const openEditPanel = (field: FormFieldType) => {
    try {
      rightRef.current?.expand();
      setSelectedField(field);
      setSelectedInspectorTab("properties");
    } catch (error) {
      console.warn("Failed to open edit panel:", error);
    }
  };

  const FieldSelectorWrapper = ({
    addFormField,
  }: {
    addFormField: (variant: string, index?: number) => void;
  }) => (
    <div className="flex flex-col md:flex-row gap-3">
      <FieldSelector addFormField={addFormField} />
    </div>
  );

  return (
    <section
      ref={groupRef}
      className="relative h-[calc(100vh-55px)] w-full space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Gradient background effects */}
      <div className="fixed -top-20 left-1/4 w-[300px] h-[700px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-10 dark:opacity-20 rounded-full blur-3xl"></div>
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-gradient-to-l from-yellow-400/10 via-orange-500/10 to-red-500/10 opacity-10 dark:opacity-20 rounded-full blur-3xl"></div>
      {/* <div className="fixed top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-br from-green-400/10 via-teal-500/10 to-blue-500/10 opacity-20 dark:opacity-30 rounded-full blur-3xl"></div> */}

      <If condition={formFields.length > 0}>
        <Then>
          <PanelGroup direction="horizontal" className="relative z-10">
            <Panel
              ref={leftRef}
              defaultSize={15}
              minSize={minPercentLeftPanel}
              maxSize={16}
              collapsible={true}
              collapsedSize={minPercentLeftPanel}
            >
              <FieldSelectorWrapper
                addFormField={(variant: string, index: number = 0) =>
                  addFormField(variant, index)
                }
              />
            </Panel>
            <PanelResizeHandle className="relative w-3 border-l border-l-gray-200 dark:border-l-gray-800 border-r border-r-gray-100 dark:border-r-gray-950 flex items-center justify-center cursor-col-resize">
              <GripVertical strokeWidth={1} />
            </PanelResizeHandle>
            <Panel minSize={30} defaultSize={40}>
              <EditPreviewPanel
                openEditPanel={openEditPanel}
                onTabChange={setSelectedPreviewTab}
              />
            </Panel>
            <PanelResizeHandle className="relative w-3 border-l border-r-gray-200 dark:border-r-gray-800 border-r border-l-gray-100 dark:border-l-gray-950 flex items-center justify-center cursor-col-resize">
              <GripVertical strokeWidth={1} />
            </PanelResizeHandle>
            <Panel
              ref={rightRef}
              defaultSize={minPercentRightPanel}
              maxSize={35}
              minSize={minPercentRightPanel}
              collapsible={true}
            >
              <div className="overflow-auto relative h-[calc(100vh-45px)] pt-3 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md border-l border-white/20 dark:border-gray-700/50">
                <div className="absolute top-4 right-4">
                  <Button
                    size={"icon"}
                    className="p-0 w-6 h-6 rounded-sm bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-white/30 dark:border-gray-600/30 hover:bg-white/80 dark:hover:bg-gray-700/80"
                    variant={"outline"}
                    onClick={() => {
                      try {
                        rightRef.current?.collapse();
                      } catch (error) {
                        console.warn("Failed to collapse panel:", error);
                      }
                    }}
                  >
                    {" "}
                    <X size={8} className="w-2 h-2" />{" "}
                  </Button>
                </div>
                <FormInspectorPanel
                  openPanel={selectedInspectorTab}
                  onTabChange={setSelectedInspectorTab}
                />
              </div>
            </Panel>
          </PanelGroup>
        </Then>
        <Else>
          <div className="flex flex-col md:flex-row items-center gap-3 md:px-5">
            <FieldSelectorWrapper
              addFormField={(variant: string, index: number = 0) =>
                addFormField(variant, index)
              }
            />
            <header className="flex flex-col items-center gap-1.5 py-6 w-full">
              <h1 className="font-text-3xl-leading-none-semibold text-slate-900 dark:text-slate-100 text-[30px] tracking-[-0.75px] leading-none font-semibold text-center">
                No field added yet
              </h1>
              <p className="font-text-sm-leading-5-normal text-slate-500 dark:text-slate-400 text-sm leading-5 text-center">
                Start by selecting a component from the left.
              </p>
            </header>
          </div>
        </Else>
      </If>
    </section>
  );
}
