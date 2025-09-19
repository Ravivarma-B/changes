import { z } from "zod";

export const roleSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().min(3, "Role name is required"),
    privilegeIds: z.array(z.string()).optional(),
    createdAt: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.string().optional(),
    createdBy: z.string().optional(),
    description: z
      .string()
      .min(1, "Description is required")
      .max(100, "Max 100 characters"),
    isActive: z.boolean().optional(),
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

export type Role = z.infer<typeof roleSchema>;
