import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import RegistrationForm from '../components/RegistrationForm';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginErrors, setLoginErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register, error, clearError, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect admin users to admin panel, regular users to home
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Clear error when switching between login/register
  useEffect(() => {
    clearError();
  }, [isLogin, clearError]);

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (loginErrors[name]) {
      setLoginErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    
    if (!loginData.email) newErrors.email = 'Email обязателен';
    else if (!/\S+@\S+\.\S+/.test(loginData.email)) newErrors.email = 'Введите корректный email';
    
    if (!loginData.password) newErrors.password = 'Пароль обязателен';

    setLoginErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (validateLogin()) {
      setIsSubmitting(true);
      try {
        const result = await login(loginData);
        if (result.success) {
          // Navigation will be handled by the useEffect hook above
          // based on the user's role (admin or regular user)
        } else {
          setLoginErrors({ general: result.message });
        }
      } catch (error) {
        setLoginErrors({ general: 'Произошла ошибка при входе' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderLoginForm = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Вход в аккаунт</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loginErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {loginErrors.general}
        </div>
      )}
      
      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleLoginInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              loginErrors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="example@email.com"
            disabled={isSubmitting}
          />
          {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль *
          </label>
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={handleLoginInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              loginErrors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Введите пароль"
            disabled={isSubmitting}
          />
          {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-600">Запомнить меня</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
            Забыли пароль?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors font-semibold ${
            isSubmitting 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="text-center">
        <p className="text-gray-600">
          Нет аккаунта?{' '}
          <button
            onClick={() => setIsLogin(false)}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            Зарегистрироваться
          </button>
        </p>
      </div>

      {/* Admin Login Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Для администраторов:</h4>
        <div className="text-xs text-blue-600 space-y-1">
          <p><strong>Админ:</strong> admin@domli.ru / domli2024!</p>
          <p><strong>Менеджер:</strong> manager@domli.ru / manager2024!</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans bg-[#f8fbff] min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Вернуться на главную
          </Link>
        </div>
        
        <div className={`mx-auto ${isLogin ? 'max-w-2xl' : 'max-w-4xl'}`}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {isLogin ? renderLoginForm() : <RegistrationForm />}
            
            {!isLogin && (
              <div className="text-center mt-6 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Уже есть аккаунт?{' '}
                  <button
                    onClick={() => setIsLogin(true)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Войти
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 