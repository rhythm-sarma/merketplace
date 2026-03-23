import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getVendorFromRequest } from "@/lib/auth";

// GET — aggregate stats for the authenticated vendor
export async function GET() {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();
    const vendorId = payload.vendorId;

    // Find all orders containing this vendor's items
    const orders = await Order.find({
      "items.vendorId": vendorId,
    }).lean();

    let totalRevenue = 0;
    let totalItemsSold = 0;
    let deliveredOrders = 0;
    let pendingOrders = 0;
    let shippedOrders = 0;

    for (const order of orders) {
      // Only sum revenue for THIS vendor's items in the order
      for (const item of order.items) {
        if (item.vendorId.toString() === vendorId) {
          totalRevenue += item.price * item.quantity;
          totalItemsSold += item.quantity;
        }
      }

      if (order.status === "Delivered") deliveredOrders++;
      else if (order.status === "Shipped") shippedOrders++;
      else pendingOrders++;
    }

    return NextResponse.json({
      totalOrders: orders.length,
      totalRevenue,
      totalItemsSold,
      deliveredOrders,
      pendingOrders,
      shippedOrders,
    });
  } catch (error: unknown) {
    console.error("GET vendor stats error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
