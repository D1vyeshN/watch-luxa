# 🗺️ LUXE Admin Roadmap (v2 — shadcn/ui Edition)

**Stack:** Refine v5 + shadcn/ui (Radix + Tailwind v4) + Next.js 16 + TypeScript + TanStack Table + Recharts + dayjs + Sonner

**Total Steps:** 30 steps | **Estimated Time:** ~2.5 weeks (full-time)

---

## 🔴 Step -1: Compatibility Verification

- [x] Prototype Refine + Next.js 16 + `syncWithLocation: true`
- [x] Confirm `?pageSize=10&currentPage=1` in URL
- [x] Verify pagination updates URL, survives refresh, back button works

**Outcome:** ✅ Green light — `syncWithLocation` works in Next.js 16

---

## 🏗️ Phase 1: Foundation

### Step 0-3: Combined Foundation (single step)

**Step 0: Cleanup + Reinstall**
- [ ] Run `grep -rn "antd\|@ant-design\|@refinedev/antd\|@reduxjs\|react-redux" src/`
- [ ] Delete `src/theme/`, `src/store/`, all AntD layout components
- [ ] Delete `src/app/(dashboard)/`, `src/app/login/`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- [ ] Delete `node_modules`, `.next`, `.turbo`, `pnpm-lock.yaml`
- [ ] Run `pnpm install` from monorepo root
- [ ] Install Refine registry components:
  - [ ] `npx shadcn@canary add @refine/layout-01`
  - [ ] `npx shadcn@canary add @refine/data-table`
  - [ ] `npx shadcn@canary add @refine/form`
  - [ ] `npx shadcn@canary add @refine/buttons`

**Step 1: Design System**
- [ ] `src/app/globals.css` with LUXE tokens (Tailwind v4 `@theme inline`)
- [ ] Forest + cream palettes defined
- [ ] shadcn semantic tokens mapped
- [ ] Dark mode variables in `.dark` selector
- [ ] Inter font loaded via `next/font`

**Step 2: Providers**
- [ ] `src/app/providers.tsx` — `QueryClientProvider` + `Refine` + `Toaster`
- [ ] `src/providers/notification-provider/` — Sonner wrapper
- [ ] `src/app/layout.tsx` — server component with Inter + `<Providers>`

**Step 3: DataProvider Verification**
- [ ] `src/app/page.tsx` — verification page with `useList({ resource: 'products' })`
- [ ] Products render in a shadcn Table
- [ ] Total count badge shows
- [ ] No error alerts
- [ ] `pnpm build` passes with 500-800 modules

**Deliverable:** `pnpm dev` runs on port 3001. Live products from MongoDB. LUXE theme applied. Zero AntD references.

---

## 🔐 Phase 2: Auth & Shell

### Step 4: Login Page + Auth Flow
- [ ] `src/app/login/page.tsx` — shadcn Form + React Hook Form + Zod
- [ ] Wire `useLogin` mutation
- [ ] Role check (admin/superadmin only) in `authProvider.login`
- [ ] Access denied error for regular users
- [ ] Success → redirect to `/dashboard`
- [ ] Styled card on forest-green background
- [ ] Test wrong credentials → error alert
- [ ] Test regular user → access denied
- [ ] Test superadmin → success

### Step 5: Auth Guard
- [ ] `src/app/(dashboard)/layout.tsx` — `<Authenticated>` wrapper
- [ ] Verify session persistence on page refresh
- [ ] Verify auto-redirect on 401
- [ ] Verify logout redirects to `/login`
- [ ] Test: unauthenticated `/dashboard` → redirect to `/login`
- [ ] Test: expired token → auto-refresh → retry

### Step 6: Layout Shell
- [ ] Customize `@refine/layout-01` — LUXE logo
- [ ] Grouped sidebar nav (Overview, Catalog, Sales, Content, System)
- [ ] Theme switcher via `next-themes` (light/dark)
- [ ] User menu — avatar + name + role + sign out
- [ ] Breadcrumbs from Refine's `useBreadcrumb`
- [ ] Collapsible sidebar
- [ ] Test every page shares the shell

