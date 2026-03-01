import { z } from "zod";

export const projectStatuses = ["active", "paused", "completed"] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  status: z.enum(projectStatuses),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export const statusLabels: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
};

export const statusVariants: Record<
  ProjectStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  paused: "secondary",
  completed: "outline",
};
