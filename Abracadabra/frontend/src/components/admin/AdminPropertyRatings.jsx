import React, { useState, useEffect } from 'react';

const AdminPropertyRatings = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for property ratings
    const mockProperties = [
      { id: 1, name: 'ЖК Сердце', rating: 4.5, reviews: 125, sales: 45 },
      { id: 2, name: 'ЖК Теплые края', rating: 4.2, reviews: 89, sales: 32 },
      { id: 3, name: 'ЖК Фонтаны', rating: 4.0, reviews: 67, sales: 28 },
      { id: 4, name: 'ЖК Режиссер', rating: 3.8, reviews: 54, sales: 19 },
      { id: 5, name: 'ЖК Победа', rating: 4.1, reviews: 78, sales: 25 }
    ];
    
    setProperties(mockProperties);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Рейтинг квартир</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Обновить рейтинги
        </button>
      </div>

      {/* Property Ratings Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-700">ЖК</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Рейтинг</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Отзывы</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Продажи</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">Действия</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{property.name}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < Math.floor(property.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-gray-600 text-sm">({property.rating})</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-700">{property.reviews}</td>
                  <td className="py-4 px-6 text-gray-700">{property.sales}</td>
                  <td className="py-4 px-6">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Редактировать
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500 text-white rounded-lg p-6">
          <h3 className="text-sm font-medium opacity-90 mb-2">Средний рейтинг</h3>
          <div className="text-2xl font-bold">4.1</div>
        </div>
        
        <div className="bg-green-500 text-white rounded-lg p-6">
          <h3 className="text-sm font-medium opacity-90 mb-2">Всего отзывов</h3>
          <div className="text-2xl font-bold">413</div>
        </div>
        
        <div className="bg-purple-500 text-white rounded-lg p-6">
          <h3 className="text-sm font-medium opacity-90 mb-2">Лучший ЖК</h3>
          <div className="text-lg font-bold">Сердце</div>
        </div>
        
        <div className="bg-orange-500 text-white rounded-lg p-6">
          <h3 className="text-sm font-medium opacity-90 mb-2">Нужно внимания</h3>
          <div className="text-2xl font-bold">2</div>
        </div>
      </div>
    </div>
  );
};

export default AdminPropertyRatings; 