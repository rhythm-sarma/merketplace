import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getVendorFromRequest } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { orderShippedEmail, orderDeliveredEmail } from "@/lib/emailTemplates";

// PATCH — update order status (authenticated vendor, must own order items)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await params;

    // Validate ObjectId to prevent Mongoose CastError (500)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const { status } = await req.json();

    if (!["Pending", "Shipped", "Delivered"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // SECURITY: Verify the vendor owns at least one item in this order
    const ownsItems = order.items.some(
      (item: any) => item.vendorId === payload.vendorId
    );
    if (!ownsItems) {
      return NextResponse.json(
        { error: "Unauthorized — you do not have items in this order" },
        { status: 403 }
      );
    }

    const previousStatus = order.status;
    order.status = status;
    await order.save();

    // ─── Send status update emails to buyer ───
    const customerName = order.customer.firstName;
    const customerEmail = order.customer.email;

    if (status === "Shipped" && previousStatus !== "Shipped") {
      const email = orderShippedEmail(order.orderId, customerName);
      sendMail(customerEmail, email.subject, email.html).catch(() => {});
    }

    if (status === "Delivered" && previousStatus !== "Delivered") {
      const email = orderDeliveredEmail(order.orderId, customerName);
      sendMail(customerEmail, email.subject, email.html).catch(() => {});
    }

    return NextResponse.json({ message: "Status updated", order });
  } catch (error: unknown) {
    console.error("PATCH order error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
