import { z } from "zod";

export const entityTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Entity name is required"),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Max 100 characters"),
  segmentTypeIds: z.array(z.string()).default([]),
  attributes: z.array(z.any()).default([]),
  formTemplate: z.record(z.string(), z.any()).optional(),
});

export type EntityType = z.infer<typeof entityTypeSchema>;
