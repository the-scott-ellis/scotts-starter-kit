"use client";

import { useQuery, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectForm } from "@/components/forms/project-form";
import type { ProjectFormValues } from "@/lib/validations/project";

export default function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();

  const project = useQuery(api.projects.get, {
    id: projectId as Id<"projects">,
  });
  const updateProject = useMutation(api.projects.update);

  async function handleSubmit(values: ProjectFormValues) {
    await updateProject({
      id: projectId as Id<"projects">,
      name: values.name,
      description: values.description,
      status: values.status,
    });
    toast.success("Project updated");
    router.push(`/projects/${projectId}`);
  }

  if (project === undefined) {
    return (
      <div className="px-4 lg:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="px-4 lg:px-6">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Project"
        description={`Editing "${project.name}"`}
      />
      <div className="px-4 lg:px-6">
        <div className="max-w-lg">
          <ProjectForm
            defaultValues={{
              name: project.name,
              description: project.description,
              status: project.status as ProjectFormValues["status"],
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </>
  );
}
