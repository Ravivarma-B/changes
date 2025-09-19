import { z } from "zod";

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1, "Name is required"),
  employeeCode: z.string().min(1, "Employee Id is required"),
  profileImage: z.string().optional(),
  positionIds: z.array(z.number()).optional(),
  namear: z.string().min(1, "Name(ar) is required"),
  status: z.string().min(1, "Status is required"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  loginName: z.string().optional(),
  emailId: z.string().min(1, "Description is required"),
  phone: z.string().min(1, "Description is required"),
});

export type User = z.infer<typeof userSchema>;
