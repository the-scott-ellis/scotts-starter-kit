import CustomClerkPricing from "@/components/custom-clerk-pricing";

export const metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for your organization.",
};

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center gap-12 py-16 px-4">
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-muted-foreground">
          Choose the plan that fits your organization. Upgrade or downgrade at
          any time.
        </p>
      </div>
      <div className="w-full max-w-5xl">
        <CustomClerkPricing forOrganizations />
      </div>
    </div>
  );
}
