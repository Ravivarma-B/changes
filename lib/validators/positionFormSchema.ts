import { z } from "zod";

export const positionFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    departmentId: z.string().min(1, "department is required"),
    roleId: z.string().optional(),
    createdBy: z.string().optional(),
    createdAt: z.string().optional(),
    description: z.string().min(1, "Description is required"),
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

export type PositionForm = z.infer<typeof positionFormSchema>;
