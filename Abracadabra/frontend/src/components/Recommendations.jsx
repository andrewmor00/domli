import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

// Default properties to show when user is not logged in or no recommendations found
const defaultProperties = [
  {
    id: 'default-1',
    title: 'ЖК "Тёплые края"',
    address: 'г. Краснодар, ул. им. Александра Гикало, д. 11',
    type: 'Квартиры',
    price: 'от 6,3 млн ₽',
    img: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
    developer: 'СЕМЬЯ'
  },
  {
    id: 'default-2',
    title: 'ЖК "Режиссёр"',
    address: 'г. Краснодар, ул. Старокубанская, д. 100/6',
    type: 'Квартиры',
    price: 'от 7,2 млн ₽',
    img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80',
    developer: 'Ava Dom'
  },
  {
    id: 'default-3',
    title: 'ЖК "Сегодня"',
    address: 'г. Краснодар, ул. Ветеранов, д. 85',
    type: 'Квартиры',
    price: 'от 5,9 млн ₽',
    img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    developer: 'ССК'
  }
];

export default function Recommendations() {
  const [properties, setProperties] = useState(defaultProperties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Handle card click navigation
  const handleCardClick = (property) => {
    if (property.id) {
      navigate(`/property/${property.id}`);
    } else {
      // For default properties without IDs, we could navigate to a search or show a message
      console.log('Property ID not available for navigation');
    }
  };

  // Format property data from backend response
  const formatProperty = (property) => ({
    id: property.id,
    title: property.name,
    address: property.address,
    type: property.property_type,
    price: property.formatted_price,
    img: property.main_photo_url || property.gallery_photos_urls?.[0] || 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80',
    developer: property.developer,
    rooms: property.rooms,
    area: property.area,
    completion: property.completion_date,
    status: property.status
  });

  // Main function to fetch recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      let success = false;

      if (isAuthenticated) {
        // Try to get personalized recommendations first
        try {
          response = await api.getPersonalizedRecommendations();
          if (response.success && response.data?.recommendations) {
            const formattedProperties = response.data.recommendations
              .slice(0, 6)
              .map(formatProperty);
            setProperties(formattedProperties);
            success = true;
          }
        } catch (error) {
          console.error('Error fetching personalized recommendations:', error);
        }
      }

      // If not authenticated or personalized recommendations failed, get general recommendations
      if (!success) {
        try {
          response = await api.getRecommendations();
          if (response.success && response.data?.recommendations) {
            const formattedProperties = response.data.recommendations
              .slice(0, 6)
              .map(formatProperty);
            setProperties(formattedProperties);
            success = true;
          }
        } catch (error) {
          console.error('Error fetching general recommendations:', error);
        }
      }

      // If all API calls fail, use default properties
      if (!success) {
        setProperties(defaultProperties);
        setError('Не удалось загрузить рекомендации. Показаны популярные объекты.');
      }

    } catch (error) {
      console.error('Error in fetchRecommendations:', error);
      setError('Не удалось загрузить рекомендации');
      setProperties(defaultProperties);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Загружаем рекомендации...</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 rounded-xl animate-pulse p-4 min-w-[260px] sm:min-w-[280px] flex-shrink-0">
              <div className="bg-gray-300 rounded-lg mb-2 w-full h-36 sm:h-40"></div>
              <div className="bg-gray-300 rounded h-4 mb-2"></div>
              <div className="bg-gray-300 rounded h-3 mb-1"></div>
              <div className="bg-gray-300 rounded h-3 mb-1"></div>
              <div className="bg-gray-300 rounded h-4"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">
        {isAuthenticated ? 'Рекомендации для вас' : 'Популярные объекты'}
      </h2>
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 sm:px-4 sm:py-3 rounded mb-4 text-sm sm:text-base">
          {error}
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {properties.map((property, i) => (
          <div 
            key={property.id || i} 
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 sm:p-4 min-w-[240px] sm:min-w-[280px] max-w-[240px] sm:max-w-[280px] flex-shrink-0 cursor-pointer hover:scale-105 transform group"
            onClick={() => handleCardClick(property)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(property);
              }
            }}
          >
            <div className="relative w-full h-32 sm:h-40 mb-3 overflow-hidden rounded-lg bg-gray-100">
              <img 
                src={property.img} 
                alt={property.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=400&q=80';
                }}
              />
            </div>
            <div className="font-semibold text-base sm:text-lg mb-2 text-gray-800">{property.title}</div>
            <div className="text-gray-600 text-xs sm:text-sm mb-1 flex items-center">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {property.address}
            </div>
            <div className="text-gray-500 text-xs mb-1">{property.type}</div>
            {property.rooms && property.rooms > 0 && (
              <div className="text-gray-500 text-xs mb-1">
                {property.rooms === 1 ? '1 комната' : `${property.rooms} комнаты`}
              </div>
            )}
            {property.area && property.area > 0 && (
              <div className="text-gray-500 text-xs mb-1">{property.area} м²</div>
            )}
            <div className="text-gray-500 text-xs mb-2">{property.developer}</div>
            {property.completion && (
              <div className="text-gray-500 text-xs mb-2">
                Сдача: {property.completion}
              </div>
            )}
            {property.status && (
              <div className="text-gray-500 text-xs mb-3">
                <span className={`inline-block px-2 py-1 rounded text-xs ${
                  property.status === 'Сдан' ? 'bg-green-100 text-green-800' :
                  property.status === 'В продаже' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {property.status}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="font-bold text-blue-700 text-base sm:text-lg">{property.price}</div>
              <div className="text-blue-600 text-xs sm:text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                Подробнее →
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs sm:text-sm mb-2">
            Зарегистрируйтесь, чтобы получить персональные рекомендации
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
          >
            Зарегистрироваться
          </button>
        </div>
      )}
    </section>
  );
} 