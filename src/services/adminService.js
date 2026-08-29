import { supabase, isSupabaseConfigured } from './supabaseClient';
import { LOCAL_CREATORS } from '../data/mockData';
import { 
  CAMPAIGNS_LIST, 
  SUBSCRIPTION_PLANS, 
  PAYMENTS_LOG, 
  REVENUE_STATS, 
  NOTIFICATION_CAMPAIGNS, 
  DEMAND_HEATMAP_CLUSTERS, 
  SYSTEM_HEALTH_SERVICES, 
  INITIAL_AUDIT_LOGS 
} from '../data/adminMockData';

export const creatorService = {
  async getCreators() {
    if (!isSupabaseConfigured) return { data: LOCAL_CREATORS, error: null };
    const { data, error } = await supabase.from('creators').select('*');
    return { data, error };
  }
};

export const campaignService = {
  async getCampaigns() {
    if (!isSupabaseConfigured) return { data: CAMPAIGNS_LIST, error: null };
    const { data, error } = await supabase.from('campaigns').select('*, campaign_metrics(*)');
    return { data, error };
  }
};

export const subscriptionService = {
  async getPlans() {
    if (!isSupabaseConfigured) return { data: SUBSCRIPTION_PLANS, error: null };
    const { data, error } = await supabase.from('subscription_plans').select('*');
    return { data, error };
  }
};

export const paymentService = {
  async getPayments() {
    if (!isSupabaseConfigured) return { data: PAYMENTS_LOG, error: null };
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    return { data, error };
  },

  async getRevenueStats() {
    if (!isSupabaseConfigured) return { data: REVENUE_STATS, error: null };
    return { data: REVENUE_STATS, error: null };
  }
};

export const notificationService = {
  async getNotifications(userId) {
    if (!isSupabaseConfigured) return { data: NOTIFICATION_CAMPAIGNS, error: null };
    const { data, error } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return { data, error };
  },

  // Subscribe to real-time notifications for user
  subscribeToNotifications(userId, onNewNotification) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel(`public:notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        onNewNotification(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

export const analyticsService = {
  async trackEvent(eventType, entityType, entityId, metadata = {}) {
    if (!isSupabaseConfigured) return { success: true };
    await supabase.from('analytics_events').insert([{ event_type: eventType, entity_type: entityType, entity_id: entityId, metadata }]);
  },

  async getDemandHeatmap() {
    if (!isSupabaseConfigured) return { data: DEMAND_HEATMAP_CLUSTERS, error: null };
    return { data: DEMAND_HEATMAP_CLUSTERS, error: null };
  }
};

export const adminService = {
  async getSystemHealth() {
    if (!isSupabaseConfigured) return { data: SYSTEM_HEALTH_SERVICES, error: null };
    return { data: SYSTEM_HEALTH_SERVICES, error: null };
  },

  async getAuditLogs() {
    if (!isSupabaseConfigured) return { data: INITIAL_AUDIT_LOGS, error: null };
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    return { data, error };
  },

  async recordAuditLog(adminId, action, entityType, entityId, oldData = null, newData = null) {
    if (!isSupabaseConfigured) return { success: true };
    await supabase.from('audit_logs').insert([{
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_data: oldData,
      new_data: newData
    }]);
  }
};
