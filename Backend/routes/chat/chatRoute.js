const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middlewares/isAuthenticated');
const Chat = require('../../models/chatModel');
const ChatMessage = require('../../models/chatMessageModel');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const chats = await Chat.find({ $or: [{ seller: req.user._id }, { buyer: req.user._id }] })
      .populate('seller', 'name email').populate('buyer', 'name email').sort({ lastMessageTime: -1, updatedAt: -1 });
    res.json({ data: chats });
  } catch (err) { res.status(500).json({ message: 'Error fetching chats', error: err.message }); }
});

router.get('/:chatId', isAuthenticated, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId).populate('seller', 'name email').populate('buyer', 'name email');
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const messages = await ChatMessage.find({ chat: req.params.chatId }).populate('sender', 'name email').sort({ createdAt: 1 });
    res.json({ chat, messages });
  } catch (err) { res.status(500).json({ message: 'Error fetching chat', error: err.message }); }
});

router.post('/or-create', isAuthenticated, async (req, res) => {
  try {
    const { otherId, orderId } = req.body;
    if (!otherId) return res.status(400).json({ message: 'otherId required' });
    // determine seller/buyer ordering - keep as provided (caller decides); but ensure uniqueness both directions
    let chat = await Chat.findOne({ $or: [{ seller: req.user._id, buyer: otherId }, { seller: otherId, buyer: req.user._id }] });
    if (!chat) {
      chat = await Chat.create({ seller: req.user._id, buyer: otherId, order: orderId || undefined });
    }
    res.json({ data: chat });
  } catch (err) { res.status(400).json({ message: 'Error creating chat', error: err.message }); }
});

router.post('/:chatId/message', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'message required' });
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    const isParticipant = chat.seller.toString() === req.user._id.toString() || chat.buyer.toString() === req.user._id.toString();
    if (!isParticipant) return res.status(403).json({ message: 'Not a participant' });
    const msg = await ChatMessage.create({ chat: req.params.chatId, sender: req.user._id, message });
    const isSeller = chat.seller.toString() === req.user._id.toString();
    await Chat.findByIdAndUpdate(req.params.chatId, {
      lastMessage: message, lastMessageTime: new Date(), lastMessageBy: req.user._id,
      $inc: isSeller ? { unreadByBuyer: 1 } : { unreadBySeller: 1 }
    });
    res.status(201).json({ data: msg });
  } catch (err) { res.status(400).json({ message: 'Error sending message', error: err.message }); }
});

router.patch('/:chatId/mark-read', isAuthenticated, async (req, res) => {
  try {
    await ChatMessage.updateMany({ chat: req.params.chatId, sender: { $ne: req.user._id }, isRead: false }, { isRead: true, readAt: new Date() });
    const chat = await Chat.findById(req.params.chatId);
    if (chat) {
      const isSeller = chat.seller.toString() === req.user._id.toString();
      await Chat.findByIdAndUpdate(req.params.chatId, isSeller ? { unreadBySeller: 0 } : { unreadByBuyer: 0 });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(400).json({ message: 'Error marking as read', error: err.message }); }
});

module.exports = router;
