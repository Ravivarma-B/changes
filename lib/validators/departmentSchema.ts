import { z } from "zod";

export const departmentSchema = z
  .object({
    id: z.number().int().optional(),
    parentId: z.number().int().optional(),
    code: z.string().min(1, "Department code is required"),
    name: z.string().min(1, "Department name is required"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(100, "Max 100 characters"),
    status: z.string().optional(),
    createdBy: z.string().optional(),
    createdAt: z.string().optional(),
    parentDepartment: z.string().optional(),
    departmentType: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true; // skip if either is missing
      return new Date(data.startDate) < new Date(data.endDate);
    },
    {
      message: "startDate must be before endDate",
      path: ["startDate"],
    }
  );

export type Department = z.infer<typeof departmentSchema>;
