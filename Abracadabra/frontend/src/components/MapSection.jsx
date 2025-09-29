import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapSection() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Load properties data from backend API
  useEffect(() => {
    const loadPropertiesFromAPI = async () => {
      try {
        const response = await fetch('/api/properties/map-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setProperties(result.data);
        } else {
          throw new Error(result.message || 'Failed to load properties');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading properties:', error);
        setError(error.message || 'Error loading properties data');
        setLoading(false);
      }
    };

    loadPropertiesFromAPI();
  }, []);

  // Initialize map and add markers
  useEffect(() => {
    if (!mapRef.current || loading || properties.length === 0) return;

    // Initialize map without default attribution control
    // Center on Krasnodar instead of Krasnoyarsk
    const map = L.map(mapRef.current, {
      attributionControl: false,
      zoomControl: window.innerWidth > 768 // Hide zoom control on mobile
    }).setView([45.0355, 38.9753], 11); // Krasnodar coordinates
    mapInstanceRef.current = map;

    // Add custom attribution control with Russian flag
    L.control.attribution({
      prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#ffffff" d="M0 0h12v2.67H0z"></path><path fill="#0039A6" d="M0 2.67h12v2.67H0z"></path><path fill="#D52B1E" d="M0 5.33h12v2.67H0z"></path></svg> Leaflet</a>'
    }).addTo(map);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for each property from API
    properties.forEach(property => {
      // Validate coordinates
      if (!property.coordinates || property.coordinates.length !== 2 || 
          isNaN(property.coordinates[0]) || isNaN(property.coordinates[1])) {
        console.warn(`Invalid coordinates for property: ${property.name}`);
        return;
      }

      const marker = L.marker(property.coordinates).addTo(map);
      
      const popupContent = `
        <div class="property-popup max-w-xs">
          <h3 class="font-bold text-base sm:text-lg mb-2 text-blue-800">${property.name}</h3>
          <div class="space-y-1 text-xs sm:text-sm">
            <p class="text-gray-700"><strong>Адрес:</strong> ${property.address}</p>
            <p class="text-green-600 font-semibold"><strong>Цена:</strong> ${property.price}</p>
            <p class="text-gray-600"><strong>Тип:</strong> ${property.type}</p>
            <p class="text-gray-600"><strong>Комнат:</strong> ${property.rooms}</p>
            <p class="text-gray-600"><strong>Площадь:</strong> ${property.area}</p>
            <p class="text-gray-600"><strong>Застройщик:</strong> ${property.developer}</p>
            <p class="text-gray-600"><strong>Проект:</strong> ${property.project}</p>
            <p class="text-gray-600"><strong>Сдача:</strong> ${property.completion}</p>
          </div>
          <button 
            class="mt-3 w-full bg-blue-500 text-white px-3 py-2 rounded text-xs sm:text-sm hover:bg-blue-600 transition-colors property-detail-btn" 
            data-property-id="${property.id}"
          >
            Подробнее
          </button>
        </div>
      `;
      
      const popup = L.popup({
        maxWidth: window.innerWidth > 640 ? 300 : 250,
        className: 'custom-popup'
      }).setContent(popupContent);
      
      marker.bindPopup(popup);
      
      // Add event listener for the button when popup opens
      popup.on('add', () => {
        // Small delay to ensure the DOM is ready
        setTimeout(() => {
          const button = document.querySelector(`[data-property-id="${property.id}"]`);
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Navigating to property:', property.id);
              navigate(`/property/${property.id}`);
            });
          }
        }, 100);
      });
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [properties, loading, navigate]);

  if (loading) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              Карта новостроек
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Загружаем данные о недвижимости...
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-100 flex items-center justify-center">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <div className="text-gray-500 text-sm sm:text-base">Загрузка карты...</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
              Карта новостроек
            </h2>
            <p className="text-red-600 text-base sm:text-lg max-w-2xl mx-auto">
              Ошибка загрузки данных: {error}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-red-500 text-xl mb-2">⚠️</div>
                <div className="text-red-500 text-sm sm:text-base">Не удалось загрузить карту</div>
                <div className="text-gray-500 text-xs sm:text-sm mt-2">Проверьте подключение к серверу</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
            Карта новостроек Краснодара
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg max-w-2xl mx-auto px-2 sm:px-0">
            Изучите расположение объектов недвижимости на интерактивной карте. 
            Найдите идеальное место для вашего нового дома в Краснодаре.
          </p>
        </div>
        
        <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <div 
            ref={mapRef} 
            className="w-full h-64 sm:h-80 md:h-96"
            style={{ zIndex: 1 }}
          />
        </div>
        
        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            Нажмите на маркер для получения подробной информации о проекте
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Загружено {properties.length} объектов недвижимости
          </p>
        </div>
      </div>
    </section>
  );
} 