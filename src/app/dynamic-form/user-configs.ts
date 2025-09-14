import { ZodAny } from "zod";

export type UserFieldValidation = Record<string, ZodAny>;

// export interface UserFieldConfig {
//   overrides?: Record<
//     string,
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     Record<string, string | number | boolean | Record<string, any>>
//   >;
//   order?: string[]; // explicit order of fields
//   validation?: Record<string, UserFieldValidation>; // per field schema extensions
// }

// export const userFieldConfig: UserFieldConfig = {
//   overrides: {
//     tree: { dataSource: "", propComponent: { name: "TreeDataSource" } },
//   },
// };

export type PropOverride =
  | { type: "value"; value: string | number | boolean | object }
  | { type: "component"; component: string; panel: string };

export type PanelPropOverride =
  | { type: "value"; value: string | number | boolean | object }
  | { type: "component"; component: string };

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
      componentOverrides?: Record<string, string>;
    }
  >;

  /**
   * Global order of fields in builder (if user wants explicit ordering)
   */
  order?: string[];
}

// export interface UserFieldConfig {
//   overrides?: Record<
//     string,
//     Record<string, string | number | boolean | Record<string, unknown>>
//   >; // props adding the
//   order?: string[]; // ordering
//   validation?: Record<string, UserFieldValidation>; // extending validation of field
//   enabled?: Record<string, boolean>; // enable/disable components/fields in form-builder
//   panels?: Record<
//     string,
//     {
//       enabled?: boolean; // enabling/disabling the panel
//       order?: string[]; // ordering the props display
//       overrides?: Record<
//         string,
//         Record<string, string | number | boolean | Record<string, unknown>>
//       >; // overriding the props
//       componentOverrides?: Record<string, string>; // overriding props display with external component
//     }
//   >;
//   /**
//    * Component replacement on a per-variant basis
//    * e.g. { Slider: CustomSlider, Tree: MyTreeEditor }
//    */
//   componentOverrides?: Record<string, string>;
// }

// import { ZodAny } from "zod";

// export type UserFieldValidation = Record<string, ZodAny>;

// // type panels =
// //   | "general"
// //   | "appearance"
// //   | "validation"
// //   | "conditional"
// //   | "conditionalLogic";

// export interface UserFieldConfig {
//   overrides?: Record<
//     string,
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     | Record<string, string | number | boolean>
//     | { components: { name: string; panel: string }[] }
//   >;
//   order?: string[]; // explicit order of fields
//   validation?: Record<string, UserFieldValidation>; // per field schema extensions
// }

// export const userFieldConfig: UserFieldConfig = {
//   overrides: {
//     tree: {
//       dataSource: "",
//       components: [{ name: "TreeDataSource", panel: "general" }],
//     },
//   },
// };

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

  // overrides: {
  //   tree: { dataSource: "", propComponent: { name: "TreeDataSource" } },
  // },
};
