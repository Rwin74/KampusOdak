"use client";

import { useState, useRef, useEffect } from "react";
import { useRoomContext, useLocalParticipant } from "@livekit/components-react";
import { Send, MessageSquare, X } from "lucide-react";

export default function ChatPanel({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const room = useRoomContext();
  useLocalParticipant();
  const [messages, setMessages] = useState<{sender: string, text: string, time: string, isMe: boolean}[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!room) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleData = (payload: Uint8Array, participant: any) => {
        const str = new TextDecoder().decode(payload);
        try {
            const data = JSON.parse(str);
            if (data.type === 'CHAT_MSG') {
                setMessages(prev => [...prev, {
                    sender: participant?.name || participant?.identity || "Partner",
                    text: data.text,
                    time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    isMe: false
                }]);
            }
        } catch { }
    };
    room.on('dataReceived', handleData);
    return () => { room.off('dataReceived', handleData); }
  }, [room]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputMsg.trim() || !room.localParticipant) return;
      
      const text = inputMsg.trim();
      const enc = new TextEncoder();
      room.localParticipant.publishData(enc.encode(JSON.stringify({ type: 'CHAT_MSG', text })), { reliable: true });
      
      setMessages(prev => [...prev, {
          sender: "Sen",
          text,
          time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          isMe: true
      }]);
      setInputMsg("");
  };

  return (
      <div className={`fixed top-0 right-0 h-full w-80 bg-[#0A0A0A]/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl transition-transform duration-500 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}>
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-bold text-lg flex items-center space-x-2 text-white tracking-widest">
                 <MessageSquare className="w-5 h-5 text-accent" /> <span>Oda Sohbeti</span>
              </h3>
              <button type="button" onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 bg-background/40 hover:bg-white/10 rounded-full transition text-muted-foreground hover:text-white shadow-lg cursor-pointer z-[60] relative">
                  <X className="w-5 h-5 pointer-events-none" />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-3">
                       <MessageSquare className="w-16 h-16 mb-2 opacity-50" />
                       <p className="text-xs tracking-widest uppercase">Mesajlar şifrelidir.</p>
                  </div>
              )}
              {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-muted-foreground mb-1 ml-1 px-1">{m.sender} - {m.time}</span>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm shadow-xl leading-relaxed ${m.isMe ? 'bg-accent/80 text-white rounded-tr-sm' : 'bg-white/10 text-white rounded-tl-sm border border-white/5'}`}>
                          {m.text}
                      </div>
                  </div>
              ))}
              <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={sendMessage} className="p-4 border-t border-white/5 bg-background/50">
             <div className="flex bg-white/5 border border-white/10 rounded-2xl focus-within:border-accent/40 focus-within:bg-white/10 transition-all shadow-inner">
                 <input 
                     type="text" 
                     value={inputMsg} 
                     onChange={(e) => setInputMsg(e.target.value)}
                     className="flex-1 bg-transparent px-4 py-3 text-sm text-white focus:outline-none placeholder-muted-foreground"
                     placeholder="Partnerine yaz..." 
                 />
                 <button type="submit" className="p-3 text-accent hover:text-white hover:bg-accent rounded-xl transition m-1 shadow-lg">
                     <Send className="w-4 h-4" />
                 </button>
             </div>
          </form>
      </div>
  )
}
