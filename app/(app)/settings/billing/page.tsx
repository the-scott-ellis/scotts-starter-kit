import CustomClerkPricing from "@/components/custom-clerk-pricing";
import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";

export default function BillingPage() {
  return (
    <>
      <PageHeader
        title="Billing"
        description="Manage your organization's subscription and billing."
      />
      <div className="px-4 lg:px-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h2 className="text-base font-semibold">Current Plan</h2>
          <p className="text-sm text-muted-foreground">
            Upgrade or change your organization's plan below.
          </p>
        </div>
        <CustomClerkPricing forOrganizations />
      </div>
    </>
  );
}