**Deliverable:** Full auth flow works. Sidebar renders with LUXE branding. Theme switches.

---

## 📊 Phase 3: Dashboard

### Step 7: Dashboard
- [ ] `src/app/(dashboard)/dashboard/page.tsx`
- [ ] KPI cards: Revenue, Orders, AOV, Customers (with % vs. previous)
- [ ] Date range selector: Today, 7d, 30d, 90d, YTD, custom
- [ ] Sales trend chart (Recharts — line/area)
- [ ] Order status donut chart
- [ ] Top products table (5 rows)
- [ ] Recent orders feed (5 rows)
- [ ] Low stock alerts list
- [ ] Data from `GET /admin/analytics/dashboard`
- [ ] Test: all metrics render, date range changes refetch

**Deliverable:** Business health visible in 5 seconds.

---

## 📦 Phase 4: Catalog Management

### Step 8: Products List
- [ ] `src/app/(dashboard)/products/page.tsx`
- [ ] `@refine/data-table` + `useTable`
- [ ] Columns: thumbnail, name, brand, category, variants, stock, status, actions
- [ ] Filters: status, category, brand, stock level, featured, limited
- [ ] Search: name, reference number, SKU
- [ ] Sort: newest, name, price, stock, best-selling
- [ ] Pagination (50/page)
- [ ] Bulk actions: Activate, Archive, Delete
- [ ] Row actions: Edit, Duplicate, View on site
- [ ] Test: browse, filter, search, sort, paginate

### Step 9a: Product Create — Content Tabs
- [ ] `src/app/(dashboard)/products/create/page.tsx`
- [ ] Refine `useForm` + shadcn Form
- [ ] Tab 1: Basic — name, slug, brand, category, collections, gender, descriptions, tags, status, featured, limited edition
- [ ] Tab 2: Media — hero image, gallery (drag reorder), video URL
- [ ] Tab 3: Specs — reference number, movement, power reserve, jewels, case dimensions, materials, crystal, water resistance, warranty, box & papers
- [ ] Tab 5: Pricing — base price, display mode
- [ ] Tab 6: SEO — meta title, description, OG image, preview
- [ ] Tab 7: Advanced — related products, internal notes, published date
- [ ] Zod validation on every field
- [ ] Test: create product with just Basic tab, then add other tabs

### Step 9b: Product Create — Variants Tab
- [ ] Tab 4: Variants
- [ ] List existing variants (empty on create)
- [ ] Add single variant button
- [ ] Variant card: SKU, dial, case, size, strap, price, stock
- [ ] Edit / Duplicate / Delete actions
- [ ] Toggle active per variant
- [ ] Test: manually add 3 variants

### Step 10: Product Edit
- [ ] `src/app/(dashboard)/products/edit/[id]/page.tsx`
- [ ] Pre-filled via `useForm` with `id` param
- [ ] Image upload to Supabase Storage
- [ ] Variant management (edit existing)
- [ ] Save via `useUpdate`
- [ ] Test: edit any product field

### Step 11: Variant Matrix Modal
- [ ] `src/components/products/variant-matrix-modal.tsx`
- [ ] Dialog triggered from Variants tab
- [ ] Checkbox groups: dial colors, case materials, strap types, case sizes
- [ ] Live combination count
- [ ] Default price, stock, low-stock threshold inputs
- [ ] Generate SKUs via `custom` dataProvider call
- [ ] Preview of combinations before confirming
- [ ] Test: generate 12 variants in one click

### Step 12: Categories CRUD
- [ ] `src/app/(dashboard)/categories/` — list, create, edit
- [ ] Columns: name, slug, description, product count, display order, system badge
- [ ] System categories show lock icon
- [ ] Cannot rename/archive/delete system categories
- [ ] Test: create custom category, edit, archive

