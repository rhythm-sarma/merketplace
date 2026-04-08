import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/adminAuth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();
    const productId = params.id;
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product admin error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
