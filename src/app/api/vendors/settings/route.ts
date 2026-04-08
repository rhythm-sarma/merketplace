import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getVendorFromRequest, TOKEN_NAME } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    // Allow updating specific fields
    const allowedFields = [
      "name",
      "phone",
      "instaId",
      "bankName",
      "accountHolderName",
      "ifscCode",
      "upiId",
      "panNumber",
      "warehouseAddress1",
      "warehouseAddress2",
      "primaryAddress"
    ];

    const updateData: any = {};
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const updatedVendor = await Vendor.findByIdAndUpdate(
      payload.vendorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedVendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Profile updated successfully", vendor: updatedVendor });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    // Check for active orders
    const activeOrdersCount = await Order.countDocuments({
      "items.vendorId": payload.vendorId,
      status: { $in: ["Pending", "Shipped"] },
      paymentStatus: "Paid"
    });

    if (activeOrdersCount > 0) {
      return NextResponse.json(
        { error: `You have ${activeOrdersCount} active order(s). Please cancel or complete them before deleting your account.` },
        { status: 400 }
      );
    }

    // Check if they have any remaining orders (Delivered/Cancelled) that they haven't "deleted" yet
    // The requirement says "they have to cancel their active order and delete all the older orders"
    const remainingOrdersCount = await Order.countDocuments({
      "items.vendorId": payload.vendorId,
    });

    if (remainingOrdersCount > 0) {
      return NextResponse.json(
        { error: "You must delete all your older orders from your dashboard before you can delete your account." },
        { status: 400 }
      );
    }

    // Delete all products
    await Product.deleteMany({ vendorId: payload.vendorId });

    // Delete vendor account
    await Vendor.findByIdAndDelete(payload.vendorId);

    // Logout
    const response = NextResponse.json({ message: "Account deleted successfully" });
    response.cookies.set(TOKEN_NAME, "", { maxAge: 0, path: "/" });
    return response;

  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
