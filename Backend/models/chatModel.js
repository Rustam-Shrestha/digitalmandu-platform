const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: String,
    lastMessageTime: Date,
    lastMessageBy: mongoose.Schema.Types.ObjectId,
    unreadBySeller: { type: Number, default: 0 },
    unreadByBuyer: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

chatSchema.index({ seller: 1, buyer: 1 }, { unique: false });

module.exports = mongoose.model('Chat', chatSchema);
