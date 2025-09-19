import { z } from "zod";

export const positionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, "Position name is required"),
  departmentId: z.string().min(1, "department is required"),
  roleId: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});

export type Position = z.infer<typeof positionSchema>;
