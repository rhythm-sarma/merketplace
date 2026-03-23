const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

async function clearDummyProducts() {
  await mongoose.connect(process.env.MONGODB_URI);
  const res = await mongoose.connection.collection("products").deleteMany({ name: "new test" });
  console.log("Deleted", res.deletedCount, "dummy products named 'new test'");
  process.exit(0);
}
clearDummyProducts().catch(console.error);
