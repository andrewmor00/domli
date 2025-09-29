import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PropertyMap from '../components/PropertyMap';
import CRMForm from '../components/CRMForm';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedApartment, setSelectedApartment] = useState(0);
  const [isCRMFormOpen, setIsCRMFormOpen] = useState(false);

  // Apartment data
  const apartments = [
    {
      id: 0,
      type: 'Студия',
      area: 20,
      price: 3860000,
      floor: '12-18',
      project: 'Теплые края'
    },
    {
      id: 1,
      type: 'Студия',
      area: 25,
      price: 4200000,
      floor: '10-18',
      project: 'Теплые края'
    },
    {
      id: 2,
      type: 'Студия',
      area: 27,
      price: 4450000,
      floor: '8-18',
      project: 'Теплые края'
    },
    {
      id: 3,
      type: 'Студия',
      area: 29,
      price: 4680000,
      floor: '5-18',
      project: 'Теплые края'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
  };

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const response = await api.getPropertyDetails(id);
        
        if (response.success) {
          setProperty(response.data.property);
        } else {
          setError(response.message || 'Не удалось загрузить данные недвижимости');
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Ошибка при загрузке данных недвижимости');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const getAllImages = () => {
    if (!property) return [];
    
    const images = [];
    
    // Add main photo
    if (property.main_photo_url) {
      images.push({
        url: property.main_photo_url,
        type: 'main',
        alt: 'Основное фото'
      });
    }
    
    // Add gallery photos
    if (property.gallery_photos_urls && property.gallery_photos_urls.length > 0) {
      property.gallery_photos_urls.forEach((url, index) => {
        if (url.trim()) {
          images.push({
            url: url.trim(),
            type: 'gallery',
            alt: `Фото ${index + 1}`
          });
        }
      });
    }
    
    // Add floor plan
    if (property.floor_plan_url) {
      images.push({
        url: property.floor_plan_url,
        type: 'floor-plan',
        alt: 'План этажа'
      });
    }
    
    return images;
  };

  const images = getAllImages();

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate('/')}
              className="hover:text-blue-600 transition-colors"
            >
              Главная
            </button>
            <span>›</span>
            <span className="text-gray-800">{property.name}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images Section */}
          <div className="lg:col-span-2">
            {images.length > 0 ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Main Image */}
                <div className="relative">
                  <img
                    src={images[currentImageIndex]?.url}
                    alt={images[currentImageIndex]?.alt}
                    className="w-full h-96 object-cover"
                    onError={(e) => {
                      e.target.src = '/placeholder-property.jpg';
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        ‹
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        ›
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <div className="p-4 bg-gray-50">
                    <div className="flex space-x-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-blue-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/placeholder-property.jpg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Фото недоступно</span>
                </div>
              </div>
            )}

            {/* Property Description */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Описание</h2>
              <p className="text-gray-600 leading-relaxed">
                {property.description || `${property.property_type} в жилом комплексе ${property.project} от застройщика ${property.developer}. Современный жилой комплекс с развитой инфраструктурой и удобным расположением в городе Краснодар.`}
              </p>
            </div>
          </div>

          {/* Property Info Sidebar */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.name}</h1>
              <p className="text-gray-600 mb-4">{property.address}</p>
              
              <div className="text-3xl font-bold text-green-600 mb-6">
                {property.formatted_price}
              </div>

              {/* Property Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Тип недвижимости:</span>
                  <span className="font-medium">{property.property_type}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Количество комнат:</span>
                  <span className="font-medium">{property.rooms}</span>
                </div>
                
                {property.area && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Площадь:</span>
                    <span className="font-medium">{property.area} м²</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Застройщик:</span>
                  <span className="font-medium">{property.developer}</span>
                </div>
                
                {property.completion_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Год сдачи:</span>
                    <span className="font-medium">{property.completion_date}</span>
                  </div>
                )}
              </div>

              {/* Contact Button */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={() => setIsCRMFormOpen(true)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Связаться с менеджером
                </button>
                
                <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Добавить в избранное
                </button>
              </div>
            </div>

            {/* Location Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Расположение</h3>
              <div className="text-gray-600 mb-4">
                <p>{property.address}</p>
                <p className="text-sm">г. {property.city}</p>
              </div>
              
              {/* Location details */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="mr-2">🏢</span>
                  <span>Застройщик: {property.developer}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🏗️</span>
                  <span>Проект: {property.project}</span>
                </div>
                {property.coordinates && (
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>Координаты: {property.coordinates[0]}, {property.coordinates[1]}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width Map Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Расположение на карте</h2>
            <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
              Интерактивная карта покажет точное местоположение объекта недвижимости и окружающую инфраструктуру.
            </p>
            <div className="flex justify-center">
              <div className="w-4/5">
                <PropertyMap 
                  property={property} 
                  className="w-full h-96"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <img
                  src="https://storage.yandexcloud.net/domli-properties/%D0%B2%D1%81%D0%B5%D1%81%D0%B2%D0%BE%D0%B8.jpg"
                  alt="Инфраструктура жилого комплекса"
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                  style={{ maxHeight: '500px' }}
                  onError={(e) => {
                    e.target.src = '/placeholder-infrastructure.jpg';
                  }}
                />
              </div>
            </div>
            <div className="mt-6 text-center">
            </div>
          </div>
        </div>

        {/* Apartment Selection Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Выбор квартиры</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left side - Apartment cards */}
              <div className="lg:col-span-1">
                <div className="grid grid-cols-2 gap-4">
                  {apartments.map((apartment) => (
                    <div
                      key={apartment.id}
                      onClick={() => setSelectedApartment(apartment.id)}
                      className={`bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedApartment === apartment.id 
                          ? 'border-blue-500 border-4 shadow-lg' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="mb-3">
                        <img
                          src="https://storage.yandexcloud.net/domli-properties/schemaRoom.png"
                          alt={`План ${apartment.type} ${apartment.area}м²`}
                          className="w-full h-24 object-contain rounded border bg-gray-50 p-2"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-800 mb-1">{apartment.type}</h3>
                        <p className="text-sm text-gray-600">{apartment.area} м²</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Selected apartment details */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Large apartment image */}
                    <div>
                      <img
                        src="https://storage.yandexcloud.net/domli-properties/schemaRoom.png"
                        alt={`План ${apartments[selectedApartment].type}`}
                        className="w-full h-64 object-contain rounded-lg border bg-gray-50 p-4"
                      />
                    </div>

                    {/* Apartment details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Проект</h3>
                        <p className="text-2xl font-bold text-gray-900">{apartments[selectedApartment].project}</p>
                      </div>

                      <div>
                        <h4 className="text-lg font-bold text-gray-800 mb-2">Стоимость</h4>
                        <p className="text-3xl font-bold text-green-600">{formatPrice(apartments[selectedApartment].price)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-semibold text-gray-700">Площадь</h5>
                          <p className="text-xl font-bold text-gray-900">{apartments[selectedApartment].area} м²</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-700">Этаж</h5>
                          <p className="text-xl font-bold text-gray-900">{apartments[selectedApartment].floor}</p>
                        </div>
                      </div>

                      <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2">
                        <span>Забронировать</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* General Plan Section */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Генеральный план</h2>
            <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
              Интерактивная 3D модель жилого комплекса с детальным планом территории и инфраструктурой.
            </p>
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <div className="relative rounded-lg overflow-hidden shadow-lg">
                  <video
                    className="w-full h-auto"
                    controls
                    preload="metadata"
                    style={{ maxHeight: '600px' }}
                  >
                    <source 
                      src="https://storage.yandexcloud.net/domli-properties/avalin-program-interface_KDof8XCy.mp4_1751144962382.mp4" 
                      type="video/mp4" 
                    />
                    <p className="text-center text-gray-500 p-8">
                      Ваш браузер не поддерживает воспроизведение видео. 
                      <a 
                        href="https://storage.yandexcloud.net/domli-properties/avalin-program-interface_KDof8XCy.mp4_1751144962382.mp4"
                        className="text-blue-600 hover:underline ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Скачать видео
                      </a>
                    </p>
                  </video>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Нажмите на воспроизведение, чтобы увидеть интерактивную модель комплекса
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CRM Form Modal */}
      <CRMForm 
        isOpen={isCRMFormOpen}
        onClose={() => setIsCRMFormOpen(false)}
        propertyData={property}
        userData={user}
        isAuthenticated={isAuthenticated}
      />
      
      <Footer />
    </div>
  );
};

export default PropertyDetail;