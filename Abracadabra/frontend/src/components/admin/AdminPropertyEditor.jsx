import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AdminPropertyEditor = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    developer_name: '',
    project_name: '',
    property_type: 'apartment',
    rooms_count: '',
    area: '',
    price_total: '',
    completion_year: '',
    address: '',
    description: '',
    amenities: '',
    status: 'available'
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/properties/csv');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      } else {
        toast.error('Ошибка загрузки объектов');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingProperty !== null) {
        // Update existing property
        await updateProperty(editingProperty, formData);
        toast.success('Объект успешно обновлен');
      } else {
        // Add new property
        await addProperty(formData);
        toast.success('Объект успешно добавлен');
      }
      
      resetForm();
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error('Ошибка сохранения объекта');
    }
  };

  const addProperty = async (propertyData) => {
    // For now, this will add to mock data since we're using CSV
    // In a real implementation, this would be a POST request to an admin API
    const newProperty = {
      ...propertyData,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    setProperties(prev => [...prev, newProperty]);
  };

  const updateProperty = async (index, propertyData) => {
    // For now, this updates the local state
    // In a real implementation, this would be a PUT request to an admin API
    setProperties(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...propertyData };
      return updated;
    });
  };

  const deleteProperty = async (index) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот объект?')) {
      return;
    }

    try {
      // For now, this deletes from local state
      // In a real implementation, this would be a DELETE request to an admin API
      setProperties(prev => prev.filter((_, i) => i !== index));
      toast.success('Объект успешно удален');
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Ошибка удаления объекта');
    }
  };

  const resetForm = () => {
    setFormData({
      developer_name: '',
      project_name: '',
      property_type: 'apartment',
      rooms_count: '',
      area: '',
      price_total: '',
      completion_year: '',
      address: '',
      description: '',
      amenities: '',
      status: 'available'
    });
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const startEdit = (property, index) => {
    setEditingProperty(index);
    setFormData(property);
    setShowAddForm(true);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.developer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || property.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Редактор объектов</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Добавить объект
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по названию, застройщику или адресу..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Статус
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="available">Доступен</option>
              <option value="sold">Продан</option>
              <option value="reserved">Забронирован</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingProperty !== null ? 'Редактировать объект' : 'Добавить новый объект'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Застройщик
              </label>
              <input
                type="text"
                name="developer_name"
                value={formData.developer_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название проекта
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип недвижимости
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="apartment">Квартира</option>
                <option value="house">Дом</option>
                <option value="commercial">Коммерческая</option>
                <option value="land">Участок</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество комнат
              </label>
              <input
                type="text"
                name="rooms_count"
                value={formData.rooms_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Площадь (м²)
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (руб.)
              </label>
              <input
                type="number"
                name="price_total"
                value={formData.price_total}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Год сдачи
              </label>
              <input
                type="number"
                name="completion_year"
                value={formData.completion_year}
                onChange={handleInputChange}
                min="2020"
                max="2030"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="available">Доступен</option>
                <option value="sold">Продан</option>
                <option value="reserved">Забронирован</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Удобства (через запятую)
              </label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleInputChange}
                placeholder="Парковка, Лифт, Балкон..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProperty !== null ? 'Обновить' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Объекты недвижимости ({filteredProperties.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Проект</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Застройщик</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Тип</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Комнаты</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Площадь</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Цена</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Год сдачи</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredProperties.map((property, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{property.project_name}</div>
                    {property.address && (
                      <div className="text-sm text-gray-500">{property.address}</div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-gray-700">{property.developer_name}</td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {property.property_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{property.rooms_count}</td>
                  <td className="py-4 px-6 text-gray-700">
                    {property.area && `${property.area} м²`}
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {property.price_total && 
                      new Intl.NumberFormat('ru-RU').format(property.price_total) + ' ₽'
                    }
                  </td>
                  <td className="py-4 px-6 text-gray-700">{property.completion_year}</td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(property, index)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => deleteProperty(index)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Объекты не найдены</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyEditor; 