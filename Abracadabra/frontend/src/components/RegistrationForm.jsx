import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RegistrationForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Registration fields
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Additional questions
    propertyType: '',
    rooms: '',
    roomsCustom: '',
    area: '',
    areaCustom: '',
    budget: '',
    budgetCustom: '',
    moveInDate: '',
    livingWith: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear custom field when selecting predefined option
      [`${name}Custom`]: ''
    }));
    
    // Clear error when user makes selection
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCustomInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear radio selection when typing custom value
      [name.replace('Custom', '')]: ''
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.email) newErrors.email = 'Email обязателен';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Введите корректный email';
    
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    else if (formData.password.length < 6) newErrors.password = 'Пароль должен содержать минимум 6 символов';
    else if (!/^(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать буквы и цифры';
    }
    
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Подтвердите пароль';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Пароли не совпадают';
    
    if (!formData.firstName) newErrors.firstName = 'Имя обязательно';
    else if (formData.firstName.length < 2 || formData.firstName.length > 50) {
      newErrors.firstName = 'Имя должно содержать от 2 до 50 символов';
    }
    else if (!/^[a-zA-Zа-яёА-ЯЁ\s-]+$/.test(formData.firstName)) {
      newErrors.firstName = 'Имя может содержать только буквы (русские или английские), пробелы и дефисы';
    }
    
    if (!formData.lastName) newErrors.lastName = 'Фамилия обязательна';
    else if (formData.lastName.length < 2 || formData.lastName.length > 50) {
      newErrors.lastName = 'Фамилия должна содержать от 2 до 50 символов';
    }
    else if (!/^[a-zA-Zа-яёА-ЯЁ\s-]+$/.test(formData.lastName)) {
      newErrors.lastName = 'Фамилия может содержать только буквы (русские или английские), пробелы и дефисы';
    }
    
    if (!formData.phone) newErrors.phone = 'Телефон обязателен';
    else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = 'Телефон должен содержать только цифры';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.propertyType) newErrors.propertyType = 'Выберите тип недвижимости';
    else if (!['apartment', 'penthouse', 'commercial'].includes(formData.propertyType)) {
      newErrors.propertyType = 'Неверный тип недвижимости';
    }
    
    if (!formData.budget && !formData.budgetCustom) newErrors.budget = 'Выберите бюджет или укажите свой';
    if (!formData.moveInDate) newErrors.moveInDate = 'Выберите срок заезда';
    if (!formData.livingWith) newErrors.livingWith = 'Выберите с кем будете жить';

    // Validate rooms/area based on property type
    if (formData.propertyType === 'apartment' || formData.propertyType === 'penthouse') {
      if (!formData.rooms && !formData.roomsCustom) newErrors.rooms = 'Выберите количество комнат или укажите свое';
    } else if (formData.propertyType === 'commercial') {
      if (!formData.area && !formData.areaCustom) newErrors.area = 'Выберите площадь или укажите свою';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare data for backend
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        propertyType: formData.propertyType,
        rooms: formData.rooms || formData.roomsCustom || null,
        area: formData.area || formData.areaCustom || null,
        budget: formData.budget || formData.budgetCustom,
        moveInDate: formData.moveInDate,
        livingWith: formData.livingWith
      };

      const result = await register(userData);
      if (result.success) {
        navigate('/');
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Произошла ошибка при регистрации' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Регистрация</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {errors.general}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Имя *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Введите ваше имя"
            disabled={isSubmitting}
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Фамилия *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Введите вашу фамилию"
            disabled={isSubmitting}
          />
          {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="example@email.com"
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Телефон *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.phone ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Введите номер телефона (только цифры)"
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль *
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Минимум 6 символов"
            disabled={isSubmitting}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Подтвердите пароль *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Повторите пароль"
            disabled={isSubmitting}
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Дополнительная информация</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Type */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Что вы ищете?</h3>
          <div className="space-y-3">
            {[
              { value: 'apartment', label: 'Квартира' },
              { value: 'penthouse', label: 'Пентхаус' },
              { value: 'commercial', label: 'Коммерческая недвижимость' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="propertyType"
                  value={option.value}
                  checked={formData.propertyType === option.value}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.propertyType && <p className="text-red-500 text-sm mt-1">{errors.propertyType}</p>}
        </div>

        {/* Budget */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Какой бюджет?</h3>
          <div className="space-y-3">
            {[
              { value: 'до 6 млн ₽', label: 'до 6 млн ₽' },
              { value: '6–9 млн ₽', label: '6–9 млн ₽' },
              { value: '9–12 млн ₽', label: '9–12 млн ₽' },
              { value: '12–16 млн ₽', label: '12–16 млн ₽' },
              { value: '17+ млн ₽', label: '17+ млн ₽' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="budget"
                  value={option.value}
                  checked={formData.budget === option.value}
                  onChange={handleRadioChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
            {/* Custom budget input */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="budget"
                  value="custom"
                  checked={formData.budget === 'custom' || formData.budgetCustom}
                  onChange={handleRadioChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Другой бюджет:</span>
              </label>
              <input
                type="text"
                name="budgetCustom"
                value={formData.budgetCustom}
                onChange={handleCustomInputChange}
                placeholder="Например: 25 млн ₽"
                className={`mt-2 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budget ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
            </div>
          </div>
          {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
        </div>
      </div>

      {/* Rooms/Area - Full Width */}
      {(formData.propertyType === 'apartment' || formData.propertyType === 'penthouse') && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Сколько комнат вам нужно?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '1', label: '1 комната' },
              { value: '2', label: '2 комнаты' },
              { value: '3', label: '3 комнаты' },
              { value: '4+', label: '4+' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="rooms"
                  value={option.value}
                  checked={formData.rooms === option.value}
                  onChange={handleRadioChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {/* Custom rooms input */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="rooms"
                value="custom"
                checked={formData.rooms === 'custom' || formData.roomsCustom}
                onChange={handleRadioChange}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">Другое количество комнат:</span>
            </label>
            <input
              type="text"
              name="roomsCustom"
              value={formData.roomsCustom}
              onChange={handleCustomInputChange}
              placeholder="Например: 5 комнат"
              className={`mt-2 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.rooms ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
        </div>
      )}

      {formData.propertyType === 'commercial' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">2. Какая площадь вас интересует?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'до 50 м²', label: 'до 50 м²' },
              { value: '50–100 м²', label: '50–100 м²' },
              { value: '100–200 м²', label: '100–200 м²' },
              { value: 'Более 200 м²', label: 'Более 200 м²' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="area"
                  value={option.value}
                  checked={formData.area === option.value}
                  onChange={handleRadioChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {/* Custom area input */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="area"
                value="custom"
                checked={formData.area === 'custom' || formData.areaCustom}
                onChange={handleRadioChange}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-700">Другая площадь:</span>
            </label>
            <input
              type="text"
              name="areaCustom"
              value={formData.areaCustom}
              onChange={handleCustomInputChange}
              placeholder="Например: 150 м²"
              className={`mt-2 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.area ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
          </div>
          {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Move-in Date */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">4. Когда вы планируете заехать?</h3>
          <div className="space-y-3">
            {[
              { value: 'Уже сдан', label: 'Уже сдан' },
              { value: 'В этом году', label: 'В этом году' },
              { value: 'В 2026-2027 году', label: 'В 2026-2027 году' },
              { value: 'В 2028-2029 году', label: 'В 2028-2029 году' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="moveInDate"
                  value={option.value}
                  checked={formData.moveInDate === option.value}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.moveInDate && <p className="text-red-500 text-sm mt-1">{errors.moveInDate}</p>}
        </div>

        {/* Living With */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">5. С кем вы будете жить?</h3>
          <div className="space-y-3">
            {[
              { value: 'Один / одна', label: 'Один / одна' },
              { value: 'С партнёром', label: 'С партнёром' },
              { value: 'С семьёй с детьми', label: 'С семьёй с детьми' },
              { value: 'Для родителей', label: 'Для родителей' },
              { value: 'Инвестиции / сдача в аренду', label: 'Инвестиции / сдача в аренду' }
            ].map(option => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="livingWith"
                  value={option.value}
                  checked={formData.livingWith === option.value}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.livingWith && <p className="text-red-500 text-sm mt-1">{errors.livingWith}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Шаг {step} из 2</span>
              <span className="text-sm font-medium text-gray-700">{step === 1 ? 'Регистрация' : 'Дополнительная информация'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          {step === 1 ? renderStep1() : renderStep2()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-100 cursor-not-allowed' 
                    : 'hover:bg-gray-50'
                }`}
              >
                Назад
              </button>
            )}
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className={`px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors ${
                step === 1 ? 'ml-auto' : ''
              } ${
                isSubmitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'hover:bg-blue-700'
              }`}
            >
              {isSubmitting 
                ? 'Обработка...' 
                : step === 1 
                  ? 'Далее' 
                  : 'Завершить регистрацию'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm; 