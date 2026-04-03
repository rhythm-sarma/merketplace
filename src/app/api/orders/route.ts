import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getVendorFromRequest } from "@/lib/auth";
import Razorpay from "razorpay";

import crypto from "crypto";

// Lazily instantiate Razorpay — fail loudly if keys are missing
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are required.");
  }
  return new Razorpay({ key_id, key_secret });
};

// POST — create an order (guest buyer, no auth required)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { customer, items, subtotal, shipping, processingFee, total } = body;

    if (!customer || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer info and items are required" },
        { status: 400 }
      );
    }

    // Validate stock for all items before proceeding
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product "${item.name}" is no longer available` },
          { status: 400 }
        );
      }
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `"${item.name}" is sold out or has insufficient stock` },
          { status: 400 }
        );
      }
    }

    // Generate a unique order ID using crypto (race-condition-safe)
    const uniqueId = crypto.randomBytes(4).toString("hex").toUpperCase();
    const orderId = `#ORD-${uniqueId}`;

    // Create Razorpay Order
    // total is in INR, Razorpay expects paise (multiply by 100)
    const amountInPaise = Math.round(total * 100);
    const razorpayOptions = {
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
    };

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create(razorpayOptions);

    // Create the order in MongoDB with Pending state
    const order = await Order.create({
      orderId,
      customer,
      items,
      subtotal,
      shipping,
      processingFee,
      total,
      status: "Pending",
      paymentStatus: "Pending",
      razorpayOrderId: razorpayOrder.id,
    });

    return NextResponse.json(
      { 
        message: "Order placed for payment", 
        order,
        razorpayOrderId: razorpayOrder.id,
        amount: amountInPaise,
        currency: "INR"
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST order error:", error);
    return NextResponse.json(
      { error: "Something went wrong creating the Razorpay order" },
      { status: 500 }
    );
  }
}

// GET — get orders for the authenticated vendor
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

    // Find orders that contain at least one item belonging to this vendor
    // Exclude abandoned carts (Pending payments) from vendor dashboard by default if you want, 
    // but for now we'll just show Paid ones or all. Let's show Paid.
    const orders = await Order.find({
      "items.vendorId": payload.vendorId,
      paymentStatus: "Paid"
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error: unknown) {
    console.error("GET orders error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
