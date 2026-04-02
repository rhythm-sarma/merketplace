# Project Requirements

## Product Listing
- **Category Filters:** Mens, Womens, Unisex.
- **Sort Options:** Featured, Price: Low to High, Price: High to Low, Newest.
- **Product IDs:** 24-character MongoDB ObjectId validation in all API routes.
- **Badges:** Condition labels (e.g., "10/10") and "SOLD OUT" status.

## Vendor Portal
- **Authentication:** Google Sign-In with Firebase.
- **Registration:** Multi-step flow (Google Login → Store Name/Phone).
- **Dashboard:** Management of products, orders, and basic stats.
- **Onboarding:** Smooth transition from login to dashboard for new vendors.

## Order Management
- **Checkout:** Razorpay integration with payment validation.
- **Tracking:** Unique order tracking page for customers.
- **History:** Order logs for both vendors and admin.

## Technical Quality (Active Requirements)
- **Automated Testing:** 
  - [ ] Unit tests for `src/lib/auth.ts` and `src/app/api/products/[id]/route.ts`.
  - [ ] Integration tests for the checkout flow (Razorpay mocking).
- **Input Validation:** 
  - [ ] Schema validation for product creation (`POST /api/products`).
  - [ ] Schema validation for vendor registration.
- **Hardening:** 
  - [ ] Remove default/fallback secrets from `src/lib/auth.ts`.
  - [ ] Secure `/admin` routes behind robust server-side authentication.
