import { FieldType } from "@/components/dynamic-form/formBuilder.types";
import {
  Calendar,
  CalendarClock,
  CreditCard,
  GitBranch,
  Group,
  List,
  ListCheck,
  ListChecks,
  Lock,
  MapPin,
  Phone,
  Radio,
  Signature,
  Sliders,
  SquareMousePointer,
  Star,
  Tags,
  Text,
  TextCursorInput,
  TextQuote,
  ToggleRight,
  Upload,
} from "lucide-react";

export const fieldTypes: FieldType[] = [
  {
    id: "wysiwyg",
    name: "WYSIWYG",
    isNew: true,
    icon: TextQuote,
    showInFormBuilder: true,
  },
  {
    id: "group",
    name: "Group",
    isNew: true,
    icon: Group,
    showInFormBuilder: false,
  },
  {
    id: "checkbox",
    name: "Checkbox",
    isNew: false,
    icon: SquareMousePointer,
    showInFormBuilder: true,
  },
  {
    id: "combobox",
    name: "Combobox",
    isNew: false,
    icon: List,
    showInFormBuilder: true,
  },
  {
    id: "date-picker",
    name: "Date Picker",
    isNew: false,
    icon: Calendar,
    showInFormBuilder: true,
  },
  {
    id: "datetime-picker",
    name: "Datetime Picker",
    isNew: false,
    icon: CalendarClock,
    showInFormBuilder: true,
  },
  {
    id: "file-input",
    name: "File Input",
    isNew: false,
    icon: Upload,
    showInFormBuilder: true,
  },
  {
    id: "input",
    name: "Input",
    isNew: false,
    icon: TextCursorInput,
    showInFormBuilder: true,
  },
  {
    id: "location-input",
    name: "Location Input",
    isNew: false,
    icon: MapPin,
    showInFormBuilder: true,
  },
  {
    id: "multi-select",
    name: "Multi Select",
    isNew: false,
    icon: ListChecks,
    showInFormBuilder: true,
  },
  {
    id: "password",
    name: "Password",
    isNew: false,
    icon: Lock,
    showInFormBuilder: true,
  },
  {
    id: "phone",
    name: "Phone",
    isNew: false,
    icon: Phone,
    showInFormBuilder: true,
  },
  {
    id: "select",
    name: "Select",
    isNew: false,
    icon: ListCheck,
    showInFormBuilder: true,
  },
  {
    id: "signature-input",
    name: "Signature Input",
    isNew: true,
    icon: Signature,
    showInFormBuilder: true,
  },
  {
    id: "slider",
    name: "Slider",
    isNew: false,
    icon: Sliders,
    showInFormBuilder: true,
  },
  {
    id: "switch",
    name: "Switch",
    isNew: false,
    icon: ToggleRight,
    showInFormBuilder: true,
  },
  {
    id: "tags-input",
    name: "Tags Input",
    isNew: false,
    icon: Tags,
    showInFormBuilder: true,
  },
  {
    id: "textarea",
    name: "Textarea",
    isNew: false,
    icon: Text,
    showInFormBuilder: true,
  },
  {
    id: "rating",
    name: "Rating",
    isNew: true,
    icon: Star,
    showInFormBuilder: true,
  },
  {
    id: "radio-group",
    name: "RadioGroup",
    isNew: false,
    icon: Radio,
    showInFormBuilder: true,
  },
  {
    id: "credit-card",
    name: "Credit Card",
    isNew: true,
    icon: CreditCard,
    showInFormBuilder: true,
  },
  {
    id: "tree",
    name: "Tree",
    isNew: true,
    icon: GitBranch,
    showInFormBuilder: true,
  },
];
export const defaultFieldConfig: Record<
  string,
  {
    label: { en: string; ar: string };
    description: { en: string; ar: string };
    placeholder?: { en: string; ar: string };
  }
