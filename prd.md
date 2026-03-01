# Scott's B2B SaaS Starter Kit — Product Requirements Document

## 1. Executive Summary

### What

An opinionated, production-ready starter kit for building customer-facing B2B SaaS applications. It ships a fully functional app skeleton — authentication with organization switching, org-scoped data with example CRUD, subscription billing, a marketing site, a polished dashboard with charts and data tables, an AI chat example, and background job support — all wired together and deployable to Vercel in minutes.

### Who

A solo developer rapidly building prototypes for a non-technical boss who wants to see working demos fast. The kit eliminates boilerplate decisions so the developer can focus on the unique business logic of each prototype.

### Why

Every new prototype shouldn't start from scratch. This kit codifies the stack decisions, multi-tenancy patterns, auth flows, billing integration, and UI components that are common across all B2B SaaS apps — so a new prototype starts at "it works, now make it do the specific thing."

### Approach: Fork and Extend

This kit is built by forking [RayFernando1337/elite-next-clerk-convex-starter](https://github.com/RayFernando1337/elite-next-clerk-convex-starter), which provides a polished foundation (Next.js 15, Convex, Clerk, Clerk Billing, shadcn/ui, Tailwind v4, dashboard with charts/tables, landing page with animations). We extend it with the B2B multi-tenancy layer, AI integration, background jobs, and org-scoped CRUD patterns that make it suitable for rapid B2B SaaS prototyping.

**What the base kit gives us (keep as-is):**
- Dashboard layout with collapsible sidebar, KPI cards, interactive area charts, advanced data table with drag-and-drop
- Landing page with hero, features, testimonials, FAQ, CTA sections
- Clerk auth with sign-in/sign-up, protected routes, webhook-driven user sync to Convex
- Clerk Billing with `<PricingTable>`, `<Protect>` payment gating, payment attempt tracking in Convex
- 38 shadcn/ui components, OKLch color system, dark mode, Framer Motion animations
- Custom animation components (MagicUI, Motion Primitives, React Bits, KokonutUI)
- TanStack Table with sorting, filtering, drag-and-drop via @dnd-kit
- Recharts data visualization
- Svix webhook signature verification
- Cookie-persisted sidebar state with Cmd+B keyboard shortcut
- Interactive 404 page with splash cursor effect

**What we add on top:**
- Clerk Organizations (B2B multi-tenancy with org switching, RBAC)
- Org-scoped data isolation via `convex-helpers` auth wrappers
- Example CRUD resource (projects) with React Hook Form + Zod
- Vercel AI SDK with provider registry and streaming chat
- Convex scheduled functions (cron jobs)
- Settings pages (org settings, members, billing management)
- Auth route group with org selection page
- Legal page placeholders

---

## 2. Tech Stack

### Inherited from Elite Kit

| Layer | Technology | Version | Role |
|---|---|---|---|
| Framework | Next.js (App Router) | 15.3+ | Full-stack React framework with Turbopack |
| Runtime | React | 19 | UI library |
| Language | TypeScript | 5+ | Type safety across the entire stack |
| Database | Convex | 1.25+ | Realtime serverless database |
| Auth | Clerk | 6.24+ | Identity management with `@clerk/nextjs`, `@clerk/backend`, `@clerk/themes` |
| Billing | Clerk Billing | Included | Per-user subscription billing with `<PricingTable>` + `<Protect>` |
| UI | shadcn/ui (new-york) | Latest | 38 copy-paste components built on Radix UI |
| CSS | Tailwind CSS v4 | 4+ | Utility-first CSS with OKLch color system |
| Dark mode | next-themes | 0.4+ | Theme management with flash prevention |
| Animations | Framer Motion / Motion | 12+ | Page transitions and UI animations |
| Data tables | @tanstack/react-table | 8.21+ | Headless sortable/filterable tables |
| Drag-and-drop | @dnd-kit | 6+ | Drag-and-drop for table row reordering |
| Charts | Recharts | 2.15+ | Area charts with interactive time selectors |
| Icons | Lucide React + @tabler/icons-react | Latest | Dual icon libraries |
| Toasts | Sonner | 2+ | Toast notification system |
| Validation | Zod | 3.25+ | Schema validation (data table, extended to forms) |
| Webhooks | Svix | 1.69+ | Cryptographic webhook signature verification |

### Added by Us

| Layer | Technology | Role |
|---|---|---|
| B2B orgs | Clerk Organizations | Multi-tenancy, org switching, roles & permissions (RBAC) |
| Billing (B2B) | Clerk Billing `forOrganizations` | Per-organization subscription billing |
| Auth helpers | convex-helpers | `authedQuery`/`authedMutation` wrappers enforcing org-scoped data access |
| AI | Vercel AI SDK (ai, @ai-sdk/anthropic, @ai-sdk/openai) | Multi-model streaming chat with provider registry |
| Forms | React Hook Form + @hookform/resolvers | Performant form state management with Zod integration |
| Background jobs | Convex scheduled functions | Built-in cron jobs and delayed mutations |

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

**Key principle:** Developers never write raw `ctx.db.query("table")` calls for org-scoped data. They always use the `authedQuery`/`authedMutation` wrappers from `convex-helpers`, which inject the `orgId` and enforce filtering. This eliminates the entire class of cross-tenant data leakage bugs.

### 3.2 Provider Composition

The root layout nests providers in this order (matching Elite Kit's existing pattern):

```
<ThemeProvider>                    ← next-themes (outermost, matches Elite Kit)
  <ClerkProvider>
    <ConvexProviderWithClerk>      ← uses Clerk's useAuth for Convex auth
      <Toaster />                  ← Sonner
      {children}
    </ConvexProviderWithClerk>
  </ClerkProvider>
</ThemeProvider>
```

### 3.3 Clerk JWT Configuration

The Clerk JWT template for Convex must include these claims (configured in Clerk Dashboard):

- `sub` — user ID (automatic)
- `org_id` — the active organization ID (**new** — add to existing JWT template)
- `org_role` — the user's role in the active org (e.g., `org:admin`, `org:member`)

### 3.4 Route Protection

- **Clerk middleware** (`middleware.ts`) protects all dashboard routes (extends existing)
- **Org guard** in dashboard `layout.tsx` redirects to org-selection if no active org (**new**)
- **Role gating** via `has({ role: 'org:admin' })` for admin-only routes (**new**)
- **Feature gating** via `has({ plan: 'pro' })` or `has({ feature: 'ai-chat' })` for plan-gated features (extends existing `<Protect>` pattern)

---

## 4. Database Schema (Convex)

### 4.1 Existing Tables (from Elite Kit — modify)

#### `users` — Synced from Clerk Webhooks

Already exists in Elite Kit with `name` and `externalId`. **Extend with:**

| Field | Type | Notes |
|---|---|---|
| `externalId` | `v.string()` | Clerk user ID — already exists |
| `name` | `v.string()` | Already exists |
| `email` | `v.string()` | **Add** |
| `imageUrl` | `v.optional(v.string())` | **Add** |
| `updatedAt` | `v.number()` | **Add** |

**Indexes:** `byExternalId` (existing), `by_email` (**add**)

#### `paymentAttempts` — Payment Tracking

Keep as-is from Elite Kit. Detailed payment attempt tracking with subscription items, payer info, totals, and failure reasons. Already indexed by `paymentId`, `userId`, and `payerUserId`.

### 4.2 New Tables (add)

#### `organizations` — Synced from Clerk Webhooks

| Field | Type | Notes |
|---|---|---|
| `clerkOrgId` | `v.string()` | Clerk org ID (`org_xxxxx`) |
| `name` | `v.string()` | |
| `slug` | `v.string()` | |
| `imageUrl` | `v.optional(v.string())` | |
| `plan` | `v.optional(v.union(...))` | `"free"`, `"pro"`, `"enterprise"` — for direct Stripe path |
| `stripeCustomerId` | `v.optional(v.string())` | For direct Stripe escape hatch |
| `stripeSubscriptionId` | `v.optional(v.string())` | For direct Stripe escape hatch |
| `stripePriceId` | `v.optional(v.string())` | For direct Stripe escape hatch |
| `stripeCurrentPeriodEnd` | `v.optional(v.number())` | For direct Stripe escape hatch |
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

### 4.3 Auth Helper Pattern

Using `convex-helpers` custom function wrappers (**new file: `convex/lib/auth.ts`**):

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

### 4.4 Schema Design Principles

1. **`orgId` is always a `v.string()`** — stores the Clerk org ID directly, not a Convex document ID. Clerk owns the org lifecycle.
2. **Compound indexes always lead with `orgId`** — ensures efficient queries within a tenant's data.
3. **`convex-helpers` wrappers are mandatory** — raw `query`/`mutation` should not be used for org-scoped data.
4. **Zod schemas mirror Convex validators** — form validation schemas in `lib/` match the Convex table shapes for consistency.

---

## 5. Route Structure

### 5.1 Overview

The Elite Kit has two route areas: `(landing)` and `dashboard`. We restructure into three route groups and add new pages.

**Changes from Elite Kit:**
- Rename `(landing)` → `(marketing)` and add pricing + legal pages
- Add `(auth)` route group for sign-in, sign-up, org-selection
- Rename `dashboard` → `(app)` route group and add projects CRUD, AI chat, settings, admin pages
- Add API routes for AI chat endpoint
- Extend existing webhook handler for org events

```
app/
├── (marketing)/                       # Public pages — no auth required
│   ├── layout.tsx                     # MODIFY existing (landing) layout
│   ├── page.tsx                       # KEEP — landing page (hero, features, testimonials, FAQ, CTA)
│   ├── header.tsx                     # KEEP — auth-aware navigation header
│   ├── hero-section.tsx               # KEEP — hero with CTA
│   ├── features-one.tsx               # KEEP — feature showcase
│   ├── animated-list-custom.tsx       # KEEP — animated feature list
│   ├── table.tsx                      # KEEP — features comparison table
│   ├── cpu-architecture.tsx           # KEEP — custom animation
│   ├── testimonials.tsx               # KEEP — testimonial carousel
│   ├── call-to-action.tsx             # KEEP — CTA section
│   ├── faqs.tsx                       # KEEP — FAQ accordion
│   ├── footer.tsx                     # KEEP — footer with links
│   ├── pricing/
│   │   └── page.tsx                   # ADD — Clerk <PricingTable forOrganizations />
│   └── legal/
│       ├── terms/page.tsx             # ADD — terms of service placeholder
│       └── privacy/page.tsx           # ADD — privacy policy placeholder
│
├── (auth)/                            # ADD — auth pages
│   ├── layout.tsx                     # ADD — centered card layout
│   ├── sign-in/
│   │   └── [[...sign-in]]/page.tsx    # ADD — Clerk SignIn component
│   ├── sign-up/
│   │   └── [[...sign-up]]/page.tsx    # ADD — Clerk SignUp component
│   └── org-selection/
│       └── page.tsx                   # ADD — post-login org picker / create org
│
├── (app)/                             # MODIFY — rename from dashboard/
│   ├── layout.tsx                     # MODIFY — add org guard + <OrganizationSwitcher> to sidebar
│   ├── dashboard/
│   │   └── page.tsx                   # KEEP — KPI cards, area chart, data table (from Elite Kit)
│   ├── projects/                      # ADD — example org-scoped CRUD
│   │   ├── page.tsx                   # ADD — list view (TanStack Table, org-filtered)
│   │   ├── new/page.tsx               # ADD — create form (React Hook Form + Zod)
│   │   └── [projectId]/
│   │       ├── page.tsx               # ADD — detail view
│   │       └── edit/page.tsx          # ADD — edit form
│   ├── ai/
│   │   └── page.tsx                   # ADD — AI chat interface (feature-gated)
│   ├── settings/
│   │   ├── page.tsx                   # ADD — general org settings
│   │   ├── members/
│   │   │   └── page.tsx              # ADD — Clerk <OrganizationProfile> members tab
│   │   └── billing/
│   │       └── page.tsx               # ADD — subscription management
│   ├── admin/                         # ADD — org-admin only (role-gated)
│   │   └── page.tsx                   # ADD — usage stats, danger zone
│   ├── app-sidebar.tsx                # MODIFY — add org switcher, update nav items
│   ├── site-header.tsx                # KEEP — dashboard header
│   ├── loading-bar.tsx                # KEEP — page loading indicator
│   ├── nav-main.tsx                   # MODIFY — add projects, AI, settings nav items
│   ├── nav-user.tsx                   # KEEP — user profile menu
│   ├── nav-documents.tsx              # KEEP or MODIFY for org context
│   ├── nav-secondary.tsx              # KEEP — secondary nav with theme toggle
│   ├── section-cards.tsx              # KEEP — KPI cards
│   ├── chart-area-interactive.tsx     # KEEP — area chart
│   ├── data-table.tsx                 # KEEP — advanced data table (reuse for projects)
│   ├── data.json                      # REMOVE — replace with real Convex data
│   └── payment-gated/
│       └── page.tsx                   # KEEP — subscription-protected page pattern
│
├── api/
│   └── ai/
│       └── chat/route.ts             # ADD — Vercel AI SDK streaming endpoint
│
├── layout.tsx                         # MODIFY — keep provider stack, add org-related providers
├── globals.css                        # KEEP — OKLch colors, theme vars, tw-animate-css
└── not-found.tsx                      # KEEP — custom 404 with splash cursor
```

> Note: Clerk webhook handling stays in `convex/http.ts` (Convex HTTP actions), not Next.js API routes. We extend the existing handler to process `organization.created` and `organization.updated` events.

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
| `api/ai/chat` | Yes (via Clerk) | Yes | — |

---

## 6. Core Features

### Layer 1 — Infrastructure Shell (inherited from Elite Kit)

**What we keep:** The foundational wiring is already done.

- Next.js 15+ with App Router, React 19, TypeScript, Turbopack dev server
- Convex initialized with schema, webhook handler, `ConvexProviderWithClerk` in root layout
- Clerk configured with `ClerkProvider`, middleware, sign-in/sign-up (modal-based), user sync webhooks
- Tailwind CSS v4 with OKLch color system in `globals.css` + `tw-animate-css`
- shadcn/ui (new-york style, 38 components) with CSS variables
- `next-themes` ThemeProvider with `attribute="class"` and `defaultTheme="system"`
- Svix webhook signature verification

**What we modify:**
- Extend Clerk JWT template to include `org_id` and `org_role` claims
- Extend `convex/auth.config.ts` if needed for org claims
- Add `convex-helpers` dependency

### Layer 2 — App Shell (inherited from Elite Kit, enhanced)

**What we keep:**

- **Sidebar navigation** — collapsible with icon-only mode, cookie-persisted state, Cmd+B keyboard shortcut
- **Site header** — dashboard top bar with breadcrumbs
- **KPI section cards** — Revenue, New Customers, Active Accounts, Growth Rate
- **Interactive area chart** — Recharts with time period selector and metric toggles
- **Advanced data table** — TanStack Table with sorting, filtering, pagination, drag-and-drop via @dnd-kit
- **Loading bar** — page transition indicator
- **Custom animations** — MagicUI (animated-list, pulsating-button), Motion Primitives (infinite-slider, progressive-blur), React Bits (splash-cursor, text-cursor, pixel-card), KokonutUI (attract-button)
- **Mobile-responsive sidebar** — off-canvas on mobile via Sheet component

**What we add:**
- **`<OrganizationSwitcher>`** in sidebar — Clerk org switching component
- **Org guard** in `(app)/layout.tsx` — redirect to org-selection if no active org
- **New nav items** — Projects, AI Chat, Settings, Admin in sidebar navigation
- **Empty states** — reusable component for pages with no data yet
- **Page header** — reusable component with title, description, optional action slot

### Layer 3 — Multi-Tenancy + Auth (new)

**What we add:**

- `authedQuery` / `authedMutation` helpers in `convex/lib/auth.ts` — enforce `orgId` on every database operation
- Extend Clerk webhook handler in `convex/http.ts` to process `organization.created`, `organization.updated` events → sync to Convex `organizations` table
- Auth route group `(auth)/` with Clerk `<SignIn>`, `<SignUp>`, `<OrganizationList>` components
- Org selection page — post-login picker for choosing or creating an org
- Role-based access — `has({ role: 'org:admin' })` check in middleware and admin page
- Extend middleware to protect `(app)` route group (replaces existing `/dashboard(.*)` matcher)

### Layer 4 — Billing (inherited, extended for B2B)

**What we keep:**
- Clerk `<PricingTable>` component with theme-aware styling (`custom-clerk-pricing.tsx`)
- `<Protect>` component for payment gating (existing `payment-gated/page.tsx` pattern)
- Payment attempt tracking in Convex via webhooks (`convex/paymentAttempts.ts`)

**What we modify:**
- Switch `<PricingTable>` to use `forOrganizations` prop for per-org billing
- Update `<Protect>` conditions to check org-level plans: `has({ plan: 'pro' })`
- Add dedicated pricing page at `(marketing)/pricing/` (currently inline on landing page)
- Add billing settings page with `<OrganizationProfile>` billing tab
- Plans defined in Clerk Dashboard under "Plans for Organizations" — e.g., Free, Pro ($29/mo), Enterprise ($99/mo)

**Documented escape hatch: Direct Stripe integration**

For when a prototype graduates to production:

- Stripe webhook handler → Convex mutation to update `organizations` table with subscription data
- Custom `useOrgSubscription()` hook reads plan from Convex
- Feature gating reads `organizations.plan` from Convex instead of Clerk's `has()`
- Migration guide in README

### Layer 5 — Example CRUD — Projects (new)

**What we add:** A complete org-scoped CRUD resource demonstrating the data pattern.

- **List view** — reuses Elite Kit's TanStack Table + @dnd-kit patterns, but wired to Convex `usePaginatedQuery` filtered by `orgId`, with status filter badges
- **Create form** — React Hook Form + Zod schema validation, Sonner toast on success, redirects to list
- **Detail view** — single record display with loading skeleton, status badge, creator info, timestamps
- **Edit form** — pre-populated form with optimistic updates
- **Delete** — confirmation dialog (shadcn AlertDialog), mutation with toast feedback

This is the template developers copy when adding new resources to a prototype. The pattern is: define table in schema → write `authedQuery`/`authedMutation` functions → build form with Zod schema → wire up pages.

### Layer 6 — AI Integration (new)

**What we add:** A working AI chat wired end-to-end, ready to customize.

- **Provider registry** (`lib/ai/registry.ts`) — `createProviderRegistry` with Anthropic and OpenAI configured. Swap models by changing a string: `"anthropic:claude-sonnet-4-20250514"` or `"openai:gpt-4o"`.
- **Chat API route** (`api/ai/chat/route.ts`) — uses `streamText()` from Vercel AI SDK, returns streaming response
- **Chat UI** (`components/ai/chat-interface.tsx`) — `useChat()` hook with message list, input field, loading indicator, markdown rendering
- **Message persistence** — optional save to Convex `chatMessages` table (can be toggled)
- **Feature gate** — AI chat page gated behind `has({ feature: 'ai-chat' })` — only available on paid plans

### Layer 7 — Background Jobs (new)

**What we add:** Built-in scheduled function support.

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

## 7. Marketing Pages (inherited, extended)

### Landing Page (`(marketing)/page.tsx`) — KEEP

The Elite Kit's landing page is comprehensive and polished. Keep all existing sections:

- **Header** — auth-aware navigation with SignIn/SignUp/Dashboard buttons
- **Hero section** — headline, subheadline, CTA button, product screenshot
- **Features showcase** — animated feature list + features table
- **Testimonials** — carousel with infinite slider + progressive blur
- **FAQ accordion** — expandable questions and answers
- **Call-to-action** — bottom CTA section
- **Footer** — links and branding

All sections are already separate components for easy per-prototype customization.

### Pricing Page (`(marketing)/pricing/page.tsx`) — ADD

- Clerk `<PricingTable forOrganizations />` component (reuse `custom-clerk-pricing.tsx` with org prop)
- Displays plans configured in Clerk Dashboard
- Handles checkout flow automatically

### Legal Pages — ADD

- Terms of service — placeholder content with sections for acceptable use, liability, etc.
- Privacy policy — placeholder content with sections for data collection, usage, retention, etc.

---

## 8. Project File Structure

Files marked **KEEP** are unchanged from the Elite Kit. Files marked **MODIFY** are edited. Files marked **ADD** are new.

```
scotts-starter-kit/
│
├── app/
│   ├── (marketing)/                        # MODIFY — rename from (landing)
│   │   ├── page.tsx                        # KEEP — full landing page
│   │   ├── header.tsx                      # KEEP — auth-aware nav
│   │   ├── hero-section.tsx                # KEEP
│   │   ├── features-one.tsx                # KEEP
│   │   ├── animated-list-custom.tsx        # KEEP
│   │   ├── table.tsx                       # KEEP
│   │   ├── cpu-architecture.tsx            # KEEP
│   │   ├── testimonials.tsx                # KEEP
│   │   ├── call-to-action.tsx              # KEEP
│   │   ├── faqs.tsx                        # KEEP
│   │   ├── footer.tsx                      # KEEP
│   │   ├── pricing/page.tsx                # ADD
│   │   └── legal/
│   │       ├── terms/page.tsx              # ADD
│   │       └── privacy/page.tsx            # ADD
│   │
│   ├── (auth)/                             # ADD — auth route group
│   │   ├── layout.tsx                      # ADD
│   │   ├── sign-in/[[...sign-in]]/page.tsx # ADD
│   │   ├── sign-up/[[...sign-up]]/page.tsx # ADD
│   │   └── org-selection/page.tsx          # ADD
│   │
│   ├── (app)/                              # MODIFY — rename from dashboard/
│   │   ├── layout.tsx                      # MODIFY — add org guard
│   │   ├── dashboard/page.tsx              # KEEP — KPI cards, chart, table
│   │   ├── projects/                       # ADD — org-scoped CRUD
│   │   │   ├── page.tsx                    # ADD — list view
│   │   │   ├── new/page.tsx               # ADD — create form
│   │   │   └── [projectId]/
│   │   │       ├── page.tsx               # ADD — detail view
│   │   │       └── edit/page.tsx          # ADD — edit form
│   │   ├── ai/page.tsx                    # ADD — AI chat
│   │   ├── settings/
│   │   │   ├── page.tsx                    # ADD — org settings
│   │   │   ├── members/page.tsx            # ADD — <OrganizationProfile>
│   │   │   └── billing/page.tsx            # ADD — billing management
│   │   ├── admin/page.tsx                  # ADD — role-gated admin
│   │   ├── app-sidebar.tsx                 # MODIFY — add org switcher + new nav
│   │   ├── site-header.tsx                 # KEEP
│   │   ├── loading-bar.tsx                 # KEEP
│   │   ├── nav-main.tsx                    # MODIFY — new nav items
│   │   ├── nav-user.tsx                    # KEEP
│   │   ├── nav-documents.tsx               # KEEP
│   │   ├── nav-secondary.tsx               # KEEP
│   │   ├── section-cards.tsx               # KEEP
│   │   ├── chart-area-interactive.tsx      # KEEP
│   │   ├── data-table.tsx                  # KEEP — reuse pattern for projects
│   │   └── payment-gated/page.tsx          # KEEP — payment gating pattern
│   │
│   ├── api/
│   │   └── ai/chat/route.ts               # ADD — Vercel AI SDK streaming
│   │
│   ├── layout.tsx                          # MODIFY — extend providers
│   ├── globals.css                         # KEEP — OKLch + tw-animate-css
│   └── not-found.tsx                       # KEEP — splash cursor 404
│
├── components/
│   ├── ui/                                 # KEEP — all 38 shadcn components
│   ├── custom-clerk-pricing.tsx            # MODIFY — add forOrganizations
│   ├── theme-provider.tsx                  # KEEP
│   ├── ConvexClientProvider.tsx             # KEEP
│   ├── logo.tsx                            # KEEP
│   ├── mode-toggle.tsx                     # KEEP
│   ├── magicui/                            # KEEP — animated-list, pulsating-button
│   ├── motion-primitives/                  # KEEP — infinite-slider, progressive-blur
│   ├── kokonutui/                          # KEEP — attract-button
│   ├── react-bits/                         # KEEP — splash-cursor, text-cursor, pixel-card
│   ├── forms/                              # ADD
│   │   └── project-form.tsx                # ADD — React Hook Form + Zod
│   ├── ai/                                 # ADD
│   │   └── chat-interface.tsx              # ADD — useChat() UI
│   └── shared/                             # ADD
│       ├── empty-state.tsx                 # ADD
│       └── page-header.tsx                 # ADD
│
├── convex/
│   ├── _generated/                         # KEEP — auto-generated
│   ├── schema.ts                           # MODIFY — add organizations, projects, chatMessages
│   ├── auth.config.ts                      # KEEP (may need org_id claim config)
│   ├── http.ts                             # MODIFY — add org webhook events
│   ├── users.ts                            # MODIFY — extend user fields
│   ├── paymentAttempts.ts                  # KEEP
│   ├── paymentAttemptTypes.ts              # KEEP
│   ├── crons.ts                            # ADD — scheduled functions
│   ├── lib/                                # ADD
│   │   └── auth.ts                         # ADD — authedQuery/authedMutation
│   ├── organizations.ts                    # ADD — org sync + subscription functions
│   ├── projects.ts                         # ADD — example CRUD functions
│   └── chatMessages.ts                     # ADD — AI chat persistence
│
├── lib/
│   ├── utils.ts                            # KEEP — cn() helper
│   └── ai/
│       └── registry.ts                     # ADD — Vercel AI SDK provider registry
│
├── hooks/
│   ├── use-mobile.ts                       # KEEP — mobile detection
│   ├── use-org-subscription.ts             # ADD — current org's plan from Convex
│   └── use-feature-gate.ts                 # ADD — check feature availability
│
├── config/                                 # ADD
│   ├── site.ts                             # ADD — site name, description, URLs
│   ├── nav.ts                              # ADD — sidebar navigation items
│   └── plans.ts                            # ADD — pricing tier definitions
│
├── public/                                 # KEEP — existing assets
│
├── middleware.ts                           # MODIFY — extend route matcher for (app)
├── components.json                         # KEEP
├── postcss.config.mjs                      # KEEP
├── next.config.ts                          # KEEP (modify if needed)
├── tsconfig.json                           # KEEP
├── package.json                            # MODIFY — add new dependencies
├── .env.local.example                      # MODIFY — add new env vars
├── CLAUDE.md                               # MODIFY — update with project context
└── README.md                               # MODIFY — full setup guide
```

---

## 9. Environment Variables

Extends the Elite Kit's `.env.example` with new variables.

```bash
# .env.local.example

# ── Convex (existing) ─────────────────────────────────
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# ── Clerk (existing) ──────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url.clerk.accounts.dev

# ── Clerk Redirects (modify — add org-selection) ─────
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/org-selection
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/org-selection
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# ── Convex Environment (set in Convex dashboard) ─────
# CLERK_WEBHOOK_SECRET=whsec_...                        # existing
# NEXT_PUBLIC_CLERK_FRONTEND_API_URL=...                 # existing

# ── AI Providers (add) ───────────────────────────────
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# ── Stripe (only if using direct integration) ─────────
# STRIPE_SECRET_KEY=sk_test_...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ── Trigger.dev (optional add-on) ─────────────────────
# TRIGGER_SECRET_KEY=tr_dev_...

# ── Composio (optional add-on) ────────────────────────
# COMPOSIO_API_KEY=...
```

---

## 10. Implementation Sequencing

Since we're forking an existing kit, the phases focus on modifications and additions rather than building from scratch.

### Phase 1: Fork + Foundation Modifications

1. Fork `RayFernando1337/elite-next-clerk-convex-starter` into this repo
2. Install new dependencies: `convex-helpers`, `react-hook-form`, `@hookform/resolvers`, `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
3. Rename `(landing)` route group → `(marketing)`
4. Rename `dashboard` route group → `(app)` (nested under route group)
5. Enable Clerk Organizations in Clerk Dashboard
6. Update Clerk JWT template to include `org_id` and `org_role` claims
7. Update `middleware.ts` to protect `(app)` routes (replace `/dashboard(.*)` matcher)
8. Update `.env.local.example` with new variables
9. Update redirect URLs to route through `/org-selection` after sign-in/sign-up

### Phase 2: Multi-Tenancy Layer

1. Extend `convex/schema.ts` — add `organizations`, `projects`, `chatMessages` tables; extend `users` table
2. Create `convex/lib/auth.ts` — `authedQuery`/`authedMutation` wrappers
3. Extend `convex/http.ts` — add `organization.created`, `organization.updated` webhook handlers
4. Create `convex/organizations.ts` — org sync mutations
5. Create `(auth)` route group with sign-in, sign-up, org-selection pages
6. Modify `(app)/layout.tsx` — add org guard (redirect to org-selection if no active org)
7. Modify `app-sidebar.tsx` — add `<OrganizationSwitcher>` component
8. Update `nav-main.tsx` — add Projects, AI, Settings, Admin nav items

### Phase 3: Org-Scoped CRUD (Projects)

1. Create `convex/projects.ts` — list, get, create, update, delete using `authedQuery`/`authedMutation`
2. Create Zod schemas for project validation in `lib/` or colocated
3. Create `(app)/projects/page.tsx` — list view reusing TanStack Table patterns from existing `data-table.tsx`, wired to Convex
4. Create `(app)/projects/new/page.tsx` — create form with React Hook Form + Zod
5. Create `(app)/projects/[projectId]/page.tsx` — detail view
6. Create `(app)/projects/[projectId]/edit/page.tsx` — edit form
7. Create `components/forms/project-form.tsx` — shared form component
8. Create `components/shared/empty-state.tsx` and `page-header.tsx`
9. Remove `data.json` mock data from dashboard (or keep for dashboard demo)

### Phase 4: Billing Extension for B2B

1. Modify `components/custom-clerk-pricing.tsx` — add `forOrganizations` prop
2. Create `(marketing)/pricing/page.tsx` — dedicated pricing page
3. Update `<Protect>` conditions in `payment-gated/page.tsx` to check org-level plans
4. Create `(app)/settings/billing/page.tsx` — `<OrganizationProfile>` billing tab
5. Create `(app)/settings/members/page.tsx` — `<OrganizationProfile>` members tab
6. Create `(app)/settings/page.tsx` — general org settings
7. Create `(app)/admin/page.tsx` — role-gated admin page with `has({ role: 'org:admin' })`

### Phase 5: AI + Background Jobs

1. Create `lib/ai/registry.ts` — provider registry with Anthropic + OpenAI
2. Create `api/ai/chat/route.ts` — `streamText()` streaming endpoint
3. Create `components/ai/chat-interface.tsx` — `useChat()` chat UI
4. Create `(app)/ai/page.tsx` — AI chat page, gated behind `has({ feature: 'ai-chat' })`
5. Create `convex/chatMessages.ts` — message persistence functions
6. Create `convex/crons.ts` — example scheduled function

### Phase 6: Polish

1. Create legal page placeholders (terms, privacy)
2. Create `config/site.ts`, `config/nav.ts`, `config/plans.ts`
3. Create `hooks/use-org-subscription.ts` and `hooks/use-feature-gate.ts`
4. Add error boundaries (`error.tsx`) in each route group
5. Update `CLAUDE.md` with project architecture context
6. Update `README.md` with full setup guide
7. Document add-on patterns (Composio, Trigger.dev, direct Stripe, file uploads, email, analytics)

---

## Tasks

### Phase 1: Fork + Foundation Modifications

- [x] Fork `RayFernando1337/elite-next-clerk-convex-starter` into this repo
- [x] Install new dependencies: `convex-helpers`, `react-hook-form`, `@hookform/resolvers`, `ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
- [x] Rename `(landing)` route group → `(marketing)`
- [x] Rename `dashboard` route group → `(app)` (nested under route group)
- [x] Enable Clerk Organizations in Clerk Dashboard
- [x] Update Clerk JWT template to include `org_id` and `org_role` claims
- [x] Update `middleware.ts` to protect `(app)` routes (replace `/dashboard(.*)` matcher)
- [x] Update `.env.local.example` with new variables
- [x] Update redirect URLs to route through `/org-selection` after sign-in/sign-up

### Phase 2: Multi-Tenancy Layer

- [x] Extend `convex/schema.ts` — add `organizations`, `projects`, `chatMessages` tables; extend `users` table
- [x] Create `convex/lib/auth.ts` — `authedQuery`/`authedMutation` wrappers
- [x] Extend `convex/http.ts` — add `organization.created`, `organization.updated` webhook handlers
- [x] Create `convex/organizations.ts` — org sync mutations
- [x] Create `(auth)` route group with sign-in, sign-up, org-selection pages
- [x] Modify `(app)/layout.tsx` — add org guard (redirect to org-selection if no active org)
- [x] Modify `app-sidebar.tsx` — add `<OrganizationSwitcher>` component
- [x] Update `nav-main.tsx` — add Projects, AI, Settings, Admin nav items

### Phase 3: Org-Scoped CRUD (Projects)

- [x] Create `convex/projects.ts` — list, get, create, update, delete using `authedQuery`/`authedMutation`
- [x] Create Zod schemas for project validation in `lib/` or colocated
- [x] Create `(app)/projects/page.tsx` — list view reusing TanStack Table patterns from existing `data-table.tsx`, wired to Convex
- [x] Create `(app)/projects/new/page.tsx` — create form with React Hook Form + Zod
- [x] Create `(app)/projects/[projectId]/page.tsx` — detail view
- [x] Create `(app)/projects/[projectId]/edit/page.tsx` — edit form
- [x] Create `components/forms/project-form.tsx` — shared form component
- [x] Create `components/shared/empty-state.tsx` and `page-header.tsx`
- [x] Remove `data.json` mock data from dashboard (or keep for dashboard demo)

### Phase 4: Billing Extension for B2B

- [x] Modify `components/custom-clerk-pricing.tsx` — add `forOrganizations` prop
- [x] Create `(marketing)/pricing/page.tsx` — dedicated pricing page
- [x] Update `<Protect>` conditions in `payment-gated/page.tsx` to check org-level plans
- [x] Create `(app)/settings/billing/page.tsx` — `<OrganizationProfile>` billing tab
- [x] Create `(app)/settings/members/page.tsx` — `<OrganizationProfile>` members tab
- [x] Create `(app)/settings/page.tsx` — general org settings
- [x] Create `(app)/admin/page.tsx` — role-gated admin page with `has({ role: 'org:admin' })`

### Phase 5: AI + Background Jobs

- [x] Create `lib/ai/registry.ts` — provider registry with Anthropic + OpenAI
- [x] Create `api/ai/chat/route.ts` — `streamText()` streaming endpoint
- [x] Create `components/ai/chat-interface.tsx` — `useChat()` chat UI
- [x] Create `(app)/ai/page.tsx` — AI chat page, gated behind `has({ feature: 'ai-chat' })`
- [x] Create `convex/chatMessages.ts` — message persistence functions
- [x] Create `convex/crons.ts` — example scheduled function

### Phase 6: Polish

- [x] Create legal page placeholders (terms, privacy)
- [x] Create `config/site.ts`, `config/nav.ts`, `config/plans.ts`
- [x] Create `hooks/use-org-subscription.ts` and `hooks/use-feature-gate.ts`
- [x] Add error boundaries (`error.tsx`) in each route group
- [x] Update `CLAUDE.md` with project architecture context
- [x] Update `README.md` with full setup guide
- [x] Document add-on patterns (Composio, Trigger.dev, direct Stripe, file uploads, email, analytics)

---

## 11. "Add When Needed" — Documented, Not Included

These capabilities are documented in the README with setup instructions and example code, but not wired into the starter kit by default.

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
| Starting point | Fork Elite Kit | Provides 60-70% of what we need with polished UI, saves days of work |
| Multi-tenancy strategy | Column-level `orgId` on every table | Simplest for Convex, scales to thousands of orgs |
| Org ID source of truth | Clerk string IDs (not Convex IDs) | Clerk owns org lifecycle, avoids sync issues |
| Auth in Convex functions | `convex-helpers` custom functions | Officially recommended, eliminates forgotten-filter bugs |
| Billing default | Clerk Billing (Beta) with `forOrganizations` | Zero webhook code, 5-min setup, perfect for prototypes |
| Billing escape hatch | Direct Stripe | Documented for production graduation |
| Simple background jobs | Convex scheduled functions | Built-in, no extra service to manage |
| Complex background jobs | Trigger.dev v4 (documented add-on) | For when prototypes need workflow orchestration |
| AI model management | Provider registry pattern | Swap models by changing a string |
| CSS configuration | Tailwind v4 with OKLch colors | Inherited from Elite Kit, more modern than HSL |
| Component library | shadcn/ui (new-york style) + custom animations | 38 components + MagicUI/Motion Primitives inherited |
| Data tables | TanStack Table + @dnd-kit | Inherited from Elite Kit, production-grade |
| Charts | Recharts | Inherited from Elite Kit, interactive area charts |
| Dark mode | next-themes | Inherited from Elite Kit, works with OKLch system |
| Forms | React Hook Form + Zod | Best DX for complex forms, Zod schemas reusable |
| Webhook verification | Svix | Inherited from Elite Kit, cryptographic signature checks |
| Composio | Documented add-on | Not every prototype needs external tool integrations |
| Marketing pages | Inherited + extended | Elite Kit's polished landing page + new pricing/legal |
