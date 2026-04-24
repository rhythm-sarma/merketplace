import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import { orderConfirmationEmail, vendorNewOrderEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      mongoOrderId
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // SECURITY: Reject verification if Razorpay secret is not configured
    if (!secret) {
      console.error("RAZORPAY_KEY_SECRET is not set. Payment verification is disabled.");
      return NextResponse.json(
        { error: "Payment verification is not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Payment matches. Mark order as paid.
    const order = await Order.findById(mongoOrderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.paymentStatus = "Paid";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Decrement stock for each item now that payment is confirmed
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // ─── Send Emails (fire-and-forget, don't block the response) ───
    const orderData = {
      orderId: order.orderId,
      customer: order.customer,
      items: order.items.map((i: any) => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        size: i.size,
        image: i.image,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      processingFee: order.processingFee,
      total: order.total,
    };

    // 1. Send order confirmation to buyer
    const buyerEmail = orderConfirmationEmail(orderData);
    sendMail(order.customer.email, buyerEmail.subject, buyerEmail.html, buyerEmail.text).catch(() => {});

    // 2. Send new order notification to each unique vendor
    const vendorIds = [...new Set(order.items.map((i: any) => i.vendorId?.toString()).filter(Boolean))];
    
    console.log(`[ORDER] Notifying ${vendorIds.length} vendor(s):`, vendorIds);
    
    for (const vendorId of vendorIds) {
      try {
        const vendor = await Vendor.findById(vendorId);
        if (vendor?.email) {
          const vendorItems = order.items
            .filter((i: any) => i.vendorId?.toString() === vendorId)
            .map((i: any) => ({
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              size: i.size,
            }));
          
          console.log(`[ORDER] Sending email to vendor "${vendor.storeName}" (${vendor.email}) for ${vendorItems.length} item(s)`);
          const vendorEmailContent = vendorNewOrderEmail(orderData, vendor.storeName, vendorItems);
          sendMail(vendor.email, vendorEmailContent.subject, vendorEmailContent.html, vendorEmailContent.text).catch((err) => {
            console.error(`[MAIL] Failed to send to vendor ${vendor.email}:`, err);
          });
        } else {
          console.warn(`[ORDER] Vendor ${vendorId} not found or has no email`);
        }
      } catch (e) {
        console.error(`[MAIL] Failed to notify vendor ${vendorId}:`, e);
      }
    }

    return NextResponse.json({ message: "Payment verified successfully", success: true });

  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
