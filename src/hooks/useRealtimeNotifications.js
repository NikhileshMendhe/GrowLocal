import { useState, useEffect } from 'react';
import { notificationService } from '../services/adminService';

export function useRealtimeNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let unsubscribe = () => {};

    async function init() {
      if (!userId) return;
      const { data } = await notificationService.getNotifications(userId);
      if (data) setNotifications(data);

      unsubscribe = notificationService.subscribeToNotifications(userId, (newNotif) => {
        setNotifications((prev) => [newNotif, ...prev]);
      });
    }

    init();

    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { notifications, setNotifications };
}
