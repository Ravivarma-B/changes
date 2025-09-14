import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";

export type UpdateFieldFn = (
  updates: Partial<FormFieldType>,
  immediate?: boolean
) => void;

export type FieldGetter<T> = (f: FormFieldType, lang: string) => T;
export type FieldSetter<T> = (
  val: T,
  f: FormFieldType,
  lang: string
) => Partial<FormFieldType>;

export type SwitchGetter = (f: FormFieldType) => boolean;
export type SwitchSetter = (
  val: boolean,
  f: FormFieldType
) => Partial<FormFieldType>;

export type SelectGetter = (f: FormFieldType) => string;
export type SelectSetter = (
  val: string,
  f: FormFieldType
) => Partial<FormFieldType>;
