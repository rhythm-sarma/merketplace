# Coding Conventions

## Language & Style
- **Language:** TypeScript (Strict mode enabled in `tsconfig.json`).
- **Framework:** Next.js 16 (App Router).
- **Components:** Functional components with defined `interface` for Props.
- **Naming:** 
  - PascalCase for Components (`ProductCard.tsx`).
  - camelCase for functions and variables.
  - lowercase-kebab-case for API route directories.

## Component Patterns
- **Client Components:** Use `"use client"` at the top when using hooks (`useState`, `useEffect`, `useParams`).
- **Layouts:** Use `layout.tsx` for shared page structures (Navbar/Footer).
- **Styling:** 
  - Mix of Tailwind CSS (v4) and global CSS classes (`globals.css`).
  - Inline styles used for dynamic states (e.g., sold out opacity).
- **Navigation:** Use `Link` from `next/link` for all internal routing.

## API & Data
- **Backend:** Next.js API Routes (`route.ts`).
- **ORM:** Mongoose for MongoDB interaction.
- **Error Handling:** Try/catch blocks in API routes with consistent JSON error responses and appropriate HTTP status codes (401, 403, 404, 500).
- **Auth Checks:** Use `getVendorFromRequest()` in API routes to verify vendor identity.

## State Management
- **Local State:** `useState` / `useReducer` for component-level state.
- **Global State:** React Context (`src/context/CartContext.tsx`) for persistent cross-page state like the shopping cart.
