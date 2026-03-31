import DashboardLayout from "@/components/vendor/DashboardLayout";
import { getVendorFromRequest } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Vendor from "@/models/Vendor";

export default async function VendorDashboardGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getVendorFromRequest();
  if (!payload) {
    redirect("/vendor");
  }

  await dbConnect();
  const vendor = await Vendor.findById(payload.vendorId).lean();
  
  if (!vendor) {
    redirect("/vendor");
  }

  if (!vendor.onboardingComplete) {
    redirect("/vendor/onboarding");
  }

  if (!vendor.isVerified) {
    return (
      <DashboardLayout>
        <div style={{ padding: "120px 40px", textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <h2>Waiting for Verification</h2>
          <p style={{ marginTop: "16px", color: "var(--gray)", fontSize: "1.1rem" }}>
            Your business profile is under review by our admin team. You will be able to access the dashboard tools once your account is verified.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
