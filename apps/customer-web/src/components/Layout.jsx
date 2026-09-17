import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { SOCKET_EVENTS } from '@growlocal/api-client';
import {
  Bell,
  Heart,
  Home,
  LayoutGrid,
  LogOut,
  MessageCircle,
  Package,
  Search,
  User,
} from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import SocketStatusBadge from './SocketStatusBadge.jsx';

const NAV_LINK_CLASS = ({ isActive }) =>
  `text-sm font-medium rounded-lg px-3 py-1.5 transition-colors ${
    isActive ? 'text-brand bg-brand-light' : 'text-[#666666] hover:text-[#111111] hover:bg-[#F0F2F0]'
  }`;

const MOBILE_LINK_CLASS = ({ isActive }) =>
  `flex flex-col items-center gap-0.5 text-[10px] font-medium px-2 py-1 rounded-lg ${
    isActive ? 'text-brand' : 'text-[#666666]'
  }`;

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return undefined;
    }
    api
      .get(ENDPOINTS.NOTIFICATIONS.MINE, { query: { unreadOnly: true, limit: 1 } })
      .then((data) => setUnread(data.total || 0))
      .catch(() => {});
    return undefined;
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!socket || !user) return undefined;
    const onNotification = () => setUnread((count) => count + 1);
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotification);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotification);
  }, [socket, user]);

  function submitSearch(event) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  async function handleLogout() {
    await logout();
    toast('Signed out. See you soon!');
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F7]">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E5E7E5]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <img src="/growlocal-logo.png" alt="GrowLocal" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg text-brand-dark hidden sm:block">GrowLocal</span>
          </NavLink>

          <form onSubmit={submitSearch} className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search shops & products…"
                className="w-full bg-[#F7F8F7] border border-[#E5E7E5] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <NavLink to="/shops" className={NAV_LINK_CLASS}>
              Shops
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={NAV_LINK_CLASS}>
                  Orders
                </NavLink>
                <NavLink to="/enquiries" className={NAV_LINK_CLASS}>
                  Enquiries
                </NavLink>
              </>
            ) : null}
          </nav>

          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/notifications"
                  className="relative p-2 rounded-lg text-[#666666] hover:text-brand hover:bg-brand-light"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unread > 0 ? (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-brand rounded-full">
                      {unread > 99 ? '99+' : unread}
                    </span>
                  ) : null}
                </NavLink>
                <NavLink
                  to="/chat"
                  className="p-2 rounded-lg text-[#666666] hover:text-brand hover:bg-brand-light"
                  aria-label="Chats"
                >
                  <MessageCircle className="w-5 h-5" />
                </NavLink>
                <NavLink
                  to="/profile"
                  className="p-2 rounded-lg text-[#666666] hover:text-brand hover:bg-brand-light"
                  aria-label="Profile"
                >
                  <User className="w-5 h-5" />
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#666666] hover:text-red-600 hover:bg-red-50"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { from: location.pathname } })}
                  className="text-sm font-semibold text-brand px-3 py-1.5 rounded-lg hover:bg-brand-light"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] px-4 py-1.5 rounded-lg"
                >
                  Join free
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-6 pb-28 md:pb-10">
        <Outlet />
      </main>

      <footer className="hidden md:block border-t border-[#E5E7E5] py-6 text-center text-xs text-[#666666]">
        <div className="flex items-center justify-center gap-3">
          <span>GrowLocal — shop local, live local.</span>
          <SocketStatusBadge />
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#E5E7E5] pb-safe">
        <div className="flex items-center justify-around py-1.5">
          <NavLink to="/" className={MOBILE_LINK_CLASS} end>
            <Home className="w-5 h-5" />
            Home
          </NavLink>
          <NavLink to="/shops" className={MOBILE_LINK_CLASS}>
            <LayoutGrid className="w-5 h-5" />
            Shops
          </NavLink>
          <NavLink to="/search" className={MOBILE_LINK_CLASS}>
            <Search className="w-5 h-5" />
            Search
          </NavLink>
          <NavLink to="/orders" className={MOBILE_LINK_CLASS}>
            <Package className="w-5 h-5" />
            Orders
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/saved" className={MOBILE_LINK_CLASS}>
              <Heart className="w-5 h-5" />
              Saved
            </NavLink>
          ) : (
            <NavLink to="/login" className={MOBILE_LINK_CLASS}>
              <User className="w-5 h-5" />
              Sign in
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  );
}
