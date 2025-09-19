"use client";

import { componentsMap } from "../dynamic-components/componentsMap";
import { FormFieldType } from "../dynamic-form/formBuilder.types";
3;

export type FieldEventType = (
  updates: Partial<any> | ((prev: FormFieldType) => Partial<FormFieldType>),
  immediate?: boolean
) => void;

export default function DynamicRenderer({
  componentName,
  ...props
}: {
  componentName: string;
  [key: string]:
    | string
    | number
    | boolean
    | Record<string, unknown>
    | FieldEventType;
}) {
  const Component = componentsMap[componentName];
  if (!Component) return <div>Component not found</div>;
  return <Component {...props} />;
}
