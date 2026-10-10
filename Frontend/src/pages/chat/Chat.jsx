import { useState } from 'react';
import { useChats, useChatMessages, useSendMessage } from '../../api/hooks';
import { MessageIcon, SendIcon } from '../../assets/data/icons';

export default function Chat() {
  const { data: chatsData } = useChats();
  const chats = chatsData?.data || chatsData || [];
  const [active, setActive] = useState(null);
  const { data: msgsData } = useChatMessages(active);
  const { mutate: send, isPending } = useSendMessage(active);
  const [text, setText] = useState('');
  const messages = msgsData?.data || msgsData || [];
  const doSend = () => {
    if (!text.trim() || !active) return;
    send({ text: text.trim() }, { onSuccess: () => setText('') });
  };
  return (
    <div className="grid md:grid-cols-3 gap-4 h-[70vh]">
      <div className="bg-white border border-gray-200 rounded-xl p-3 overflow-auto">
        <h2 className="font-semibold flex items-center gap-2 mb-3"><MessageIcon /> Chats</h2>
        {chats.length===0 && <p className="text-sm text-gray-500">No chats yet</p>}
        {chats.map(c=>(
          <button key={c._id} onClick={()=>setActive(c._id)} className={`w-full text-left p-2 rounded-lg text-sm mb-1 ${active===c._id?'bg-green-footer border border-green-border':'hover:bg-gray-50'}`}>{c.participants?.map(p=>p.email||p.userName).join(', ') || c._id}</button>
        ))}
      </div>
      <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl flex flex-col">
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {!active && <p className="text-sm text-gray-500 text-center mt-10">Select a chat</p>}
          {active && messages.length===0 && <p className="text-sm text-gray-500 text-center">No messages — polling every 5s</p>}
          {messages.map((m,i)=>(
            <div key={m._id||i} className="flex flex-col max-w-[80%] bg-gray-50 border rounded-lg px-3 py-2 text-sm">
              <span className="text-xs text-gray-500">{m.sender?.email || 'user'} · {m.createdAt?new Date(m.createdAt).toLocaleTimeString():''}</span>
              <span>{m.text || m.message}</span>
            </div>
          ))}
        </div>
        <div className="border-t p-3 flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSend()} disabled={!active} placeholder={active?'Type a message...':'Select a chat'} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50" />
          <button onClick={doSend} disabled={isPending||!active} className="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"><SendIcon /> Send</button>
        </div>
      </div>
    </div>
  );
}
