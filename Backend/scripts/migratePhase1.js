require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Product = require('../models/productModel');

async function run() {
  const uri = process.env.MONGO_URI || process.env.Mongo_URI;
  await mongoose.connect(uri);
  console.log('connected');
  const admin = await User.findOne({ role: { $in: ['admin','seller'] } }) || await User.findOne({});
  if (!admin) console.log('no user found for seller backfill');

  const r1 = await Product.updateMany({ seller: { $exists: false } }, { $set: { seller: admin?._id, approvalStatus: 'approved', approvedAt: new Date() } });
  console.log('backfill seller products (missing field):', r1.modifiedCount);
  const r2 = await Product.updateMany({ seller: null }, { $set: { seller: admin?._id, approvalStatus: 'approved' } });
  console.log('backfill seller null:', r2.modifiedCount);
  const r3 = await Product.updateMany({ approvalStatus: { $exists: false } }, { $set: { approvalStatus: 'approved', soldCount: 0, viewCount: 0, isActive: true } });
  console.log('backfill approval/soldCount:', r3.modifiedCount);
  const r4 = await Product.updateMany({ soldCount: { $exists: false } }, { $set: { soldCount: 0 } });
  console.log('soldCount:', r4.modifiedCount);
  await mongoose.disconnect();
  console.log('done');
}
run().catch(e=>{console.error(e); process.exit(1)});
