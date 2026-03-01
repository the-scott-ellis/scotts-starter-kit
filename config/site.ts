export const siteConfig = {
  name: "Starter Kit",
  description: "B2B SaaS starter kit — fork and build.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  links: {
    pricing: "/pricing",
    terms: "/legal/terms",
    privacy: "/legal/privacy",
  },
} as const;
