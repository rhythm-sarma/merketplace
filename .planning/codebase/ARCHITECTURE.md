# System Architecture

## Pattern
- **Framework:** Next.js (App Router)
- **Pattern:** Model-View-Controller (MVC) like structure where models are Mongoose schemas, views are Next.js pages/components, and controllers are Next.js API routes.

## Layers
1. **Frontend (App Router):** `src/app` handles routing, layout, and client/server components.
2. **Components:** `src/components` (shared, vendor UI, skeleton screens).
3. **API Layer:** `src/app/api` handles server-side logic and database interaction.
4. **Data Layer:** `src/models` defines the schema for MongoDB.
5. **Context:** `src/context` (Cart context for state management).

## Data Flow
- **Authentication:** Firebase (Client) + JWT (Server) for Vendor sessions.
- **Data Preservation:** MongoDB Atlas for all persistent state (Vendors, Products, Orders).
- **Media Storage:** Cloudinary (Product images).
- **Payment Lifecycle:** 
  1. Frontend creates Razorpay order.
  2. Frontend collects payment.
  3. API validates payment and creates Order record in MongoDB.

## Entry Points
- **Customer Home:** `src/app/page.tsx`
- **Shop Listing:** `src/app/shop/page.tsx`
- **Vendor Portal:** `src/app/vendor/page.tsx`
- **API Entry:** `src/app/api/.../route.ts`
