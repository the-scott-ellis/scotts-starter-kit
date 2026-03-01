"use client";

import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { ProjectForm } from "@/components/forms/project-form";
import { PageHeader } from "@/components/shared/page-header";
import type { ProjectFormValues } from "@/lib/validations/project";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useMutation(api.projects.create);

  async function handleSubmit(values: ProjectFormValues) {
    await createProject({
      name: values.name,
      description: values.description,
      status: values.status,
    });
    toast.success("Project created");
    router.push("/projects");
  }

  return (
    <>
      <PageHeader
        title="New Project"
        description="Create a new project for your organization."
      />
      <div className="px-4 lg:px-6">
        <div className="max-w-lg">
          <ProjectForm onSubmit={handleSubmit} submitLabel="Create Project" />
        </div>
      </div>
    </>
  );
}
