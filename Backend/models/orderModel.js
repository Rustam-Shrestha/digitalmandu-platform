const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // seller denormalized for quick seller order queries (optional additive)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [{
        quantity: {
            type: Number,
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId, ref: "Product",
            required: true
        },
    }],
        totalAmount: {
            type: Number,
            required: true
        },
        shippingAddress: {
            type: String,
            required: true
        },
        orderStatus: {
            type: String,
            enum: ["pending", "delivered", "cancelled", "ontheway", "preparation"],
            default: "pending"
        },
        trackingNumber: String,
        estimatedDelivery: Date,
        invoice: {
            invoiceNumber: String,
            invoiceDate: Date,
            invoicePDF: String,
            receipt: String
        },
        orderNotes: String,
        customerNotes: String,
        refund: {
            requested: { type: Boolean, default: false },
            reason: String,
            status: { type: String, enum: ['none', 'requested', 'approved', 'rejected', 'completed'], default: 'none' },
            amount: Number,
            requestedAt: Date,
            approvedAt: Date,
            refundedAt: Date
        },
        paymentDetails: {
            //payment id if paid
            pidx:{
                type:String
            },
            method: {
                type: String,
                enum: ['COD', 'cod', "khalti"],
                lowercase: true
            },
            status: {
                type: String,
                enum: ["paid", "unpaid", "pending"],
                default:"pending"
            }
        }
}, {
    timestamps: true
});





const Order = mongoose.model("Order", orderSchema);
module.exports = Order