import { z } from "zod";

export const segmentTypeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Segment-type name is required"),
  nameAr: z.string().min(3, "Segment-type name(ar) is required"),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Max 100 characters"),
  formTemplate: z.record(z.string(), z.any()).optional(),
});

export type SegmentTypeForm = z.infer<typeof segmentTypeFormSchema>;
