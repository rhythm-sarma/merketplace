# External Integrations

## Database
- **Provider:** MongoDB Atlas (implied by connection string)
- **Library:** `mongoose`
- **Connection:** Managed via `src/lib/dbConnect.ts` with global caching for serverless environments.

## Authentication
- **Firebase Auth:** Used for customer and vendor Google Sign-In.
- **JWT:** Used for vendor-specific session management (`vendor_token` cookie).
- **Initialization:** `src/lib/firebase.ts` handles client-side Firebase init with build-time safety checks.

## Image Storage
- **Provider:** Cloudinary
- **Usage:** Used for product images and vendor assets.
- **Config:** `src/lib/cloudinary.ts`
- **Next.js Config:** `res.cloudinary.com` added to remote patterns.

## Payments
- **Provider:** Razorpay
- **Library:** `razorpay` (Node.js SDK)
- **Frontend:** Razorpay Checkout (via `NEXT_PUBLIC_RAZORPAY_KEY_ID`)

## Design / UI
- **Unsplash:** Used for placeholder images in development/demos.
- **Config:** `images.unsplash.com` added to remote patterns.
