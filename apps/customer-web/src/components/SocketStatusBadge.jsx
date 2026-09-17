import React from 'react';
import { WifiOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext.jsx';

export default function SocketStatusBadge() {
  const { status } = useSocket();
  if (status === 'connected') return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1"
      role="status"
      title="Live updates disconnected — content may be stale"
    >
      <WifiOff className="w-3.5 h-3.5" />
      Live updates {status === 'connecting' ? 'connecting…' : 'offline'}
    </span>
  );
}
