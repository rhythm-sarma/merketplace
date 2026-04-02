# Testing Practices

## Automated Testing
- **Status:** There are currently no automated tests (Unit, Integration, or E2E) in the codebase.
- **Frameworks Installed:** None (no Jest, Vitest, or Playwright detected in `package.json`).

## Manual Verification
- **Process:** Verification is performed manually by running the development server (`npm run dev`) and interacting with the UI.
- **Key Flows:**
  - Vendor registration and login.
  - Product creation and management.
  - Shopping: browsing, adding to cart, checkout.
  - Admin dashboard data accuracy.

## Quality Gates
- **Build:** Success of `next build` is the primary quality gate in CI (Vercel).
- **Linting:** ESLint is configured and run during the build process.
