# 🗺️ LUXE Admin Roadmap

**Stack:** Refine v5 + Ant Design v5 + Next.js 16 + TypeScript + Recharts + dayjs

**Total Steps:** 30 steps | **Estimated Time:** ~2.5 weeks (full-time)

---

## 🔴 Step -1: Verify Compatibility

- [ ] Prototype Refine + Next.js 16 + `syncWithLocation: true`
- [ ] Create throwaway Next.js 16 app
- [ ] Install Refine + Ant Design
- [ ] Build one resource with `useTable({ syncWithLocation: true })`
- [ ] Confirm `?current=2` updates URL, survives refresh, back button works

**Outcome:** Green light to proceed / pin to Next.js 15 / use workaround

---

## 🏗️ Phase 1: Foundation (Steps 0-4)

### Step 0: Project Setup
- [ ] Next.js 16 setup
- [ ] Refine v5 installation
- [ ] Ant Design v5 installation
- [ ] Folder structure setup
- [ ] `next.config.mjs` performance tuning
- [ ] Default Next.js page runs with Refine provider mounted

### Step 1: Custom dataProvider
- [ ] Map Express API `{ success, data, pagination }` to Refine's expected shape
- [ ] Test `useList` fetches products from backend

### Step 2: Custom authProvider + accessControlProvider
- [ ] Implement login, logout, check
- [ ] Implement getIdentity, getPermissions
- [ ] Add role rules
- [ ] Test login flow works
- [ ] Test role check enforced

### Step 3: Theme + root `<Refine>`
- [ ] LUXE palette via `ConfigProvider`
- [ ] Define resources
- [ ] Mount `ThemedLayout`
- [ ] Admin shell renders with LUXE colors and sidebar

### Step 4: Login page + auth guard
- [ ] Build login page
- [ ] Implement `useIsAuthenticated` guard
- [ ] Add global loading/error states
- [ ] Test unauthenticated users redirect to `/login`

---

## 🎨 Phase 2: UI Shell (Steps 5-6)

### Step 5: ThemedLayout Customization
- [ ] Sidebar nav
- [ ] Topbar
- [ ] User menu
- [ ] Breadcrumbs
- [ ] Theme switcher (light/compact/dark)
- [ ] Test every page shares the shell

### Step 6: Reusable Components
- [ ] `PageHeader` component
- [ ] `StatCard` component
- [ ] `DataTable` component (wraps `<Table>`)
- [ ] `ConfirmDialog` component
- [ ] `EmptyState` component

---

## 📊 Phase 3: Dashboard (Step 7)

### Step 7: Dashboard Layout
- [ ] Stat cards
- [ ] Sales trend chart
- [ ] Order status donut
- [ ] Top products
- [ ] Recent orders
- [ ] Low stock alerts
- [ ] Test business health at a glance

---

## 📦 Phase 4: Catalog Management (Steps 8-16)

### Step 8: Products List
- [ ] `<List>` + `useTable`
- [ ] Filters
- [ ] Search
- [ ] Bulk actions
- [ ] Row actions
- [ ] Test browse, filter, search products

### Step 9: Product Create
- [ ] `<Create>` + `useForm`
- [ ] 7-tab form (Basic, Media, Specs, Variants, Pricing, SEO, Advanced)
- [ ] Test create products with full spec

### Step 10: Product Edit
- [ ] Same form as create
- [ ] Pre-filled via `useForm`
- [ ] Image upload
- [ ] Variant management
- [ ] Test edit any product field

### Step 11: Variant Matrix Modal
- [ ] Custom dialog
- [ ] Checkboxes for dial × case × strap × size
- [ ] Live count
- [ ] Generate SKUs
- [ ] Test add 12+ variants in one click

### Step 12: Categories
- [ ] `<List>` + `<Create>` + `<Edit>`
- [ ] System category lock
- [ ] Test manage watch types

### Step 13: Brands
- [ ] `<List>` + `<Create>` + `<Edit>`
- [ ] Logo upload
- [ ] Heritage story
- [ ] Test manage watch brands

### Step 14: Collections
- [ ] `<List>` + `<Create>` + `<Edit>`
- [ ] Product picker with drag-reorder
- [ ] Test curate merchandising groups

