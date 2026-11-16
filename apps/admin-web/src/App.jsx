import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Activities from './pages/Activities';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="products" element={<Products />} />
                <Route path="orders" element={<Orders />} />
                <Route path="customers" element={<Customers />} />
                <Route path="activities" element={<Activities />} />
                {/* Safe redirects for decommissioned merchant routes */}
                <Route path="shops" element={<Navigate to="/products" replace />} />
                <Route path="shop-verifications" element={<Navigate to="/products" replace />} />
                <Route path="product-approvals" element={<Navigate to="/products" replace />} />
                <Route path="merchants" element={<Navigate to="/products" replace />} />
                <Route path="campaigns" element={<Navigate to="/" replace />} />
                <Route path="creators" element={<Navigate to="/" replace />} />
                <Route path="audit-logs" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
