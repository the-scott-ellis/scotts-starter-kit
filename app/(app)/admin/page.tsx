import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconShieldLock } from "@tabler/icons-react";

export default async function AdminPage() {
  const { has, orgId, userId } = await auth();

  // Only org admins may access this page
  if (!has({ role: "org:admin" })) {
    redirect("/dashboard");
  }

  return (
    <>
      <PageHeader
        title="Admin"
        description="Organization admin tools and settings."
        action={
          <Badge variant="secondary" className="gap-1.5">
            <IconShieldLock className="size-3.5" />
            Org Admin
          </Badge>
        }
      />

      <div className="px-4 lg:px-6 flex flex-col gap-6">
        {/* Info */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Organization Info</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Org ID</p>
              <p className="mt-1 font-mono text-xs break-all">{orgId}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Your User ID</p>
              <p className="mt-1 font-mono text-xs break-all">{userId}</p>
            </div>
          </CardContent>
        </Card>

        <Separator className="max-w-2xl" />

        {/* Danger zone placeholder */}
        <Card className="max-w-2xl border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Destructive actions for this organization will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
