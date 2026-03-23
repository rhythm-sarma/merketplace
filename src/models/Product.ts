import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
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
    price: { type: Number, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true, default: "thrift" },
    sizes: { type: [String], default: [] },
    stock: { type: Number, default: 1 },
    images: { type: [String], default: [] },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
