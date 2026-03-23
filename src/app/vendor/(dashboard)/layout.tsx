import DashboardLayout from "@/components/vendor/DashboardLayout";

export default function VendorDashboardGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
