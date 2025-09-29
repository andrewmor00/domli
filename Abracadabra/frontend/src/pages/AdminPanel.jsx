import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdminStatistics from '../components/admin/AdminStatistics';
import AdminPropertyRatings from '../components/admin/AdminPropertyRatings';
import AdminPropertyEditor from '../components/admin/AdminPropertyEditor';
import AdminSettings from '../components/admin/AdminSettings';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('statistics');
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  React.useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">У вас нет прав для доступа к админ-панели</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'statistics', label: 'Статистика', icon: '📊' },
    { id: 'ratings', label: 'Рейтинг квартир', icon: '📈' },
    { id: 'editor', label: 'Редактор объектов', icon: '✏️' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <AdminStatistics />;
      case 'ratings':
        return <AdminPropertyRatings />;
      case 'editor':
        return <AdminPropertyEditor />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminStatistics />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Admin Panel Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Админ-панель Домли</h1>
          <p className="text-gray-600">Добро пожаловать, {user?.firstName || 'Администратор'}</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminPanel; 