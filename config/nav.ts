import {
  IconDashboard,
  IconFolder,
  IconSparkles,
  IconSettings,
  IconShieldLock,
  IconHelp,
  IconSearch,
} from "@tabler/icons-react";

export type NavItem = {
  title: string;
  url: string;
  icon: React.FC<{ className?: string }>;
};

/** Primary navigation — shown in the main sidebar section */
export const navMain: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },
  { title: "Projects", url: "/projects", icon: IconFolder },
  { title: "AI Chat", url: "/ai", icon: IconSparkles },
];

/** Settings / admin navigation — shown below main nav */
export const navSettings: NavItem[] = [
  { title: "Settings", url: "/settings", icon: IconSettings },
  { title: "Admin", url: "/admin", icon: IconShieldLock },
];

/** Secondary navigation — shown at the bottom of the sidebar */
export const navSecondary: NavItem[] = [
  { title: "Get Help", url: "#", icon: IconHelp },
  { title: "Search", url: "#", icon: IconSearch },
];
