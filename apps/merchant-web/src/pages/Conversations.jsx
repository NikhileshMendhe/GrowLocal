import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ENDPOINTS, SOCKET_EVENTS } from '@growlocal/api-client';
import { ArrowLeft, MessageCircle, Send, User } from 'lucide-react';
import { api } from '../lib/apiClient';
import { formatTime, timeAgo } from '../lib/format';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, ErrorState, PageLoader } from '../components/ui';

function MessageBubble({ message }) {
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center">
        <p className="text-[11px] text-[#666666] bg-[#F7F8F7] border border-[#E5E7E5] px-3 py-1 rounded-full">
          {message.message_text}
        </p>
      </div>
    );
  }
  const mine = message.sender_type === 'merchant';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2 ${
          mine ? 'bg-brand text-white rounded-br-md' : 'bg-white border border-[#E5E7E5] text-[#111111] rounded-bl-md'
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.message_text}</p>
        <p className={`text-[10px] mt-0.5 ${mine ? 'text-white/70' : 'text-[#999999]'}`}>
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

export default function Conversations() {
  const toast = useToast();
  const socket = useSocket();
  const [conversations, setConversations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const activeIdRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.get(ENDPOINTS.CONVERSATIONS.LIST, { query: { limit: 50 } });
      setConversations(data.conversations);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const activeConversation = conversations?.find((item) => item.id === activeId) || null;

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return undefined;
    let cancelled = false;
    setMessagesLoading(true);
    api
      .get(ENDPOINTS.CONVERSATIONS.MESSAGES(activeId), { query: { limit: 100 } })
      .then((data) => {
        if (cancelled) return;
        setMessages([...data.messages].reverse());
      })
      .catch((err) => {
        if (!cancelled) toast(err.message || 'Could not load the conversation', 'error');
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, toast]);

  useEffect(() => {
    if (!socket || !activeId) return undefined;
    socket.emit('conversation:join', activeId);
    return () => socket.emit('conversation:leave', activeId);
  }, [socket, activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages]);

  useSocketEvent(SOCKET_EVENTS.MESSAGE_CREATED, (message) => {
    const isActive = message.conversation_id === activeIdRef.current;
    if (isActive) {
      setMessages((prev) => (prev.some((item) => item.id === message.id) ? prev : [...prev, message]));
    }
    setConversations((prev) => {
      if (!prev) return prev;
      const updated = prev.map((conversation) => {
        if (conversation.id !== message.conversation_id) return conversation;
        return {
          ...conversation,
          last_message_text: message.message_text,
          last_message_at: message.created_at,
          last_message_sender_type: message.sender_type,
          unread_count:
            isActive || message.sender_type === 'merchant'
              ? conversation.unread_count
              : (conversation.unread_count || 0) + 1,
        };
      });
      return [...updated].sort(
        (a, b) => new Date(b.last_message_at || b.updated_at) - new Date(a.last_message_at || a.updated_at)
      );
    });
  });

  async function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;
    setSending(true);
    try {
      const data = await api.post(ENDPOINTS.CONVERSATIONS.MESSAGES(activeId), {
        messageText: text,
        messageType: 'text',
      });
      setMessages((prev) => (prev.some((item) => item.id === data.message.id) ? prev : [...prev, data.message]));
      setConversations((prev) =>
        prev
          ? prev.map((conversation) =>
              conversation.id === activeId
                ? {
                    ...conversation,
                    last_message_text: text,
                    last_message_at: data.message.created_at,
                    last_message_sender_type: 'merchant',
                  }
                : conversation
            )
          : prev
      );
      setDraft('');
    } catch (err) {
      toast(err.message || 'Could not send the message', 'error');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <PageLoader label="Loading conversations…" />;
  if (error) return <ErrorState error={error} onRetry={() => loadConversations()} />;

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-8rem)] md:h-[calc(100vh-11rem)]">
      <div>
        <h1 className="text-2xl font-bold text-[#111111] font-[Poppins,sans-serif]">Chats</h1>
        <p className="text-sm text-[#666666] mt-0.5">Customer conversations — new messages arrive live.</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[320px,1fr] gap-3">
        <div
          className={`bg-white border border-[#E5E7E5] rounded-2xl card-shadow overflow-y-auto ${
            activeId ? 'hidden md:block' : 'block'
          }`}
        >
          {!conversations || conversations.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No conversations yet"
              description="When a customer messages your shop, the thread appears here."
            />
          ) : (
            <ul className="divide-y divide-[#E5E7E5]">
              {conversations.map((conversation) => (
                <li key={conversation.id}>
                  <button
                    onClick={() => setActiveId(conversation.id)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                      activeId === conversation.id ? 'bg-brand-light' : 'hover:bg-[#F7F8F7]'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-brand" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#111111] truncate">{conversation.customer_name}</p>
                        <span className="text-[10px] text-[#666666] shrink-0">
                          {timeAgo(conversation.last_message_at || conversation.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-[#666666] truncate">
                          {conversation.last_message_sender_type === 'merchant' ? 'You: ' : ''}
                          {conversation.last_message_text || 'No messages yet'}
                        </p>
                        {conversation.unread_count > 0 && (
                          <span className="shrink-0 bg-brand text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className={`bg-white border border-[#E5E7E5] rounded-2xl card-shadow flex flex-col min-h-0 ${
            activeId ? 'flex' : 'hidden md:flex'
          }`}
        >
          {!activeConversation ? (
            <EmptyState
              icon={MessageCircle}
              title="Select a conversation"
              description="Pick a thread on the left to read and reply."
            />
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7E5]">
                <button
                  onClick={() => setActiveId(null)}
                  className="md:hidden p-1.5 rounded-lg text-[#666666] hover:bg-[#F7F8F7]"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111111] truncate">{activeConversation.customer_name}</p>
                  <p className="text-xs text-[#666666] truncate">
                    {activeConversation.shop_name} · {activeConversation.status}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2.5 bg-[#F7F8F7]">
                {messagesLoading ? (
                  <p className="text-xs text-[#666666] text-center py-4">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-xs text-[#666666] text-center py-4">
                    No messages yet — say hello to get the conversation going.
                  </p>
                ) : (
                  messages.map((message) => <MessageBubble key={message.id} message={message} />)
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-[#E5E7E5]">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type a message…"
                  maxLength={5000}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E5E7E5] text-sm text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-brand focus:ring-2 focus:ring-[#EAF7EE]"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
