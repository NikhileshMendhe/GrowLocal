import { useEffect } from 'react';
import { SOCKET_EVENTS } from '@growlocal/api-client';

import { useSocket } from '../context/SocketContext.jsx';

/**
 * Applies live `catalog` room events (§7.5) to a product list held in React
 * state — the only cache is the current session's state; no TTL, no
 * localStorage mirror. Every connection is auto-joined to `catalog`
 * server-side, so no explicit room join is needed.
 */
export default function useLiveCatalog(products, setProducts, { enabled = true } = {}) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !enabled) return undefined;

    const onCreated = (product) => {
      if (!product?.id) return;
      setProducts((prev) =>
        prev.some((item) => item.id === product.id) ? prev : [product, ...prev]
      );
    };

    const onUpdated = (product) => {
      if (!product?.id) return;
      setProducts((prev) =>
        prev.some((item) => item.id === product.id)
          ? prev.map((item) => (item.id === product.id ? { ...item, ...product } : item))
          : prev
      );
    };

    const onDeleted = (payload) => {
      const id = payload?.id ?? payload;
      if (!id) return;
      setProducts((prev) => prev.filter((item) => item.id !== id));
    };

    socket.on(SOCKET_EVENTS.PRODUCT_CREATED, onCreated);
    socket.on(SOCKET_EVENTS.PRODUCT_UPDATED, onUpdated);
    socket.on(SOCKET_EVENTS.PRODUCT_DELETED, onDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.PRODUCT_CREATED, onCreated);
      socket.off(SOCKET_EVENTS.PRODUCT_UPDATED, onUpdated);
      socket.off(SOCKET_EVENTS.PRODUCT_DELETED, onDeleted);
    };
  }, [socket, enabled, setProducts]);
}
