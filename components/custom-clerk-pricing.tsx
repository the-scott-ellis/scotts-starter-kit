'use client'
import { PricingTable } from "@clerk/nextjs";
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes"

interface CustomClerkPricingProps {
  forOrganizations?: boolean;
}

export default function CustomClerkPricing({ forOrganizations }: CustomClerkPricingProps) {
  const { theme } = useTheme()
  return (
    <PricingTable
      {...(forOrganizations ? { forOrganizations: true } : {})}
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        elements: {
          pricingTableCardTitle: {
            fontSize: 20,
            fontWeight: 400,
          },
          pricingTableCardDescription: {
            fontSize: 14,
          },
          pricingTableCardFee: {
            fontSize: 36,
            fontWeight: 800,
          },
          pricingTable: {
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          },
        },
      }}
    />
  )
}
