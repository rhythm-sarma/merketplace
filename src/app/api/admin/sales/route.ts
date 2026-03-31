import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Vendor from "@/models/Vendor";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    await dbConnect();

    // Get all paid orders
    const orders = await Order.find({ paymentStatus: "Paid" }).sort({ createdAt: -1 }).lean();

    // Get all vendors
    const vendors = await Vendor.find().select("-password").lean();

    // Build a map of vendorId -> vendor details
    const vendorMap: Record<string, any> = {};
    for (const v of vendors) {
      vendorMap[v._id.toString()] = v;
    }

    // Aggregate sales per vendor
    const salesMap: Record<string, { totalSales: number; orderCount: number; orders: any[] }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        const vid = item.vendorId;
        if (!salesMap[vid]) {
          salesMap[vid] = { totalSales: 0, orderCount: 0, orders: [] };
        }
        salesMap[vid].totalSales += item.price * item.quantity;
      }
      // Track unique orders per vendor
      const vendorIds = [...new Set(order.items.map((i: any) => i.vendorId))];
      for (const vid of vendorIds) {
        if (!salesMap[vid as string]) {
          salesMap[vid as string] = { totalSales: 0, orderCount: 0, orders: [] };
        }
        salesMap[vid as string].orderCount += 1;
        salesMap[vid as string].orders.push({
          orderId: order.orderId,
          date: order.createdAt,
          items: order.items.filter((i: any) => i.vendorId === vid),
          total: order.items.filter((i: any) => i.vendorId === vid).reduce((sum: number, i: any) => sum + i.price * i.quantity, 0),
        });
      }
    }

    // Build response
    const vendorSales = Object.entries(salesMap).map(([vendorId, data]) => {
      const vendor = vendorMap[vendorId];
      const commission = Math.round(data.totalSales * 0.05 * 100) / 100;
      const payout = Math.round((data.totalSales - commission) * 100) / 100;

      return {
        vendorId,
        storeName: vendor?.storeName || "Unknown Store",
        email: vendor?.email || "N/A",
        phone: vendor?.phone || "N/A",
        bankName: vendor?.bankName || "N/A",
        accountHolderName: vendor?.accountHolderName || "N/A",
        ifscCode: vendor?.ifscCode || "N/A",
        upiId: vendor?.upiId || "N/A",
        panNumber: vendor?.panNumber || "N/A",
        totalSales: data.totalSales,
        orderCount: data.orderCount,
        commission,
        payout,
        orders: data.orders,
      };
    });

    // Sort by total sales descending
    vendorSales.sort((a, b) => b.totalSales - a.totalSales);

    return NextResponse.json({ vendorSales });
  } catch (error) {
    console.error("Admin sales error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
