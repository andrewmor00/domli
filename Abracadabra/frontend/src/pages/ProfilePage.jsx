import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Toast from "../components/Toast";
import apiService, { ReservationService } from "../services/api";

const reservationService = new ReservationService();

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("reserved");
  const [reservedProperties, setReservedProperties] = useState([]);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mortgage calculator state
  const [calculatorMode, setCalculatorMode] = useState("property"); // 'property' or 'loan'
  const [propertyPrice, setPropertyPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [downPaymentCurrency, setDownPaymentCurrency] = useState("₽");
  const [loanAmount, setLoanAmount] = useState(0);
  const [loanTerm, setLoanTerm] = useState("");
  const [loanTermUnit, setLoanTermUnit] = useState("лет");
  const [interestRate, setInterestRate] = useState("");
  const [paymentType, setPaymentType] = useState("annuity"); // 'annuity' or 'differentiated'
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [overpayment, setOverpayment] = useState(0);
  const [showPaymentTypeInfo, setShowPaymentTypeInfo] = useState(false);

  // Settings state
  const [settingsData, setSettingsData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyType: '',
    rooms: '',
    budget: '',
    city: '',
    notifications: true
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Toast state
  const [toasts, setToasts] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Initialize settings data with user info
  useEffect(() => {
    if (user) {
      setSettingsData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        propertyType: user.propertyType || '',
        rooms: user.rooms || '',
        budget: user.budget || '',
        city: user.city || 'Краснодар',
        notifications: user.notifications !== undefined ? user.notifications : true
      });
    }
  }, [user]);

  // Load user's reserved properties
  useEffect(() => {
    const loadReservedProperties = async () => {
      console.log('🔍 ProfilePage: loadReservedProperties called', { isAuthenticated });
      
      if (!isAuthenticated) {
        console.log('❌ ProfilePage: User not authenticated, skipping load');
        return;
      }
      
      console.log('✅ ProfilePage: User authenticated, loading reservations...');
      setLoading(true);
      
      try {
        // Get user's reservations
        console.log('📡 ProfilePage: Calling getUserReservations...');
        const reservationsResponse = await reservationService.getUserReservations();
        console.log('📥 ProfilePage: Reservations response:', reservationsResponse);
        
        if (reservationsResponse.success) {
          console.log(`📊 ProfilePage: Found ${reservationsResponse.reservations.length} reservations`);
          
          // Get all properties to match with reservations
          console.log('📡 ProfilePage: Calling getRecommendations...');
          const propertiesResponse = await apiService.getRecommendations();
          console.log('📥 ProfilePage: Properties response:', propertiesResponse);
          
          if (propertiesResponse.success) {
            const propertiesData = propertiesResponse.data?.recommendations || propertiesResponse.properties || [];
            console.log(`📊 ProfilePage: Found ${propertiesData.length} total properties`);
            
            // Separate reservations from favorites based on notes
            const reservedProps = [];
            const favoriteProps = [];
            
            reservationsResponse.reservations.forEach(reservation => {
              console.log(`🔗 ProfilePage: Processing reservation for property ${reservation.property_id}`);
              const property = propertiesData.find(p => p.id === reservation.property_id);
              
              const propertyData = property ? {
                ...property,
                reservationId: reservation.id,
                reservationDate: reservation.reservation_date,
                expiresAt: reservation.expires_at,
                notes: reservation.notes
              } : {
                id: reservation.property_id,
                reservationId: reservation.id,
                name: `Объект #${reservation.property_id}`,
                type: "Недвижимость",
                area: "Не указано",
                address: "Адрес не найден",
                floor: "Не указано",
                deadline: "Не указано",
                main_photo_url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80",
                reservationDate: reservation.reservation_date,
                expiresAt: reservation.expires_at,
                notes: reservation.notes
              };
              
              // Check if it's a favorite (notes start with "Избранное:") or reservation (from form)
              if (reservation.notes && reservation.notes.startsWith('Избранное:')) {
                console.log(`❤️ ProfilePage: Adding to favorites: ${reservation.property_id}`);
                favoriteProps.push(propertyData);
              } else {
                console.log(`📋 ProfilePage: Adding to reservations: ${reservation.property_id}`);
                reservedProps.push(propertyData);
              }
            });
            
            console.log(`🎯 ProfilePage: Setting ${reservedProps.length} reserved properties and ${favoriteProps.length} favorites`);
            setReservedProperties(reservedProps);
            setFavoriteProperties(favoriteProps);
          } else {
            console.error('❌ ProfilePage: Properties response not successful:', propertiesResponse);
          }
        } else {
          console.error('❌ ProfilePage: Reservations response not successful:', reservationsResponse);
        }
      } catch (error) {
        console.error('💥 ProfilePage: Error loading reserved properties:', error);
        showToast('Ошибка при загрузке забронированных объектов', 'error');
      } finally {
        setLoading(false);
        console.log('🏁 ProfilePage: loadReservedProperties finished');
      }
    };

    loadReservedProperties();
  }, [isAuthenticated]);

  const sidebarItems = [
    { id: "reserved", label: "Забронированные", active: true },
    { id: "client-service", label: "Клиентский сервис", active: false },
    { id: "favorites", label: "Избранное", active: false },
    { id: "feedback", label: "Обратная связь", active: false },
    { id: "settings", label: "Настройки", active: false },
  ];

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
  };

  // Mortgage calculator functions
  const calculateMortgage = () => {
    const price = parseFloat(propertyPrice.replace(/\s/g, "")) || 0;
    const down = parseFloat(downPayment.replace(/\s/g, "")) || 0;
    const rate = parseFloat(interestRate) / 100 / 12; // Monthly interest rate
    const term = parseInt(loanTerm) * (loanTermUnit === "лет" ? 12 : 1); // Total months

    let loan = 0;
    if (calculatorMode === "property") {
      loan =
        downPaymentCurrency === "₽"
          ? price - down
          : price - (price * down) / 100;
    } else {
      loan = price; // In loan mode, propertyPrice is actually loan amount
    }

    setLoanAmount(loan);

    if (loan > 0 && rate > 0 && term > 0) {
      let monthly = 0;

      if (paymentType === "annuity") {
        // Annuity payment formula
        monthly =
          (loan * (rate * Math.pow(1 + rate, term))) /
          (Math.pow(1 + rate, term) - 1);
      } else {
        // Differentiated payment (first payment)
        monthly = loan / term + loan * rate;
      }

      const total = monthly * term;
      const over = total - loan;

      setMonthlyPayment(monthly);
      setTotalPayment(total);
      setOverpayment(over);
    } else {
      setMonthlyPayment(0);
      setTotalPayment(0);
      setOverpayment(0);
    }
  };

  // Auto-calculate when values change
  useEffect(() => {
    calculateMortgage();
  }, [
    propertyPrice,
    downPayment,
    downPaymentCurrency,
    loanTerm,
    loanTermUnit,
    interestRate,
    paymentType,
    calculatorMode,
  ]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat("ru-RU").format(Math.round(num));
  };

  const handleNumberInput = (value, setter) => {
    // Remove all non-digits and format with spaces
    const cleanValue = value.replace(/\D/g, "");
    const formattedValue = cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    setter(formattedValue);
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



  // Settings functions
  const handleSettingsChange = (field, value) => {
    setSettingsData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      // Prepare profile data (personal information)
      const profileData = {
        firstName: settingsData.firstName,
        lastName: settingsData.lastName,
        email: settingsData.email,
        phone: settingsData.phone
      };

      // Prepare preferences data - only send fields that have values
      const preferencesData = {};
      
      if (settingsData.propertyType) {
        preferencesData.propertyType = settingsData.propertyType;
      }
      
      if (settingsData.rooms) {
        if (settingsData.rooms === 'studio') {
          preferencesData.rooms = 0;
        } else if (settingsData.rooms === '5+') {
          preferencesData.rooms = 5;
        } else {
          const roomsNum = parseInt(settingsData.rooms);
          if (!isNaN(roomsNum)) {
            preferencesData.rooms = roomsNum;
          }
        }
      }
      
      if (settingsData.budget) {
        preferencesData.budget = settingsData.budget;
      }

      // Update profile first
      const profileResponse = await apiService.updateProfile(profileData);
      
      if (!profileResponse.success) {
        throw new Error(profileResponse.message || 'Ошибка при обновлении профиля');
      }

      // Update preferences only if there's data to send
      if (Object.keys(preferencesData).length > 0) {
        try {
          const preferencesResponse = await apiService.updatePreferences(preferencesData);
          if (!preferencesResponse.success) {
            console.warn('Preferences update failed:', preferencesResponse.message);
            // Don't throw error for preferences - profile was already updated
          }
        } catch (preferencesError) {
          console.warn('Preferences update error:', preferencesError);
          // Don't throw error for preferences - profile was already updated
        }
      }

      // Update user context with new profile data
      const updatedUser = {
        ...user,
        firstName: profileResponse.data.user.firstName,
        lastName: profileResponse.data.user.lastName,
        email: profileResponse.data.user.email,
        phone: profileResponse.data.user.phone,
        // Add preferences to user object
        propertyType: settingsData.propertyType,
        rooms: settingsData.rooms,
        budget: settingsData.budget,
        city: settingsData.city,
        notifications: settingsData.notifications
      };
      
      updateUser(updatedUser);
      
      // Update localStorage as well
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditingSettings(false);
      showToast('Настройки успешно сохранены!', 'success');
    } catch (error) {
      console.error('Settings save error:', error);
      showToast(error.message || 'Ошибка при сохранении настроек', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCancelSettings = () => {
    // Reset to original user data
    if (user) {
      setSettingsData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        propertyType: user.propertyType || '',
        rooms: user.rooms || '',
        budget: user.budget || '',
        city: user.city || 'Краснодар',
        notifications: user.notifications !== undefined ? user.notifications : true
      });
    }
    // Reset password data
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsEditingSettings(false);
  };

  // Password change functions
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showToast('Заполните все поля для смены пароля', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Новые пароли не совпадают', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('Новый пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await apiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });

      if (response.success) {
        showToast('Пароль успешно изменен!', 'success');
        // Reset password form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        throw new Error(response.message || 'Ошибка при изменении пароля');
      }
    } catch (error) {
      console.error('Password change error:', error);
      showToast(error.message || 'Ошибка при изменении пароля', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const renderReservedProperties = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-24 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (reservedProperties.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Нет забронированных объектов
          </h3>
          <p className="text-gray-500 mb-4">
            Объекты появятся здесь после обращения к менеджеру
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Посмотреть объекты
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reservedProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="flex gap-4">
              {/* Property Image */}
                <img 
                  src={property.main_photo_url || property.image || 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80'} 
                  alt="Property" 
                  className="w-24 h-20 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80';
                  }}
                />

              {/* Property Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property.type}{" "}
                    <span className="text-gray-600 font-normal">
                      {property.area}
                    </span>
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {property.address}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      Этаж <strong>{property.floor || 'Не указано'}</strong>
                    </span>
                    <span>
                      срок <strong>{property.deadline}</strong>
                    </span>
                  </div>
                </div>

                {/* Reservation info */}
                {property.reservationDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Забронировано: {new Date(property.reservationDate).toLocaleDateString('ru-RU')}
                    {property.expiresAt && (
                      <span className="ml-2">
                        • Истекает: {new Date(property.expiresAt).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                )}

                {/* Action button */}
                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors w-full"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFavoriteProperties = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-24 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (favoriteProperties.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Нет избранных объектов
          </h3>
          <p className="text-gray-500 mb-4">
            Добавляйте объекты в избранное, нажимая на сердечко
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Посмотреть объекты
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favoriteProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
          >
            <div className="flex gap-4">
              {/* Property Image */}
              <img 
                src={property.main_photo_url || property.image || 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80'} 
                alt="Property" 
                className="w-24 h-20 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80';
                }}
              />

              {/* Property Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {property.name || property.type}{" "}
                    <span className="text-gray-600 font-normal">
                      {property.area}
                    </span>
                  </h3>
                </div>

                <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                  {property.address}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {property.formatted_price || 'Цена не указана'}
                    </span>
                  </div>
                </div>

                {/* Favorite info */}
                {property.reservationDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Добавлено в избранное: {new Date(property.reservationDate).toLocaleDateString('ru-RU')}
                  </div>
                )}

                {/* Action button */}
                <div className="mt-3">
                  <button
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors w-full"
                  >
                    Подробнее
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "reserved":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Забронированные варианты
            </h2>
            {renderReservedProperties()}
          </div>
        );
      case "favorites":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Избранные объекты
            </h2>
            {renderFavoriteProperties()}
          </div>
        );
      case "client-service":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Клиентский сервис
            </h2>

            {/* Mortgage Calculator */}
            <div className="bg-gray-100 rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Ипотечный калькулятор
              </h3>

              {/* Mode Toggle */}
              <div className="flex mb-8 border-b border-gray-300">
                <button
                  onClick={() => setCalculatorMode("property")}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    calculatorMode === "property"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  По стоимости недвижимости
                </button>
                <button
                  onClick={() => setCalculatorMode("loan")}
                  className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                    calculatorMode === "loan"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  По сумме кредита
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input Fields */}
                <div className="space-y-6">
                  {/* Property Price / Loan Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {calculatorMode === "property"
                        ? "Стоимость недвижимости"
                        : "Сумма кредита"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={propertyPrice}
                        onChange={(e) =>
                          handleNumberInput(e.target.value, setPropertyPrice)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">
                        ₽
                      </span>
                    </div>
                  </div>

                  {/* Down Payment */}
                  {calculatorMode === "property" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Первоначальный взнос
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={downPayment}
                            onChange={(e) =>
                              handleNumberInput(e.target.value, setDownPayment)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <select
                          value={downPaymentCurrency}
                          onChange={(e) =>
                            setDownPaymentCurrency(e.target.value)
                          }
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="₽">₽</option>
                          <option value="%">%</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Loan Amount Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сумма кредита
                    </label>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatNumber(loanAmount)}
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Срок кредита
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      <select
                        value={loanTermUnit}
                        onChange={(e) => setLoanTermUnit(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="лет">лет</option>
                        <option value="мес">мес</option>
                      </select>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Процентная ставка
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Payment Type */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Тип ежемесячных платежей
                      </label>
                      <button
                        onClick={() =>
                          setShowPaymentTypeInfo(!showPaymentTypeInfo)
                        }
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {showPaymentTypeInfo ? "Скрыть" : "Что это?"}
                      </button>
                    </div>

                    {showPaymentTypeInfo && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="space-y-3 text-sm">
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">
                              Аннуитетные платежи:
                            </h4>
                            <p className="text-blue-800">
                              Равномерные ежемесячные платежи на протяжении
                              всего срока кредита. В начале большая часть
                              платежа идет на погашение процентов, к концу — на
                              погашение основного долга.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-1">
                              Дифференцированные платежи:
                            </h4>
                            <p className="text-blue-800">
                              Платежи уменьшаются каждый месяц. Основной долг
                              погашается равными частями, проценты начисляются
                              на остаток долга. Первые платежи больше, последние
                              — меньше.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="flex items-start">
                        <input
                          type="radio"
                          value="annuity"
                          checked={paymentType === "annuity"}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="ml-3">
                          <span className="text-gray-700 font-medium">
                            Аннуитетные
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Одинаковые платежи каждый месяц
                          </p>
                        </div>
                      </label>
                      <label className="flex items-start">
                        <input
                          type="radio"
                          value="differentiated"
                          checked={paymentType === "differentiated"}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="ml-3">
                          <span className="text-gray-700 font-medium">
                            Дифференцированные
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Платежи уменьшаются со временем
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Results */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    Результат расчета
                  </h4>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Ежемесячный платеж</span>
                      <span className="text-xl font-bold text-gray-900">
                        {formatNumber(monthlyPayment)} ₽
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Общая сумма выплат</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatNumber(totalPayment)} ₽
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600">Переплата</span>
                      <span className="text-lg font-semibold text-red-600">
                        {formatNumber(overpayment)} ₽
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "favorites":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Избранное</h2>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <p className="text-gray-600">
                Здесь будут ваши избранные объекты.
              </p>
            </div>
          </div>
        );
      case "feedback":
        return (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Обратная связь
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Контактная информация
                </h3>

                <div className="space-y-4">
                  {/* Phone Numbers */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Телефон
                    </h4>
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <div>
                        <p className="text-gray-900 font-medium">
                          8 800 101 93 01
                        </p>
                        <p className="text-sm text-gray-500">
                          Бесплатный звонок по России
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Email
                    </h4>
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <p className="text-gray-900 font-medium">info@azkka.ru</p>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Офис
                    </h4>
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="text-gray-900 font-medium">
                          350015, г. Краснодар
                        </p>
                        <p className="text-sm text-gray-500">
                          ул. Кузнечная, 6, этаж 8, офис 5
                        </p>
                        <p className="text-sm text-gray-500">
                          Пн-Пт: 9:00-18:00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media & Feedback Form */}
              <div className="space-y-6">
                {/* Social Media */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Мы в социальных сетях
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {/* VK */}
                    <a
                      href="https://vk.com/adkk_info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1.01-1.49-.9-1.744-.9-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">ВКонтакте</p>
                        <p className="text-sm text-gray-500">adkk_info</p>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Quick Feedback Form */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Быстрая связь
                  </h3>

                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ваше имя
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Введите ваше имя"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+7 (XXX) XXX-XX-XX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Сообщение
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Опишите ваш вопрос или пожелание..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Отправить сообщение
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Настройки</h2>
              {!isEditingSettings ? (
                <button
                  onClick={() => setIsEditingSettings(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Редактировать
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={settingsLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {settingsLoading ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button
                    onClick={handleCancelSettings}
                    disabled={settingsLoading}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Личная информация</h3>
                
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя
                    </label>
                    <input
                      type="text"
                      value={settingsData.firstName}
                      onChange={(e) => handleSettingsChange('firstName', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Фамилия
                    </label>
                    <input
                      type="text"
                      value={settingsData.lastName}
                      onChange={(e) => handleSettingsChange('lastName', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Введите вашу фамилию"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={settingsData.email}
                      onChange={(e) => handleSettingsChange('email', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="your.email@example.com"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={settingsData.phone}
                      onChange={(e) => handleSettingsChange('phone', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="+7 (XXX) XXX-XX-XX"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Город
                    </label>
                    <select
                      value={settingsData.city}
                      onChange={(e) => handleSettingsChange('city', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="Краснодар">Краснодар</option>
                      <option value="Москва">Москва</option>
                      <option value="Ростов-на-Дону">Ростов-на-Дону</option>
                      <option value="Саратов">Саратов</option>
                      <option value="Волгоград">Волгоград</option>
                      <option value="Кисловодск">Кисловодск</option>
                      <option value="Сочи">Сочи</option>
                      <option value="Анапа">Анапа</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Preferences */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Предпочтения по недвижимости</h3>
                
                <div className="space-y-4">
                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тип недвижимости
                    </label>
                    <select
                      value={settingsData.propertyType}
                      onChange={(e) => handleSettingsChange('propertyType', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Выберите тип</option>
                      <option value="apartment">Квартира</option>
                      <option value="house">Дом</option>
                      <option value="commercial">Коммерческая недвижимость</option>
                      <option value="land">Земельный участок</option>
                    </select>
                  </div>

                  {/* Number of Rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Количество комнат
                    </label>
                    <select
                      value={settingsData.rooms}
                      onChange={(e) => handleSettingsChange('rooms', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Выберите количество</option>
                      <option value="studio">Студия</option>
                      <option value="1">1 комнатная</option>
                      <option value="2">2 комнатная</option>
                      <option value="3">3 комнатная</option>
                      <option value="4">4 комнатная</option>
                      <option value="5+">5+ комнатная</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Бюджет
                    </label>
                    <select
                      value={settingsData.budget}
                      onChange={(e) => handleSettingsChange('budget', e.target.value)}
                      disabled={!isEditingSettings}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !isEditingSettings ? 'bg-gray-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">Выберите бюджет</option>
                      <option value="до 3 млн">до 3 млн ₽</option>
                      <option value="3-5 млн">3-5 млн ₽</option>
                      <option value="5-8 млн">5-8 млн ₽</option>
                      <option value="8-12 млн">8-12 млн ₽</option>
                      <option value="12-20 млн">12-20 млн ₽</option>
                      <option value="свыше 20 млн">свыше 20 млн ₽</option>
                    </select>
                  </div>

                  {/* Notifications */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Уведомления
                    </label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settingsData.notifications}
                        onChange={(e) => handleSettingsChange('notifications', e.target.checked)}
                        disabled={!isEditingSettings}
                        className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
                          !isEditingSettings ? 'cursor-not-allowed' : ''
                        }`}
                      />
                      <span className="ml-3 text-gray-700">
                        Получать уведомления о новых предложениях
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            {isEditingSettings && (
              <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Изменить пароль</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Текущий пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Введите текущий пароль"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Новый пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Введите новый пароль"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Подтвердите пароль
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Повторите новый пароль"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Изменение...' : 'Изменить пароль'}
                </button>
              </div>
            )}
          </div>
        );
      default:
        return renderContent();
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {user?.firstName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.firstName || "Пользователь"}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>

              <nav className="p-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors ${
                      activeSection === item.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-lg mb-1 text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  Выйти
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">{renderContent()}</div>
        </div>
      </div>

      <Footer />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ProfilePage;
