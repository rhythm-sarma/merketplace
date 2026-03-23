import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { getVendorFromRequest, TOKEN_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const vendor = await Vendor.findById(payload.vendorId).select("-password");
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ vendor });
  } catch (error: unknown) {
    console.error("Me error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Logout
export async function DELETE() {
  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set(TOKEN_NAME, "", { maxAge: 0, path: "/" });
  return response;
}
