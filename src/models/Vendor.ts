import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVendor extends Document {
  storeName: string;
  email: string;
  password: string;
  phone: string;
  slug: string;
  
  // Onboarding fields
  name?: string;
  warehouseAddress1?: string;
  warehouseAddress2?: string;
  primaryAddress?: string;
  bankName?: string;
  ifscCode?: string;
  panNumber?: string;
  upiId?: string;
  accountHolderName?: string;
  instaId?: string;
  
  // State flags
  isVerified: boolean;
  onboardingComplete: boolean;
  
  createdAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    storeName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, lowercase: true },
    
    // Onboarding fields
    name: { type: String },
    warehouseAddress1: { type: String },
    warehouseAddress2: { type: String },
    primaryAddress: { type: String, enum: ["address1", "address2"] },
    bankName: { type: String },
    ifscCode: { type: String },
    panNumber: { type: String },
    upiId: { type: String },
    accountHolderName: { type: String },
    instaId: { type: String },
    
    // State flags
    isVerified: { type: Boolean, default: false },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Prevent model recompilation in dev (hot reload)
const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>("Vendor", VendorSchema);

export default Vendor;
