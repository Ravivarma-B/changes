import { z } from "zod";

export const documentTypeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  createdBy: z.string().optional(),
  isActive: z.boolean().optional(),
  departmentIds: z.array(z.number()).optional(),
  workflowIds: z.array(z.string()).optional(),
  formTemplate: z.record(z.string(), z.any()).optional(),
});

export type DocumentTypeForm = z.infer<typeof documentTypeFormSchema>;
