import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const _JWT_SECRET = process.env.JWT_SECRET;
if (!_JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required. Set it in .env.local");
}
const JWT_SECRET: string = _JWT_SECRET;
const TOKEN_NAME = "vendor_token";

export function signToken(payload: { vendorId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { vendorId: string; email: string };
  } catch {
    return null;
  }
}

export async function getVendorFromRequest() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { TOKEN_NAME };
