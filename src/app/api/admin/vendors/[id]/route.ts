import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
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
    const vendorId = params.id;
    
    // 1. Delete all products associated with this vendor
    const productDeleteResult = await Product.deleteMany({ vendorId });
    
    // 2. Delete the vendor store record
    const deletedVendor = await Vendor.findByIdAndDelete(vendorId);
    
    if (!deletedVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Vendor and associated products deleted permanently",
      productsDeleted: productDeleteResult.deletedCount
    });
  } catch (error) {
    console.error("Delete vendor admin error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
