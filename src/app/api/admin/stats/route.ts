import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Vendor from "@/models/Vendor";
import Product from "@/models/Product";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const authError = verifyAdmin(req);
  if (authError) return authError;

  try {
    await dbConnect();

    // Orders
    const paidOrders = await Order.find({ paymentStatus: "Paid" }).lean();
    const allOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: "Pending", paymentStatus: "Paid" });
    const shippedOrders = await Order.countDocuments({ status: "Shipped" });
    const deliveredOrders = await Order.countDocuments({ status: "Delivered" });

    // Revenue from paid orders
    let totalRevenue = 0;
    for (const order of paidOrders) {
      for (const item of order.items) {
        totalRevenue += item.price * item.quantity;
      }
    }
    totalRevenue = Math.round(totalRevenue * 100) / 100;

    const totalCommission = Math.round(totalRevenue * 0.05 * 100) / 100;
    const totalPayout = Math.round((totalRevenue - totalCommission) * 100) / 100;

    // Vendors
    const totalVendors = await Vendor.countDocuments();
    const verifiedVendors = await Vendor.countDocuments({ isVerified: true });
    const pendingVendors = await Vendor.countDocuments({ onboardingComplete: true, isVerified: false });
    const incompleteVendors = await Vendor.countDocuments({ onboardingComplete: false });

    // Products
    const totalProducts = await Product.countDocuments();
    const outOfStockProducts = await Product.countDocuments({ stock: { $lte: 0 } });

    return NextResponse.json({
      revenue: {
        totalRevenue,
        totalCommission,
        totalPayout,
      },
      orders: {
        total: allOrders,
        paid: paidOrders.length,
        pending: pendingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
      },
      vendors: {
        total: totalVendors,
        verified: verifiedVendors,
        pending: pendingVendors,
        incomplete: incompleteVendors,
      },
      products: {
        total: totalProducts,
        outOfStock: outOfStockProducts,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
