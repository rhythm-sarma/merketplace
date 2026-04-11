import { NextRequest, NextResponse } from "next/server";
import { getVendorFromRequest } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import sharp from "sharp";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB — vendors can upload large phone photos
const COMPRESS_THRESHOLD = 4 * 1024 * 1024; // 4MB — compress anything above this server-side
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Compress an image buffer server-side using sharp.
 * Progressively reduces quality until the output is under the target size.
 */
async function compressServerSide(
  inputBuffer: Buffer,
  targetBytes = 4 * 1024 * 1024
): Promise<{ buffer: Buffer; mimeType: string }> {
  const qualities = [80, 65, 50, 40];

  for (const quality of qualities) {
    const compressed = await sharp(inputBuffer)
      .resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();

    if (compressed.length <= targetBytes) {
      return { buffer: compressed, mimeType: "image/webp" };
    }
  }

  // Last resort: aggressive compression
  const final = await sharp(inputBuffer)
    .resize({ width: 1200, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 30 })
    .toBuffer();

  return { buffer: final, mimeType: "image/webp" };
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getVendorFromRequest();
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (15MB limit)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 15MB." },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer = Buffer.from(bytes);
    let mimeType = file.type;

    // Server-side compression for large files
    if (buffer.length > COMPRESS_THRESHOLD) {
      console.log(
        `Compressing image: ${(buffer.length / 1024 / 1024).toFixed(1)}MB → target <4MB`
      );
      const compressed = await compressServerSide(buffer);
      console.log(
        `Compressed: ${(compressed.buffer.length / 1024 / 1024).toFixed(1)}MB`
      );
      buffer = Buffer.from(compressed.buffer);
      mimeType = compressed.mimeType;
    }

    // Convert to base64 data URI for Cloudinary upload
    const base64 = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "marketplace/products",
      resource_type: "image",
      transformation: [
        { width: 1200, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Allow up to 16MB request bodies for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
