import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { verifyAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID required" }, { status: 400 });
    }

    await dbConnect();
    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { isVerified: true },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Vendor verified successfully", vendor });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
