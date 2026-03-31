import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: "Order ID and email are required" }, { status: 400 });
    }

    const order = await Order.findOne({
      orderId: orderId.toUpperCase(),
      "customer.email": email.toLowerCase(),
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "No order found with that ID and email combination" }, { status: 404 });
    }

    // Return safe subset of order data
    return NextResponse.json({
      order: {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        items: order.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          size: i.size,
          price: i.price,
          image: i.image,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping,
        total: order.total,
        createdAt: order.createdAt,
        customer: {
          firstName: order.customer.firstName,
          city: order.customer.city,
          state: order.customer.state,
        },
      },
    });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
