"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function getPageTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname === "/dashboard/payment-gated") return "Payment Gated"
  if (pathname === "/projects/new") return "New Project"
  if (pathname.match(/^\/projects\/[^/]+\/edit$/)) return "Edit Project"
  if (pathname.match(/^\/projects\/[^/]+$/)) return "Project"
  if (pathname === "/projects") return "Projects"
  if (pathname === "/ai") return "AI Chat"
  if (pathname === "/settings") return "Settings"
  if (pathname === "/settings/members") return "Members"
  if (pathname === "/settings/billing") return "Billing"
  if (pathname === "/admin") return "Admin"
  return "Page"
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{pageTitle}</h1>
      </div>
    </header>
  )
}
