import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Not logged in -> Redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role -> Redirect to specific dashboard
    const rolePaths = {
      'Student': '/student',
      'Teacher': '/teacher',
      'Admin': '/admin'
    };
    return <Navigate to={rolePaths[user.role] || '/login'} replace />;
  }

  // Authorized -> Render children routes
  return <Outlet />;
}