### Step 15: Inventory
- [ ] Flat SKU view
- [ ] Inline stock edit
- [ ] Low-stock highlighting
- [ ] Bulk adjust
- [ ] Export CSV
- [ ] Test stock management

### Step 16: CSV Import Wizard
- [ ] 3-step `<Steps>` flow
- [ ] Preview
- [ ] Error report
- [ ] Atomic import
- [ ] Test bulk load up to 5,000 products

---

## 🛒 Phase 5: Sales Operations (Steps 17-22)

### Step 17: Orders List
- [ ] `<List>` + `useTable`
- [ ] Filters (status, payment, date range)
- [ ] Search
- [ ] Test find any order

### Step 18: Order Detail
- [ ] `<Show>` + `<Descriptions>` + `<Timeline>`
- [ ] Status updates
- [ ] Tracking
- [ ] Refund
- [ ] Notes
- [ ] Test fulfill orders end-to-end

### Step 19: Customers
- [ ] Aggregated list from order activity
- [ ] Sort by spend
- [ ] Detail with order history
- [ ] Test see who's buying

### Step 20: Coupons
- [ ] CRUD operations
- [ ] Activate/deactivate
- [ ] Live usage stats
- [ ] Test run promotions

### Step 21: Returns
- [ ] List view
- [ ] Detail view
- [ ] Approve/reject/received/refund
- [ ] Optional restock
- [ ] Test process returns

### Step 22: Reviews
- [ ] Moderation tabs (Pending, Approved, Rejected)
- [ ] Approve/reject/reply/delete
- [ ] Test curate reviews

---

## ⚙️ Phase 6: System (Steps 23-25)

### Step 23: Settings
- [ ] Store identity
- [ ] Shipping rules
- [ ] Tax config
- [ ] Returns policy
- [ ] Test configure the store

### Step 24: Team Management (Superadmin)
- [ ] List admins
- [ ] Create admin
- [ ] Deactivate admin
- [ ] Test add staff

### Step 25: Audit Logs (Superadmin)
- [ ] Log every write action
- [ ] Filterable logs
- [ ] Immutable logs
- [ ] Test accountability

---

## 🚀 Phase 7: Polish + Launch (Steps 26-29)

### Step 26: Next.js Performance Audit
- [ ] Module count check
- [ ] Bundle size analysis
- [ ] Dynamic imports for heavy pages
- [ ] Test fast builds, fast loads

### Step 27: Accessibility Pass
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Focus rings
- [ ] Screen reader testing
- [ ] Test WCAG AA compliance

### Step 28: E2E Testing
- [ ] Playwright setup
- [ ] Seed DB
- [ ] Critical user flows
- [ ] Test reliable releases

### Step 29: Deployment
- [ ] Vercel project setup
- [ ] `admin.luxe.com` domain
- [ ] SSL configuration
- [ ] Environment variables
- [ ] CORS update on backend
- [ ] Test live at `admin.luxe.com`

---

## 🎯 Minimum Launch Set (11 Steps)

If you want to launch faster, here's the **minimum path**:

- [ ] Step -1: Compatibility check
- [ ] Step 0: Project setup + performance tuning
- [ ] Step 1: Custom dataProvider
- [ ] Step 2: authProvider + accessControlProvider
- [ ] Step 3: Theme + root Refine + ThemedLayout
- [ ] Step 4: Login + auth guard
- [ ] Step 5: ThemedLayout customization
- [ ] Step 6: Reusable components
- [ ] Step 7: Dashboard
- [ ] Step 8: Products list
- [ ] Step 9: Product create
- [ ] Step 11: Variant Matrix Modal
- [ ] Step 15: Inventory
- [ ] Step 17: Orders list
- [ ] Step 18: Order detail
- [ ] Step 29: Deploy to `admin.luxe.com`

**11 steps to a working admin.** Everything else is growth + polish.

---

## 🎯 Critical Path (1 Week)

If you only have **one week**, build this:

**Day 1:**
- [ ] Step -1: Verify Refine + Next.js 16 compatibility
- [ ] Step 0: Project setup
- [ ] Step 1: Custom dataProvider

**Day 2:**
- [ ] Step 2: authProvider + accessControlProvider
- [ ] Step 3: Theme + root Refine

**Day 3:**
- [ ] Step 4: Login + auth guard
- [ ] Step 5: ThemedLayout customization

