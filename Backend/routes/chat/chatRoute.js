const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middlewares/isAuthenticated');
const Chat = require('../../models/chatModel');
const ChatMessage = require('../../models/chatMessageModel');
const User = require('../../models/userModel');

// GET /api/chat - List chats for current user (or all chats if admin)
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin 
      ? {} 
      : { $or: [{ seller: req.user._id }, { buyer: req.user._id }] };

    const chats = await Chat.find(query)
      .populate('seller', 'name email role sellerProfile')
      .populate('buyer', 'name email role')
      .populate('order', 'orderItems totalAmount status')
      .sort({ updatedAt: -1, lastMessageTime: -1 });

    res.json({ data: chats });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chats', error: err.message });
  }
});

// GET /api/chat/contacts - List potential contacts to start new chat
router.get('/contacts', isAuthenticated, async (req, res) => {
  try {
    let contacts = [];
    if (req.user.role === 'admin') {
      contacts = await User.find({ _id: { $ne: req.user._id } }, 'name email role sellerProfile');
    } else if (req.user.role === 'seller') {
      contacts = await User.find({ _id: { $ne: req.user._id }, role: { $in: ['customer', 'admin'] } }, 'name email role sellerProfile');
    } else {
      // Customer/Buyer: get all sellers and admins
      contacts = await User.find({ _id: { $ne: req.user._id }, role: { $in: ['seller', 'admin'] } }, 'name email role sellerProfile');
    }
    res.json({ data: contacts });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching contacts', error: err.message });
  }
});

// GET /api/chat/:chatId - Fetch chat details and messages
router.get('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('seller', 'name email role sellerProfile')
      .populate('buyer', 'name email role')
      .populate('order', 'orderItems totalAmount status');

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = req.user.role === 'admin' ||
      chat.seller._id.toString() === req.user._id.toString() ||
      chat.buyer._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await ChatMessage.find({ chat: req.params.chatId })
      .populate('sender', 'name email role')
      .sort({ createdAt: 1 });

    res.json({ data: { chat, messages }, chat, messages });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching chat', error: err.message });
  }
});

// POST /api/chat/or-create - Get existing chat or create a new one
router.post('/or-create', isAuthenticated, async (req, res) => {
  try {
    const targetId = req.body.otherId || req.body.otherUserId || req.body.targetUserId;
    const { orderId } = req.body;

    if (!targetId) return res.status(400).json({ message: 'Target user ID is required' });

    const targetUser = await User.findById(targetId);
    if (!targetUser) return res.status(404).json({ message: 'Target user not found' });

    // Look for existing chat between these two users
    let chat = await Chat.findOne({
      $or: [
        { seller: req.user._id, buyer: targetId },
        { seller: targetId, buyer: req.user._id }
      ]
    }).populate('seller', 'name email role sellerProfile').populate('buyer', 'name email role');

    if (!chat) {
      // Determine seller and buyer roles
      let sellerId, buyerId;
      if (req.user.role === 'seller') {
        sellerId = req.user._id;
        buyerId = targetId;
      } else if (targetUser.role === 'seller') {
        sellerId = targetId;
        buyerId = req.user._id;
      } else {
        // Fallback for customer-admin or user-user
        sellerId = req.user._id;
        buyerId = targetId;
      }

      chat = await Chat.create({
        seller: sellerId,
        buyer: buyerId,
        order: orderId || undefined
      });

      chat = await Chat.findById(chat._id)
        .populate('seller', 'name email role sellerProfile')
        .populate('buyer', 'name email role');
    }

    res.json({ data: chat });
  } catch (err) {
    res.status(400).json({ message: 'Error creating chat', error: err.message });
  }
});

// Helper for sending messages
const handleSendMessage = async (req, res) => {
  try {
    const textContent = req.body.message || req.body.text;
    if (!textContent || !textContent.trim()) {
      return res.status(400).json({ message: 'Message content required' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const isParticipant = req.user.role === 'admin' ||
      chat.seller.toString() === req.user._id.toString() ||
      chat.buyer.toString() === req.user._id.toString();

    if (!isParticipant) return res.status(403).json({ message: 'Not a participant' });

    const msg = await ChatMessage.create({
      chat: req.params.chatId,
      sender: req.user._id,
      message: textContent.trim()
    });

    const isSeller = chat.seller.toString() === req.user._id.toString();
    const updatedChat = await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: textContent.trim(),
      lastMessageTime: new Date(),
      lastMessageBy: req.user._id,
      $inc: isSeller ? { unreadByBuyer: 1 } : { unreadBySeller: 1 }
    }, { new: true });

    const populatedMsg = await ChatMessage.findById(msg._id).populate('sender', 'name email role');

    // Socket.IO real-time emission
    if (req.io) {
      req.io.to(`chat_${req.params.chatId}`).emit('receive_message', populatedMsg);
      const recipientId = isSeller ? chat.buyer.toString() : chat.seller.toString();
      req.io.to(`user_${recipientId}`).emit('new_message_notification', {
        chatId: req.params.chatId,
        message: populatedMsg
      });
    }

    res.status(201).json({ data: populatedMsg });
  } catch (err) {
    res.status(400).json({ message: 'Error sending message', error: err.message });
  }
};

router.post('/:chatId/message', isAuthenticated, handleSendMessage);
router.post('/:chatId/messages', isAuthenticated, handleSendMessage);

// Mark read helper
const handleMarkRead = async (req, res) => {
  try {
    await ChatMessage.updateMany(
      { chat: req.params.chatId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    const chat = await Chat.findById(req.params.chatId);
    if (chat) {
      const isSeller = chat.seller.toString() === req.user._id.toString();
      await Chat.findByIdAndUpdate(req.params.chatId, isSeller ? { unreadBySeller: 0 } : { unreadByBuyer: 0 });
      if (req.io) {
        req.io.to(`chat_${req.params.chatId}`).emit('messages_read', { chatId: req.params.chatId, readBy: req.user._id });
      }
    }

    res.json({ message: 'Marked as read' });
  } catch (err) {
    res.status(400).json({ message: 'Error marking as read', error: err.message });
  }
};

router.patch('/:chatId/mark-read', isAuthenticated, handleMarkRead);
router.patch('/:chatId/read', isAuthenticated, handleMarkRead);

module.exports = router;
