const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection;
  const orders = await db.collection('orders').find().sort({_id: -1}).limit(2).toArray();
  console.log(JSON.stringify(orders, null, 2));
  process.exit();
}).catch(console.error);
