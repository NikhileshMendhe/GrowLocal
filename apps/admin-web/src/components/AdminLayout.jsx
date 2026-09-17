import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  LayoutDashboard,
  Leaf,
  LogOut,
  Megaphone,
  Menu,
  PackageCheck,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { humanize } from '../lib/format';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/shops', label: 'Shops', icon: Store },
  { to: '/shop-verifications', label: 'Verifications', icon: ShieldCheck },
  { to: '/product-approvals', label: 'Product Approvals', icon: PackageCheck },
  { to: '/merchants', label: 'Merchants', icon: Briefcase },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { to: '/creators', label: 'Creators', icon: Sparkles },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
];

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const adminName = admin?.full_name || admin?.fullName || admin?.name || 'Admin';
  const adminEmail = admin?.email || '';
  const adminRole = admin?.role_name || admin?.roleName || null;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[#E5E7E5] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <p className="font-semibold text-[#111111]">GrowLocal</p>
          <p className="text-xs text-[#666666]">Admin Console</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-light text-brand-dark'
                  : 'text-[#666666] hover:bg-[#F7F8F7] hover:text-[#111111]'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[#E5E7E5] p-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-light text-brand-dark flex items-center justify-center text-sm font-semibold shrink-0">
            {initials(adminName)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-sm font-medium text-[#111111] truncate">{adminName}</p>
            <p className="text-xs text-[#666666] truncate">
              {[adminRole ? humanize(adminRole) : null, adminEmail].filter(Boolean).join(' · ') || '—'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 rounded-lg text-[#666666] hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E5E7E5] z-30">
        {sidebar}
      </aside>

      {menuOpen ? (
        <div className="lg:hidden fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative w-72 max-w-[85%] bg-white h-full">{sidebar}</aside>
        </div>
      ) : null}

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-white border-b border-[#E5E7E5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#111111]">GrowLocal Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="p-2 rounded-lg text-[#666666] hover:text-[#111111] hover:bg-[#F7F8F7]"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function initials(name) {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
