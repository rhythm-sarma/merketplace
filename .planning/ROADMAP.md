# Project Roadmap

## Milestone 1: Hardening & Testing Foundation
*Focus: Stability, security, and developer confidence.*

### Phase 1: Automated Testing Foundation
- **Goals:** Establish a testing framework and write core tests.
- **Status:** [ ]
- **Features:**
  - [ ] Setup Vitest/Jest for API testing.
  - [ ] Unit tests for `src/lib/auth.ts`.
  - [ ] Unit tests for `src/app/api/products/[id]/route.ts`.

### Phase 2: Input Validation & Security
- **Goals:** Secure endpoints and validate incoming data.
- **Status:** [ ]
- **Features:**
  - [ ] Implement Zod schemas for Product and Vendor registration.
  - [ ] Remove hardcoded JWT secrets and fallback values.
  - [ ] Audit and secure `/admin` dashboard routes.

### Phase 3: Refactoring & Error Handling
- **Goals:** Dry up the codebase and improve error reporting.
- **Status:** [ ]
- **Features:**
  - [ ] Centralize API error handling.
  - [ ] Refactor repetitive logic in Product and Order controllers.

## Milestone 2: Feature Expansion
*Focus: Advanced user features and scaling.*

### Phase 4: Admin Dashboard Refinement
- **Goals:** Improved data visualization and management.
- **Status:** [ ]

### Phase 5: Advanced Search & Personalization
- **Goals:** Full-text search and personalized recommendations.
- **Status:** [ ]