**Day 4:**
- [ ] Step 7: Dashboard
- [ ] Step 8: Products list

**Day 5:**
- [ ] Step 9: Product create
- [ ] Step 11: Variant Matrix Modal

**Day 6:**
- [ ] Step 15: Inventory
- [ ] Step 17: Orders list

**Day 7:**
- [ ] Step 18: Order detail
- [ ] Step 29: Deploy to `admin.luxe.com`

**After 7 days:** You have a working admin that can manage products, orders, and inventory — enough to run the store.

---

## 📊 Time Estimate Breakdown

| Phase | Steps | Duration |
| :--- | :--- | :--- |
| Step -1: Verify | 1 | 30 min |
| Phase 1: Foundation | 0-4 | 2-3 days |
| Phase 2: UI Shell | 5-6 | 1-2 days |
| Phase 3: Dashboard | 7 | 1 day |
| Phase 4: Catalog | 8-16 | 5-7 days |
| Phase 5: Sales Ops | 17-22 | 3-4 days |
| Phase 6: System | 23-25 | 1-2 days |
| Phase 7: Polish + Launch | 26-29 | 2-3 days |
| **Total** | **30 steps** | **~2.5 weeks** |

---

## 🚀 Post-Launch Roadmap

Once the admin is live, here's what comes next:

### Phase 8: Email Notifications
- [ ] Order confirmation emails
- [ ] Shipping notification emails
- [ ] Review request emails

### Phase 9: Real-time Updates
- [ ] Supabase Realtime integration
- [ ] New order alerts
- [ ] Low stock alerts

### Phase 10: RBAC Upgrade
- [ ] Granular permissions per role
- [ ] Permission inheritance
- [ ] Permission audit

### Phase 11: Advanced Analytics
- [ ] Cohort analysis
- [ ] Retention metrics
- [ ] LTV calculation

### Phase 12: Multi-language Admin
- [ ] Hindi language support
- [ ] Language switcher
- [ ] Translated labels

### Phase 13: Theme Enhancements
- [ ] Dark mode toggle
- [ ] Compact mode toggle
- [ ] Custom themes

---

## 🎯 Key Differences vs. Storefront Roadmap

| Aspect | Storefront | Admin |
| :--- | :--- | :--- |
| **Total steps** | 33 | 30 |
| **Total time** | ~4 weeks | ~2.5 weeks |
| **Meta-framework** | None (custom) | Refine v5 |
| **UI library** | shadcn/ui | Ant Design v5 |
| **Data layer** | RTK Query | Refine `dataProvider` |
| **State** | Redux (server + client) | Redux (client only) |
| **Auth** | JWT + thunks | `authProvider` |
| **Rendering** | SSG + SSR + ISR + CSR | Fully CSR |
| **SEO** | Critical | Irrelevant |
| **Design** | Editorial, spacious | Dense, functional |

---

## ⚠️ Biggest Risks & Mitigations

### Risk 1: `syncWithLocation` bug in Next.js 16
**Mitigation:** Verify early (Step -1)

### Risk 2: Custom `dataProvider` mapping
**Mitigation:** Write `dataProvider` with tests (Step 1)

### Risk 3: Product form complexity (7 tabs)
**Mitigation:** Build product form incrementally — Basic first, then each tab

---

## ✅ What's Testable After Each Phase

| Phase | Testable Deliverable |
| :--- | :--- |
| **Step -1** | Refine + Next.js 16 prototype works with `syncWithLocation` |
| **Phase 1 (0-4)** | Staff can log in, see the dashboard shell, and be redirected if unauthorized |
| **Phase 2 (5-6)** | Sidebar, topbar, and reusable components all render |
| **Phase 3 (7)** | Dashboard shows live revenue, orders, and low stock |
| **Phase 4 (8-16)** | Staff can add a 12-variant product in under 3 minutes and bulk-import 500 products from CSV |
| **Phase 5 (17-22)** | Staff can fulfill an order end-to-end, process a return, and moderate reviews |
| **Phase 6 (23-25)** | Superadmin can add a team member and view audit logs |
| **Phase 7 (26-29)** | Deployed to `admin.luxe.com` with 90+ Lighthouse score |

---

**Say "Start" when you're ready, and we begin with Step -1 — verifying Refine works with your Next.js 16 setup.**
