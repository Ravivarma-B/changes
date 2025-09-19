import { z } from "zod";

export const lookupItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    label: z.string(),
    labelAr: z.string().optional(),
    description: z.string().optional(),
    updatedBy: z.string().optional(),
    lastDateUpdated: z.string().optional(), 
    parentId: z.string().optional(),
    children: z.array(lookupItemSchema).optional() // Recursive children
  })
);

export type LookupType = z.infer<typeof lookupItemSchema>;
