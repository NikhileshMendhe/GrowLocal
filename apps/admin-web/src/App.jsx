import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Shops from './pages/Shops';
import ShopVerifications from './pages/ShopVerifications';
import ProductApprovals from './pages/ProductApprovals';
import Merchants from './pages/Merchants';
import Customers from './pages/Customers';
import Campaigns from './pages/Campaigns';
import Creators from './pages/Creators';
import AuditLogs from './pages/AuditLogs';

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
                <Route path="shops" element={<Shops />} />
                <Route path="shop-verifications" element={<ShopVerifications />} />
                <Route path="product-approvals" element={<ProductApprovals />} />
                <Route path="merchants" element={<Merchants />} />
                <Route path="customers" element={<Customers />} />
                <Route path="campaigns" element={<Campaigns />} />
                <Route path="creators" element={<Creators />} />
                <Route path="audit-logs" element={<AuditLogs />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
