import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BadgePercent,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  ShoppingBag,
  Sprout,
  Store,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { VerifiedBadge } from '@growlocal/ui';
import { useAuth } from '../context/AuthContext';
import { useSocketConnected } from '../context/SocketContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/enquiries', label: 'Enquiries', icon: MessageCircle },
  { to: '/offers', label: 'Offers', icon: BadgePercent },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/chats', label: 'Chats', icon: MessageCircle },
  { to: '/shop', label: 'My Shop', icon: Store },
  { to: '/subscription', label: 'Subscription', icon: Crown },
];

function NavLinks({ onNavigate }) {
  return NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-brand text-white' : 'text-[#666666] hover:bg-brand-light hover:text-brand-dark'
        }`
      }
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      <span>{label}</span>
    </NavLink>
  ));
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const connected = useSocketConnected();
  const location = useLocation();

  const activeLabel = NAV_ITEMS.find(
    (item) => item.to === location.pathname || (item.to !== '/' && location.pathname.startsWith(item.to))
  )?.label;

  return (
    <div className="min-h-screen bg-[#F7F8F7] md:pl-60 pb-16 md:pb-0">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 flex-col bg-white border-r border-[#E5E7E5] p-4 gap-4">
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-[#111111] font-[Poppins,sans-serif]">GrowLocal</p>
            <p className="text-[11px] font-medium text-[#666666]">Merchant Console</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          <NavLinks />
        </nav>

        <div className="border-t border-[#E5E7E5] pt-3 px-1">
          <div className="flex items-center gap-1.5 text-xs font-medium mb-2 px-2">
            {connected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-brand" />
                <span className="text-brand">Live updates on</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-600">Reconnecting…</span>
              </>
            )}
          </div>
          <div className="flex items-start justify-between gap-2 px-2 py-1">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111111] truncate">{user?.business_name}</p>
              <p className="text-xs text-[#666666] truncate">{user?.email}</p>
              {user?.verification_status === 'approved' && (
                <div className="mt-1.5">
                  <VerifiedBadge size="small" text="Verified" />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#666666] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#E5E7E5] px-4 py-3 flex items-center justify-between gap-3 md:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <Sprout className="w-[18px] h-[18px] text-white" />
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-bold text-[#111111] font-[Poppins,sans-serif] truncate">{activeLabel || 'GrowLocal'}</p>
            <p className="text-[11px] text-[#666666] truncate">{user?.business_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {connected ? (
            <Wifi className="w-4 h-4 text-brand" />
          ) : (
            <WifiOff className="w-4 h-4 text-amber-600" />
          )}
          <button
            onClick={logout}
            className="p-2 rounded-lg text-[#666666] hover:bg-red-50 hover:text-red-600"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white border-t border-[#E5E7E5] px-2 py-1.5 flex justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-[10px] font-medium min-w-[56px] ${
                isActive ? 'text-brand' : 'text-[#666666]'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
