import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";
import { getVendorFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();
    const vendor = await Vendor.findById(payload.vendorId);
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const data = await req.json();

    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      return NextResponse.json({ error: "Phone number must be exactly 10 digits" }, { status: 400 });
    }

    // Update vendor with business details
    vendor.name = data.name;
    vendor.phone = data.phone;
    vendor.warehouseAddress1 = data.warehouseAddress1;
    vendor.warehouseAddress2 = data.warehouseAddress2;
    vendor.primaryAddress = data.primaryAddress;
    vendor.bankName = data.bankName;
    vendor.ifscCode = data.ifscCode;
    vendor.panNumber = data.panNumber;
    vendor.upiId = data.upiId;
    vendor.accountHolderName = data.accountHolderName;
    vendor.instaId = data.instaId;

    // Mark onboarding as complete (but not yet verified)
    vendor.onboardingComplete = true;

    await vendor.save();

    return NextResponse.json({ message: "Onboarding completed successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("Vendor onboarding error:", error);
    return NextResponse.json({ error: "Something went wrong during onboarding" }, { status: 500 });
  }
}
