import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
  const [activeSection, setActiveSection] = useState('system');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Домли',
    siteDescription: 'Платформа для поиска недвижимости',
    contactEmail: 'admin@domli.ru',
    contactPhone: '+7 (800) 123-45-67',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileSize: '10', // MB
    allowedFileTypes: 'jpg,jpeg,png,webp,pdf'
  });

  // Analytics Settings
  const [analyticsSettings, setAnalyticsSettings] = useState({
    googleAnalyticsId: '',
    yandexMetricaId: '',
    enableHeatmaps: false,
    trackUserActivity: true,
    dataRetentionDays: '365'
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: '8',
    requireSpecialChars: true,
    sessionTimeout: '24', // hours
    maxLoginAttempts: '5',
    enableTwoFactor: false,
    ipWhitelist: '',
    autoBackup: true,
    backupFrequency: 'daily'
  });

  useEffect(() => {
    fetchUsers();
    loadSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      // Mock users data - in real app this would be an API call
      setUsers([
        { id: 1, name: 'Иван Иванов', email: 'ivan@example.com', role: 'admin', status: 'active', lastLogin: '2024-01-15 10:30' },
        { id: 2, name: 'Мария Петрова', email: 'maria@example.com', role: 'moderator', status: 'active', lastLogin: '2024-01-14 16:45' },
        { id: 3, name: 'Алексей Сидоров', email: 'alexey@example.com', role: 'user', status: 'inactive', lastLogin: '2024-01-10 09:15' }
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Ошибка загрузки пользователей');
    }
  };

  const loadSettings = async () => {
    try {
      // In a real app, this would load settings from the backend
      console.log('Settings loaded');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAnalyticsSettingChange = (key, value) => {
    setAnalyticsSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecuritySettingChange = (key, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async (settingsType) => {
    setLoading(true);
    try {
      // In a real app, this would save settings to the backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Настройки успешно сохранены');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success(`Пользователь ${newStatus === 'active' ? 'активирован' : 'деактивирован'}`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Ошибка изменения статуса пользователя');
    }
  };

  const exportData = async (dataType) => {
    setLoading(true);
    try {
      // In a real app, this would export data from the backend
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate export
      toast.success(`${dataType} успешно экспортированы`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Ошибка экспорта данных');
    } finally {
      setLoading(false);
    }
  };

  const performBackup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate backup
      toast.success('Резервная копия создана успешно');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Ошибка создания резервной копии');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate cache clear
      toast.success('Кэш очищен');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Ошибка очистки кэша');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'system', label: 'Система', icon: '⚙️' },
    { id: 'users', label: 'Пользователи', icon: '👥' },
    { id: 'analytics', label: 'Аналитика', icon: '📊' },
    { id: 'security', label: 'Безопасность', icon: '🔒' },
    { id: 'backup', label: 'Резервные копии', icon: '💾' }
  ];

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Основные настройки</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название сайта
          </label>
          <input
            type="text"
            value={systemSettings.siteName}
            onChange={(e) => handleSystemSettingChange('siteName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email для связи
          </label>
          <input
            type="email"
            value={systemSettings.contactEmail}
            onChange={(e) => handleSystemSettingChange('contactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Телефон для связи
          </label>
          <input
            type="tel"
            value={systemSettings.contactPhone}
            onChange={(e) => handleSystemSettingChange('contactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Максимальный размер файла (МБ)
          </label>
          <input
            type="number"
            value={systemSettings.maxFileSize}
            onChange={(e) => handleSystemSettingChange('maxFileSize', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание сайта
        </label>
        <textarea
          value={systemSettings.siteDescription}
          onChange={(e) => handleSystemSettingChange('siteDescription', e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Разрешенные типы файлов
        </label>
        <input
          type="text"
          value={systemSettings.allowedFileTypes}
          onChange={(e) => handleSystemSettingChange('allowedFileTypes', e.target.value)}
          placeholder="jpg,jpeg,png,webp,pdf"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Функции сайта</h4>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="maintenanceMode"
            checked={systemSettings.maintenanceMode}
            onChange={(e) => handleSystemSettingChange('maintenanceMode', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700">
            Режим технического обслуживания
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="registrationEnabled"
            checked={systemSettings.registrationEnabled}
            onChange={(e) => handleSystemSettingChange('registrationEnabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="registrationEnabled" className="ml-2 text-sm text-gray-700">
            Разрешить регистрацию новых пользователей
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={systemSettings.emailNotifications}
            onChange={(e) => handleSystemSettingChange('emailNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
            Email уведомления
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="smsNotifications"
            checked={systemSettings.smsNotifications}
            onChange={(e) => handleSystemSettingChange('smsNotifications', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="smsNotifications" className="ml-2 text-sm text-gray-700">
            SMS уведомления
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => saveSettings('system')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Управление пользователями</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => exportData('Пользователи')}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Экспорт пользователей
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Пользователь</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Email</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Роль</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Статус</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Последний вход</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100">
                  <td className="py-4 px-6 font-medium text-gray-900">{user.name}</td>
                  <td className="py-4 px-6 text-gray-700">{user.email}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'moderator' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700 text-sm">{user.lastLogin}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.status)}
                      className={`text-sm font-medium ${
                        user.status === 'active' 
                          ? 'text-red-600 hover:text-red-800' 
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Настройки аналитики</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Google Analytics ID
          </label>
          <input
            type="text"
            value={analyticsSettings.googleAnalyticsId}
            onChange={(e) => handleAnalyticsSettingChange('googleAnalyticsId', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Яндекс.Метрика ID
          </label>
          <input
            type="text"
            value={analyticsSettings.yandexMetricaId}
            onChange={(e) => handleAnalyticsSettingChange('yandexMetricaId', e.target.value)}
            placeholder="12345678"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Период хранения данных (дни)
          </label>
          <select
            value={analyticsSettings.dataRetentionDays}
            onChange={(e) => handleAnalyticsSettingChange('dataRetentionDays', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="30">30 дней</option>
            <option value="90">90 дней</option>
            <option value="365">1 год</option>
            <option value="730">2 года</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableHeatmaps"
            checked={analyticsSettings.enableHeatmaps}
            onChange={(e) => handleAnalyticsSettingChange('enableHeatmaps', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enableHeatmaps" className="ml-2 text-sm text-gray-700">
            Включить тепловые карты
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="trackUserActivity"
            checked={analyticsSettings.trackUserActivity}
            onChange={(e) => handleAnalyticsSettingChange('trackUserActivity', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="trackUserActivity" className="ml-2 text-sm text-gray-700">
            Отслеживать активность пользователей
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => saveSettings('analytics')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Настройки безопасности</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Минимальная длина пароля
          </label>
          <select
            value={securitySettings.passwordMinLength}
            onChange={(e) => handleSecuritySettingChange('passwordMinLength', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="6">6 символов</option>
            <option value="8">8 символов</option>
            <option value="10">10 символов</option>
            <option value="12">12 символов</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Время сессии (часы)
          </label>
          <select
            value={securitySettings.sessionTimeout}
            onChange={(e) => handleSecuritySettingChange('sessionTimeout', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">1 час</option>
            <option value="8">8 часов</option>
            <option value="24">24 часа</option>
            <option value="168">1 неделя</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Максимум попыток входа
          </label>
          <select
            value={securitySettings.maxLoginAttempts}
            onChange={(e) => handleSecuritySettingChange('maxLoginAttempts', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="3">3 попытки</option>
            <option value="5">5 попыток</option>
            <option value="10">10 попыток</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Частота резервного копирования
          </label>
          <select
            value={securitySettings.backupFrequency}
            onChange={(e) => handleSecuritySettingChange('backupFrequency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Ежедневно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Белый список IP-адресов (через запятую)
        </label>
        <textarea
          value={securitySettings.ipWhitelist}
          onChange={(e) => handleSecuritySettingChange('ipWhitelist', e.target.value)}
          rows="3"
          placeholder="192.168.1.1, 10.0.0.1"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="requireSpecialChars"
            checked={securitySettings.requireSpecialChars}
            onChange={(e) => handleSecuritySettingChange('requireSpecialChars', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requireSpecialChars" className="ml-2 text-sm text-gray-700">
            Требовать спецсимволы в пароле
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="enableTwoFactor"
            checked={securitySettings.enableTwoFactor}
            onChange={(e) => handleSecuritySettingChange('enableTwoFactor', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="enableTwoFactor" className="ml-2 text-sm text-gray-700">
            Включить двухфакторную аутентификацию
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="autoBackup"
            checked={securitySettings.autoBackup}
            onChange={(e) => handleSecuritySettingChange('autoBackup', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoBackup" className="ml-2 text-sm text-gray-700">
            Автоматическое резервное копирование
          </label>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={() => saveSettings('security')}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Резервные копии и обслуживание</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Actions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Резервное копирование</h4>
          <div className="space-y-3">
            <button
              onClick={performBackup}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Создание резервной копии...' : 'Создать резервную копию'}
            </button>
            
            <button
              onClick={() => exportData('База данных')}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Экспорт базы данных
            </button>
            
            <button
              onClick={() => exportData('Настройки')}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Экспорт настроек
            </button>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Обслуживание системы</h4>
          <div className="space-y-3">
            <button
              onClick={clearCache}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Очистка кэша...' : 'Очистить кэш'}
            </button>
            
            <button
              onClick={() => exportData('Логи')}
              disabled={loading}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Скачать логи
            </button>
            
            <button
              onClick={() => {
                if (confirm('Вы уверены? Это действие нельзя отменить.')) {
                  toast.success('Старые данные очищены');
                }
              }}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Очистить старые данные
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Состояние системы</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-sm text-gray-600">Время работы</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">2.3 ГБ</div>
            <div className="text-sm text-gray-600">Использовано места</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">1,247</div>
            <div className="text-sm text-gray-600">Активных пользователей</div>
          </div>
        </div>
      </div>

      {/* Recent Backups */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Последние резервные копии</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-700">backup_2024-01-15_10-30.sql</span>
            <span className="text-sm text-gray-500">15 янв 2024, 10:30</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-700">backup_2024-01-14_10-30.sql</span>
            <span className="text-sm text-gray-500">14 янв 2024, 10:30</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-700">backup_2024-01-13_10-30.sql</span>
            <span className="text-sm text-gray-500">13 янв 2024, 10:30</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'system':
        return renderSystemSettings();
      case 'users':
        return renderUserManagement();
      case 'analytics':
        return renderAnalyticsSettings();
      case 'security':
        return renderSecuritySettings();
      case 'backup':
        return renderBackupSettings();
      default:
        return renderSystemSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Настройки системы</h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Section Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {renderSectionContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 