### Step 13: Brands CRUD
- [ ] `src/app/(dashboard)/brands/` — list, create, edit
- [ ] Columns: logo, name, country, founded, product count, featured, status
- [ ] Logo upload to Supabase
- [ ] Heritage story rich text (start with TextArea)
- [ ] Test: create brand, edit heritage, archive

### Step 14: Collections CRUD
- [ ] `src/app/(dashboard)/collections/` — list, create, edit
- [ ] Columns: image, name, product count, featured, display order
- [ ] Product picker with search
- [ ] Drag-reorder products within collection
- [ ] Test: create collection, add products, reorder

### Step 15: Inventory
- [ ] `src/app/(dashboard)/inventory/page.tsx`
- [ ] Flat SKU view (product, variant, SKU, stock, threshold)
- [ ] Filters: low stock, out of stock, active, inactive
- [ ] Search by SKU or product name
- [ ] Inline stock editing (click → type → enter)
- [ ] Bulk actions: +N, −N, set exact for selected
- [ ] Color-coded rows: yellow (low), red (out of stock)
- [ ] Export to CSV
- [ ] Test: edit stock inline, bulk adjust, verify atomic update

### Step 16: CSV Import Wizard
- [ ] `src/app/(dashboard)/csv-import/page.tsx`
- [ ] 3-step wizard: Upload → Preview → Confirm
- [ ] Download CSV template
- [ ] Upload with file validation
- [ ] Preview table with products + variants grouped
- [ ] Error report: row number, field, message
- [ ] Warnings for potential issues
- [ ] Atomic import via MongoDB transaction
- [ ] Success summary: products + variants count
- [ ] Test: upload 500-row CSV, verify all-or-nothing behavior

**Deliverable:** Staff can add a 12-variant product in under 3 minutes. Bulk import works.

---

## 🛒 Phase 5: Sales Operations

### Step 17: Orders List + Detail
- [ ] `src/app/(dashboard)/orders/page.tsx` — list
- [ ] Columns: order number, customer name, email, total, status, payment, date
- [ ] Filters: order status, payment status, date range
- [ ] Search by order number or email
- [ ] `src/app/(dashboard)/orders/show/[id]/page.tsx` — detail
- [ ] Order header with status chips
- [ ] Line items with images, SKUs, quantities
- [ ] Shipping + billing addresses
- [ ] Payment details
- [ ] Financial summary
- [ ] Timeline of status history
- [ ] Actions: update status, add tracking, cancel, refund, internal note
- [ ] Test: fulfill order end-to-end

### Step 18: Customers
- [ ] `src/app/(dashboard)/customers/page.tsx`
- [ ] Aggregated from order activity (name, email, orders, spend, last order)
- [ ] Sort by total spend (descending default)
- [ ] Search by name or email
- [ ] Filters: high-value, repeat buyers, new
- [ ] Detail page with order history
- [ ] Test: sort by spend, verify aggregation

### Step 19: Coupons
- [ ] `src/app/(dashboard)/coupons/` — list, create, edit
- [ ] Columns: code, type, value, min order, max uses, used count, active, expires
- [ ] Create form: code, description, type, value, max discount, min order, max uses, expiry, auto-apply
- [ ] Activate / deactivate
- [ ] Delete
- [ ] Live usage stats display
- [ ] Test: create percentage coupon (requires maxDiscount), verify validation

### Step 20: Returns
- [ ] `src/app/(dashboard)/returns/page.tsx` — list
- [ ] Columns: return number, order, customer, amount, status, requested date
- [ ] Filters: status, refund status
- [ ] Detail page: items, reason, images, timeline
- [ ] Actions: Approve, Reject with reason, Mark Received, Refund (with optional restock)
- [ ] Test: approve → received → refund with restock

