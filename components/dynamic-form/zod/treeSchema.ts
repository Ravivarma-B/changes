import { z } from "zod";

// Node schema
export const TreeNodeSchema: z.ZodType<{
  id: string;
  name: string;
  expanded?: boolean;
  icon?: string;
  isUserIcon?: boolean;
  children?: TreeNode[];
}> = z.lazy(() =>
  z
    .object({
      id: z
        .string()
        .min(1, "ID is required")
        .or(z.number().min(1).transform(String)),
      name: z.string().min(1, "Name is required").max(100, "Name too long"),
      expanded: z.boolean().optional(),
      isUserIcon: z.boolean().optional(),
      icon: z.custom<string>().optional(),
      children: z.array(TreeNodeSchema).optional(),
    })
    .catchall(z.unknown())
);

// Tree type
export type TreeNode = z.infer<typeof TreeNodeSchema>;
export const TreeSchema = z.array(TreeNodeSchema);

export const TreeSettingsSchema = z.object({
  parentSelection: z.boolean().default(false),
  selectable: z.boolean().default(true),
  multiple: z.boolean().default(true),
  treeLines: z.boolean().default(true),
});

export type TreeSettings = z.infer<typeof TreeSettingsSchema>;
