# ##  Workbench RBAC Studio

> Build permissions that fit your team.

Enterprise-grade Role-Based Access Control (RBAC) and Permission Management application built with Next.js 15.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-ff4154)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Custom Roles** — Create, edit, duplicate, and delete roles with fine-grained permissions
- **Multi-Role Users** — Assign multiple roles to users with automatic UNION-based resolution
- **Permission Inspector** — Visually inspect how multiple roles merge into effective permissions
- **Permission Matrix** — Interactive checkbox grid with select-all, per-resource controls
- **Command Palette** — Ctrl+K to quickly navigate anywhere in the app
- **Dark Mode** — Full light/dark theme support with system preference detection
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Smooth Animations** — Page transitions and micro-interactions powered by Framer Motion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 + shadcn/ui |
| State | Zustand |
| Data Fetching | TanStack Query |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Toasts | Sonner |
| Command Palette | cmdk |
| Theme | next-themes |
| Data | In-memory (server-side) |

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Seed Data

### Roles
| Role | Permissions | System? |
|------|------------|---------|
| Owner | All 18 permissions | ✅ |
| Admin | 14/18 (projects, tasks, members, settings.view) | ✅ |
| Member | 10/18 (projects, tasks, members.view, settings.view) | ✅ |
| Viewer | 5/18 (read-only across all) | ✅ |
| Contractor | 5/18 (projects + tasks only) | ❌ |

### Users
| User | Roles | Multi-Role? |
|------|-------|------------|
| Sarah Johnson | Admin, Viewer | ✅ |
| John Smith | Contractor | ❌ |
| Emma Wilson | Owner | ❌ |
| Alex Brown | Member, Contractor | ✅ |

## Permission Matrix

| Resource | Actions |
|----------|---------|
| Projects | view, create, edit, delete, archive |
| Tasks | view, create, edit, delete, assign |
| Members | view, invite, remove, update_role |
| Billing | view, update, download_invoices |
| Settings | view, update |

## Permission Resolution: UNION Strategy

When a user has multiple roles, their effective permissions are the **union** of all permissions across all assigned roles. See [Architecture.md](./ARCHITECTURE.md) for the full rationale.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/permissions` | List all permissions grouped by resource |
| GET | `/api/roles` | List all roles with user counts |
| POST | `/api/roles` | Create a new role |
| PUT | `/api/roles/[id]` | Update a role |
| DELETE | `/api/roles/[id]` | Delete a role |
| GET | `/api/users` | List all users |
| GET | `/api/users/[id]` | Get user details |
| POST | `/api/users/[id]/roles` | Assign role to user |
| DELETE | `/api/users/[id]/roles/[roleId]` | Remove role from user |
| GET | `/api/users/[id]/effective-permissions` | Get computed effective permissions |

## Project Structure

```
app/
  (marketing)/        # Landing page
  (auth)/             # Login & Register
  dashboard/          # Protected dashboard pages
  api/                # Route handlers (backend)
components/
  ui/                 # shadcn/ui primitives
  layout/             # Sidebar, Topbar, Command Palette
  roles/              # Permission matrix
  shared/             # Loading skeletons, empty states, error states
lib/
  data/               # Seed data, in-memory store, permissions
  hooks/              # TanStack Query hooks
  store/              # Zustand stores
  types/              # TypeScript type definitions
  utils/              # Utility functions
```

## License

MIT