### Step 21: Reviews
- [ ] `src/app/(dashboard)/reviews/page.tsx`
- [ ] Tabs: Pending | Approved | Rejected | All
- [ ] Columns: product, customer, rating, comment excerpt, status, date
- [ ] Detail view with full review + images
- [ ] Actions: Approve, Reject with reason, Reply, Delete
- [ ] Test: approve review → verify it appears on storefront

**Deliverable:** Full sales operations coverage.

---

## ⚙️ Phase 6: System

### Step 22: Settings
- [ ] `src/app/(dashboard)/settings/page.tsx`
- [ ] Store identity: name, logo, contact email, phone
- [ ] Shipping rules: free threshold, flat fee
- [ ] Tax config: GST rate
- [ ] Returns policy: window days, text
- [ ] Test: save settings, verify persistence

### Step 23: Team Management (Superadmin)
- [ ] `src/app/(dashboard)/settings/team/page.tsx`
- [ ] Guarded by `<CanAccess resource="team" action="list">`
- [ ] List admins: name, email, role, status, last login
- [ ] Create admin: email, name, password, role
- [ ] Deactivate admin
- [ ] Test: create admin, verify they can log in with limited access

### Step 24: Audit Logs (Superadmin)
- [ ] `src/app/(dashboard)/settings/audit-logs/page.tsx`
- [ ] Guarded by `<CanAccess resource="audit-logs" action="list">`
- [ ] Columns: timestamp, actor, action, entity, entity ID, IP
- [ ] Filters: actor, action, entity, date range
- [ ] Detail: before/after snapshot
- [ ] Immutable — no delete UI
- [ ] Test: verify every write action appears

**Deliverable:** Full system control.

---

## 🚀 Phase 7: Polish + Launch

### Step 25: Performance Audit
- [ ] Measure module count (`pnpm build` output)
- [ ] Bundle size analysis
- [ ] Dynamic imports for heavy pages (CSV import, variant matrix modal)
- [ ] `next/dynamic` with `ssr: false` where needed
- [ ] Verify `optimizePackageImports` in `next.config.mjs`
- [ ] Test: Lighthouse desktop 85+, module count under 1,000

### Step 26: Accessibility Pass
- [ ] Keyboard navigation on every table and form
- [ ] Focus rings visible
- [ ] ARIA labels on icon-only buttons
- [ ] Form labels associated with inputs
- [ ] Color contrast 4.5:1 minimum
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Test: WCAG 2.1 AA compliance

### Step 27: E2E Testing
- [ ] Playwright setup
- [ ] Seed test database
- [ ] Test flows: login → products → orders → fulfillment
- [ ] Test: unauthorized redirect, role check, session expiry
- [ ] CI integration
- [ ] Test: `pnpm test:e2e` passes

### Step 28: Deployment
- [ ] Vercel project setup (separate from storefront)
- [ ] Root directory: `apps/admin`
- [ ] Environment variables: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`
- [ ] Custom domain: `admin.luxe.com`
- [ ] SSL certificate (Vercel auto)
- [ ] CORS update on backend: add `https://admin.luxe.com`
- [ ] Test: live at `admin.luxe.com`

**Deliverable:** Production admin at `admin.luxe.com`.

---

## 🎯 Minimum Launch Set (13 Steps)

If you want to launch faster:

- [x] Step -1: Compatibility check
- [ ] Step 0-3: Combined foundation
- [ ] Step 4: Login + auth
- [ ] Step 5: Auth guard
- [ ] Step 6: Layout shell
- [ ] Step 7: Dashboard
- [ ] Step 8: Products list
- [ ] Step 9a: Product create (content tabs)
- [ ] Step 9b: Product create (variants)
- [ ] Step 11: Variant Matrix Modal
- [ ] Step 15: Inventory
- [ ] Step 17: Orders list + detail
- [ ] Step 28: Deploy

**13 steps to a working admin.** Everything else is growth + polish.

---

## 🎯 Critical Path (1 Week)

**Day 1:**
- [ ] Step 0-3: Cleanup, design system, providers, dataProvider verification

