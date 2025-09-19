import { z } from "zod";

export const userGroupSchema = z.object({
  groupName: z.string().min(1, "Group name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(100, "Max 100 characters"),
  active: z.boolean(),
});

export type UserGroupInput = z.infer<typeof userGroupSchema>;

export interface UserGroup extends UserGroupInput {
  id: string;
  departmentId: string;
  users: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
