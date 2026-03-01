# Scott's B2B SaaS Starter Kit — Product Requirements Document

## 1. Executive Summary

### What

An opinionated, production-ready starter kit for building customer-facing B2B SaaS applications. It ships a fully functional app skeleton — authentication with organization switching, org-scoped data with example CRUD, subscription billing, a marketing site, a dashboard layout, an AI chat example, and background job support — all wired together and deployable to Vercel in minutes.

### Who

A solo developer rapidly building prototypes for a non-technical boss who wants to see working demos fast. The kit eliminates boilerplate decisions so the developer can focus on the unique business logic of each prototype.

### Why

Every new prototype shouldn't start from scratch. This kit codifies the stack decisions, multi-tenancy patterns, auth flows, billing integration, and UI components that are common across all B2B SaaS apps — so a new prototype starts at "it works, now make it do the specific thing."

### Inspiration

Based on the patterns from [michaelshimeles/nextjs-starter-kit](https://github.com/michaelshimeles/nextjs-starter-kit) (Next.js 15, shadcn/ui, Tailwind v4, Vercel AI SDK), but rebuilt around **Convex**, **Clerk**, and **Clerk Billing** for multi-organization B2B apps.

---

## 2. Tech Stack

### Core

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js (App Router) | 15+ | Full-stack React framework with server components |
| Runtime | React | 19 | UI library |
| Language | TypeScript | 5+ | Type safety across the entire stack |
| Database | Convex | Latest | Realtime serverless database with built-in scheduling, file storage, and full-text search |
| Auth | Clerk | Latest | Identity management, B2B organization components, roles & permissions (RBAC) |
| Billing | Clerk Billing (wraps Stripe) | Beta | Per-organization subscription billing with zero webhook code |
| AI | Vercel AI SDK | 4+ | Multi-model streaming chat with provider registry pattern |
| Hosting | Vercel | — | Deployment, preview environments, edge functions |

### UI & Design System

| Technology | Role |
|---|---|
| shadcn/ui (new-york style) | Copy-paste component library built on Radix UI primitives |
| Tailwind CSS v4 | Utility-first CSS with CSS-based configuration (no `tailwind.config.ts`) |
| Radix UI | Accessible headless primitives (implicit via shadcn/ui) |
| next-themes | Dark mode management with flash prevention |
| Framer Motion | Page transitions and UI animations |
| Lucide React | Icon library (shadcn default) |
| Sonner | Toast notification system |

### Forms & Validation

| Technology | Role |
|---|---|
| React Hook Form | Performant form state management |
| Zod | TypeScript-first schema validation (reusable across client + Convex) |

### Backend Utilities

| Technology | Role |
|---|---|
| convex-helpers | Custom function wrappers for auth middleware (`authedQuery`/`authedMutation`) |
| Convex scheduled functions | Built-in cron jobs and delayed mutations — no extra service |

### Documented Add-Ons (Not Wired by Default)

| Technology | Role | When to Add |
|---|---|---|
| Trigger.dev v4 | Complex multi-step background workflows with retries | When a prototype needs orchestration beyond simple cron/delay |
| Composio | AI agent tool integrations (850+ external services) | When a prototype needs agents that interact with external tools |
| Direct Stripe integration | Full control over Stripe objects, no transaction fee | When a prototype graduates to production and needs custom billing |

---

## 3. Architecture

### 3.1 Multi-Tenancy Pattern

The starter kit uses **column-level multi-tenancy**: every org-scoped table includes an `orgId` field containing the Clerk organization ID. This is the simplest approach for Convex and scales to thousands of organizations.

**Data flow:**

```
User logs in via Clerk
  → Selects/creates organization
    → Clerk JWT includes org_id + org_role claims
      → Convex receives JWT via ConvexProviderWithClerk
        → authedQuery/authedMutation extracts orgId from identity
          → Every database query filters by orgId automatically
```

**Key principle:** Developers never write raw `ctx.db.query("table")` calls. They always use the `authedQuery`/`authedMutation` wrappers from `convex-helpers`, which inject the `orgId` and enforce filtering. This eliminates the entire class of cross-tenant data leakage bugs.

### 3.2 Provider Composition

The root layout nests providers in this order (outermost → innermost):

```
<ClerkProvider>
  <ConvexProviderWithClerk>    ← uses Clerk's useAuth for Convex auth
    <ThemeProvider>             ← next-themes
      <Toaster />              ← Sonner
      {children}
    </ThemeProvider>
  </ConvexProviderWithClerk>
</ClerkProvider>
```

### 3.3 Clerk JWT Configuration

The Clerk JWT template for Convex must include these claims (configured in Clerk Dashboard):

- `sub` — user ID (automatic)
- `org_id` — the active organization ID
- `org_role` — the user's role in the active org (e.g., `org:admin`, `org:member`)

### 3.4 Route Protection

- **Clerk middleware** (`middleware.ts`) protects all `(app)` routes
- **Org guard** in `(app)/layout.tsx` redirects to org-selection if no active org
- **Role gating** via `has({ role: 'org:admin' })` for admin-only routes
- **Feature gating** via `has({ plan: 'pro' })` or `has({ feature: 'ai-chat' })` for plan-gated features

---

## 4. Database Schema (Convex)

### 4.1 Tables

#### `users` — Synced from Clerk Webhooks

| Field | Type | Notes |
|---|---|---|
| `clerkId` | `v.string()` | Clerk user ID (`user_xxxxx`) |
| `email` | `v.string()` | |
| `name` | `v.optional(v.string())` | |
| `imageUrl` | `v.optional(v.string())` | |
| `updatedAt` | `v.number()` | Unix timestamp |

**Indexes:** `by_clerkId`, `by_email`

#### `organizations` — Synced from Clerk Webhooks

| Field | Type | Notes |
|---|---|---|
| `clerkOrgId` | `v.string()` | Clerk org ID (`org_xxxxx`) |
| `name` | `v.string()` | |
| `slug` | `v.string()` | |
| `imageUrl` | `v.optional(v.string())` | |
| `plan` | `v.optional(v.union(...))` | `"free"`, `"pro"`, `"enterprise"` — for direct Stripe path |
| `stripeCustomerId` | `v.optional(v.string())` | For direct Stripe path |
| `stripeSubscriptionId` | `v.optional(v.string())` | For direct Stripe path |
| `stripePriceId` | `v.optional(v.string())` | For direct Stripe path |
| `stripeCurrentPeriodEnd` | `v.optional(v.number())` | For direct Stripe path |
| `updatedAt` | `v.number()` | |

**Indexes:** `by_clerkOrgId`, `by_stripeCustomerId`

> Note: The Stripe fields are only used if you migrate from Clerk Billing to direct Stripe integration. With Clerk Billing, plan/feature info comes from `has()` checks against the Clerk session, not the database.

#### `projects` — Example Org-Scoped CRUD Resource

| Field | Type | Notes |
|---|---|---|
| `orgId` | `v.string()` | **The key field for tenancy** |
| `name` | `v.string()` | |
| `description` | `v.optional(v.string())` | |
| `status` | `v.union(...)` | `"active"`, `"paused"`, `"completed"` |
| `createdBy` | `v.string()` | Clerk user ID of creator |
| `updatedAt` | `v.number()` | |

**Indexes:** `by_orgId`, `by_orgId_status`

#### `chatMessages` — AI Chat Persistence

| Field | Type | Notes |
|---|---|---|
| `orgId` | `v.string()` | |
| `userId` | `v.string()` | Clerk user ID |
| `role` | `v.union(...)` | `"user"`, `"assistant"` |
| `content` | `v.string()` | |
| `conversationId` | `v.string()` | Groups messages into conversations |
| `createdAt` | `v.number()` | |

**Indexes:** `by_orgId_conversation`

### 4.2 Auth Helper Pattern

Using `convex-helpers` custom function wrappers:

```typescript
// convex/lib/auth.ts
export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthenticated");
    const orgId = identity.org_id;
    if (!orgId) throw new ConvexError("No organization selected");
    return { ctx: { userId: identity.subject, orgId }, args: {} };
  },
});

// Same pattern for authedMutation
```

Usage:

```typescript
// convex/projects.ts
export const list = authedQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("projects")
      .withIndex("by_orgId", (q) => q.eq("orgId", ctx.orgId))
      .collect();
  },
});
```

### 4.3 Schema Design Principles

1. **`orgId` is always a `v.string()`** — stores the Clerk org ID directly, not a Convex document ID. Clerk owns the org lifecycle.
2. **Compound indexes always lead with `orgId`** — ensures efficient queries within a tenant's data.
3. **`convex-helpers` wrappers are mandatory** — raw `query`/`mutation` should not be used for org-scoped data.
4. **Zod schemas mirror Convex validators** — form validation schemas in `lib/` match the Convex table shapes for consistency.

---

## 5. Route Structure

### 5.1 Overview

```
app/
├── (marketing)/                    # Public pages — no auth required
│   ├── layout.tsx                  # Marketing layout (navbar + footer)
│   ├── page.tsx                    # Landing page (hero, features, CTA)
│   ├── pricing/
│   │   └── page.tsx                # Pricing tiers (Clerk <PricingTable>)
│   └── legal/
│       ├── terms/page.tsx          # Terms of service
│       └── privacy/page.tsx        # Privacy policy
│
├── (auth)/                         # Auth pages — Clerk hosted components
│   ├── layout.tsx                  # Centered card layout
│   ├── sign-in/
│   │   └── [[...sign-in]]/page.tsx
│   ├── sign-up/
│   │   └── [[...sign-up]]/page.tsx
│   └── org-selection/
│       └── page.tsx                # Post-login org picker / create org
│
├── (app)/                          # Authenticated app — org context required
│   ├── layout.tsx                  # Sidebar + topbar + org guard
│   ├── dashboard/
│   │   └── page.tsx                # Main dashboard (summary cards, activity)
│   ├── projects/                   # Example CRUD resource
│   │   ├── page.tsx                # List view (paginated table)
│   │   ├── new/page.tsx            # Create form
│   │   └── [projectId]/
│   │       ├── page.tsx            # Detail view
│   │       └── edit/page.tsx       # Edit form
│   ├── ai/
│   │   └── page.tsx                # AI chat interface (feature-gated)
│   ├── settings/
│   │   ├── page.tsx                # General org settings
│   │   ├── members/
│   │   │   └── page.tsx            # Clerk <OrganizationProfile> members tab
│   │   └── billing/
│   │       └── page.tsx            # Subscription management
│   └── admin/                      # Org-admin only (role-gated)
│       └── page.tsx                # Usage stats, danger zone
│
├── api/
│   ├── webhooks/
│   │   ├── clerk/route.ts          # Clerk webhook (user/org sync → Convex)
│   │   └── stripe/route.ts         # Stripe webhook (direct integration path)
│   └── ai/
│       └── chat/route.ts           # Vercel AI SDK streaming endpoint
│
└── layout.tsx                      # Root layout: providers, fonts, metadata
```

### 5.2 Route Protection Matrix

| Route Pattern | Auth Required | Org Required | Role Required |
|---|---|---|---|
| `(marketing)/*` | No | No | — |
| `(auth)/*` | No | No | — |
| `(app)/dashboard` | Yes | Yes | — |
| `(app)/projects/*` | Yes | Yes | — |
| `(app)/ai` | Yes | Yes | Plan: `has({ feature: 'ai-chat' })` |
| `(app)/settings/*` | Yes | Yes | — |
| `(app)/admin` | Yes | Yes | `has({ role: 'org:admin' })` |
| `api/webhooks/*` | No (verified by signature) | — | — |
| `api/ai/chat` | Yes (via Clerk) | Yes | — |

---

## 6. Core Features

### Layer 1 — Infrastructure Shell

**What ships:** The foundational wiring that makes everything else possible.

- Next.js 15+ with App Router, React 19, TypeScript strict mode
- Convex initialized with schema, dev server, `ConvexProviderWithClerk` in root layout
- Clerk configured with `ClerkProvider`, middleware, sign-in/sign-up pages, org switcher
- Tailwind CSS v4 with CSS-based configuration in `globals.css` (no `tailwind.config.ts`)
- shadcn/ui initialized with `components.json` (new-york style, CSS variables enabled)
- Base shadcn components installed: Button, Card, Input, Label, Dialog, DropdownMenu, Sheet, Skeleton, Tooltip, Badge, Separator, Tabs
- `next-themes` ThemeProvider with `attribute="class"` and `defaultTheme="system"`

### Layer 2 — App Shell

**What ships:** A professional-looking app layout that works on all screen sizes.

- **Sidebar navigation** — collapsible with icon-only mode, contains nav items from `config/nav.ts`, org switcher (`<OrganizationSwitcher>`), user button (`<UserButton>`)
- **Topbar** — breadcrumbs, theme toggle (dark/light/system), mobile menu trigger
- **Mobile navigation** — sidebar content in a Sheet component, triggered from topbar
- **Loading states** — Skeleton components in `loading.tsx` files for each route
- **Error handling** — `error.tsx` files in each route group with retry functionality
- **Empty states** — reusable component with illustration slot, title, description, action button
- **Page header** — reusable component with title, description, and optional action slot
- **Animations** — Framer Motion page transitions on route changes, sidebar collapse animation

### Layer 3 — Multi-Tenancy + Auth

**What ships:** Secure org-scoped data access out of the box.

- `authedQuery` / `authedMutation` helpers in `convex/lib/auth.ts` — enforce `orgId` on every database operation
- Clerk webhook handler (`api/webhooks/clerk/route.ts`) — syncs `user.created`, `user.updated`, `organization.created`, `organization.updated` events to Convex `users` and `organizations` tables
- Org guard in `(app)/layout.tsx` — checks for active organization, redirects to `/org-selection` if none
- Org selection page — Clerk `<OrganizationList>` component for picking or creating an org
- Role-based access — `has({ role: 'org:admin' })` check in middleware and in admin page server component

### Layer 4 — Billing

**What ships:** Working subscription billing with per-organization plans.

**Default path: Clerk Billing (recommended for prototypes)**

- Pricing page with Clerk `<PricingTable forOrganizations />` — renders plans defined in Clerk Dashboard
- Feature gating via `has({ plan: 'pro' })` or `has({ feature: 'ai-chat' })` in server components and middleware
- Billing settings page with `<OrganizationProfile>` showing the billing tab — users manage subscriptions, view invoices, update payment methods
- Plans defined in Clerk Dashboard under "Plans for Organizations" — e.g., Free, Pro ($29/mo), Enterprise ($99/mo)

**Documented escape hatch: Direct Stripe integration**

For when a prototype graduates to production and needs full Stripe control:

- Stripe webhook handler → Convex mutation to update `organizations` table with subscription data
- Custom `useOrgSubscription()` hook reads plan from Convex
- Feature gating reads `organizations.plan` from Convex instead of Clerk's `has()`
- Stripe Customer Portal for self-service billing management
- Migration guide in README

### Layer 5 — Example CRUD (Projects)

**What ships:** A complete CRUD resource demonstrating the org-scoped data pattern.

- **List view** — paginated table using Convex `usePaginatedQuery`, sortable columns, status filter badges
- **Create form** — React Hook Form + Zod schema validation, Sonner toast on success, redirects to list
- **Detail view** — single record display with loading skeleton, status badge, creator info, timestamps
- **Edit form** — pre-populated form with optimistic updates
- **Delete** — confirmation dialog (shadcn AlertDialog), mutation with toast feedback

This is the template developers copy when adding new resources to a prototype. The pattern is: define table in schema → write `authedQuery`/`authedMutation` functions → build form with Zod schema → wire up pages.

### Layer 6 — AI Integration (Minimal)

**What ships:** A working AI chat wired end-to-end, ready to customize.

- **Provider registry** (`lib/ai/registry.ts`) — `createProviderRegistry` with Anthropic and OpenAI configured. Swap models by changing a string: `"anthropic:claude-sonnet-4-20250514"` or `"openai:gpt-4o"`.
- **Chat API route** (`api/ai/chat/route.ts`) — uses `streamText()` from Vercel AI SDK, returns streaming response
- **Chat UI** (`components/ai/chat-interface.tsx`) — `useChat()` hook with message list, input field, loading indicator, markdown rendering
- **Message persistence** — optional save to Convex `chatMessages` table (can be toggled)
- **Feature gate** — AI chat page gated behind `has({ feature: 'ai-chat' })` — only available on paid plans

### Layer 7 — Background Jobs

**What ships:** Built-in scheduled function support, with Trigger.dev documented as an add-on.

**Included: Convex scheduled functions**

- Example cron job in `convex/crons.ts` — e.g., daily cleanup of stale data
- Example delayed mutation — schedule a function to run after a delay (e.g., send reminder after 24 hours)
- Documentation for `ctx.scheduler.runAfter()` and `ctx.scheduler.runAt()` patterns

**Documented add-on: Trigger.dev v4**

- Setup guide: `npx trigger.dev@latest init`, configuration in `trigger.config.ts`
- Example task file in `trigger/` directory
- Pattern for triggering from Next.js server actions
- When to use: complex multi-step workflows, retries with backoff, long-running jobs, fan-out/fan-in patterns

---

## 7. Marketing Pages

### Landing Page (`(marketing)/page.tsx`)

- **Hero section** — headline, subheadline, CTA button (links to sign-up), product screenshot/illustration
- **Features grid** — 3-6 feature cards with icons, titles, descriptions
- **CTA section** — bottom call-to-action with pricing link

All sections are separate components in `components/marketing/` for easy customization per-prototype.

### Pricing Page (`(marketing)/pricing/page.tsx`)

- Clerk `<PricingTable forOrganizations />` component
- Displays plans configured in Clerk Dashboard
- Handles checkout flow automatically

### Legal Pages

- Terms of service — placeholder content with sections for acceptable use, liability, etc.
- Privacy policy — placeholder content with sections for data collection, usage, retention, etc.

---

## 8. Project File Structure

```
scotts-starter-kit/
│
├── app/                                # Next.js App Router
│   ├── (marketing)/                    # Public pages
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing page
│   │   ├── pricing/page.tsx
│   │   └── legal/
│   │       ├── terms/page.tsx
│   │       └── privacy/page.tsx
│   ├── (auth)/                         # Auth pages
│   │   ├── layout.tsx
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   └── org-selection/page.tsx
│   ├── (app)/                          # Authenticated app
│   │   ├── layout.tsx                  # Sidebar layout + org guard
│   │   ├── dashboard/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx
│   │   │       └── edit/page.tsx
│   │   ├── ai/page.tsx
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── members/page.tsx
│   │   │   └── billing/page.tsx
│   │   └── admin/page.tsx
│   ├── api/
│   │   ├── webhooks/
│   │   │   ├── clerk/route.ts
│   │   │   └── stripe/route.ts
│   │   └── ai/chat/route.ts
│   ├── layout.tsx                      # Root layout (providers)
│   ├── globals.css                     # Tailwind v4 + shadcn CSS vars
│   └── not-found.tsx
│
├── components/
│   ├── ui/                             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (all shadcn components)
│   ├── layout/                         # App shell
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── mobile-nav.tsx
│   │   └── org-switcher.tsx
│   ├── marketing/                      # Landing page sections
│   │   ├── hero.tsx
│   │   ├── features.tsx
│   │   └── cta.tsx
│   ├── forms/                          # Reusable form components
│   │   └── project-form.tsx
│   ├── ai/                             # AI components
│   │   └── chat-interface.tsx
│   └── shared/                         # Reusable pieces
│       ├── loading-spinner.tsx
│       ├── error-boundary.tsx
│       ├── empty-state.tsx
│       └── page-header.tsx
│
├── convex/                             # Convex backend
│   ├── _generated/                     # Auto-generated types
│   ├── schema.ts                       # Database schema
│   ├── auth.config.ts                  # Clerk JWT provider config
│   ├── http.ts                         # HTTP router (optional webhooks)
│   ├── crons.ts                        # Scheduled functions
│   ├── lib/
│   │   ├── auth.ts                     # authedQuery / authedMutation
│   │   └── utils.ts                    # Shared utilities
│   ├── users.ts                        # User sync functions
│   ├── organizations.ts                # Org sync + subscription functions
│   ├── projects.ts                     # Example CRUD functions
│   └── chatMessages.ts                 # AI chat persistence
│
├── lib/                                # Shared utilities (Next.js side)
│   ├── ai/
│   │   └── registry.ts                 # Vercel AI SDK provider registry
│   ├── utils.ts                        # cn() helper, formatters
│   └── constants.ts                    # Feature flags, nav items
│
├── hooks/                              # Custom React hooks
│   ├── use-org-subscription.ts         # Current org's plan from Convex
│   └── use-feature-gate.ts            # Check feature availability
│
├── config/                             # App configuration
│   ├── site.ts                         # Site name, description, URLs
│   ├── nav.ts                          # Sidebar navigation items
│   └── plans.ts                        # Pricing tier definitions
│
├── public/                             # Static assets
│   ├── logo.svg
│   └── og-image.png
│
├── middleware.ts                        # Clerk route protection
├── components.json                     # shadcn/ui CLI config
├── next.config.ts                      # Next.js config
├── tsconfig.json
├── package.json
├── .env.local.example                  # Env var template
└── README.md                           # Setup guide
```

---

## 9. Environment Variables

```bash
# .env.local.example

# ── Clerk ──────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/org-selection

# ── Convex ─────────────────────────────────────────────
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=prod:your-key           # For production deploys

# ── Stripe (only if using direct integration) ─────────
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ── AI Providers ───────────────────────────────────────
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# ── Trigger.dev (optional add-on) ─────────────────────
# TRIGGER_SECRET_KEY=tr_dev_...

# ── Composio (optional add-on) ────────────────────────
# COMPOSIO_API_KEY=...
```

---

## 10. Implementation Sequencing

### Phase 1: Foundation

1. Initialize Next.js 15+ with TypeScript, App Router
2. Initialize Convex (`npx convex init`)
3. Install and configure Clerk (`@clerk/nextjs`)
4. Set up `ConvexProviderWithClerk` in root layout
5. Configure Clerk middleware for route protection
6. Create `convex/auth.config.ts` with Clerk issuer
7. Set up `globals.css` with Tailwind v4 `@import "tailwindcss"` + `@theme` + shadcn CSS variables
8. Run `npx shadcn@latest init` and add base components

### Phase 2: App Shell

1. Create the three route groups: `(marketing)`, `(auth)`, `(app)`
2. Build sidebar layout with navigation from `config/nav.ts`
3. Build topbar with org switcher, theme toggle, user button
4. Add sign-in/sign-up catch-all pages with Clerk components
5. Add org-selection page with `<OrganizationList>`
6. Wire `next-themes` dark mode toggle
7. Add Sonner `<Toaster>` to root layout

### Phase 3: Multi-Tenancy + Data

1. Define Convex schema (`convex/schema.ts`)
2. Build `authedQuery`/`authedMutation` helpers with `convex-helpers`
3. Create Clerk webhook handler (user + org sync to Convex)
4. Build example CRUD: projects list, create, detail, edit, delete
5. Build React Hook Form + Zod forms for project create/edit
6. Add loading skeletons and empty states

### Phase 4: Billing

1. Configure Clerk Billing in Clerk Dashboard (define plans, features)
2. Add `<PricingTable forOrganizations />` to pricing page
3. Add feature gating with `has()` to protected routes
4. Add billing settings page with `<OrganizationProfile>` billing tab
5. Document direct Stripe integration as alternative path

### Phase 5: AI + Background Jobs

1. Set up Vercel AI SDK provider registry in `lib/ai/registry.ts`
2. Create `api/ai/chat/route.ts` with `streamText()`
3. Build chat UI component with `useChat()`
4. Set up Convex cron job example in `convex/crons.ts`
5. Document Trigger.dev v4 add-on pattern

### Phase 6: Polish

1. Build landing page sections (hero, features, CTA)
2. Add Framer Motion page transitions
3. Add error boundaries (`error.tsx`) in each route group
4. Add custom 404 page
5. Legal page placeholders (terms, privacy)
6. Complete `.env.local.example` with all variables
7. Write README with step-by-step setup guide
8. Document add-on patterns (Composio, Trigger.dev, direct Stripe, file uploads, email, analytics)

---

## 11. "Add When Needed" — Documented, Not Included

These capabilities are documented in the README with setup instructions and example code, but not wired into the starter kit by default to keep it lean.

| Capability | Why Not Included | What's Documented |
|---|---|---|
| **Composio** | Not every prototype needs external tool integrations. Adds API key. | Install `@composio/core`, create session, pass tools to AI SDK `streamText()` |
| **Trigger.dev v4** | Convex scheduled functions handle simple cases. | Full setup guide, example task, triggering from server actions |
| **File uploads** | Use case varies. Convex has built-in file storage. | Convex file storage API + upload component example |
| **Email (Resend)** | Requires domain verification, slows initial setup. | Convex scheduled function that calls Resend API |
| **Analytics (PostHog)** | Another vendor to configure. | PostHog Next.js integration snippet |
| **Direct Stripe** | Clerk Billing is simpler for prototypes. | Full webhook handler + Convex mutation + feature gating migration |
| **Audit logging** | Important for enterprise, overkill for prototypes. | Schema pattern for `auditLog` table |
| **Rate limiting** | `convex-helpers` has a rate limiter module. | Configuration example |
| **i18n** | English-only for prototypes. | `next-intl` setup guide link |
| **E2E testing** | Adds CI/CD complexity. | Playwright config + Clerk test mode docs |

---

## 12. Key Decisions Reference

| Decision | Choice | Rationale |
|---|---|---|
| Multi-tenancy strategy | Column-level `orgId` on every table | Simplest for Convex, scales to thousands of orgs |
| Org ID source of truth | Clerk string IDs (not Convex IDs) | Clerk owns org lifecycle, avoids sync issues |
| Auth in Convex functions | `convex-helpers` custom functions | Officially recommended, eliminates forgotten-filter bugs |
| Billing default | Clerk Billing (Beta) | Zero webhook code, 5-min setup, perfect for prototypes |
| Billing escape hatch | Direct Stripe | Documented for production graduation |
| Simple background jobs | Convex scheduled functions | Built-in, no extra service to manage |
| Complex background jobs | Trigger.dev v4 (documented add-on) | For when prototypes need workflow orchestration |
| AI model management | Provider registry pattern | Swap models by changing a string |
| CSS configuration | Tailwind v4 (CSS-based) | No `tailwind.config.ts`, faster builds |
| Component library | shadcn/ui (new-york style) | Copy-paste ownership, Radix primitives underneath |
| Dark mode | next-themes | Standard approach, works with shadcn CSS variable theming |
| Forms | React Hook Form + Zod | Best DX for complex forms, Zod schemas reusable for validation |
| Composio | Documented add-on | Not every prototype needs external tool integrations |
| Marketing pages | Included | Professional first impression for demo presentations |
