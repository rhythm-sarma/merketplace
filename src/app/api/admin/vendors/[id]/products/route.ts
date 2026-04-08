import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();
    const vendorId = params.id;
    // Fetch products belonging to this vendor
    const products = await Product.find({ vendorId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Fetch vendor products admin error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
