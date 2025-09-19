import { z } from "zod";

export const departmentFormSchema = z.object({
  parentDepartment: z.string().min(1, "Parent department is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  status: z.string().min(1, "Status is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  departmentType: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export type DepartmentForm = z.infer<typeof departmentFormSchema>;
