import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { authService } from './AuthService';
import type { User } from 'oidc-client-ts';
import Home from './components/Home';
import Profile from './components/Profile';
import Callback from './components/Callback';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService
      .getUser()
      .then(setUser)
      .catch((err) => {
        console.error('Ошибка при получении пользователя:', err);
        setUser(null);
      });
  }, []);

  const login = () => authService.signIn();
  const logout = () => authService.signOut();

  return (
    <div className="app-content">
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
            element={
              <ProtectedRoute user={user}>
                {user && (
                  <Profile
                    user={user}
                    onUserUpdate={(updatedUser) => setUser(updatedUser)}
                  />
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
