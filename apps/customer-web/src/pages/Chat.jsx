import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SOCKET_EVENTS } from '@growlocal/api-client';
import { ArrowLeft, Loader2, MessageCircle, Send, Store } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDateTime, initials } from '../lib/format';

export default function Chat() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    setLoadingList(true);
    api
      .get(ENDPOINTS.CONVERSATIONS.LIST, { query: { limit: 50 } })
      .then((data) => setConversations(data.conversations || []))
      .catch((err) => setError(err.message || 'Could not load chats'))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoadingThread(true);
    api
      .get(ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), { query: { limit: 50 } })
      .then((data) => setMessages((data.messages || []).slice().reverse()))
      .catch((err) => setError(err.message || 'Could not load messages'))
      .finally(() => setLoadingThread(false));
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return undefined;
    socket.emit('conversation:join', conversationId);
    const onMessage = (message) => {
      if (!message?.id || message.conversation_id !== conversationId) return;
      setMessages((prev) =>
        prev.some((item) => item.id === message.id) ? prev : [...prev, message]
      );
      setConversations((prev) =>
        prev.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                last_message_text: message.message_text,
                last_message_at: message.created_at,
                last_message_sender_type: message.sender_type,
              }
            : item
        )
      );
    };
    socket.on(SOCKET_EVENTS.MESSAGE_CREATED, onMessage);
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_CREATED, onMessage);
      socket.emit('conversation:leave', conversationId);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function send(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !conversationId) return;
    setSending(true);
    try {
      const data = await api.post(ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), {
        messageText: text,
      });
      setMessages((prev) =>
        prev.some((item) => item.id === data.message.id) ? prev : [...prev, data.message]
      );
      setDraft('');
    } catch (err) {
      setError(err.message || 'Could not send the message');
    } finally {
      setSending(false);
    }
  }

  const activeConversation = conversations.find((item) => item.id === conversationId);

  const list = (
    <div className={conversationId ? 'hidden lg:block' : 'block'}>
      <h1 className="text-2xl font-bold text-[#111111] mb-4">Chats</h1>
      {loadingList ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No chats yet"
          subtitle="Open a shop page and hit Chat to start a conversation."
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => navigate(`/chat/${conversation.id}`)}
              className={`w-full text-left flex items-center gap-3 bg-white border rounded-xl p-3.5 hover:border-brand ${
                conversation.id === conversationId ? 'border-brand' : 'border-[#E5E7E5]'
              }`}
            >
              <span className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand shrink-0">
                {initials(conversation.shop_name)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111111] truncate">
                    {conversation.shop_name}
                  </span>
                  {conversation.unread_count > 0 ? (
                    <span className="text-[10px] font-bold text-white bg-brand rounded-full px-1.5 py-0.5">
                      {conversation.unread_count}
                    </span>
                  ) : null}
                </span>
                <span className="block text-xs text-[#666666] truncate mt-0.5">
                  {conversation.last_message_text || 'Say hello 👋'}
                </span>
              </span>
              <span className="text-[10px] text-[#999999] shrink-0">
                {formatDateTime(conversation.last_message_at)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const thread = conversationId ? (
    <div className="flex flex-col h-[calc(100vh-16rem)] min-h-[24rem] bg-white border border-[#E5E7E5] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[#E5E7E5] px-4 py-3">
        <button
          type="button"
          onClick={() => navigate('/chat')}
          className="lg:hidden p-1.5 rounded-lg text-[#666666] hover:bg-[#F7F8F7]"
          aria-label="Back to chats"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {activeConversation ? (
          <button
            type="button"
            onClick={() => navigate(`/shops/${activeConversation.shop_id}`)}
            className="flex items-center gap-3 min-w-0"
          >
            <span className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-xs font-bold text-brand shrink-0">
              {initials(activeConversation.shop_name)}
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-[#111111] truncate">
                {activeConversation.shop_name}
              </span>
              <span className="block text-xs text-[#666666] truncate">
                {activeConversation.shop_city || 'Local shop'}
              </span>
            </span>
          </button>
        ) : (
          <span className="flex items-center gap-2 text-sm text-[#666666]">
            <Store className="w-4 h-4" /> Conversation
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingThread ? (
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-brand animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#999999] text-center py-10">
            No messages yet — say hello!
          </p>
        ) : (
          messages.map((message) => {
            const mine = message.sender_type === 'customer';
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                    mine
                      ? 'bg-brand text-white rounded-br-md'
                      : 'bg-[#F7F8F7] text-[#111111] border border-[#E5E7E5] rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line break-words">
                    {message.message_text}
                  </p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-[#999999]'}`}>
                    {formatDateTime(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-[#E5E7E5] p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-[#F7F8F7] border border-[#E5E7E5] rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
        <button
          type="submit"
          disabled={sending || draft.trim().length === 0}
          className="w-11 h-11 rounded-full bg-brand text-white flex items-center justify-center hover:bg-[#0F752C] disabled:opacity-50"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  ) : null;

  return (
    <div>
      {error ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      ) : null}
      <div className="grid lg:grid-cols-[22rem_1fr] gap-6 items-start">
        {list}
        {thread || (
          <div className="hidden lg:flex h-64 items-center justify-center text-sm text-[#999999]">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
