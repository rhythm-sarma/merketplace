"use client";

import { useState, useRef } from "react";
import { Camera, ImagePlus, X, Package } from "lucide-react";
import Link from "next/link";


export default function AddProductPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);

  const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
  const toggleSize = (size: string) => {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };
  const [stock, setStock] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Upload failed");
        }

        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          category,
          condition,
          sizes,
          stock: Number(stock) || 1,
          images,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to add product");
        setSubmitting(false);
        return;
      }

      setShowSuccess(true);
      // Reset form
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setCondition("");
      setSizes([]);
      setStock("");
      setImages([]);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="vd-page-header">
        <h1 className="vd-page-title">List New Product</h1>
        <p className="vd-page-subtitle">Add a high-quality product to your collection.</p>
      </div>

      <div className="vd-form-card">
        {error && (
          <div style={{
            background: "#ffebeb",
            border: "2px solid #000",
            padding: "16px",
            marginBottom: "32px",
            fontWeight: "700",
            fontSize: "0.85rem",
            textTransform: "uppercase"
          }}>
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="vd-form-group">
            <label className="vd-form-label">Product Name</label>
            <input
              type="text"
              className="vd-form-input"
              placeholder="e.g. VINTAGE OVERSIZED BLAZER"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="vd-form-group">
            <label className="vd-form-label">Description</label>
            <textarea
              className="vd-form-textarea"
              placeholder="Tell us about the fabric, fit, and any minor flaws..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="vd-form-row">
            <div className="vd-form-group">
              <label className="vd-form-label">Price (₹)</label>
              <input
                type="number"
                className="vd-form-input"
                placeholder="2499"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Category</label>
              <select
                className="vd-form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">SELECT CATEGORY</option>
                <option value="Mens">MENS</option>
                <option value="Womens">WOMENS</option>
                <option value="Unisex">UNISEX</option>
                <option value="Accessories">ACCESSORIES</option>
              </select>
            </div>
          </div>

          <div className="vd-form-row">
            <div className="vd-form-group">
              <label className="vd-form-label">Condition</label>
              <select
                className="vd-form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="">SELECT CONDITION</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`${n}/10`}>{n}/10 CONDITION</option>
                ))}
              </select>
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Stock Quantity</label>
              <input
                type="number"
                className="vd-form-input"
                placeholder="1"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="vd-form-group">
            <label className="vd-form-label">Available Sizes</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  style={{
                    padding: "10px 20px",
                    border: "3px solid #000",
                    background: sizes.includes(size) ? "#FFD60A" : "#fff",
                    color: "#000",
                    fontSize: "0.8rem",
                    fontWeight: "800",
                    cursor: "pointer",
                    boxShadow: sizes.includes(size) ? "none" : "3px 3px 0 0 #000",
                    transform: sizes.includes(size) ? "translate(2px, 2px)" : "none",
                    transition: "all 0.1s ease",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="vd-form-group">
            <label className="vd-form-label">Product Photos</label>

            {images.length > 0 && (
              <div style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}>
                {images.map((url, i) => (
                  <div key={i} style={{
                    position: "relative",
                    width: "120px",
                    height: "120px",
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0 0 #000",
                  }}>
                    <img
                      src={url}
                      alt={`Product ${i + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        background: "#FFD60A",
                        border: "2px solid #000",
                        width: "24px",
                        height: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="vd-photo-options">
              <button
                type="button"
                className="vd-photo-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <ImagePlus strokeWidth={2.5} />
                <span style={{ fontWeight: "800" }}>{uploading ? "UPLOADING..." : "SELECT FILES"}</span>
              </button>
              <button
                type="button"
                className="vd-photo-btn"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera strokeWidth={2.5} />
                <span style={{ fontWeight: "800" }}>TAKE PHOTO</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e.target.files)}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: "none" }}
                onChange={(e) => handleImageUpload(e.target.files)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="vd-add-btn"
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "20px",
              fontSize: "1rem",
            }}
            disabled={submitting || uploading}
          >
            {submitting ? "UPLOADING..." : "PUBLISH PRODUCT"}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="vd-popup-overlay" onClick={() => setShowSuccess(false)}>
          <div className="vd-popup" onClick={(e) => e.stopPropagation()}>
            <button 
              className="vd-popup-close"
              onClick={() => setShowSuccess(false)}
              aria-label="Close"
            >
              <X size={18} strokeWidth={3} />
            </button>
            <div className="vd-popup-icon" style={{ background: "#FFD60A" }}>
              <Package size={40} strokeWidth={3} />
            </div>
            <h2 className="vd-popup-title">BOOM! UPLOADED.</h2>
            <p className="vd-popup-text">Your product is now live on the marketplace. Ready for another one?</p>
            <div className="vd-popup-actions">
              <button 
                onClick={() => setShowSuccess(false)}
                className="vd-add-btn"
                style={{ width: '100%' }}
              >
                ADD ANOTHER
              </button>
              <Link href="/vendor/products" className="vd-action-link" style={{ textAlign: 'center', marginTop: '12px' }}>
                VIEW ALL PRODUCTS
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
