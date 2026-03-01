import { auth, currentUser } from "@clerk/nextjs/server";
import { OrganizationProfile } from "@clerk/nextjs";
import { PageHeader } from "@/components/shared/page-header";

export default async function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your organization's general settings."
      />
      <div className="px-4 lg:px-6">
        <OrganizationProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border rounded-lg w-full",
            },
          }}
        />
      </div>
    </>
  );
}
