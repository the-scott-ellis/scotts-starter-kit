"use client";

import { useQuery } from "convex/react";
import { useOrganization } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { PlanId } from "@/config/plans";

/**
 * Returns the current organization's subscription data from the Convex
 * `organizations` table.
 *
 * Primarily useful when you've migrated to direct Stripe integration and
 * store plan info in Convex. With Clerk Billing, prefer `useHasPlan()` below
 * which reads directly from the Clerk session via `has({ plan })`.
 */
export function useOrgSubscription() {
  const { organization } = useOrganization();

  const org = useQuery(
    api.organizations.getByClerkOrgId,
    organization?.id ? { clerkOrgId: organization.id } : "skip"
  );

  return {
    org,
    plan: (org?.plan ?? "free") as PlanId,
    isLoading: org === undefined,
  };
}