**Day 2:**
- [ ] Step 4: Login page + auth flow
- [ ] Step 5: Auth guard
- [ ] Step 6: Layout shell

**Day 3:**
- [ ] Step 7: Dashboard
- [ ] Step 8: Products list

**Day 4:**
- [ ] Step 9a: Product create (content tabs)
- [ ] Step 9b: Product create (variants)
- [ ] Step 11: Variant Matrix Modal

**Day 5:**
- [ ] Step 12: Categories
- [ ] Step 13: Brands
- [ ] Step 14: Collections

**Day 6:**
- [ ] Step 15: Inventory
- [ ] Step 17: Orders list + detail

**Day 7:**
- [ ] Step 28: Deploy

**After 7 days:** Working admin that manages products, orders, and inventory.

---

## 📊 Time Estimate Breakdown

| Phase | Steps | Duration |
| :--- | :--- | :--- |
| Step -1: Verify | 1 | ✅ Done |
| Phase 1: Foundation | 0-3 | 1-2 days |
| Phase 2: Auth & Shell | 4-6 | 2 days |
| Phase 3: Dashboard | 7 | 1 day |
| Phase 4: Catalog | 8-16 | 5-7 days |
| Phase 5: Sales Ops | 17-21 | 3-4 days |
| Phase 6: System | 22-24 | 1-2 days |
| Phase 7: Polish + Launch | 25-28 | 2-3 days |
| **Total** | **30 steps** | **~2.5 weeks** |

---

## 🔄 vs. Storefront Roadmap

| Aspect | Storefront (apps/web) | Admin (apps/admin) |
| :--- | :--- | :--- |
| **Total steps** | 33 | 30 |
| **Total time** | ~4 weeks | ~2.5 weeks |
| **Meta-framework** | None | Refine v5 |
| **UI library** | shadcn/ui | shadcn/ui (same base) |
| **Data layer** | RTK Query | Refine `dataProvider` |
| **State** | Redux (server + client) | React Context + TanStack Query |
| **Forms** | React Hook Form + Zod | React Hook Form + Zod (via `@refinedev/react-hook-form`) |
| **Tables** | Custom + RTK Query | TanStack Table + `@refinedev/react-table` |
| **Auth** | JWT + thunks | `authProvider` |
| **Notifications** | Sonner | Sonner |
| **Charts** | Recharts | Recharts |
| **Rendering** | SSG + SSR + ISR + CSR | Fully CSR |
| **SEO** | Critical | Irrelevant |
| **Design** | Editorial, spacious | Dense, functional |

---

## ⚠️ Biggest Risks & Mitigations

### Risk 1: `syncWithLocation` bug in Next.js 16
**Status:** ✅ Verified working

### Risk 2: Custom `dataProvider` mapping
**Mitigation:** Already written and tested in combined Step 0-3. Handles non-standard API shape.

### Risk 3: Product form complexity (7 tabs)
**Mitigation:** Split into Step 9a (content tabs) and Step 9b (variants). Build each tab independently. Basic first, then Media, then Specs, etc.

### Risk 4: Supabase upload integration
**Mitigation:** Backend already has `/admin/uploads` endpoints. Frontend just needs a drag-drop wrapper around the file input.

### Risk 5: CSV Import — large files
**Mitigation:** Backend limits to 5,000 rows. Frontend shows preview before committing. Use `useCustom` for the import mutation.

---

## ✅ What's Testable After Each Phase

| Phase | Testable Deliverable |
| :--- | :--- |
| **Step -1** | ✅ Refine + Next.js 16 works with `syncWithLocation` |
| **Phase 1 (0-3)** | Live products render, LUXE theme applied, no AntD |
| **Phase 2 (4-6)** | Staff can log in, see the shell, redirect if unauthorized |
| **Phase 3 (7)** | Dashboard shows live revenue, orders, low stock |
| **Phase 4 (8-16)** | Add 12-variant product in 3 min, bulk-import 500 from CSV |
| **Phase 5 (17-21)** | Fulfill order end-to-end, process return, moderate reviews |
| **Phase 6 (22-24)** | Superadmin adds team member, views audit logs |
| **Phase 7 (25-28)** | Deployed to `admin.luxe.com` with 85+ Lighthouse |

