"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Camera, ImagePlus, X, Package } from "lucide-react";
import Link from "next/link";
import { compressImage } from "@/lib/imageCompressor";
import ImageGalleryManager from "@/components/vendor/ImageGalleryManager";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [shippingPrice, setShippingPrice] = useState("");
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
  const [uploadProgress, setUploadProgress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (res.ok && data.product) {
          const p = data.product;
          setName(p.name || "");
          setDescription(p.description || "");
          setPrice(String(p.price || ""));
          setShippingPrice(String(p.shippingPrice || ""));
          setCategory(p.category || "");
          setCondition(p.condition || "");
          setSizes(p.sizes || []);
          setStock(String(p.stock || ""));
          setImages(p.images || []);
        } else {
          setError("Product not found");
        }
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    setUploadProgress("COMPRESSING...");
    try {
      // Compress all files first (parallel compression)
      const compressedFiles = await Promise.all(
        Array.from(files).map((file) => compressImage(file))
      );

      setUploadProgress(`0 / ${compressedFiles.length}`);
      let completed = 0;

      // Upload all compressed files in parallel with timeout
      const uploadPromises = compressedFiles.map(async (file) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", { method: "POST", body: formData, signal: controller.signal });
          clearTimeout(timeout);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || "Upload failed");
          }
          const data = await res.json();
          completed++;
          setUploadProgress(`${completed} / ${compressedFiles.length}`);
          return data.url;
        } catch (err: any) {
          clearTimeout(timeout);
          if (err.name === "AbortError") {
            throw new Error("Upload timed out. Please try again.");
          }
          throw err;
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
      // Reset file inputs so the same files can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (cameraInputRef.current) cameraInputRef.current.value = "";
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
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          shippingPrice: Number(shippingPrice) || 0,
          category,
          condition,
          sizes,
          stock: Number(stock) || 1,
          images,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update product");
        setSubmitting(false);
        return;
      }

      setShowSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="vd-page-header">
          <h1 className="vd-page-title">Edit Product</h1>
          <p className="vd-page-subtitle">LOADING PRODUCT DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="vd-page-header">
        <h1 className="vd-page-title">Edit Product</h1>
        <p className="vd-page-subtitle">UPDATE YOUR LISTING DETAILS BELOW.</p>
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
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div className="vd-form-group">
            <label className="vd-form-label">Description</label>
            <textarea 
              className="vd-form-textarea" 
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
                value={price} 
                onChange={(e) => setPrice(e.target.value)} 
                required 
              />
            </div>
            <div className="vd-form-group">
              <label className="vd-form-label">Shipping Price (₹)</label>
              <input 
                type="number" 
                className="vd-form-input" 
                placeholder="99"
                min="0"
                value={shippingPrice} 
                onChange={(e) => setShippingPrice(e.target.value)} 
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
                    fontSize: "0.80rem",
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
            <ImageGalleryManager
              images={images}
              onReorder={(reordered) => setImages(reordered)}
              onRemove={(index) => setImages((prev) => prev.filter((_, i) => i !== index))}
            />
            <div className="vd-photo-options">
              <button type="button" className="vd-photo-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? (
                  <>
                    <span className="upload-spinner" />
                    <span style={{ fontWeight: "800" }}>UPLOADING {uploadProgress}<span className="dots-animation" /></span>
                  </>
                ) : (
                  <>
                    <ImagePlus strokeWidth={2.5} />
                    <span style={{ fontWeight: "800" }}>SELECT FILES</span>
                  </>
                )}
              </button>
              <button type="button" className="vd-photo-btn" onClick={() => cameraInputRef.current?.click()} disabled={uploading}>
                <Camera strokeWidth={2.5} />
                <span style={{ fontWeight: "800" }}>TAKE PHOTO</span>
              </button>
              <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: "none" }} onChange={(e) => { handleImageUpload(e.target.files); }} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => { handleImageUpload(e.target.files); }} />
            </div>
          </div>

          <button 
            type="submit" 
            className="vd-add-btn" 
            style={{ width: "100%", marginTop: "24px", padding: "20px", fontSize: "1rem" }} 
            disabled={submitting || uploading}
          >
            {submitting ? "SAVING CHANGES..." : "UPDATE PRODUCT"}
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
            <h2 className="vd-popup-title">UPDATED!</h2>
            <p className="vd-popup-text">Your product details have been saved successfully.</p>
            <div className="vd-popup-actions">
              <Link 
                href="/vendor/products" 
                className="vd-add-btn"
                style={{ width: '100%', textAlign: 'center' }}
              >
                BACK TO PRODUCTS
              </Link>
              <button 
                onClick={() => setShowSuccess(false)}
                className="vd-action-link"
                style={{ marginTop: '12px' }}
              >
                KEEP EDITING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
