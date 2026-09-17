import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createSocketClient } from '@growlocal/api-client';

import { WS_URL, getAccessToken, refreshSession } from '../lib/apiClient';
import { useAuth } from './AuthContext.jsx';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('connecting');
  const authKey = user?.id ?? null;

  useEffect(() => {
    if (!WS_URL) return undefined;

    const client = createSocketClient({ wsUrl: WS_URL, getAccessToken });
    setSocket(client);

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onConnectError = (error) => {
      setStatus('error');
      if (String(error?.message || '').includes('unauthorized') && getAccessToken()) {
        // refreshSession rotates the in-memory token (or clears it when the
        // session is gone); the auth callback re-reads it on the next
        // reconnect attempt, so no manual reconnect is needed here.
        refreshSession().catch(() => {});
      }
    };

    client.on('connect', onConnect);
    client.on('disconnect', onDisconnect);
    client.on('connect_error', onConnectError);

    return () => {
      client.off('connect', onConnect);
      client.off('disconnect', onDisconnect);
      client.off('connect_error', onConnectError);
      client.close();
      setSocket(null);
      setStatus('connecting');
    };
  }, [authKey]);

  const value = useMemo(() => ({ socket, status, connected: status === 'connected' }), [
    socket,
    status,
  ]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
