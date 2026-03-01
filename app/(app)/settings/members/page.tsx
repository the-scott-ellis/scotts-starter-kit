import { OrganizationProfile } from "@clerk/nextjs";
import { PageHeader } from "@/components/shared/page-header";

export default function MembersPage() {
  return (
    <>
      <PageHeader
        title="Members"
        description="Manage the members of your organization."
      />
      <div className="px-4 lg:px-6">
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border rounded-lg w-full",
              // Surface only the members tab
              navbar: "hidden",
              navbarMobileMenuRow: "hidden",
            },
          }}
        />
      </div>
    </>
  );
}
