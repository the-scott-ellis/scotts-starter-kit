"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { IconArrowLeft, IconEdit } from "@tabler/icons-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  statusLabels,
  statusVariants,
  type ProjectStatus,
} from "@/lib/validations/project";

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useQuery(api.projects.get, {
    id: projectId as Id<"projects">,
  });

  if (project === undefined) {
    return (
      <div className="px-4 lg:px-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full max-w-2xl" />
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="px-4 lg:px-6 space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <IconArrowLeft className="size-4" /> Back to Projects
          </Link>
        </Button>
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <IconArrowLeft className="size-4" /> Projects
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href={`/projects/${project._id}/edit`}>
            <IconEdit className="size-4" /> Edit
          </Link>
        </Button>
      </div>

      <div className="px-4 lg:px-6">
        <Card className="max-w-2xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl">{project.name}</CardTitle>
              <Badge variant={statusVariants[project.status as ProjectStatus]}>
                {statusLabels[project.status as ProjectStatus]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description && (
              <>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
                <Separator />
              </>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Created by</p>
                <p className="mt-1 font-mono text-xs">{project.createdBy}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">
                  Last updated
                </p>
                <p className="mt-1">
                  {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
