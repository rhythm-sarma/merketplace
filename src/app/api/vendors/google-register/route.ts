import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { signToken, TOKEN_NAME } from "@/lib/auth";
import { sendMail } from "@/lib/mailer";
import { vendorWelcomeEmail } from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, name, storeName, phone, uid } = await req.json();

    if (!storeName || !email || !uid) {
      return NextResponse.json(
        { error: "Store name, email, and Google UID are required" },
        { status: 400 }
      );
    }

    if (phone && !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 });
    }

    // Check if vendor already exists to prevent duplicate creation
    const existing = await Vendor.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create URL-friendly slug from store name
    const slug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const slugExists = await Vendor.findOne({ slug });
    if (slugExists) {
      return NextResponse.json(
        { error: "A store with a similar name already exists. Please choose a different name." },
        { status: 409 }
      );
    }

    // Generate a strong random password for Google Auth users to satisfy DB schema
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const vendor = await Vendor.create({
      storeName,
      name: name || "",
      email,
      password: hashedPassword,
      phone: phone || "",
      slug,
      isVerified: false,
      onboardingComplete: false,
    });

    const token = signToken({ vendorId: vendor._id.toString(), email: vendor.email });

    const response = NextResponse.json(
      { message: "Account created successfully", vendor: { id: vendor._id, storeName: vendor.storeName, slug: vendor.slug } },
      { status: 201 }
    );

    response.cookies.set(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // Send welcome email (fire-and-forget)
    const welcomeEmail = vendorWelcomeEmail(storeName, email);
    sendMail(email, welcomeEmail.subject, welcomeEmail.html, welcomeEmail.text).catch(() => {});

    return response;
  } catch (error: unknown) {
    console.error("Google register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
