---
name: new-page
description: Scaffold a new Next.js App Router page following Mobipita project structure and accessibility guidelines. Use when creating new pages or routes.
argument-hint: <route-path> [description]
---

Create a new Next.js page following Mobipita's established patterns.

## Steps

1. Determine the correct route group based on the target audience:
   - `src/app/(TOP)/` — Public landing pages
   - `src/app/(customer)/` — Customer booking portal
   - `src/app/m/admin/` — Admin role pages
   - `src/app/m/company/` — Company role pages
   - `src/app/m/staff/` — Staff role pages
2. Read an existing page in the same route group for pattern reference
3. Create `page.tsx` (and `layout.tsx` if needed)

## Required Patterns

- **"use client"** only when the page needs client-side interactivity
- **Accessibility**: Font size >= 16px body / 18px labels, touch targets >= 44x44px, WCAG AA contrast
- **Auth**: Management pages (`/m/`) must check user roles
- **Styling**: TailwindCSS 4 classes, follow existing component patterns
- **Components**: Use shadcn/ui components from `@/components/ui/`

## Arguments

- `$1`: Route path (e.g., `m/company/services`, `(customer)/booking`)
- `$2`: Optional description of the page's purpose
