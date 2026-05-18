import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  shippingPrice: number;
  category: string;
  condition: string;
  sizes: string[];
  stock: number;
  images: string[];
  vendorId: Types.ObjectId;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: [1, "Price must be at least ₹1"] },
    shippingPrice: { type: Number, default: 0, min: [0, "Shipping price cannot be negative"] },
    category: { type: String, required: true },
    condition: { type: String, required: true, default: "thrift" },
    sizes: { type: [String], default: [] },
    stock: { type: Number, default: 1, min: [0, "Stock cannot be negative"] },
    images: { type: [String], default: [] },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
