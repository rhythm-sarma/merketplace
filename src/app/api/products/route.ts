import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import { getVendorFromRequest } from "@/lib/auth";

export const dynamic = 'force-dynamic';
// GET all products (public) — or vendor's own products if ?mine=true
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get("mine");
    const category = searchParams.get("category");
    const condition = searchParams.get("condition");
    const vendorSlug = searchParams.get("vendor");

    let filter: Record<string, unknown> = {};

    // If requesting own products
    if (mine === "true") {
      const payload = await getVendorFromRequest();
      if (!payload) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
      }
      filter.vendorId = payload.vendorId;
    }

    // If filtering by vendor slug
    if (vendorSlug) {
      const vendor = await Vendor.findOne({ slug: vendorSlug });
      if (vendor) {
        filter.vendorId = vendor._id;
      } else {
        return NextResponse.json({ products: [] });
      }
    }

    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    const products = await Product.find(filter)
      .populate("vendorId", "storeName slug")
      .sort({ createdAt: -1 })
      .lean();

    // Map vendorId to vendor for cleaner API response
    const mapped = products.map((p) => ({
      ...p,
      _id: p._id.toString(),
      vendorId: undefined,
      vendor: p.vendorId
        ? {
            storeName: (p.vendorId as unknown as { storeName: string; slug: string }).storeName,
            slug: (p.vendorId as unknown as { storeName: string; slug: string }).slug,
          }
        : null,
    }));

    return NextResponse.json({ products: mapped });
  } catch (error: unknown) {
    console.error("GET products error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST create product (authenticated vendor)
export async function POST(req: NextRequest) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { name, description, price, category, condition, sizes, stock, images } = body;

    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    const product = await Product.create({
      name,
      description: description || "",
      price: Number(price),
      category,
      condition: condition || "thrift",
      sizes: sizes || [],
      stock: stock ? Number(stock) : 1,
      images: images || [],
      vendorId: payload.vendorId,
    });

    return NextResponse.json(
      { message: "Product created", product },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST product error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
