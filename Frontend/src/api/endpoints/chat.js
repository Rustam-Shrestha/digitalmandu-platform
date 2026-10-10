import client from '../client';

export const chatAPI = {
  getChats: () => client.get('/chat'),
  getContacts: () => client.get('/chat/contacts'),
  getOrCreate: (targetUserId, orderId) => client.post('/chat/or-create', { otherId: targetUserId, targetUserId, orderId }),
  getMessages: (chatId) => client.get(`/chat/${chatId}`),
  sendMessage: (chatId, data) => client.post(`/chat/${chatId}/message`, { message: data.message || data.text, ...data }),
  markRead: (chatId) => client.patch(`/chat/${chatId}/mark-read`),
};
