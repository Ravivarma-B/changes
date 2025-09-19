import { z } from "zod";

export const groupSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  isActive: z.boolean().optional(),
  type: z.string().optional(),
  members: z
    .array(
      z.object({
        type: z.string().optional(),
        userId: z.number().optional(),
        departmentId: z.number().optional(),
        positionId: z.number().optional(),
      })
    )
    .optional(),
});

export type Group = z.infer<typeof groupSchema>;
