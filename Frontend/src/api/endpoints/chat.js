import client from '../client';
export const chatAPI = {
  getChats: () => client.get('/chats'),
  getOrCreate: (otherUserId) => client.post('/chats', { otherUserId }),
  getMessages: (chatId, params) => client.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => client.post(`/chats/${chatId}/messages`, data),
  markRead: (chatId) => client.patch(`/chats/${chatId}/read`),
};
