import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const vendors = await db.collection('vendors').find({}).toArray();
  console.log("All Vendors:", JSON.stringify(vendors, null, 2));
  process.exit(0);
}

check().catch(console.error);
