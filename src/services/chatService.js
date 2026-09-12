import { supabase, isSupabaseConfigured } from './supabaseClient';
import { REPORTED_CHATS } from '../data/adminMockData';

const CHAT_STORAGE_KEY = 'growlocal_chat_messages';
const BROADCAST_CHANNEL_NAME = 'growlocal_realtime_chat';

// Single shared BroadcastChannel instance for cross-tab communication
let broadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel initialization error:', e);
  }
}

// Single shared Supabase Realtime channel for cross-network communication
let realtimeChannel = null;
if (isSupabaseConfigured && supabase) {
  try {
    realtimeChannel = supabase.channel('growlocal_chat_room');
    realtimeChannel.subscribe((status) => {
      // Channel subscription status handler
    });
  } catch (err) {
    console.warn('Supabase Realtime Channel init notice:', err);
  }
}

export const chatService = {
  // Retrieve all stored messages from local storage
  getStoredMessages() {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.filter(m => 
          m && 
          m.text !== "Hi, do you have this in size L?" && 
          m.text !== "Yes! We have it available. What is your budget?" &&
          m.text !== "My budget is ₹700." &&
          m.text !== "Great! We can offer it for ₹699. Size L is available in stock right now."
        );
      }
      return [];
    } catch (e) {
      console.warn('Failed reading chat messages from storage:', e);
      return [];
    }
  },

  // Save full messages list to local storage
  saveStoredMessages(messages) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed writing chat messages to storage:', e);
    }
  },

  // Fetch messages for a specific conversation, shop, or enquiry
  async getMessages(conversationId) {
    const all = this.getStoredMessages();
    if (!conversationId) return { data: all, error: null };

    const target = String(conversationId).toLowerCase().trim();
    const filtered = all.filter(m => {
      if (m.conversationId && String(m.conversationId).toLowerCase() === target) return true;
      if (m.enquiryId && String(m.enquiryId).toLowerCase() === target) return true;
      if (m.shopId && String(m.shopId).toLowerCase() === target) return true;
      return false;
    });

    return { data: filtered, error: null };
  },

  // Send a realtime message across LocalStorage, BroadcastChannel, and Supabase Realtime
  async sendMessage({ 
    conversationId, 
    shopId, 
    shopName, 
    customerId, 
    customerName, 
    sender = 'customer', 
    senderRole, 
    senderName, 
    senderAvatar = '', 
    text = '', 
    messageText, 
    messageType = 'text', 
    attachmentUrl = null, 
    offer = null 
  }) {
    const contentText = (text || messageText || '').trim();
    const role = senderRole || (sender === 'shop' || sender === 'merchant' ? 'shop' : 'customer');
    const displaySender = role === 'shop' ? 'shop' : 'customer';

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      conversationId: String(conversationId || `${shopId || 'shop'}_${customerId || 'user'}`),
      shopId: String(shopId || ''),
      shopName: shopName || 'Local Shop',
      customerId: String(customerId || ''),
      customerName: customerName || 'Customer',
      sender: displaySender,
      senderRole: role,
      senderName: senderName || (displaySender === 'shop' ? (shopName || 'Shopkeeper') : (customerName || 'Customer')),
      senderAvatar: senderAvatar || '',
      text: contentText,
      messageText: contentText,
      messageType: offer ? 'offer' : messageType,
      attachmentUrl: attachmentUrl || null,
      offer: offer || null,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      isRead: false
    };

    // 1. Optimistic persistence in LocalStorage
    try {
      const current = this.getStoredMessages();
      const updated = [...current, newMsg];
      this.saveStoredMessages(updated);
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 2. Instant Cross-Tab Realtime via BroadcastChannel
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage({
          type: 'NEW_CHAT_MESSAGE',
          payload: newMsg
        });
      } catch (e) {
        console.warn('BroadcastChannel post error:', e);
      }
    }

    // 3. Instant Cross-Device Realtime via Supabase Broadcast
    if (realtimeChannel) {
      try {
        realtimeChannel.send({
          type: 'broadcast',
          event: 'chat_message',
          payload: newMsg
        }).catch(() => {});
      } catch (e) {
        // Non-blocking
      }
    }

    // 4. Asynchronous DB persistence in Supabase `messages` table
    if (isSupabaseConfigured && supabase) {
      try {
        // Validate if conversationId is a valid UUID before sending to conversation_id column
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(conversationId);
        supabase
          .from('messages')
          .insert([{
            conversation_id: isUUID ? conversationId : null,
            sender_role: role,
            message_type: offer ? 'offer' : 'text',
            message_text: contentText || (offer ? `Offer: ₹${offer.price} for ${offer.productName}` : 'Attachment'),
            attachment_url: attachmentUrl
          }])
          .then(() => {})
          .catch(() => {});
      } catch (err) {
        // Non-blocking
      }
    }

    return { data: newMsg, error: null };
  },

  // Subscribe to real-time chat messages across all channels
  subscribeToChat(onNewMessage) {
    if (typeof onNewMessage !== 'function') return () => {};

    // A. BroadcastChannel listener (instant cross-tab sync)
    const handleBroadcast = (event) => {
      if (event?.data?.type === 'NEW_CHAT_MESSAGE' && event.data.payload) {
        onNewMessage(event.data.payload);
      }
    };

    if (broadcastChannel) {
      try {
        broadcastChannel.addEventListener('message', handleBroadcast);
      } catch (_) {}
    }

    // B. LocalStorage event listener (fallback cross-window sync)
    const handleStorageEvent = (event) => {
      if (event.key === CHAT_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = parsed[parsed.length - 1];
            if (latest) onNewMessage(latest);
          }
        } catch (_) {}
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageEvent);
    }

    // C. Supabase Realtime channel broadcast listener (cross-network sync)
    let supabaseSubChannel = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseSubChannel = supabase.channel(`growlocal_chat_sub_${Date.now()}`)
          .on('broadcast', { event: 'chat_message' }, (event) => {
            if (event.payload) {
              onNewMessage(event.payload);
            }
          })
          .subscribe();
      } catch (_) {}
    }

    // Cleanup function
    return () => {
      if (broadcastChannel) {
        try {
          broadcastChannel.removeEventListener('message', handleBroadcast);
        } catch (_) {}
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageEvent);
      }
      if (supabaseSubChannel && supabase) {
        try {
          supabase.removeChannel(supabaseSubChannel);
        } catch (_) {}
      }
    };
  },

  // Clear messages for a specific conversation
  clearConversation(conversationId) {
    const all = this.getStoredMessages();
    const updated = all.filter(m => m.conversationId !== conversationId && m.enquiryId !== conversationId);
    this.saveStoredMessages(updated);
    return updated;
  },

  // Get reported conversations for admin moderation
  async getReportedChats() {
    if (!isSupabaseConfigured) return { data: REPORTED_CHATS, error: null };

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*, profiles!customer_id(full_name), merchants(business_name)')
        .eq('status', 'flagged');

      if (error || !data || data.length === 0) {
        return { data: REPORTED_CHATS, error: null };
      }
      return { data, error: null };
    } catch (_) {
      return { data: REPORTED_CHATS, error: null };
    }
  }
};
