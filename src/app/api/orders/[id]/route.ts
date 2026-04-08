import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { getVendorFromRequest } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { orderShippedEmail, orderDeliveredEmail, orderConfirmedEmail, orderCancelledEmail } from "@/lib/emailTemplates";

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

    if (!["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].includes(status)) {
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

    if (status === "Confirmed" && previousStatus !== "Confirmed") {
      const email = orderConfirmedEmail(order.orderId, customerName);
      sendMail(customerEmail, email.subject, email.html, email.text).catch(() => {});
    }

    if (status === "Shipped" && previousStatus !== "Shipped") {
      const email = orderShippedEmail(order.orderId, customerName);
      sendMail(customerEmail, email.subject, email.html, email.text).catch(() => {});
    }

    if (status === "Delivered" && previousStatus !== "Delivered") {
      const email = orderDeliveredEmail(order.orderId, customerName);
      sendMail(customerEmail, email.subject, email.html, email.text).catch(() => {});
    }

    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      const email = orderCancelledEmail(order.orderId, customerName);
      sendMail(customerEmail, email.subject, email.html, email.text).catch(() => {});
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

// DELETE — vendor deletes an order from their view (only if Delivered or Cancelled)
// The user explicitly said "delete it from admins panel too"
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership
    const ownsItems = order.items.some((i: any) => i.vendorId === payload.vendorId);
    if (!ownsItems) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only allow deletion of Delivered or Cancelled orders
    if (!["Delivered", "Cancelled"].includes(order.status)) {
      return NextResponse.json(
        { error: "Only delivered or cancelled orders can be deleted." },
        { status: 400 }
      );
    }

    await Order.findByIdAndDelete(id);

    return NextResponse.json({ message: "Order deleted from system permanently." });
  } catch (error: any) {
    console.error("DELETE order error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
