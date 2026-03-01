"use client";

import { useAuth } from "@clerk/nextjs";
import type { PlanId } from "@/config/plans";

/**
 * Client-side feature / plan gating via Clerk's `has()`.
 *
 * Usage:
 *   const { hasPlan, hasFeature } = useFeatureGate();
 *   if (!hasPlan("pro")) return <UpgradePrompt />;
 *   if (!hasFeature("ai-chat")) return <UpgradePrompt />;
 *
 * For server components, use `auth().has()` from `@clerk/nextjs/server` directly.
 * For JSX gating, use Clerk's `<Protect>` component.
 */
export function useFeatureGate() {
  const { has, isLoaded } = useAuth();

  function hasPlan(plan: PlanId): boolean {
    if (!isLoaded || !has) return false;
    return has({ plan });
  }

  function hasFeature(feature: string): boolean {
    if (!isLoaded || !has) return false;
    return has({ feature });
  }

  function hasRole(role: string): boolean {
    if (!isLoaded || !has) return false;
    return has({ role });
  }

  return { hasPlan, hasFeature, hasRole, isLoaded };
}
