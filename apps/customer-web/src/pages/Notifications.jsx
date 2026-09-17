import React, { useEffect, useState } from 'react';
import { SOCKET_EVENTS } from '@growlocal/api-client';
import { Bell, BellRing, CheckCheck, Loader2 } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useSocket } from '../context/SocketContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { formatDateTime } from '../lib/format';

const TYPE_ICONS = {
  offer_created: '🏷️',
  offer_accepted: '✅',
  offer_rejected: '❌',
  order_created: '🧾',
  order_status_changed: '📦',
  enquiry_created: '💬',
  message_created: '💬',
  demand_response_created: '📢',
};

export default function Notifications() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(ENDPOINTS.NOTIFICATIONS.MINE, { query: { limit: 50 } })
      .then((data) => setNotifications(data.notifications || []))
      .catch((err) => setError(err.message || 'Could not load notifications'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return undefined;
    const onNotification = (notification) => {
      if (!notification?.id) return;
      setNotifications((prev) =>
        prev.some((item) => item.id === notification.id) ? prev : [notification, ...prev]
      );
    };
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotification);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotification);
  }, [socket]);

  async function markRead(id) {
    try {
      const data = await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? data.notification || { ...item, is_read: true } : item))
      );
    } catch {
      // non-critical
    }
  }

  async function markAllRead() {
    try {
      await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch {
      // non-critical
    }
  }

  const unread = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Notifications</h1>
          <p className="text-sm text-[#666666] mt-1">
            {unread > 0 ? `${unread} unread` : "You're all caught up"}
          </p>
        </div>
        {unread > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-brand bg-brand-light border border-brand/20 hover:border-brand rounded-lg"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        ) : null}
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand animate-spin" />
        </div>
      ) : error ? (
        <EmptyState title="Something went wrong" subtitle={error} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          subtitle="Order updates, offers and shop replies will land here — live."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => !notification.is_read && markRead(notification.id)}
              className={`w-full text-left flex items-start gap-3 bg-white border rounded-xl p-4 hover:border-brand ${
                notification.is_read ? 'border-[#E5E7E5]' : 'border-brand/40 bg-brand-light/30'
              }`}
            >
              <span className="w-9 h-9 rounded-full bg-[#F7F8F7] border border-[#E5E7E5] flex items-center justify-center text-base shrink-0">
                {TYPE_ICONS[notification.type] || <BellRing className="w-4 h-4 text-brand" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#111111]">{notification.title}</span>
                  {!notification.is_read ? (
                    <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  ) : null}
                </span>
                <span className="block text-sm text-[#666666] mt-0.5">
                  {notification.message}
                </span>
                <span className="block text-xs text-[#999999] mt-1">
                  {formatDateTime(notification.created_at)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
