const mongoose = require('mongoose');
// having schema so i can nest an schema inside schema which is nexting the reviews inside products
const { reviewSchema } = require('./nextWayReviewModel');
// const { userSchema } = require('./nextWayUserModel');
// Define the product schema with database fields as phone, name, and email
const productSchema = new mongoose.Schema({
    productName: { type: String, required: [true, "product name is required"] },
    productDescription: { type: String, required: [true, "product description is required"] },
    productStock: { type: Number, required: [true, "product stock is required"] },
    productPrice: { type: Number, required: [true, "product price is required"] },
    productStatus: { type: String, enum: ['draft', 'public'], required: [true, "draft is required"], default: "public" },
    productImage: { type: String,required: [true, "image is required"], default: "drafthttps://artists.spotify.com/songwriter/3IMp1zKhmOEmva4eNPGZKf" },
    // SELLER ref - optional to keep seeded data intact (backfilled via migration)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // APPROVAL - auto-approve by default (police later)
    approvalStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'approved' },
    rejectionReason: String,
    approvedBy: mongoose.Schema.Types.ObjectId,
    approvedAt: Date,
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    category: String,
    tags: [String],
    isActive: { type: Boolean, default: true },
    reviews:[reviewSchema]
},{
    // enabling mongodb to use new data called timespants
    timestamps:true,
});
// create model named product which is in side param assigns it the model we created above
// and assigns it to product variable
const Product = mongoose.model('Product', productSchema);

// Export the product model
module.exports = Product;