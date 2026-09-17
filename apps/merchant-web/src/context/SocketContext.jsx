import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createSocketClient } from '@growlocal/api-client';
import { WS_URL, getAccessToken } from '../lib/apiClient';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setConnected(false);
      return undefined;
    }

    const client = createSocketClient({ wsUrl: WS_URL, getAccessToken });
    setSocket(client);

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onConnectError = () => setConnected(false);
    client.on('connect', onConnect);
    client.on('disconnect', onDisconnect);
    client.on('connect_error', onConnectError);

    return () => {
      client.off('connect', onConnect);
      client.off('disconnect', onDisconnect);
      client.off('connect_error', onConnectError);
      client.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user?.id]);

  return <SocketContext.Provider value={{ socket, connected }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext).socket;
}

export function useSocketConnected() {
  return useContext(SocketContext).connected;
}
