"use client";

import { useState, useEffect } from "react";
import StatCard from "@/components/vendor/StatCard";
import { Package, ShoppingCart, IndianRupee, Truck } from "lucide-react";

export default function VendorDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    storeName: "",
    revenue: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, meRes, statsRes] = await Promise.all([
          fetch("/api/products?mine=true"),
          fetch("/api/vendors/me"),
          fetch("/api/vendors/stats"),
        ]);

        const productsData = await productsRes.json();
        const meData = await meRes.json();
        const vendorStats = await statsRes.json();

        const products = productsData.products || [];
        const totalStock = products.reduce((sum: number, p: { stock: number }) => sum + p.stock, 0);

        setStats({
          totalProducts: products.length,
          totalStock,
          storeName: meData.vendor?.storeName || "Your Store",
          revenue: vendorStats.totalRevenue || 0,
          totalOrders: vendorStats.totalOrders || 0,
          pendingOrders: vendorStats.pendingOrders || 0
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <div className="vd-page-header">
        <h1 className="vd-page-title">
          {loading ? "Overview" : `Welcome, ${stats.storeName}`}
        </h1>
        <p className="vd-page-subtitle">Here&apos;s what&apos;s happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="vd-stats-grid">
        <StatCard
          title="Revenue"
          value={loading ? "..." : `₹${stats.revenue.toLocaleString()}`}
          trend="Lifetime"
          trendUp={true}
          icon={IndianRupee}
        />
        <StatCard
          title="Total Orders"
          value={loading ? "..." : String(stats.totalOrders)}
          trend={`${stats.pendingOrders} pending`}
          trendUp={true}
          icon={Truck}
        />
        <StatCard
          title="Total Products"
          value={loading ? "..." : String(stats.totalProducts)}
          trend="Active"
          trendUp={true}
          icon={Package}
        />
        <StatCard
          title="Total Stock"
          value={loading ? "..." : String(stats.totalStock)}
          trend="Units"
          trendUp={true}
          icon={ShoppingCart}
        />
      </div>

      {/* Getting Started Prompt */}
      {!loading && stats.totalProducts === 0 && (
        <div className="vd-table-card" style={{ textAlign: "center", padding: "48px 24px", marginTop: "40px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "8px" }}>
            Start building your store
          </h2>
          <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "24px" }}>
            Add your first product to get started selling on 20RACKS.
          </p>
          <a href="/vendor/products/new" className="vd-add-btn">
            + Add Your First Product
          </a>
        </div>
      )}
    </div>
  );
}
