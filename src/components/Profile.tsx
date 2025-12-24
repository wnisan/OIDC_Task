import { useEffect, useState } from 'react';
import type { User } from 'oidc-client-ts';
import { authService } from '../AuthService';

interface ProfileProps {
  user: User;
  onUserUpdate?: (user: User | null) => void;
}

const Profile = ({ user: initialUser, onUserUpdate }: ProfileProps) => {
  const [user, setUser] = useState<User>(initialUser);

  // Обновляем локальное состояние пользователя при изменении
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Автоматически обновляем токен, если он истёк
  useEffect(() => {
    const checkAndRefreshToken = async () => {
      const refreshedUser = await authService.refreshTokenIfNeeded();
      if (refreshedUser && refreshedUser.access_token !== initialUser.access_token) {
        setUser(refreshedUser);
        if (onUserUpdate) {
          onUserUpdate(refreshedUser);
        }
      }
    };

    checkAndRefreshToken();
  }, [initialUser, onUserUpdate]);

  return (
    <div className="container">
      <h2>Привет, {user.profile.name || user.profile.sub}!</h2>
      <p>Email: {user.profile.email || 'Не указан'}</p>
    </div>
  );
};

export default Profile;