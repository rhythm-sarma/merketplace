import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Optionally connect to DB to keep the connection warm
    await dbConnect();
    
    // Check if the connection is really completely established
    const isDbConnected = mongoose.connection.readyState === 1;

    return NextResponse.json({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      dbConnected: isDbConnected
    }, { status: 200 });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({
      status: "error",
      message: "Health check failed"
    }, { status: 500 });
  }
}
