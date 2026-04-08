import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { signToken, TOKEN_NAME } from "@/lib/auth";
import { sendMailAsync } from "@/lib/mailer";
import { vendorLoginEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
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

    // Send login notification (fire-and-forget — doesn't delay login response)
    const loginEmail = vendorLoginEmail(vendor.storeName);
    sendMailAsync(email, loginEmail.subject, loginEmail.html, loginEmail.text);

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
