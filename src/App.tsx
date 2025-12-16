import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { authService } from './AuthService';
import { User } from 'oidc-client-ts'; 
import './App.css';

const Home = () => <h2>Главная страница (Публичная)</h2>;
const Profile = ({ user }: { user: User | null }) => {
  const [apiMessage, setApiMessage] = useState('');

  const fetchProtectedData = async () => {
    // проверка наличия токена
    const token = user?.access_token;
    if (!token) {
      setApiMessage('Токен доступа отсутствует.');
      return;
    }

    try {
      // Бэкенд в dev-режиме работает по http
      const response = await fetch('http://localhost:3000/protected', {
        headers: {
          Authorization: `Bearer ${token}`, // Отправляем JWT в заголовке
        },
      });
      
      if (!response.ok) {
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
    <div>
      <h2>Привет, {user?.profile.name || user?.profile.sub}!</h2>
      <button onClick={fetchProtectedData}>Вызвать защищенный API</button>
      {apiMessage && <p>Ответ API: {apiMessage}</p>}
    </div>
  );
};

const Callback = () => {
  const navigate = useNavigate();
  useEffect(() => {
    authService.handleSigninCallback().then(() => {
      navigate('/profile');
    }).catch(console.error);
  }, [navigate]);
  return <div>Загрузка профиля...</div>;
};


function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.getUser().then(setUser).catch(console.error);
  }, []);

  const login = () => authService.signIn();
  const logout = () => authService.signOut();

  return (
    <Router>
      <nav>
        <Link to="/">Главная</Link> |
        {user ? (
          <>
            <Link to="/profile">Профиль</Link> |
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <button onClick={login}>Войти</button>
        )}
      </nav>
      <hr />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin-callback" element={<Callback />} />
        <Route 
          path="/profile" 
          element={user ? <Profile user={user} /> : <Home />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
