"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    warehouseAddress1: "",
    warehouseAddress2: "",
    primaryAddress: "address1",
    bankName: "",
    ifscCode: "",
    panNumber: "",
    upiId: "",
    accountHolderName: "",
    instaId: "",
  });

  useEffect(() => {
    // Check if vendor needs onboarding
    const checkSession = async () => {
      try {
        const res = await fetch("/api/vendors/me");
        const data = await res.json();
        if (res.ok && data.vendor) {
          setOnboardingComplete(data.vendor.onboardingComplete);
          setIsVerified(data.vendor.isVerified);
          if (data.vendor.isVerified) {
            router.push("/vendor/dashboard");
          }
        } else {
          router.push("/vendor");
        }
      } catch (err) {
        console.error("Session check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/vendors/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setOnboardingComplete(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to submit onboarding data");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "200px 40px", textAlign: "center" }}>Loading...</div>
      </>
    );
  }

  if (onboardingComplete && !isVerified) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: "600px", margin: "160px auto", padding: "40px", textAlign: "center", border: "var(--border)", boxShadow: "var(--shadow)" }}>
          <h1 style={{ marginBottom: "16px", fontFamily: "var(--font-display)" }}>Waiting for Verification</h1>
          <p style={{ color: "var(--gray)", marginBottom: "32px", fontSize: "1.1rem" }}>
            Your business details have been submitted successfully. Our team is currently reviewing your application. You will be able to access your dashboard once you are verified.
          </p>
          <Link href="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: "800px", margin: "120px auto 80px", padding: "40px", border: "var(--border)", boxShadow: "var(--shadow)", background: "var(--white)" }}>
        <h1 style={{ marginBottom: "8px", fontFamily: "var(--font-display)", fontSize: "2rem" }}>Complete Your Profile</h1>
        <p style={{ color: "var(--gray)", marginBottom: "32px" }}>Please provide your business and bank details to start selling.</p>

        {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", border: "2px solid #b91c1c", marginBottom: "24px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <div style={{ padding: "24px", border: "var(--border)", background: "var(--off-white)" }}>
            <h3 style={{ marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>Personal & Store Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input name="name" placeholder="Full Name *" value={formData.name} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="phone" placeholder="Phone Number *" value={formData.phone} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="instaId" placeholder="Instagram ID for your store (Optional)" value={formData.instaId} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
            </div>
          </div>

          <div style={{ padding: "24px", border: "var(--border)", background: "var(--off-white)" }}>
            <h3 style={{ marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>Warehouse Location</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input name="warehouseAddress1" placeholder="Warehouse Address 1 *" value={formData.warehouseAddress1} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="warehouseAddress2" placeholder="Warehouse Address 2" value={formData.warehouseAddress2} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>Primary Address for Delivery Partners:</label>
                <select name="primaryAddress" value={formData.primaryAddress} onChange={handleChange} style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none", background: "white", cursor: "pointer" }}>
                  <option value="address1">Warehouse Address 1</option>
                  <option value="address2">Warehouse Address 2</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ padding: "24px", border: "var(--border)", background: "var(--off-white)" }}>
            <h3 style={{ marginBottom: "20px", textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.9rem" }}>Bank Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input name="accountHolderName" placeholder="Account Holder Name *" value={formData.accountHolderName} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="bankName" placeholder="Bank Name *" value={formData.bankName} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="ifscCode" placeholder="IFSC Code *" value={formData.ifscCode} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="panNumber" placeholder="PAN Number *" value={formData.panNumber} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
              <input name="upiId" placeholder="UPI ID *" value={formData.upiId} onChange={handleChange} required style={{ width: "100%", padding: "12px", border: "var(--border-thin)", outline: "none" }} />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary" style={{ width: "100%", marginTop: "16px" }}>
            {submitting ? "Submitting..." : "Submit for Verification"}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
