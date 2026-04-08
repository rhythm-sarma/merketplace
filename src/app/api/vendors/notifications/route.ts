import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getVendorFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    // Fetch recent orders that are Cancelled or Delivered just as an example of notifications
    // You can customize which statuses trigger a notification
    const recentOrders = await Order.find({
      "items.vendorId": payload.vendorId,
      status: { $in: ["Cancelled", "Delivered", "Pending"] }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const notifications = recentOrders.map((order) => {
      let message = "";
      if (order.status === "Cancelled") {
        message = `Order #${order.orderId} was cancelled.`;
      } else if (order.status === "Delivered") {
        message = `Order #${order.orderId} was delivered successfully.`;
      } else if (order.status === "Pending") {
        message = `New order received: #${order.orderId}.`;
      }

      return {
        id: order._id,
        orderId: order.orderId,
        message,
        status: order.status,
        date: order.createdAt,
      };
    });

    return NextResponse.json({ notifications }, { status: 200 });
  } catch (error: unknown) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