---

## 🚀 Post-Launch Roadmap

### Phase 8: Email Notifications
- [ ] Order confirmation emails
- [ ] Shipping notification emails
- [ ] Review request emails
- [ ] Abandoned cart recovery

### Phase 9: Real-time Updates
- [ ] Supabase Realtime integration
- [ ] New order alerts (toast + sound)
- [ ] Low stock alerts
- [ ] Live inventory sync

### Phase 10: RBAC Upgrade
- [ ] Granular permissions per role
- [ ] Permission inheritance
- [ ] Attribute-based rules (e.g., "editors can only edit products they created")

### Phase 11: Advanced Analytics
- [ ] Cohort analysis
- [ ] Retention metrics
- [ ] LTV calculation
- [ ] Revenue forecasting

### Phase 12: Multi-language Admin
- [ ] Hindi language support
- [ ] Language switcher in user menu
- [ ] Translated labels

### Phase 13: Theme Enhancements
- [ ] Compact mode toggle
- [ ] Custom theme colors
- [ ] Saved theme preferences per user

---

## 📋 Progress Tracking Template

Copy this into your project tracker:

```
## Phase 1: Foundation
- [ ] Step 0-3: Combined foundation
- [ ] Step 4: Login + auth
- [ ] Step 5: Auth guard
- [ ] Step 6: Layout shell

## Phase 2: Dashboard
- [ ] Step 7: Dashboard

## Phase 3: Catalog
- [ ] Step 8: Products list
- [ ] Step 9a: Product create (content)
- [ ] Step 9b: Product create (variants)
- [ ] Step 10: Product edit
- [ ] Step 11: Variant Matrix Modal
- [ ] Step 12: Categories
- [ ] Step 13: Brands
- [ ] Step 14: Collections
- [ ] Step 15: Inventory
- [ ] Step 16: CSV Import

## Phase 4: Sales Ops
- [ ] Step 17: Orders
- [ ] Step 18: Customers
- [ ] Step 19: Coupons
- [ ] Step 20: Returns
- [ ] Step 21: Reviews

## Phase 5: System
- [ ] Step 22: Settings
- [ ] Step 23: Team
- [ ] Step 24: Audit logs

## Phase 6: Polish
- [ ] Step 25: Performance
- [ ] Step 26: Accessibility
- [ ] Step 27: E2E tests
- [ ] Step 28: Deploy
```

---

## 🎯 Key Decisions Locked

| Decision | Value |
| :--- | :--- |
| **UI Library** | shadcn/ui (Radix + Tailwind v4) |
| **Meta-framework** | Refine v5 |
| **Data layer** | Refine `dataProvider` (custom) |
| **State** | React Context + TanStack Query |
| **Forms** | React Hook Form + Zod (`@refinedev/react-hook-form`) |
| **Tables** | TanStack Table (`@refinedev/react-table`) |
| **Auth** | `authProvider` + role check |
| **Access control** | `accessControlProvider` + `<CanAccess>` |
| **Notifications** | Sonner |
| **Charts** | Recharts |
| **Dates** | dayjs |
| **Theme** | Tailwind v4 `@theme inline` + `next-themes` |
| **Rendering** | Fully CSR |
| **Deployment** | Vercel on `admin.luxe.com` |
| **localStorage keys** | `luxe_admin_access_token`, `luxe_admin_refresh_token`, `luxe_admin_user` |

---

**Save this file as `ADMIN-ROADMAP.md` in your project root.**

**Next: run the combined Step 0-3 and report back. Then say "Step 4" and we build the login page.**
