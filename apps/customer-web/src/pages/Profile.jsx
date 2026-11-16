import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut, Mail, MapPin, Phone, Save, User } from 'lucide-react';

import { ENDPOINTS, api } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { initials } from '../lib/format';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(ENDPOINTS.CUSTOMERS.ME)
      .then((data) => {
        setFullName(data.customer?.full_name || '');
        setPhone(data.customer?.phone || '');
      })
      .catch(() => {});
  }, []);

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const data = await api.patch(ENDPOINTS.CUSTOMERS.ME, {
        fullName: fullName.trim(),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
      });
      setFullName(data.customer?.full_name || fullName);
      setPhone(data.customer?.phone || '');
      toast('Profile updated!');
    } catch (err) {
      setError(err.message || 'Could not update your profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    toast('Signed out. See you soon!');
    navigate('/');
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white border border-[#E5E7E5] rounded-2xl p-6 flex items-center gap-4">
        <span className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-xl font-bold text-brand">
          {initials(user?.full_name)}
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#111111] truncate">{user?.full_name}</h1>
          <p className="text-sm text-[#666666] truncate flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
          </p>
        </div>
      </div>

      <form onSubmit={save} className="bg-white border border-[#E5E7E5] rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
          Edit profile
        </h2>
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Full name
          </label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              className="w-full border border-[#E5E7E5] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
            Phone
          </label>
          <div className="relative mt-1.5">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Optional"
              className="w-full border border-[#E5E7E5] rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>
        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-brand hover:bg-[#0F752C] rounded-lg disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => navigate('/search')}
          className="flex items-center gap-3 bg-white border border-[#E5E7E5] rounded-xl p-4 hover:border-brand text-left transition-colors cursor-pointer"
        >
          <User className="w-5 h-5 text-brand" />
          <span>
            <span className="block text-sm font-semibold text-[#111111]">Browse Catalog</span>
            <span className="block text-xs text-[#666666]">Explore all products</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="flex items-center gap-3 bg-white border border-[#E5E7E5] rounded-xl p-4 hover:border-brand text-left transition-colors cursor-pointer"
        >
          <MapPin className="w-5 h-5 text-brand" />
          <span>
            <span className="block text-sm font-semibold text-[#111111]">My Orders</span>
            <span className="block text-xs text-[#666666]">View active & past orders</span>
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:border-red-400 rounded-lg"
      >
        <LogOut className="w-4 h-4" /> Sign out
      </button>
    </div>
  );
}
