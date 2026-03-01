import { Protect } from '@clerk/nextjs'
import CustomClerkPricing from "@/components/custom-clerk-pricing";

function UpgradeCard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto max-w-2xl space-y-4 text-center px-4">
        <h1 className="text-center text-2xl font-semibold lg:text-3xl">
          Upgrade your organization
        </h1>
        <p className="text-muted-foreground">
          This page is available on paid plans. Choose a plan for your organization.
        </p>
      </div>
      <div className="px-8 lg:px-12">
        <CustomClerkPricing forOrganizations />
      </div>
    </div>
  )
}

function FeaturesCard() {
  return (
    <div className="px-4 lg:px-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Advanced features</h1>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Page with advanced features</h2>
          <p className="text-muted-foreground">
            Your organization has access to advanced features.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentGatedPage() {
  return (
    <Protect
      condition={(has) =>
        has({ plan: "pro" }) || has({ plan: "enterprise" })
      }
      fallback={<UpgradeCard />}
    >
      <FeaturesCard />
    </Protect>
  )
}
