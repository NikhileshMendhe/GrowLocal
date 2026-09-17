import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import EmptyState from './components/EmptyState.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Shops from './pages/Shops.jsx';
import ShopProfile from './pages/ShopProfile.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Search from './pages/Search.jsx';
import Orders from './pages/Orders.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Enquiries from './pages/Enquiries.jsx';
import Chat from './pages/Chat.jsx';
import SavedShops from './pages/SavedShops.jsx';
import DemandRequests from './pages/DemandRequests.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';

function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      subtitle="The page you're looking for doesn't exist — maybe start from home?"
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shops" element={<Shops />} />
        <Route path="/shops/:id" element={<ShopProfile />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/search" element={<Search />} />
        <Route
          path="/orders"
          element={
            <RequireAuth>
              <Orders />
            </RequireAuth>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <RequireAuth>
              <OrderDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/enquiries"
          element={
            <RequireAuth>
              <Enquiries />
            </RequireAuth>
          }
        />
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />
        <Route
          path="/saved"
          element={
            <RequireAuth>
              <SavedShops />
            </RequireAuth>
          }
        />
        <Route
          path="/demand"
          element={
            <RequireAuth>
              <DemandRequests />
            </RequireAuth>
          }
        />
        <Route
          path="/notifications"
          element={
            <RequireAuth>
              <Notifications />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
