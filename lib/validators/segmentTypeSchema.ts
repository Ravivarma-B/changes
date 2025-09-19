import { z } from "zod";

export const segmentTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(3, "Segment name is required"),
  nameAr: z.string().min(3, "Segment name(ar) is required"),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Max 100 characters"),
  fields: z.array(z.record(z.string(), z.any())),
  formTemplate: z.record(z.string(), z.any()).optional(),
});

export type SegmentType = z.infer<typeof segmentTypeSchema>;
