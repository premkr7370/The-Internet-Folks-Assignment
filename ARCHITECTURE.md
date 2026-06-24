# Architecture

> Workbench RBAC Studio — Build permissions that fit your team.

---

## Stack Choices

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 15 (App Router) | Full-stack framework with file-based routing, React Server Components, and API Route Handlers — no separate backend needed. |
| Language | TypeScript | End-to-end type safety between API, store, hooks, and components. Catches permission string typos at compile time. |
| Styling | Tailwind CSS 4 + shadcn/ui | Utility-first CSS for rapid iteration. shadcn/ui provides accessible, composable primitives without opinionated design constraints. |
| State (Client) | Zustand | Lightweight, zero-boilerplate state for sidebar collapse and command palette toggle. No context provider hell. |
| Data Fetching | TanStack Query | Declarative cache management, automatic refetching, mutation invalidation. Replaces manual `useEffect` + `useState` fetch patterns. |
| Animations | Framer Motion | Layout animations, staggered lists, and spring-based active indicators. Declarative API that composes well with React. |
| Charts | Recharts | Composable chart components built on D3. Used for the permission distribution donut chart on the dashboard. |
| Toasts | Sonner | Minimal, accessible toast notifications with auto-dismiss. |
| Command Palette | cmdk | Headless command menu matching the Ctrl+K pattern from Linear/Notion/VS Code. |
| Theme | next-themes | Server-safe theme detection with system preference support and flash-free hydration. |
| Icons | Lucide React | Tree-shakeable SVG icons. Consistent stroke style that matches the Linear/Stripe aesthetic. |
| Data | In-memory (server-side) | Stateless store that resets on restart. Designed as a deliberate simplification — no database driver or ORM complexity. |

---

## Folder Structure

```
app/
├── (marketing)/          # Route group — landing page (no sidebar)
│   ├── page.tsx
│   └── layout.tsx
├── (auth)/               # Route group — login & register (centered card)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── dashboard/            # Protected layout with sidebar + topbar
│   ├── page.tsx          # Dashboard (stats, charts, widgets)
│   ├── roles/
│   │   ├── page.tsx      # Roles listing
│   │   ├── create/       # Create role form + permission matrix
│   │   └── [id]/edit/    # Edit role form + permission matrix
│   ├── users/
│   │   ├── page.tsx      # Users listing
│   │   └── [id]/         # User details + effective permissions
│   ├── permissions/      # Permission Inspector (merge visualization)
│   ├── settings/         # Workspace settings
│   └── layout.tsx        # Sidebar + Topbar + CommandPalette
├── api/                  # Backend route handlers
│   ├── permissions/
│   ├── roles/
│   │   └── [id]/
│   └── users/
│       └── [id]/
│           ├── roles/
│           │   └── [roleId]/
│           └── effective-permissions/
├── not-found.tsx         # 404 page
├── layout.tsx            # Root layout (providers)
└── globals.css           # Design system tokens

components/
├── ui/                   # shadcn/ui primitives (button, card, badge, etc.)
├── layout/               # Sidebar, Topbar, CommandPalette, ThemeToggle
├── roles/                # PermissionMatrix component
├── shared/               # LoadingSkeleton, EmptyState, ErrorState
└── providers/            # ThemeProvider, QueryProvider

lib/
├── data/                 # permissions.ts, seed.ts, store.ts
├── hooks/                # TanStack Query hooks (use-roles, use-users, use-permissions)
├── store/                # Zustand stores (sidebar, command palette)
├── types/                # Shared TypeScript types
└── utils/                # cn() utility, API helpers
```

**Why route groups?** The `(marketing)` and `(auth)` groups share no layout with the dashboard. Route groups let Next.js apply different layouts without URL nesting.

**Why `lib/hooks/`?** TanStack Query hooks encapsulate query keys, fetch functions, and mutation invalidation logic. Components never call `fetch()` directly — they use `useRoles()`, `useUsers()`, etc.

---

## State Management Decisions

### Server State → TanStack Query

All data from API routes is managed by TanStack Query:

```
useRoles()              → GET /api/roles
useRole(id)             → GET /api/roles/[id]
useCreateRole()         → POST /api/roles
useUpdateRole(id)       → PUT /api/roles/[id]
useDeleteRole()         → DELETE /api/roles/[id]
useDuplicateRole()      → POST /api/roles (copy)

useUsers()              → GET /api/users
useUser(id)             → GET /api/users/[id]
useEffectivePermissions(id) → GET /api/users/[id]/effective-permissions
useAssignRole()         → POST /api/users/[id]/roles
useRemoveRole()         → DELETE /api/users/[id]/roles/[roleId]
```

Each mutation automatically invalidates the relevant query keys. For example, `useAssignRole` invalidates `userKeys.all`, `userKeys.detail(userId)`, `userKeys.effectivePermissions(userId)`, and `roleKeys.all` (because user counts change).

### Client State → Zustand

Only two pieces of truly client-local state exist:

| Store | Purpose |
|-------|---------|
| `useSidebarStore` | Sidebar collapsed/expanded + mobile open/close |
| `useCommandStore` | Command palette open/close toggle |

These never touch the server. Zustand was chosen over React Context because it doesn't cause unnecessary re-renders and has a simpler API.

### Local Component State → `useState`

Form inputs (role name, description, search queries) use plain `useState`. They don't need global persistence or server synchronization.

---

## Permission Resolution Strategy

### The Decision: UNION

When a user has multiple roles, their effective permissions are computed as the **set union** of all permissions from all assigned roles.

