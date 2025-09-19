import { z } from "zod";

// --- Task schema ---
export const workflowTaskSchema = z.object({
  guid: z.string(),
  name: z.string(),
  type: z.number(),
  assignee: z.object({
    type: z.enum(["user", "department", "position"]),
    userId: z.number().optional(),
    departmentId: z.number().optional(),
    positionId: z.number().optional(),
  }),
});

// --- Step schema ---
export const workflowStepSchema = z.object({
  guid: z.string(),
  name: z.string(),
  logic: z.number(),
  tasks: z.array(workflowTaskSchema).optional(),
});

// --- Workflow schema ---
export const workflowSchema = z.object({
  id: z.number(), 
  name: z.string().min(1, "Name is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Max 255 characters"),
  status: z.string().min(1, "Status is required"),
  workflowSteps: z.array(workflowStepSchema).optional(), 
  createdAt: z.string(),
});

// --- Types ---
export type WorkflowTask = z.infer<typeof workflowTaskSchema>;
export type WorkflowStep = z.infer<typeof workflowStepSchema>;
export type Workflow = z.infer<typeof workflowSchema>;
