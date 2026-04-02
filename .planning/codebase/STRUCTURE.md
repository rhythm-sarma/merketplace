# Project Structure

## Directory Layout
- `.planning/` - GSD project management and codebase map
- `public/` - Static assets (images, logos)
- `src/` - Application source code
  - `app/` - Next.js App Router (Pages & API routes)
    - `admin/` - Admin dashboard
    - `api/` - Backend endpoints
    - `cart/`, `checkout/`, `shop/`, `store/`, `track-order/` - Feature pages
    - `vendor/` - Vendor portal
  - `components/` - React components
    - `vendor/` - Vendor-specific UI
  - `context/` - React Context (Cart state)
  - `lib/` - Utility functions and initializations (Auth, Cloudinary, DB, Firebase)
  - `models/` - Mongoose/MongoDB schemas
  - `styles/` - Global CSS

## Naming Conventions
- **Directories:** lowercase-with-hyphens
- **Components:** PascalCase (.tsx)
- **API Routes:** `route.ts` within segment directories
- **Models:** PascalCase (.ts)
- **Utilities:** camelCase (.ts)
