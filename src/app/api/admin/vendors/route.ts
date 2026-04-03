import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();
    const vendors = await Vendor.find().select("-password").sort({ createdAt: -1 }).lean();

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
