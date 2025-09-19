import z from "zod";

type LocalizedText = {
  [key: string]: string;
};
type LocaleStructure = Record<string, LocalizedText>;
export const fieldLabels: LocaleStructure = {
  name: {
    en: "Name",
    ar: "الاسم",
  },
  description: {
    en: "Description",
    ar: "الوصف",
  },
  placeholder: {
    en: "Placeholder",
    ar: "نص افتراضي",
  },
  options: {
    en: "Options",
    ar: "خيارات",
  },
  label: {
    en: "Label",
    ar: "تسمية",
  },
  value: {
    en: "Value",
    ar: "قيمة",
  },
  showLabel: {
    en: "Show Label",
    ar: "عرض التسمية",
  },
  className: {
    en: "Class Name(s)",
    ar: "اسم الفئة",
  },
  containerClassName: {
    en: "Container Class Name(s)",
    ar: "اسم فئة الحاوية",
  },
  selectOption: {
    en: "Select Options",
    ar: "التطبيق",
  },
  width: {
    en: "Width",
    ar: "العرض",
  },
  visibility: {
    en: "Visibility",
    ar: "الظهور",
  },
  validation: {
    en: "Validation",
    ar: "التحقق",
  },
  min: {
    en: "min",
    ar: "الحد الأدنى",
  },
  max: {
    en: "max",
    ar: "الحد الأقصى",
  },
  required: {
    en: "Required",
    ar: "إلزامي",
  },
  disabled: {
    en: "Disabled",
    ar: "معطل",
  },
  pattern: {
    en: "Pattern",
    ar: "نمط",
  },
  patternPlaceholder: {
    en: "Custom validation (e.g. ^[A-Z]{3}\\d{2}$)",
    ar: "تحقق مخصص",
  },
  patternErrMessage: {
    en: "Pattern Message",
    ar: "رسالة النمط",
  },
  patternErrPlaceHolder: {
    en: "Pattern Error Message",
    ar: "رسالة خطأ النمط",
  },
  conditionalRender: {
    en: "Conditional Render",
    ar: "عرض مشروط",
  },
  conditionalDisable: {
    en: "Conditional Disable",
    ar: "تعطيل مشروط",
  },
  conditionalRequire: {
    en: "Conditional Require",
    ar: "شرط متطلب",
  },
  conditionalLogic: {
    en: "Conditional Logic",
    ar: "عرض مشروط",
  },
  step: {
    en: "Step",
    ar: "خطوة",
  },
  repeatable: {
    en: "Repeatable",
    ar: "قابل للتكرار",
  },
  type: {
    en: "Type",
    ar: "نوع",
  },
  appearance: {
    en: "Appearance",
    ar: "مظهر",
  },
  selectWidth: {
    en: "Select Width",
    ar: "حدد العرض",
  },
  selectCondition: {
    en: "Select Operator",
    ar: "حدد عامل",
  },
  selectField: {
    en: "Select Field",
    ar: "حدد الحقل",
  },
  addOption: {
    en: "Add Option",
    ar: "إضافة خيار",
  },
  general: {
    en: "General",
    ar: "عام",
  },
  enterComparsionValue: {
    en: "Enter Comparsion Value",
    ar: "أدخل قيمة المقارنة",
  },
  maxValueErrorMsg: {
    en: "Max Value Error Message",
    ar: "رسالة خطأ الحد الأقصى",
  },
  minValueErrorMsg: {
    en: "Min Value Error Message",
    ar: "رسالة خطأ الحد الأدنى",
  },
  maxValue: {
    en: "Max Value",
    ar: "القيمة القصوى",
  },
  minValue: {
    en: "Min Value",
    ar: "القيمة الدنيا",
  },
  requiredErrorMsg: {
    en: "Required Error Message",
    ar: "رسالة الخطأ المطلوبة",
  },
  selectOptionsType: {
    en: "Select Options Type",
    ar: "حدد نوع الخيارات",
  },
  selectPredefinedSource: {
    en: "Select Predefined Source",
    ar: "حدد المصدر المحدد مسبقًا",
  },
  apiURL: {
    en: "API URL",
    ar: "حدد المصدر المحدد مسبقًا",
  },
  fetch: {
    en: "Fetch",
    ar: "أحضر",
  },
  fetching: {
    en: "Fetching...",
    ar: "جلب",
  },
  save: {
    en: "Save",
    ar: "يحفظ",
  },
  responsePreview: {
    en: "Response Preview",
    ar: "معاينة الاستجابة",
  },
  labelKey: {
    en: "Label Key",
    ar: "معاينة الاستجابة",
  },
  valueKey: {
    en: "Value Key",
    ar: "معاينة الاستجابة",
  },
  constructTree: {
    en: "Construct Tree",
    ar: "معاينة الاستجابة",
  },
};

export enum Language {
  EN = "en",
  AR = "ar",
}
export enum DataSource {
  MANUAL = "manual",
  API = "api",
  PREDEFINED = "predefined",
}
export const DEFAULT_LANGUAGE = Language.EN;
export const SUPPORTED_LANGUAGE = [Language.EN, DEFAULT_LANGUAGE];
export const MANUAL = DataSource.MANUAL;
export const API = DataSource.API;
export const PREDEFINED = DataSource.PREDEFINED;

export const localizedString = (langs: string[]) =>
  z.object(Object.fromEntries(langs.map((lang) => [lang, z.string()])));
