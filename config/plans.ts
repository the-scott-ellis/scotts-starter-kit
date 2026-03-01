/**
 * Plan definitions — mirrors the plans configured in Clerk Dashboard.
 *
 * With Clerk Billing, plan/feature availability is checked via:
 *   has({ plan: "pro" })  or  has({ feature: "ai-chat" })
 *
 * These definitions are used for display purposes (pricing UI, feature lists).
 * For direct Stripe integration, update the `organizations` table instead.
 */

export type PlanId = "free" | "pro" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number | null;
  features: string[];
  highlighted?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    description: "For getting started.",
    monthlyPrice: 0,
    features: [
      "Up to 3 team members",
      "5 projects",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams.",
    monthlyPrice: 29,
    highlighted: true,
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "AI Chat assistant",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations.",
    monthlyPrice: 99,
    features: [
      "Everything in Pro",
      "SSO / SAML",
      "Audit logging",
      "Dedicated support",
      "Custom contracts",
    ],
  },
];

export const planById = Object.fromEntries(
  plans.map((p) => [p.id, p])
) as Record<PlanId, Plan>;
