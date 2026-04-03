import { NextRequest, NextResponse } from "next/server";

/**
 * Centralized admin authentication helper.
 * Validates the x-admin-secret header against the ADMIN_SECRET env var.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export function verifyAdmin(req: NextRequest): NextResponse | null {
  const adminSecret = process.env.ADMIN_SECRET;

  // If ADMIN_SECRET is not configured, block all admin access
  if (!adminSecret) {
    console.error("ADMIN_SECRET environment variable is not set. Admin access is disabled.");
    return NextResponse.json(
      { error: "Admin access is not configured" },
      { status: 403 }
    );
  }

  const providedSecret = req.headers.get("x-admin-secret");

  if (providedSecret !== adminSecret) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  return null; // Authorized
}
