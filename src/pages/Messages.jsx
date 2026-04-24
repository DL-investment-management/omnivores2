import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, MessageCircle, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "@/lib/appData";

async function apiGet(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

function Avatar({ user, size = 10 }) {
  return (
    <div className={`w-${size} h-${size} rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0`}>
      {user?.avatar || "?"}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [me, setMe] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    getCurrentUser().then(u => {
      setMe(u);
      // If URL has ?with=email, open that convo
      const withEmail = searchParams.get("with");
      if (withEmail) {
        setActivePartner({ email: withEmail, full_name: withEmail, avatar: "?" });
      }
    });
  }, []);

  // Load conversations
  useEffect(() => {
    if (!me) return;
    loadConversations();
  }, [me]);

  async function loadConversations() {
    if (!me) return;
    try {
      const data = await apiGet(`/api/messages?email=${encodeURIComponent(me.email)}&type=conversations`);
      setConversations(data.conversations || []);
    } catch {}
    setLoadingConvos(false);
  }

  // Load messages for active conversation and start polling
  useEffect(() => {
    if (!me || !activePartner) return;
    loadMessages();
    pollRef.current = setInterval(loadMessages, 4000);
    return () => clearInterval(pollRef.current);
  }, [me, activePartner]);

  async function loadMessages() {
    if (!me || !activePartner) return;
    setLoadingMsgs(true);
    try {
      const data = await apiGet(
        `/api/messages?email=${encodeURIComponent(me.email)}&type=conversation&with_email=${encodeURIComponent(activePartner.email)}`
      );
      setMessages(data.messages || []);
      // Also refresh conversation list to clear unread
      loadConversations();
    } catch {}
    setLoadingMsgs(false);
  }

  // Scroll to bottom when messages load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!draft.trim() || sending || !me || !activePartner) return;
    setSending(true);
    try {
      const { message } = await apiPost("/api/messages", {
        from_email: me.email,
        to_email: activePartner.email,
        content: draft.trim(),
      });
      setMessages(prev => [...prev, message]);
      setDraft("");
      loadConversations();
    } catch {}
    setSending(false);
  }

  function openConversation(convo) {
    setActivePartner(convo.partner);
    setMessages([]);
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!me) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] max-w-4xl mx-auto overflow-hidden">
      {/* Conversation List — hidden on mobile when chat is open */}
      <div className={`flex flex-col border-r border-border bg-card ${activePartner && isMobile ? "hidden" : "w-full md:w-80 shrink-0"}`}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <button onClick={() => navigate("/profile")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-heading font-bold text-lg">Messages</h1>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-heading font-bold text-sm mb-1">No messages yet</p>
              <p className="text-xs text-muted-foreground">Find people on your profile and start chatting!</p>
            </div>
          ) : (
            conversations.map(convo => (
              <button
                key={convo.partner_email}
                onClick={() => openConversation(convo)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 ${
                  activePartner?.email === convo.partner_email ? "bg-primary/5 border-l-2 border-l-primary" : ""
                }`}
              >
                <Avatar user={convo.partner} size={10} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm truncate">{convo.partner?.full_name || convo.partner_email}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {timeAgo(convo.latest_message.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {convo.latest_message.from_email === me.email ? "You: " : ""}
                    {convo.latest_message.content}
                  </p>
                </div>
                {convo.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shrink-0">
                    {convo.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col ${!activePartner && isMobile ? "hidden" : ""} ${!activePartner ? "hidden md:flex" : "flex"}`}>
        {activePartner ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <button
                onClick={() => setActivePartner(null)}
                className="md:hidden text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar user={activePartner} size={9} />
              <div>
                <p className="font-heading font-bold">{activePartner.full_name || activePartner.email}</p>
                <p className="text-xs text-muted-foreground">{activePartner.rank || ""}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
              {messages.length === 0 && !loadingMsgs && (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">Start the conversation! 👋</p>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.from_email === me.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {timeAgo(msg.created_at)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Message input */}
            <div className="p-3 border-t border-border bg-card flex gap-2 items-end">
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 resize-none bg-muted/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary max-h-24"
              />
              <button
                onClick={sendMessage}
                disabled={!draft.trim() || sending}
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle className="w-16 h-16 text-muted-foreground/20 mb-4" />
            <p className="font-heading font-bold text-lg mb-1">Your Messages</p>
            <p className="text-sm text-muted-foreground">Select a conversation or find someone new to chat with.</p>
            <button
              onClick={() => navigate("/profile")}
              className="mt-4 text-sm text-primary font-bold hover:underline"
            >
              Find People →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
