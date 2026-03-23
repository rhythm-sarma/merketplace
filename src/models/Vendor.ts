import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVendor extends Document {
  storeName: string;
  email: string;
  password: string;
  phone: string;
  slug: string;
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    storeName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

// Prevent model recompilation in dev (hot reload)
const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);

export default Vendor;