> = {
  Checkbox: {
    label: { en: "Checkbox Field", ar: "حقل مربع الاختيار" },
    description: {
      en: "Select this option if applicable.",
      ar: "اختر هذا الخيار إذا كان مناسباً.",
    },
    placeholder: { en: "", ar: "" },
  },
  Combobox: {
    label: { en: "Combobox Field", ar: "حقل صندوق التحديد" },
    description: {
      en: "Select an option from the dropdown.",
      ar: "اختر خياراً من القائمة المنسدلة.",
    },
    placeholder: { en: "Select option", ar: "اختر خياراً" },
  },
  "Date Picker": {
    label: { en: "Date Field", ar: "حقل التاريخ" },
    description: { en: "Please select a date.", ar: "يرجى اختيار تاريخ." },
    placeholder: { en: "Select date", ar: "اختر التاريخ" },
  },
  "Datetime Picker": {
    label: { en: "Date & Time Field", ar: "حقل التاريخ والوقت" },
    description: {
      en: "Please select date and time.",
      ar: "يرجى اختيار التاريخ والوقت.",
    },
    placeholder: { en: "Select date & time", ar: "اختر التاريخ والوقت" },
  },
  "File Input": {
    label: { en: "File Upload", ar: "رفع ملف" },
    description: { en: "Upload your file here.", ar: "ارفع ملفك هنا." },
    placeholder: { en: "Choose file...", ar: "اختر ملفاً..." },
  },
  Input: {
    label: { en: "Text Field", ar: "حقل النص" },
    description: { en: "Enter your text here.", ar: "أدخل نصك هنا." },
    placeholder: { en: "Enter value", ar: "أدخل القيمة" },
  },
  "Location Input": {
    label: { en: "Location Field", ar: "حقل الموقع" },
    description: { en: "Select your location.", ar: "اختر موقعك." },
    placeholder: { en: "Search location", ar: "ابحث عن الموقع" },
  },
  "Multi Select": {
    label: { en: "Multi Select Field", ar: "حقل الاختيار المتعدد" },
    description: {
      en: "Select one or more options.",
      ar: "اختر خياراً واحداً أو أكثر.",
    },
    placeholder: { en: "Select options...", ar: "اختر الخيارات..." },
  },
  Select: {
    label: { en: "Select Field", ar: "حقل الاختيار" },
    description: {
      en: "Choose an option from the list.",
      ar: "اختر خياراً من القائمة.",
    },
    placeholder: { en: "Select an option", ar: "اختر خياراً" },
  },
  Slider: {
    label: { en: "Slider Field", ar: "حقل الشريط المنزلق" },
    description: {
      en: "Adjust the value using the slider.",
      ar: "اضبط القيمة باستخدام الشريط المنزلق.",
    },
    placeholder: { en: "", ar: "" },
  },
  "Signature Input": {
    label: { en: "Signature Field", ar: "حقل التوقيع" },
    description: {
      en: "Please provide your signature.",
      ar: "يرجى تقديم توقيعك.",
    },
    placeholder: { en: "Draw your signature", ar: "ارسم توقيعك" },
  },
  Switch: {
    label: { en: "Switch Field", ar: "حقل المفتاح" },
    description: {
      en: "Toggle this option on or off.",
      ar: "فعّل أو أوقف هذا الخيار.",
    },
    placeholder: { en: "", ar: "" },
  },
  "Tags Input": {
    label: { en: "Tags Field", ar: "حقل الوسوم" },
    description: {
      en: "Add tags by typing and pressing enter.",
      ar: "أضف وسوماً بالكتابة والضغط على إدخال.",
    },
    placeholder: { en: "Type and press enter...", ar: "اكتب واضغط إدخال..." },
  },
  Textarea: {
    label: { en: "Text Area Field", ar: "حقل منطقة النص" },
    description: {
      en: "Enter your detailed text here.",
      ar: "أدخل نصك المفصل هنا.",
    },
    placeholder: { en: "Enter your text...", ar: "أدخل نصك..." },
  },
  Password: {
    label: { en: "Password Field", ar: "حقل كلمة المرور" },
    description: {
      en: "Enter your password.",
      ar: "أدخل كلمة المرور الخاصة بك.",
    },
    placeholder: { en: "Enter password", ar: "أدخل كلمة المرور" },
  },
  Phone: {
    label: { en: "Phone Number Field", ar: "حقل رقم الهاتف" },
    description: { en: "Enter your phone number.", ar: "أدخل رقم هاتفك." },
    placeholder: { en: "Enter phone number", ar: "أدخل رقم الهاتف" },
  },
  Rating: {
    label: { en: "Rating Field", ar: "حقل التقييم" },
    description: { en: "Provide your rating.", ar: "قدم تقييمك." },
    placeholder: { en: "Select rating", ar: "اختر التقييم" },
  },
  RadioGroup: {
    label: { en: "Radio Group Field", ar: "حقل مجموعة الاختيار" },
    description: {
      en: "Select one option from the group.",
      ar: "اختر خياراً واحداً من المجموعة.",
    },
    placeholder: { en: "Choose one", ar: "اختر واحداً" },
  },
  "Credit Card": {
    label: { en: "Credit Card Field", ar: "حقل بطاقة الائتمان" },
    description: {
      en: "Enter your credit card information.",
      ar: "أدخل معلومات بطاقة الائتمان الخاصة بك.",
    },
    placeholder: { en: "Card details", ar: "تفاصيل البطاقة" },
  },
  Tree: {
    label: { en: "Tree Field", ar: "حقل بطاقة الائتمان" },
    description: {
      en: "Create your own tree structred data",
      ar: "أدخل معلومات بطاقة الائتمان الخاصة بك.",
    },
    placeholder: { en: "Tree details", ar: "تفاصيل البطاقة" },
  },
};

export function getVariantIcon(variant: string) {
  return fieldTypes.find((fieldType: FieldType) => fieldType.name === variant)
    ?.icon;
}

export const DropdownPresets = [
  { name: "country", location: "data/country.json" },
  { name: "state", location: "data/state.json" },
];
