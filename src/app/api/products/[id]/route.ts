import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import "@/models/Vendor"; // Ensure Vendor schema is registered for populate()
import { getVendorFromRequest } from "@/lib/auth";

// GET single product by ID (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId to avoid Mongoose CastError (which causes 500)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await dbConnect();
    const product = await Product.findById(id)
      .populate("vendorId", "storeName slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const populatedVendor = product.vendorId as unknown as { _id: any; storeName: string; slug: string } | null;

    const mapped = {
      ...product,
      _id: product._id.toString(),
      vendorId: populatedVendor?._id?.toString() || null,
      vendor: populatedVendor
        ? {
            storeName: populatedVendor.storeName,
            slug: populatedVendor.slug,
          }
        : null,
    };

    return NextResponse.json({ product: mapped });
  } catch (error: unknown) {
    console.error("GET product error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// PUT update product (vendor-only, must own the product)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await dbConnect();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.vendorId.toString() !== payload.vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, shippingPrice, category, condition, sizes, stock, images } = body;

    // Validate price and stock before updating
    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 1) {
        return NextResponse.json({ error: "Price must be at least ₹1" }, { status: 400 });
      }
    }
    if (stock !== undefined) {
      const numericStock = Number(stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });
      }
    }
    if (shippingPrice !== undefined) {
      const numericShipping = Number(shippingPrice);
      if (isNaN(numericShipping) || numericShipping < 0) {
        return NextResponse.json({ error: "Shipping price cannot be negative" }, { status: 400 });
      }
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (shippingPrice !== undefined) product.shippingPrice = Number(shippingPrice);
    if (category !== undefined) product.category = category;
    if (condition !== undefined) product.condition = condition;
    if (sizes !== undefined) product.sizes = sizes;
    if (stock !== undefined) product.stock = Math.max(0, Number(stock));
    if (images !== undefined) product.images = images;

    await product.save();
    return NextResponse.json({ message: "Product updated", product });
  } catch (error: unknown) {
    console.error("PUT product error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE product (vendor-only, must own the product)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await dbConnect();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.vendorId.toString() !== payload.vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted" });
  } catch (error: unknown) {
    console.error("DELETE product error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
