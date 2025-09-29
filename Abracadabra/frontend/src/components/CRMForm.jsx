import React, { useState, useEffect } from 'react';
import bitrixService from '../services/bitrix';
import { ReservationService } from '../services/api';
import Toast from './Toast';

const reservationService = new ReservationService();

const CRMForm = ({ isOpen, onClose, propertyData = {}, userData = null, isAuthenticated = false }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [toasts, setToasts] = useState([]);

  // Auto-fill form when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.full_name || userData.name || prev.name,
        phone: userData.phone || prev.phone,
        email: userData.email || prev.email,
        message: prev.message // Keep existing message
      }));
    }
  }, [isAuthenticated, userData, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Only reset if user is not authenticated, otherwise keep user data
      if (!isAuthenticated) {
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
        });
      } else {
        // Keep user data but reset message
        setFormData(prev => ({
          ...prev,
          message: ''
        }));
      }
    }
  }, [isOpen, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toast functions
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    const newToast = { id, message, type };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Подготовка данных для отправки
      const leadData = {
        title: `Заявка с сайта: ${propertyData?.name || 'Недвижимость'}`,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        comments: `
Сообщение: ${formData.message}

=== ИНФОРМАЦИЯ О НЕДВИЖИМОСТИ ===
Название: ${propertyData?.name || 'Не указано'}
Расположение: ${propertyData?.location || propertyData?.address || 'Не указано'}
Цена: ${propertyData?.price || propertyData?.formatted_price || 'Не указано'}
Площадь: ${propertyData?.area || 'Не указано'}
Комнат: ${propertyData?.rooms || 'Не указано'}
Застройщик: ${propertyData?.developer || 'Не указано'}
Проект: ${propertyData?.project || 'Не указано'}

=== КОНТАКТНЫЕ ДАННЫЕ ===
Имя: ${formData.name}
Телефон: ${formData.phone}
Email: ${formData.email || 'Не указан'}

Источник: Сайт недвижимости
Дата: ${new Date().toLocaleString('ru-RU')}
        `.trim(),
        source: 'Сайт недвижимости',
        // Цена сделки
        opportunity: bitrixService.parsePrice(propertyData?.price || propertyData?.formatted_price || '0'),
        currency: 'RUB',
        // Дополнительные поля недвижимости
        propertyId: propertyData?.id,
        propertyType: propertyData?.property_type,
        propertyArea: propertyData?.area,
        propertyRooms: propertyData?.rooms
      };

      // Логирование для отладки цены
      const priceValue = propertyData?.price || propertyData?.formatted_price || '0';
      console.log('🔍 Отладка цены - ДО парсинга:', {
        priceValue: priceValue,
        priceValueType: typeof priceValue,
        originalPrice: propertyData?.price,
        originalPriceType: typeof propertyData?.price,
        formattedPrice: propertyData?.formatted_price,
        formattedPriceType: typeof propertyData?.formatted_price,
        propertyData: propertyData
      });
      
      const parsedPrice = bitrixService.parsePrice(priceValue);
      console.log('🔍 Отладка цены - ПОСЛЕ парсинга:', {
        parsedPrice: parsedPrice,
        parsedPriceType: typeof parsedPrice
      });

      // Отправка в Битрикс24 (используем сделку для лучшей работы с ценами)
      const result = await bitrixService.sendDeal(leadData);

      if (result.success) {
        let successMessage = `Заявка успешно отправлена! Создан контакт (ID: ${result.contactId}) и сделка (ID: ${result.dealId}) в CRM. Менеджер свяжется с вами в ближайшее время.`;
        
        // Создаем бронирование для авторизованных пользователей
        if (isAuthenticated && propertyData?.id) {
          try {
            console.log('🔖 CRMForm: Creating reservation for property', propertyData.id);
            const reservationResponse = await reservationService.createReservation(
              propertyData.id, 
              `Заявка через форму: ${formData.message || 'Интерес к объекту'}`
            );
            
            if (reservationResponse.success) {
              console.log('✅ CRMForm: Reservation created successfully');
              successMessage += ` Объект добавлен в ваши забронированные.`;
            } else {
              console.warn('⚠️ CRMForm: Reservation creation failed:', reservationResponse.error);
              // Don't show error for reservation failure, as the main form submission was successful
            }
          } catch (reservationError) {
            console.error('❌ CRMForm: Error creating reservation:', reservationError);
            // Don't show error for reservation failure, as the main form submission was successful
          }
        }
        
        showToast(successMessage, 'success');
        
        // Сброс формы (с учетом авторизации)
        if (isAuthenticated && userData) {
          // Для авторизованных пользователей сохраняем их данные, очищаем только сообщение
          setFormData(prev => ({
            ...prev,
            message: ''
          }));
        } else {
          // Для неавторизованных пользователей очищаем все поля
          setFormData({
            name: '',
            phone: '',
            email: '',
            message: ''
          });
        }
        
        // Закрытие модального окна после небольшой задержки, чтобы показать toast
        setTimeout(() => {
          onClose();
        }, 3000); // Slightly longer delay to show the reservation message
      } else {
        throw new Error(result.error || 'Неизвестная ошибка');
      }

    } catch (error) {
      console.error('Ошибка отправки заявки:', error);
      showToast('Ошибка отправки заявки. Попробуйте позже или свяжитесь с нами по телефону.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-800">Связаться с менеджером</h2>
              {isAuthenticated && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full border border-green-200">
                  ✓ Данные заполнены
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          {propertyData.name && (
            <p className="text-sm text-gray-600 mt-2">
              По объекту: {propertyData.name}
            </p>
          )}
          {isAuthenticated && (
            <p className="text-xs text-blue-600 mt-2">
              💡 Ваши контактные данные автоматически заполнены из профиля
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
                {isAuthenticated && userData?.name && (
                  <span className="ml-1 text-xs text-green-600">• автозаполнено</span>
                )}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isAuthenticated && userData?.name 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Ваше имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон *
                {isAuthenticated && userData?.phone && (
                  <span className="ml-1 text-xs text-green-600">• автозаполнено</span>
                )}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isAuthenticated && userData?.phone 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
                {isAuthenticated && userData?.email && (
                  <span className="ml-1 text-xs text-green-600">• автозаполнено</span>
                )}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isAuthenticated && userData?.email 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300'
                }`}
                placeholder="example@mail.ru"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Сообщение
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Дополнительная информация или вопросы..."
              />
            </div>

            {/* Property Info Display */}
            {propertyData.name && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm font-medium text-gray-800">Информация об объекте:</p>
                <p className="text-sm text-gray-600">• {propertyData.name}</p>
                {propertyData.formatted_price && (
                  <p className="text-sm text-gray-600">• Цена: {propertyData.formatted_price}</p>
                )}
                {propertyData.developer && (
                  <p className="text-sm text-gray-600">• Застройщик: {propertyData.developer}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Toast notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={4000}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default CRMForm; 