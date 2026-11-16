import React from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import { FullScreenLoader } from './components/ui';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Enquiries from './pages/Enquiries';
import Offers from './pages/Offers';
import Products from './pages/Products';
import Conversations from './pages/Conversations';
import ShopProfile from './pages/ShopProfile';
import Subscription from './pages/Subscription';

function RequireAuth() {
  const { status } = useAuth();
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function AppRoutes() {
  const { status } = useAuth();
  if (status === 'loading') return <FullScreenLoader />;
  return (
    <Routes>
      <Route path="/login" element={<Login initialMode="login" />} />
      <Route path="/signup" element={<Login initialMode="signup" />} />
      <Route path="/register" element={<Login initialMode="signup" />} />
      <Route element={<RequireAuth />}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="enquiries" element={<Enquiries />} />
        <Route path="offers" element={<Offers />} />
        <Route path="products" element={<Products />} />
        <Route path="chats" element={<Conversations />} />
        <Route path="shop" element={<ShopProfile />} />
        <Route path="subscription" element={<Subscription />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <AppRoutes />
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

