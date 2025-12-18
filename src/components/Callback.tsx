import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../AuthService';

const Callback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authService
      .handleSigninCallback()
      .then(() => {
        navigate('/profile');
      })
      .catch((err) => {
        console.error('Ошибка при обработке callback:', err);
        navigate('/');
      });
  }, [navigate]);

  return <div className="container">Загрузка профиля...</div>;
};

export default Callback;


