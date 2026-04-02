# Project racksup

## What This Is
A production-ready thrift marketplace rebranding from "20RACKS" to "racksup." It features a distinct Neo-Brutalism design aesthetic and provides a full vendor-to-customer ecosystem including product management, secure payments, and order tracking.

## Core Value
To provide a fast, visually stunning, and reliable platform for the thrift fashion community in India, prioritizing ease of use for both vendors and customers.

## Context
- **Stage:** Beta / Rebranding complete.
- **Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4, MongoDB, Firebase Auth, Razorpay, Cloudinary.
- **Status:** Core marketplace features (shop, checkout, vendor portal) are implemented but require hardening (testing, validation).

## Requirements

### Validated
- ✓ **Next.js 16 Baseline** — Modern App Router architecture.
- ✓ **Neo-Brutalism UI** — Global design system with bold borders and high contrast.
- ✓ **Vendor Onboarding** — Google Sign-In (Firebase) and store registration flow.
- ✓ **Product Management** — CRUD operations for thrift items with Cloudinary image hosting.
- ✓ **Shopping Experience** — Product listing with category filters and functional price/newest sorting.
- ✓ **Payment Flow** — Integration with Razorpay for secure transactions.
- ✓ **Order Lifecycle** — Order creation and tracking system for customers.

### Active
- [ ] **Automated Testing** — Implement Unit/Integration tests for critical API routes and components (Highest Priority).
- [ ] **Input Validation** — Add robust schema validation (e.g., Zod) to all API endpoints.
- [ ] **Admin Hardening** — Secure the admin dashboard and refine access controls.
- [ ] **Error Handling** — Centralize error management to reduce redundancy in API routes.

### Out of Scope
- **Mobile Native Apps** — Focus is currently on Responsive Web.
- **Auction-style Bidding** — Fixed price only for the initial version.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 | Latest features, stability, and App Router benefits. | ✓ Confirmed |
| Tailwind 4 | Modern styling approach with CSS-first configuration. | ✓ Confirmed |
| Neo-Brutalism | Unique brand identity that stands out in the marketplace. | ✓ Confirmed |
| Firebase + JWT | Seamless Google login combined with secure vendor session control. | ✓ Confirmed |

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-03 after GSD initialization*
