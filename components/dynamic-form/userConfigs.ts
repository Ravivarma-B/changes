import { ZodAny } from "zod";

export type UserFieldValidation = Record<string, ZodAny>;

export type PropOverride =
  | { type: "value"; value: string | number | boolean | object }
  | { type: "component"; component: string; panel: string };

export type PanelPropOverride =
  | { type: "value"; value: string | number | boolean | object }
  | { type: "component"; component: string };

export type FieldConfig = {
  label: {
    [lang: string]: string;
  };
  description?: {
    [lang: string]: string;
  };
  placeholder?: {
    [lang: string]: string;
  };
  component?: string;
  variant: "dynamic";
};

export interface FieldControlConfig {
  /**
   * Enable or disable the entire field type
   */
  enabled?: boolean;

  /**
   * Remove props from this variant
   * Example: ["placeholder", "description"]
   */
  removeProps?: string[];

  /**
   * Replace with a custom component
   */
  componentOverride?: string;

  /**
   * Per-prop overrides
   */
  overrides?: Record<string, PropOverride>;
}

export interface UserFieldConfig {
  /**
   * Config per field type (matching `fieldTypes[].id`)
   */
  fields?: Record<string, FieldControlConfig>;

  /**
   * Panel-level config
   */
  panels?: Record<
    string,
    {
      enabled?: boolean;
      order?: string[];
      removeProps?: string[];
      overrides?: Record<string, PanelPropOverride>;
    }
  >;

  newFields?: Record<string, FieldConfig>;

  /**
   * Global order of fields in builder (if user wants explicit ordering)
   */
  order?: string[];
}

export const userFieldConfig: UserFieldConfig = {
  fields: {
    tree: {
      overrides: {
        dataSource: { type: "value", value: "" },
        treeComponent: {
          type: "component",
          component: "TreeDataSource",
          panel: "general",
        },
      },
    },
  },
  newFields: {
    table: {
      label: { en: "Table", ar: "جدول" },
      description: { en: "A structured table layout", ar: "تخطيط جدول منظم" },
      placeholder: { en: "Configure table", ar: "تكوين الجدول" },
      component: "TableField",
      variant: "dynamic",
    },
  },
};

type PanelComponentConfig = {
  component: string;
  panel: string;
};

type PanelConfigMap = Record<string, PanelComponentConfig>;

/**
 * Get components by panel name
 */
export function getComponentsByPanel(
  config: PanelConfigMap,
  panelName: string
): string[] {
  return Object.values(config)
    .filter((entry) => entry.panel === panelName)
    .map((entry) => entry.component);
}

/**
 * Get components (with their prop names) by panel name
 */
export function getPropComponentsByPanel(
  config: PanelConfigMap,
  panelName: string
): { propName: string; component: string }[] {
  return Object.entries(config)
    .filter(([_, entry]) => entry.panel === panelName)
    .map(([propName, entry]) => ({
      propName,
      component: entry.component,
    }));
}
