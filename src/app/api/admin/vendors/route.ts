import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized. Admin panel is local only." }, { status: 403 });
  }

  try {
    await dbConnect();
    const vendors = await Vendor.find().select("-password").sort({ createdAt: -1 }).lean();

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error("Fetch vendors error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
