import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './StateViews';

export default function ProtectedRoute() {
  const { admin, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F7]">
        <Spinner className="w-8 h-8 text-brand" />
      </div>
    );
  }

  const isAdmin = Boolean(
    admin &&
    (admin.role_name === 'admin' || admin.role === 'admin' || admin.type === 'admin')
  );

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
