"use client";

import { useState, useEffect } from "react";
import { User, Phone, Instagram, MapPin, Landmark, Trash2, LogOut, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VendorSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    instaId: "",
    bankName: "",
    accountHolderName: "",
    ifscCode: "",
    upiId: "",
    panNumber: "",
    warehouseAddress1: "",
    warehouseAddress2: "",
    primaryAddress: "address1"
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/vendors/me");
      const data = await res.json();
      if (res.ok && data.vendor) {
        setFormData({
          name: data.vendor.name || "",
          phone: data.vendor.phone || "",
          instaId: data.vendor.instaId || "",
          bankName: data.vendor.bankName || "",
          accountHolderName: data.vendor.accountHolderName || "",
          ifscCode: data.vendor.ifscCode || "",
          upiId: data.vendor.upiId || "",
          panNumber: data.vendor.panNumber || "",
          warehouseAddress1: data.vendor.warehouseAddress1 || "",
          warehouseAddress2: data.vendor.warehouseAddress2 || "",
          primaryAddress: data.vendor.primaryAddress || "address1"
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/vendors/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Profile updated successfully!");
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      await fetch("/api/vendors/me", { method: "DELETE" });
      router.push("/vendor");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("CAUTION: This will permanently delete your store, all products, and everything associated with your account. This cannot be undone.\n\nAre you absolutely sure?")) return;
    try {
      const res = await fetch("/api/vendors/settings", { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        alert("Account deleted successfully.");
        router.push("/vendor");
      } else {
        alert(data.error || "Failed to delete account");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  if (loading) {
    return (
      <div className="vd-page-header">
        <h1 className="vd-page-title">Settings</h1>
        <p className="vd-page-subtitle">LOADING PROFILE DATA...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="vd-page-header">
        <h1 className="vd-page-title">STORE SETTINGS</h1>
        <p className="vd-page-subtitle">Manage your business profile and account preferences.</p>
      </div>

      <div className="vd-form-card">
        {error && <div className="vd-alert-error">ERROR: {error}</div>}
        {success && <div className="vd-alert-success">{success}</div>}

        <form onSubmit={handleUpdate}>
          {/* Section: Basic Info */}
          <div className="vd-settings-section">
            <h3 className="vd-settings-section-title"><User size={18} /> BASIC INFORMATION</h3>
            <div className="vd-form-row">
              <div className="vd-form-group">
                <label className="vd-form-label">Full Name</label>
                <input type="text" name="name" className="vd-form-input" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="vd-form-group">
                <label className="vd-form-label">Phone Number</label>
                <input type="text" name="phone" className="vd-form-input" value={formData.phone} onChange={handleInputChange} />
              </div>
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Instagram Handle</label>
              <input type="text" name="instaId" className="vd-form-input" placeholder="@yourstore" value={formData.instaId} onChange={handleInputChange} />
            </div>
          </div>

          {/* Section: Warehouse & Shipping */}
          <div className="vd-settings-section">
            <h3 className="vd-settings-section-title"><MapPin size={18} /> ADDRESS & SHIPPING</h3>
            <div className="vd-form-group">
              <label className="vd-form-label">Warehouse Address 1</label>
              <input type="text" name="warehouseAddress1" className="vd-form-input" value={formData.warehouseAddress1} onChange={handleInputChange} />
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Warehouse Address 2 (Optional)</label>
              <input type="text" name="warehouseAddress2" className="vd-form-input" value={formData.warehouseAddress2} onChange={handleInputChange} />
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Primary Address for Couriers</label>
              <select name="primaryAddress" className="vd-form-select" value={formData.primaryAddress} onChange={handleInputChange}>
                <option value="address1">Address 1</option>
                <option value="address2" disabled={!formData.warehouseAddress2}>Address 2</option>
              </select>
            </div>
          </div>

          {/* Section: Payout Details */}
          <div className="vd-settings-section">
            <h3 className="vd-settings-section-title"><Landmark size={18} /> BANK & PAYOUT DETAILS</h3>
            <div className="vd-form-row">
              <div className="vd-form-group">
                <label className="vd-form-label">Bank Name</label>
                <input type="text" name="bankName" className="vd-form-input" value={formData.bankName} onChange={handleInputChange} />
              </div>
              <div className="vd-form-group">
                <label className="vd-form-label">Account Holder Name</label>
                <input type="text" name="accountHolderName" className="vd-form-input" value={formData.accountHolderName} onChange={handleInputChange} />
              </div>
            </div>
            <div className="vd-form-row">
              <div className="vd-form-group">
                <label className="vd-form-label">IFSC Code</label>
                <input type="text" name="ifscCode" className="vd-form-input" value={formData.ifscCode} onChange={handleInputChange} />
              </div>
              <div className="vd-form-group">
                <label className="vd-form-label">UPI ID</label>
                <input type="text" name="upiId" className="vd-form-input" value={formData.upiId} onChange={handleInputChange} />
              </div>
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">PAN Number</label>
              <input type="text" name="panNumber" className="vd-form-input" value={formData.panNumber} onChange={handleInputChange} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
            <button type="submit" className="vd-add-btn" style={{ flex: 1, padding: "16px" }} disabled={saving}>
              <Save size={20} /> {saving ? "SAVING..." : "SAVE SETTINGS"}
            </button>
            <button type="button" onClick={handleLogout} className="vd-photo-btn" style={{ width: "auto", padding: "0 24px" }}>
              <LogOut size={20} /> LOGOUT
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div style={{ marginTop: "80px", borderTop: "4px solid #000", paddingTop: "40px" }}>
          <div style={{ background: "#ffebeb", border: "2px solid #000", padding: "24px" }}>
            <h3 style={{ margin: "0 0 8px", fontWeight: "900", fontSize: "1.2rem" }}>DANGER ZONE</h3>
            <p style={{ margin: "0 0 20px", fontWeight: "600", color: "#555" }}>
              Permanently delete your account, products, and close your store. Active orders must be cancelled and all order history must be cleared first.
            </p>
            <button onClick={handleDeleteAccount} className="vd-delete-btn-full">
              <Trash2 size={20} /> DELETE ACCOUNT PERMANENTLY
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vd-settings-section {
          margin-bottom: 40px;
          padding-bottom: 40px;
          border-bottom: 2px solid #eee;
        }
        .vd-settings-section:last-of-type {
          border-bottom: none;
        }
        .vd-settings-section-title {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 0.9rem;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
        }
        .vd-alert-error {
          background: #ffebeb;
          border: 2px solid #000;
          padding: 16px;
          margin-bottom: 32px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .vd-alert-success {
          background: #e6fffa;
          border: 2px solid #000;
          padding: 16px;
          margin-bottom: 32px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: #276749;
        }
        .vd-delete-btn-full {
          background: #ff4d4d;
          color: #fff;
          border: 2px solid #000;
          padding: 16px 24px;
          font-weight: 900;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.1s ease;
          box-shadow: 4px 4px 0 0 #000;
        }
        .vd-delete-btn-full:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0 0 #000;
        }
        .vd-delete-btn-full:active {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
