import { z } from "zod";

export const roleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export type RoleForm = z.infer<typeof roleFormSchema>;
