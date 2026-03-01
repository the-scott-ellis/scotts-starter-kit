# Scott's B2B SaaS Starter Kit

An opinionated, production-ready starter kit for building customer-facing B2B SaaS applications. Fork it, configure it, and start building your unique business logic in minutes.

**What ships out of the box:**
- Multi-tenant authentication with organization switching (Clerk Organizations)
- Org-scoped data isolation via `authedQuery`/`authedMutation` wrappers
- Example CRUD resource (Projects) — copy this pattern for every new resource
- Per-organization subscription billing (Clerk Billing)
- Streaming AI chat (Vercel AI SDK v6, Anthropic + OpenAI)
- Polished dashboard with KPI cards, charts, and data tables
- Marketing landing page, pricing page, legal placeholders
- Background job support (Convex scheduled functions)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Database | Convex (realtime serverless) |
| Auth + Orgs + Billing | Clerk |
| AI | Vercel AI SDK v6 (`ai`, `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/react`) |
| UI | shadcn/ui (new-york) + Tailwind v4 + Framer Motion |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table + @dnd-kit |
| Charts | Recharts |

---

## Prerequisites

- Node.js 20+
- A [Clerk](https://clerk.com) account
- A [Convex](https://convex.dev) account
- (Optional) Anthropic and/or OpenAI API keys for AI chat

---

## Setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd scotts-starter-kit
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` — see the section below for each variable.

### 3. Configure Clerk Dashboard

1. **Create a Clerk application** at [dashboard.clerk.com](https://dashboard.clerk.com)

2. **Enable Organizations**
   - Dashboard → Configure → Organizations → Enable

3. **Create a JWT template named `convex`**
   - Dashboard → Configure → JWT templates → New template → Convex
   - Add these claims to the template:
     ```json
     {
       "org_id": "{{org.id}}",
       "org_role": "{{org.role}}"
     }
     ```
   - Copy the **Issuer URL** — this is `NEXT_PUBLIC_CLERK_FRONTEND_API_URL`

4. **Configure Billing** (optional, for paid plans)
   - Dashboard → Billing → Enable Clerk Billing
   - Create Plans for Organizations: `free`, `pro`, `enterprise`
   - Update plan IDs in `config/plans.ts` to match what you create

5. **Set redirect URLs** in your `.env.local`:
   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/org-selection
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/org-selection
   ```

### 4. Configure Convex

```bash
npx convex dev
```

This will:
- Create a Convex project (or link an existing one)
- Populate `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` in `.env.local`
- Push the schema and auto-generate types in `convex/_generated/`

**Add the webhook secret to Convex** (not `.env.local`):
- Convex Dashboard → your deployment → Settings → Environment variables
- Add `CLERK_WEBHOOK_SECRET` with the value from Clerk → Webhooks → your endpoint

### 5. Configure Clerk Webhooks

In the Clerk Dashboard → Webhooks → Add endpoint:
- **URL:** `https://<your-convex-deployment>.convex.site/clerk-users-webhook`
- **Events to subscribe:**
  - `user.created`, `user.updated`, `user.deleted`
  - `organization.created`, `organization.updated`
  - `paymentAttempt.updated` (if using Clerk Billing)

### 6. Run the app

In two terminals:

```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Convex (keep running)
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# Convex — auto-populated by `npx convex dev`
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=https://your-clerk-frontend-api-url.clerk.accounts.dev

# Clerk routes + redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/org-selection
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/org-selection
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# AI providers (only needed if using AI Chat)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

> **Note:** `CLERK_WEBHOOK_SECRET` goes in the **Convex** dashboard environment variables, not `.env.local`.

---

## Project Structure

```
app/
├── (marketing)/          # Public — landing, /pricing, /legal/terms, /legal/privacy
├── (auth)/               # Sign-in, sign-up, org-selection
├── (app)/                # Protected — requires auth + active org
│   ├── dashboard/        # KPI cards, chart, data table
│   ├── projects/         # Example org-scoped CRUD resource
│   ├── ai/               # AI chat (plan-gated)
│   ├── settings/         # Org settings, members, billing
│   └── admin/            # Org admin only
└── api/ai/chat/          # Vercel AI SDK streaming endpoint

convex/
├── schema.ts             # Full database schema
├── lib/auth.ts           # authedQuery / authedMutation wrappers
├── projects.ts           # Example org-scoped CRUD functions
├── organizations.ts      # Org sync from Clerk webhooks
├── chatMessages.ts       # AI chat persistence
├── crons.ts              # Scheduled functions
└── http.ts               # Clerk webhook handler

config/
├── site.ts               # App name, URLs
├── nav.ts                # Sidebar navigation items
└── plans.ts              # Pricing tier definitions

lib/
├── ai/registry.ts        # AI provider registry — change DEFAULT_MODEL here
└── validations/          # Zod schemas (copy pattern for new resources)
```

---

## Adding a New Resource

Copy the Projects pattern for any new org-scoped resource:

1. **Schema** — add table to `convex/schema.ts` with `orgId: v.string()`
2. **Validation** — add Zod schema to `lib/validations/`
3. **Convex functions** — add `list`, `get`, `create`, `update`, `remove` to a new `convex/<resource>.ts` using `authedQuery`/`authedMutation`
4. **Form component** — copy `components/forms/project-form.tsx`
5. **Pages** — copy `app/(app)/projects/` structure

---

## Switching AI Models

Edit one line in `lib/ai/registry.ts`:

```typescript
export const DEFAULT_MODEL = "anthropic:claude-sonnet-4-20250514";
// or
export const DEFAULT_MODEL = "openai:gpt-4o";
```

---

## Documented Add-Ons (not wired by default)

| Add-on | When to add | Docs |
|---|---|---|
| **Trigger.dev v4** | Complex multi-step background jobs | [trigger.dev/docs](https://trigger.dev/docs) |
| **Composio** | AI agents with 850+ external tool integrations | [docs.composio.dev](https://docs.composio.dev) |
| **Direct Stripe** | Graduating from Clerk Billing to production billing | Stripe docs |
| **Resend** | Transactional email | [resend.com/docs](https://resend.com/docs) |
| **PostHog** | Analytics | [posthog.com/docs](https://posthog.com/docs) |
| **Convex file storage** | File uploads | [docs.convex.dev/file-storage](https://docs.convex.dev/file-storage) |

---

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Multi-tenancy | Column-level `orgId` on every table | Simplest pattern for Convex; scales to thousands of orgs without schema changes |
| Org ID type | Clerk string IDs (not Convex IDs) | Clerk owns the org lifecycle — storing Convex IDs would create sync problems |
| Convex auth wrappers | `convex-helpers` `authedQuery`/`authedMutation` | Officially recommended pattern; eliminates the entire class of forgotten-filter bugs |
| Billing | Clerk Billing with `forOrganizations` | Zero webhook code, 5-minute setup — the right default for prototypes |
| Billing escape hatch | Direct Stripe (documented, not wired) | Clear migration path when a prototype graduates to production |
| Background jobs | Convex scheduled functions | Built-in, no extra service to manage for simple cron/delay use cases |
| Complex workflows | Trigger.dev v4 (documented add-on) | Reach for this when you need retries, orchestration, or long-running jobs |
| AI model management | Provider registry pattern | Swap models by changing one string in `lib/ai/registry.ts` |
| Forms | React Hook Form + Zod | Best DX for complex forms; Zod schemas double as Convex validator mirrors |
| Webhook verification | Svix | Cryptographic signature verification on all inbound Clerk webhooks |

---

## Deploying to Vercel

```bash
vercel deploy
```

Set all environment variables in the Vercel dashboard. After deploying, update your Clerk webhook endpoint URL to the production Vercel URL.
