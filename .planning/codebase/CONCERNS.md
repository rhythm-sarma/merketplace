# Technical Concerns & Debt

## Security
- **JWT Secret:** `src/lib/auth.ts` has a hardcoded fallback secret (`marketplace-dev-secret-change-me`). This should be removed and made strictly required from environment variables in production.
- **Admin Authentication:** The `/admin` routes should be audited to ensure they are properly protected and not just hidden by UI.
- **Input Validation:** API routes handle basic body parsing, but could benefit from more robust validation (e.g., Zod).

## Technical Debt
- **Testing:** Zero automated tests (Unit, Integration, E2E). This is the highest priority debt to address for long-term stability.
- **Image Processing:** Cloudinary uploads are handled synchronously in API routes. 
- **Error Handling:** While present, error handling is somewhat repetitive across API routes. A centralized middleware or utility might be beneficial.
- **State Management:** The Cart relies on client-side localStorage/Context. This can lead to hydration mismatches if not handled carefully in Next.js SSR.

## Fragility
- **Firebase Initialization:** Build-time safety checks in `src/lib/firebase.ts` are necessary but reflect the fragility of relying on browser-only SDKs during Next.js static generation.
- **Hardcoded IDs:** Some IDs (like Razorpay) might be hardcoded in development/demo components.
