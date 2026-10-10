const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: Date,
    attachment: {
        type: String,
        url: String
    },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
