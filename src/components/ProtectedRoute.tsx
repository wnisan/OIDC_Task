import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { User } from 'oidc-client-ts';

interface ProtectedRouteProps {
  user: User | null;
  children: ReactNode;
}

// Если пользователя нет, перенаправляем на главную.
const ProtectedRoute = ({ user, children }: ProtectedRouteProps) => {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;


