import { z } from "zod";

export const entityTypeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Entity-type name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Max 100 characters"),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  segmentTypeIds: z.array(z.string()).default([]), // array of SegmentType IDs
  formTemplate: z.record(z.string(), z.any()).optional(),
});

export type EntityTypeForm = z.infer<typeof entityTypeFormSchema>;
