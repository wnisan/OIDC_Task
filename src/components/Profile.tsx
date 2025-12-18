import { useState } from 'react';
import type { User } from 'oidc-client-ts';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

interface ProfileProps {
  user: User;
}

const Profile = ({ user }: ProfileProps) => {
  const [apiMessage, setApiMessage] = useState('');

  const fetchProtectedData = async () => {
    const token = user?.access_token;
    if (!token) {
      setApiMessage('Токен доступа отсутствует.');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/protected`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setApiMessage('Доступ запрещён: токен невалиден или истёк.');
          return;
        }
        throw new Error(`Ошибка сети или сервера: ${response.statusText}`);
      }

      const data = await response.json();
      setApiMessage(data.message);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setApiMessage(`Ошибка при вызове API: ${error.message}`);
      } else {
        setApiMessage('Произошла неизвестная ошибка.');
      }
    }
  };

  return (
    <div className="container">
      <h2>Привет, {user.profile.name || user.profile.sub}!</h2>
      <button onClick={fetchProtectedData}>Вызвать защищенный API</button>
      {apiMessage && <p>Ответ API: {apiMessage}</p>}
    </div>
  );
};

export default Profile;


