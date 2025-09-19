import { z } from "zod";

export const documentTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  isActive: z.boolean().optional(),
  departmentIds: z.array(z.number()).optional(),
  workflowIds: z.array(z.string()).optional(),
  formTemplate: z.record(z.string(), z.any()).optional(),
});

export type DocumentType = z.infer<typeof documentTypeSchema>;
