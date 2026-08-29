import { supabase, isSupabaseConfigured } from './supabaseClient';
import { INITIAL_CHAT_MESSAGES } from '../data/mockData';
import { REPORTED_CHATS } from '../data/adminMockData';

export const chatService = {
  // Fetch messages for a conversation
  async getMessages(conversationId) {
    if (!isSupabaseConfigured) {
      return { data: INITIAL_CHAT_MESSAGES, error: null };
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Send message
  async sendMessage({ conversationId, senderId, senderRole, messageText, messageType = 'text', attachmentUrl = null }) {
    if (!isSupabaseConfigured) {
      return { 
        data: { 
          id: `msg-${Date.now()}`, 
          sender_id: senderId, 
          sender_role: senderRole, 
          message_text: messageText, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }, 
        error: null 
      };
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        sender_id: senderId,
        sender_role: senderRole,
        message_type: messageType,
        message_text: messageText,
        attachment_url: attachmentUrl
      }])
      .select()
      .single();

    // Update conversation timestamp
    await supabase.from('conversations').update({ updated_at: new Date() }).eq('id', conversationId);

    return { data, error };
  },

  // Subscribe to real-time chat messages
  subscribeToMessages(conversationId, onNewMessage) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel(`public:messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        onNewMessage(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // Get reported conversations for admin moderation
  async getReportedChats() {
    if (!isSupabaseConfigured) return { data: REPORTED_CHATS, error: null };

    const { data, error } = await supabase
      .from('conversations')
      .select('*, profiles!customer_id(full_name), merchants(business_name)')
      .eq('status', 'flagged');

    return { data, error };
  }
};
