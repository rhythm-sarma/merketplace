"use client";

import { useState, useRef } from "react";
import { Camera, ImagePlus, X } from "lucide-react";

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
  const [message, setMessage] = useState("");
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
          throw new Error("Upload failed");
        }

        const data = await res.json();
        uploadedUrls.push(data.url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch {
      setError("Failed to upload image. Please try again.");
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
    setMessage("");
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

      setMessage("Product added successfully!");
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
        <h1 className="vd-page-title">Add New Product</h1>
        <p className="vd-page-subtitle">Fill in the details to list a new product in your store.</p>
      </div>

      <div className="vd-form-card">
        {message && (
          <p style={{
            color: "#27ae60",
            fontSize: "0.85rem",
            textAlign: "center",
            marginBottom: "20px",
            padding: "12px",
            background: "#eafaf1",
            border: "1px solid #d5f5e3",
          }}>
            {message}
          </p>
        )}

        {error && (
          <p style={{
            color: "#e74c3c",
            fontSize: "0.85rem",
            textAlign: "center",
            marginBottom: "20px",
            padding: "12px",
            background: "#fdf0ef",
            border: "1px solid #fce4e4",
          }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="vd-form-group">
            <label className="vd-form-label">Product Name</label>
            <input
              type="text"
              className="vd-form-input"
              placeholder="e.g. Vintage Leather Jacket"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="vd-form-group">
            <label className="vd-form-label">Description</label>
            <textarea
              className="vd-form-textarea"
              placeholder="Describe the product, its condition, and notable features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Price + Category */}
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
                <option value="">Select category</option>
                <option value="Mens">Mens</option>
                <option value="Womens">Womens</option>
                <option value="Unisex">Unisex</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>
          </div>

          {/* Condition + Stock */}
          <div className="vd-form-row">
            <div className="vd-form-group">
              <label className="vd-form-label">Condition</label>
              <select
                className="vd-form-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
              >
                <option value="">Select condition</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={`${n}/10`}>{n}/10</option>
                ))}
              </select>
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Stock Quantity</label>
              <input
                type="number"
                className="vd-form-input"
                placeholder="10"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          {/* Available Sizes */}
          <div className="vd-form-group">
            <label className="vd-form-label">Available Sizes</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "20px",
                    border: sizes.includes(size) ? "1.5px solid #111" : "1.5px solid #ddd",
                    background: sizes.includes(size) ? "#111" : "#fff",
                    color: sizes.includes(size) ? "#fff" : "#333",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Product Images */}
          <div className="vd-form-group">
            <label className="vd-form-label">Product Photos</label>

            {/* Image Previews */}
            {images.length > 0 && (
              <div style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "16px",
              }}>
                {images.map((url, i) => (
                  <div key={i} style={{
                    position: "relative",
                    width: "100px",
                    height: "100px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e8e8e8",
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
                        top: "4px",
                        right: "4px",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <X size={12} />
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
                <ImagePlus />
                <span>{uploading ? "Uploading..." : "Choose Photo"}</span>
                <span className="vd-photo-hint">Browse from files</span>
              </button>
              <button
                type="button"
                className="vd-photo-btn"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera />
                <span>Click Photo</span>
                <span className="vd-photo-hint">Use device camera</span>
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

          {/* Submit */}
          <button
            type="submit"
            className="vd-add-btn"
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "16px",
              opacity: submitting ? 0.6 : 1,
            }}
            disabled={submitting || uploading}
          >
            {submitting ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
