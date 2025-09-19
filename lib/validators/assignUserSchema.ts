import { z } from "zod";

export const assignUserSchema = z.object({
  userGroup: z.string().min(1, "User Group is required"),
  selectUsers: z.string().min(1, "User Group is required"),
  note: z.string().min(1, "Note is required").max(100, "Max 100 characters"),
});

export type AssignUserInput = z.infer<typeof assignUserSchema>;

export interface AssignUser extends AssignUserInput {
  id: string;
  userGroup: string;
  selectUsers: string;
  note: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
