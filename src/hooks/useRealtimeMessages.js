import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';

export function useRealtimeMessages(conversationId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    async function fetchAndSubscribe() {
      if (!conversationId) return;
      setLoading(true);

      // Initial fetch
      const { data } = await chatService.getMessages(conversationId);
      if (data) setMessages(data);
      setLoading(false);

      // Subscribe to Realtime inserts
      unsubscribe = chatService.subscribeToMessages(conversationId, (newMessage) => {
        setMessages((prevMsgs) => {
          if (prevMsgs.some((m) => m.id === newMessage.id)) return prevMsgs;
          return [...prevMsgs, newMessage];
        });
      });
    }

    fetchAndSubscribe();

    return () => {
      unsubscribe();
    };
  }, [conversationId]);

  return { messages, setMessages, loading };
}
