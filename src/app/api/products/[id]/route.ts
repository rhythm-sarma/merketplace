import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { getVendorFromRequest } from "@/lib/auth";

// GET single product by ID (public)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id)
      .populate("vendorId", "storeName slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const mapped = {
      ...product,
      _id: product._id.toString(),
      vendorId: undefined,
      vendor: product.vendorId
        ? {
            storeName: (product.vendorId as unknown as { storeName: string; slug: string }).storeName,
            slug: (product.vendorId as unknown as { storeName: string; slug: string }).slug,
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

    await dbConnect();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (product.vendorId.toString() !== payload.vendorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, category, condition, sizes, stock, images } = body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (category !== undefined) product.category = category;
    if (condition !== undefined) product.condition = condition;
    if (sizes !== undefined) product.sizes = sizes;
    if (stock !== undefined) product.stock = Number(stock);
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

    await dbConnect();
    const { id } = await params;
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
