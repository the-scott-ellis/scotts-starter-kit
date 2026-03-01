# Add a new org-scoped resource

Create a complete org-scoped CRUD resource following the Projects pattern.

**Usage:** `/new-resource <ResourceName>` (PascalCase singular, e.g. `Invoice`)

Use `$ARGUMENTS` as the resource name throughout. Derive lowercase/plural forms as needed (e.g. `Invoice` → `invoice`, `invoices`).

---

## Steps

### 1. Schema — `convex/schema.ts`

Add a new table. Every org-scoped table **must** include `orgId: v.string()` and lead compound indexes with it.

Reference: `convex/schema.ts` — copy the `projects` table shape (lines 36–51).

```typescript
<resource>s: defineTable({
  orgId: v.string(),        // Clerk org ID — required for tenancy
  name: v.string(),
  // ... your fields
  createdBy: v.string(),    // Clerk user ID
  updatedAt: v.number(),
})
  .index("by_orgId", ["orgId"]),
```

### 2. Validation — `lib/validations/<resource>.ts`

Copy `lib/validations/project.ts`. Update the schema fields and export the inferred type.

### 3. Convex Functions — `convex/<resource>s.ts`

Copy `convex/projects.ts`. All five functions use `authedQuery`/`authedMutation` from `convex/lib/auth.ts` — **never raw `query`/`mutation`** for org-scoped data. The wrappers inject `ctx.orgId` and `ctx.userId` automatically.

Required functions: `list`, `get`, `create`, `update`, `remove`.

- `list` — `.withIndex("by_orgId", q => q.eq("orgId", ctx.orgId))`
- `get` — fetch by `_id`, then verify `doc.orgId === ctx.orgId`
- `create` — spread validated args + `orgId: ctx.orgId, createdBy: ctx.userId, updatedAt: Date.now()`
- `update` — ownership check first, then `ctx.db.patch`
- `remove` — ownership check first, then `ctx.db.delete`

### 4. Update Generated Types — `convex/_generated/api.d.ts`

Manually add the new module to the `api` object until `npx convex dev` regenerates types:

```typescript
<resource>s: typeof import("../<resource>s");
```

### 5. Form Component — `components/forms/<resource>-form.tsx`

Copy `components/forms/project-form.tsx`. Update the schema import, field names, and form inputs. Keep React Hook Form + Zod pattern.

### 6. Pages — `app/(app)/<resource>s/`

Copy `app/(app)/projects/` directory. Four pages:

```
app/(app)/<resource>s/
├── page.tsx                    # List view — useQuery(api.<resource>s.list)
├── new/page.tsx                # Create form
└── [<resource>Id]/
    ├── page.tsx                # Detail view
    └── edit/page.tsx           # Edit form
```

### 7. Navigation — `config/nav.ts`

Add an entry to `navMain`:

```typescript
{
  title: "<Resource>s",
  url: "/<resource>s",
  icon: IconSomeIcon,  // pick from @tabler/icons-react
},
```

### 8. Middleware — `middleware.ts`

If the new route needs protection (it almost certainly does), verify `/<resource>s(.*)` is covered by the existing `createRouteMatcher` in `middleware.ts`. The current matcher already covers common routes — check before adding.

---

## Checklist

- [ ] Table added to `convex/schema.ts` with `orgId: v.string()` and `by_orgId` index
- [ ] Zod schema in `lib/validations/<resource>.ts`
- [ ] Convex functions in `convex/<resource>s.ts` using `authedQuery`/`authedMutation`
- [ ] `convex/_generated/api.d.ts` updated (until `npx convex dev` runs)
- [ ] Form component in `components/forms/<resource>-form.tsx`
- [ ] All four pages created (list, new, detail, edit)
- [ ] Nav entry added to `config/nav.ts`
- [ ] Route covered by middleware matcher