```
Admin permissions:    {projects.view, projects.edit, tasks.view, tasks.edit}
Viewer permissions:   {projects.view, billing.view, settings.view}
                      ──────────────────────────────────────────────
Effective:            {projects.view, projects.edit, tasks.view, tasks.edit,
                       billing.view, settings.view}
```

### Why UNION?

1. **Principle of least surprise** — Adding a role always extends access, never restricts it. Admins can reason about permissions without worrying about role interactions.

2. **Industry standard** — AWS IAM, Google Cloud IAM, GitHub organizations, and Kubernetes RBAC all use additive permission models as the default.

3. **Simplicity** — No deny rules, no priority conflicts, no role ordering. The system is predictable.

4. **Auditability** — For any granted permission, you can trace exactly which role(s) provide it. The Permission Inspector uses color-coded dots (blue/violet) to show this provenance.

### Alternatives Considered

| Strategy | Pros | Cons | Why Not |
|----------|------|------|---------|
| **Intersection** | Most restrictive | Multi-role users lose access | Unusable for our use case |
| **Priority-based** | Fine control | Requires role ordering UI | Adds complexity without clear benefit |
| **Deny-override** | Maximum flexibility | Hard to debug, easy to misconfigure | Over-engineered for a team RBAC tool |

### Implementation

```typescript
// lib/data/store.ts — computeEffectivePermissions()
const permissionSet = new Set<Permission>();
for (const role of userRoles) {
  for (const perm of role.permissions) {
    permissionSet.add(perm);
  }
}
```

The computation is O(R × P) where R = number of roles and P = average permissions per role. With 5 roles and 18 max permissions, this is trivially fast.

---

## API Design

### Endpoint Structure

```
GET  /api/permissions                        → All permissions grouped by resource
GET  /api/roles                              → All roles with user counts
POST /api/roles                              → Create role
PUT  /api/roles/[id]                         → Update role
DELETE /api/roles/[id]                       → Delete role (cascades from users)

GET  /api/users                              → All users with role names
GET  /api/users/[id]                         → Single user with full role objects
POST /api/users/[id]/roles                   → Assign role to user
DELETE /api/users/[id]/roles/[roleId]        → Remove role from user
GET  /api/users/[id]/effective-permissions   → UNION-computed permissions
```

### Design Decisions

- **Role deletion cascades**: When a role is deleted, it's automatically removed from all users' `roleIds` arrays. This prevents orphaned references.

- **Computed endpoints**: `/effective-permissions` is a computed view, not stored data. It's recalculated on every request to ensure consistency.

- **Consistent response shape**: All endpoints return `{ data: T, success: boolean }`. Error responses include a `message` field.

- **RESTful sub-resources**: User roles are managed at `/api/users/[id]/roles` rather than a separate `/api/user-roles` endpoint. This keeps the API intuitive.

---

## Seed Data

### Roles (5)

| Role | Permissions | System? |
|------|------------|---------|
| Owner | All 18 permissions | ✅ |
| Admin | 14/18 (no billing, partial settings) | ✅ |
| Member | 10/18 (projects, tasks, members.view, settings.view) | ✅ |
| Viewer | 5/18 (read-only across all resources) | ✅ |
| Contractor | 5/18 (projects.view/edit, tasks.view/create/edit) | ❌ |

### Users (4)

| User | Roles | Multi-Role? |
|------|-------|------------|
| Sarah Johnson | Admin, Viewer | ✅ |
| John Smith | Contractor | ❌ |
| Emma Wilson | Owner | ❌ |
| Alex Brown | Member, Contractor | ✅ |

Sarah and Alex demonstrate UNION resolution with overlapping and complementary role sets.

---

## Trade-offs

| Decision | Trade-off | Why Acceptable |
|----------|-----------|----------------|
| In-memory store | Data resets on restart | Intentional simplification — no database complexity. Easy to swap for Prisma/Drizzle later. |
| No authentication | Anyone can access all routes | Allows focusing on the RBAC builder UX. Auth is orthogonal to role management. |
| TanStack Query over SWR | Slightly larger bundle | Superior mutation support, better query invalidation, more powerful devtools. |
| shadcn/ui over Radix directly | Some bundle overhead from pre-styled components | Dramatically faster development. Components are copy-pasted, not imported — fully customizable. |
| UNION only (no deny) | Cannot restrict permissions via roles | Covers 90%+ of team RBAC use cases. Deny rules add debugging complexity that isn't justified here. |
| Single Next.js repo | Cannot scale frontend/backend independently | Perfect for this scope. Monorepo deployment on Vercel is trivial. |

---

## Future Improvements

### Near-Term
- **Role templates** — Pre-built permission sets for common patterns (Editor, Reviewer, Support Agent)
- **Bulk operations** — Assign/remove roles from multiple users simultaneously
- **Role comparison** — Side-by-side diff of two roles' permissions
- **Activity log** — Track who changed what role and when
- **Export/Import** — JSON export of role configurations for backup and migration

### Medium-Term
- **Database integration** — Replace in-memory store with Prisma + SQLite/PostgreSQL
- **Authentication** — NextAuth.js with OAuth providers
- **API keys** — Programmatic role management via API tokens
- **Webhooks** — Notify external systems on role/permission changes
- **Role hierarchy** — Inherit permissions from parent roles

### Long-Term
- **Conditional permissions** — Time-based access, IP-based restrictions
- **Resource-scoped roles** — Different permissions per project/workspace
- **ABAC hybrid** — Attribute-based rules alongside role-based permissions
- **Compliance reporting** — SOC 2 / ISO 27001 permission audit reports
