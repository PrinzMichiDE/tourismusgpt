import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().optional(),
  completed: z.boolean(),
});

export type TaskInput = z.infer<typeof taskSchema>;
