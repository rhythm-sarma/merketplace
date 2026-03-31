import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";

export async function POST(req: NextRequest) {
  // Only allow in local development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

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
