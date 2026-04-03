import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { signToken, TOKEN_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, uid } = await req.json();

    if (!email || !uid) {
      return NextResponse.json(
        { error: "Email and Google UID are required" },
        { status: 400 }
      );
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      // Return 404 to prompt the frontend to ask for storeName
      return NextResponse.json(
        { message: "Vendor not found, please provide store name" },
        { status: 404 }
      );
    }

    // SECURITY TODO: In a production app, you MUST verify the Firebase ID Token 
    // server-side via `firebase-admin` to prevent email impersonation.
    // Currently, this route trusts the uid/email sent by the client.
    
    if (email.length > 255 || uid.length > 128) {
      return NextResponse.json({ error: "Invalid input length" }, { status: 400 });
    }

    const token = signToken({ vendorId: vendor._id.toString(), email: vendor.email });

    const response = NextResponse.json({
      message: "Login successful",
      vendor: { id: vendor._id, storeName: vendor.storeName, slug: vendor.slug },
    });

    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Google login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
