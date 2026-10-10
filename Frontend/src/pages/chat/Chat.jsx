import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { 
  useChats, 
  useChatMessages, 
  useSendMessage, 
  useChatContacts, 
  useGetOrCreateChat, 
  useMarkChatRead 
} from '../../api/hooks';
import { getSocket } from '../../utils/socket';
import { 
  MessageIcon, 
  SendIcon, 
  PlusIcon, 
  SearchIcon, 
  CrownIcon, 
  CloseIcon
} from '../../assets/data/icons';

import toast from 'react-hot-toast';

const RefreshIcon = ({ className = "size-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);


export default function Chat() {
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;
  const currentRole = user?.role || 'customer';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeChatId, setActiveChatId] = useState(searchParams.get('chatId') || null);
  const [text, setText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Queries & Mutations
  const { data: chats = [], refetch: refetchChats, isLoading: isLoadingChats } = useChats();
  const { data: rawMessages = [], refetch: refetchMessages, isLoading: isLoadingMessages } = useChatMessages(activeChatId);
  const { data: contacts = [], isLoading: isLoadingContacts } = useChatContacts();

  const { mutate: sendMessage, isPending: isSending } = useSendMessage(activeChatId);
  const { mutate: getOrCreateChat, isPending: isCreatingChat } = useGetOrCreateChat();
  const { mutate: markRead } = useMarkChatRead();

  const [liveMessages, setLiveMessages] = useState([]);

  // Synchronize live messages with API refetch
  useEffect(() => {
    setLiveMessages(rawMessages);
  }, [rawMessages]);

  // Handle URL query params for initializing chat with target user
  useEffect(() => {
    const targetUserId = searchParams.get('userId') || searchParams.get('targetUserId');
    const orderId = searchParams.get('orderId');

    if (targetUserId) {
      getOrCreateChat({ targetUserId, orderId }, {
        onSuccess: (newChat) => {
          const cId = newChat._id || newChat.id;
          if (cId) {
            setActiveChatId(cId);
            setSearchParams({ chatId: cId }, { replace: true });
          }
        }
      });
    }
  }, [searchParams]);

  // Scroll to bottom on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [liveMessages, otherUserTyping]);

  // Mark active chat as read
  useEffect(() => {
    if (activeChatId) {
      markRead(activeChatId);
    }
  }, [activeChatId, liveMessages.length]);

  // Socket setup & real-time events
  useEffect(() => {
    const socket = getSocket();

    if (currentUserId) {
      socket.emit('user_online', currentUserId);
    }

    if (activeChatId) {
      socket.emit('join_room', activeChatId);
    }

    const handleReceiveMessage = (msg) => {
      if (msg.chat === activeChatId || msg.chat?._id === activeChatId) {
        setLiveMessages((prev) => {
          // Avoid duplicate messages
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        markRead(activeChatId);
      }
      refetchChats();
    };

    const handleTyping = ({ chatId, userName }) => {
      if (chatId === activeChatId) {
        setOtherUserTyping(userName || 'Participant');
      }
    };

    const handleStopTyping = ({ chatId }) => {
      if (chatId === activeChatId) {
        setOtherUserTyping(false);
      }
    };

    const handleNewNotification = ({ chatId }) => {
      refetchChats();
      if (chatId === activeChatId) {
        refetchMessages();
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);
    socket.on('new_message_notification', handleNewNotification);

    return () => {
      if (activeChatId) {
        socket.emit('leave_room', activeChatId);
      }
      socket.off('receive_message', handleReceiveMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
      socket.off('new_message_notification', handleNewNotification);
    };
  }, [activeChatId, currentUserId]);

  // Handle typing indicator dispatch
  const handleInputChange = (e) => {
    setText(e.target.value);
    const socket = getSocket();

    if (activeChatId && !isTyping) {
      setIsTyping(true);
      socket.emit('typing', { chatId: activeChatId, userName: user?.name || user?.email });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (activeChatId) {
        socket.emit('stop_typing', { chatId: activeChatId });
      }
      setIsTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if (!text.trim() || !activeChatId) return;
    const msgText = text.trim();
    setText('');
    
    // Clear typing state
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    getSocket().emit('stop_typing', { chatId: activeChatId });
    setIsTyping(false);

    sendMessage({ message: msgText, text: msgText });
  };

  // Helper to extract the counterpart user details
  const getOtherParticipant = (chat) => {
    if (!chat) return null;
    const isSellerMe = chat.seller?._id === currentUserId || chat.seller === currentUserId;
    const other = isSellerMe ? chat.buyer : chat.seller;
    
    if (other && typeof other === 'object') return other;
    
    // Fallback if user is admin
    if (chat.seller && chat.seller._id !== currentUserId) return chat.seller;
    if (chat.buyer && chat.buyer._id !== currentUserId) return chat.buyer;
    
    return { name: 'Support / User', email: 'user@system', role: 'user' };
  };

  const activeChat = chats.find((c) => c._id === activeChatId);
  const activeOtherUser = getOtherParticipant(activeChat);

  // Filtered chats list
  const filteredChats = chats.filter((c) => {
    const other = getOtherParticipant(c);
    const nameStr = (other?.name || other?.email || '').toLowerCase();
    const lastMsgStr = (c.lastMessage || '').toLowerCase();
    return nameStr.includes(searchTerm.toLowerCase()) || lastMsgStr.includes(searchTerm.toLowerCase());
  });

  const startChatWithUser = (targetUserId) => {
    setShowNewModal(false);
    getOrCreateChat({ targetUserId }, {
      onSuccess: (chat) => {
        const cId = chat._id || chat.id;
        setActiveChatId(cId);
        setSearchParams({ chatId: cId });
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] min-h-[500px] flex flex-col md:flex-row gap-4 p-2 md:p-4 font-sans">
      
      {/* LEFT SIDEBAR: Chat List */}
      <div className="w-full md:w-80 lg:w-96 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col shrink-0 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <MessageIcon className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-base leading-tight">Messages</h2>
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-500 animate-pulse"></span> Socket Active
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setShowNewModal(true)} 
            className="p-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm transition flex items-center gap-1 text-xs font-semibold"
            title="Start new conversation"
          >
            <PlusIcon className="size-4" /> New Chat
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <SearchIcon className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search chats..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>
        </div>

        {/* Chat Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
          {isLoadingChats && (
            <div className="p-8 text-center text-sm text-gray-400">Loading chats...</div>
          )}

          {!isLoadingChats && filteredChats.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageIcon className="size-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No conversations found</p>
              <button 
                onClick={() => setShowNewModal(true)}
                className="mt-3 text-xs text-primary font-semibold hover:underline"
              >
                + Start a new chat
              </button>
            </div>
          )}

          {filteredChats.map((c) => {
            const other = getOtherParticipant(c);
            const isActive = c._id === activeChatId;
            const isUnread = (c.seller?._id === currentUserId && c.unreadBySeller > 0) ||
                             (c.buyer?._id === currentUserId && c.unreadByBuyer > 0);
            const unreadCount = c.seller?._id === currentUserId ? c.unreadBySeller : c.unreadByBuyer;

            return (
              <button
                key={c._id}
                onClick={() => {
                  setActiveChatId(c._id);
                  setSearchParams({ chatId: c._id });
                }}
                className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/20 text-gray-900 shadow-xs' 
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="size-11 rounded-full bg-gradient-to-tr from-primary to-emerald-400 text-white font-bold flex items-center justify-center text-sm uppercase shadow-xs">
                    {(other?.name || other?.email || 'U').charAt(0)}
                  </div>
                  {other?.role === 'admin' && (
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-0.5" title="Admin">
                      <CrownIcon className="size-3" />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-xs text-gray-900 truncate">
                      {other?.name || other?.email || 'Support User'}
                    </span>
                    {c.lastMessageTime && (
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs truncate ${isUnread ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
                      {c.lastMessage || 'Click to send a message'}
                    </p>
                    {isUnread && (
                      <span className="bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shrink-0">
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {other?.role && (
                    <span className="inline-block mt-1 text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold bg-gray-100 text-gray-600">
                      {other.role}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN PANEL: Active Conversation */}
      <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
        {activeChatId ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-emerald-500 text-white font-bold flex items-center justify-center text-sm uppercase shadow-xs">
                  {(activeOtherUser?.name || activeOtherUser?.email || 'U').charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    {activeOtherUser?.name || activeOtherUser?.email || 'User'}
                    {activeOtherUser?.role && (
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        activeOtherUser.role === 'admin' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                          : activeOtherUser.role === 'seller'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {activeOtherUser.role}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">{activeOtherUser?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { refetchMessages(); refetchChats(); }} 
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Refresh conversation"
                >
                  <RefreshIcon className="size-4" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              {isLoadingMessages && (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  Loading messages...
                </div>
              )}

              {!isLoadingMessages && liveMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3 text-primary">
                    <MessageIcon className="size-8" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No messages yet</p>
                  <p className="text-xs text-gray-500 mt-1">Send a friendly greeting to start the conversation!</p>
                </div>
              )}

              {liveMessages.map((m, idx) => {
                const senderId = m.sender?._id || m.sender;
                const isMe = senderId === currentUserId;
                const senderName = m.sender?.name || m.sender?.email || (isMe ? 'You' : 'User');

                return (
                  <div 
                    key={m._id || idx} 
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 px-1">
                      <span>{senderName}</span>
                      <span>•</span>
                      <span>
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div 
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                        isMe 
                          ? 'bg-primary text-white rounded-tr-none font-normal' 
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none font-normal'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.message || m.text}</p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic bg-white border border-gray-200 px-3 py-1.5 rounded-full w-max shadow-xs animate-pulse">
                  <span className="size-2 bg-primary rounded-full animate-bounce"></span>
                  {otherUserTyping} is typing...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                value={text}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Write your message..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || isSending}
                className="bg-primary hover:bg-primary-dark text-white font-medium px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-2"
              >
                <span>Send</span>
                <SendIcon className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-400 bg-slate-50/30">
            <div className="p-4 bg-white rounded-full shadow-md text-primary mb-4">
              <MessageIcon className="size-12" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Select a Conversation</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Choose an existing chat from the left panel or start a new conversation with sellers, buyers, or support.
            </p>
            <button
              onClick={() => setShowNewModal(true)}
              className="mt-6 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm hover:bg-primary-dark transition flex items-center gap-2"
            >
              <PlusIcon className="size-4" /> Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* NEW CHAT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <MessageIcon className="size-5 text-primary" /> Start New Chat
              </h3>
              <button 
                onClick={() => setShowNewModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition"
              >
                <CloseIcon className="size-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3">
              Select a contact to initiate instant direct socket messaging:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-gray-50 pr-1">
              {isLoadingContacts && (
                <div className="p-4 text-center text-xs text-gray-400">Loading contacts...</div>
              )}

              {!isLoadingContacts && contacts.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400">No available contacts found</div>
              )}

              {contacts.map((contact) => (
                <button
                  key={contact._id}
                  onClick={() => startChatWithUser(contact._id)}
                  disabled={isCreatingChat}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition flex items-center justify-between group border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs uppercase">
                      {(contact.name || contact.email || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-gray-900 group-hover:text-primary transition">
                        {contact.name || contact.email}
                      </p>
                      <p className="text-[10px] text-gray-400">{contact.email}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    contact.role === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : contact.role === 'seller'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {contact.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
