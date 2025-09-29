import React, { useState, useEffect } from 'react';

const AdminStatistics = () => {
  const [stats, setStats] = useState({
    soldApartments: 124,
    averagePrice: 150,
    totalRevenue: 5.6,
    unsoldPercentage: 60
  });

  const [topSales] = useState([
    { complex: 'Сердце', rooms: '2-комнатная', area: '45м²', pricePerSqm: '140кР', sales: 13 },
    { complex: 'Теплые края', rooms: '3-комнатная', area: '65м²', pricePerSqm: '120кР', sales: 10 },
    { complex: 'Сердце', rooms: '3-комнатная', area: '70м²', pricePerSqm: '140кР', sales: 7 },
    { complex: 'Фонтан', rooms: '1-комнатная', area: '25м²', pricePerSqm: '150кР', sales: 6 }
  ]);

  const [topReservations] = useState([
    { complex: 'Сердце', rooms: '2-комнатная', reserved: 15 },
    { complex: 'Теплые края', rooms: '2-комнатная', reserved: 10 },
    { complex: 'Фонтаны', rooms: '3-комнатная', reserved: 9 },
    { complex: 'Режиссер', rooms: '1-комнатная', reserved: 6 },
    { complex: 'Сердце', rooms: '1-комнатная', reserved: 3 }
  ]);

  const [topStagnant] = useState([
    { complex: 'Сердце', rooms: '2-комнатная', daysWithoutSales: 100 },
    { complex: 'Теплые края', rooms: '2-комнатная', daysWithoutSales: 100 },
    { complex: 'Фонтаны', rooms: '3-комнатная', daysWithoutSales: 90 },
    { complex: 'Режиссер', rooms: '1-комнатная', daysWithoutSales: 60 },
    { complex: 'Сердце', rooms: '1-комнатная', daysWithoutSales: 39 }
  ]);

  // Mock chart data
  const chartData = [
    { month: 'Кв1', sold: 18, unsold: 22 },
    { month: 'Кв2', sold: 35, unsold: 50 },
    { month: 'Кв3', sold: 65, unsold: 48 },
    { month: 'Кв4', sold: 95, unsold: 42 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Sales Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-600 mb-4">Top-5 по продажам</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-blue-600">ЖК</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-600">Комнатность</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-600">Площадь</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-600">цена за м²</th>
                  <th className="text-left py-3 px-4 font-medium text-blue-600">Продажи</th>
                </tr>
              </thead>
              <tbody>
                {topSales.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-blue-600">{item.complex}</td>
                    <td className="py-3 px-4 text-gray-700">{item.rooms}</td>
                    <td className="py-3 px-4 text-gray-700">{item.area}</td>
                    <td className="py-3 px-4 text-gray-700">{item.pricePerSqm}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{item.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Statistics Cards and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-blue-500 text-white rounded-lg p-6">
            <h3 className="text-sm font-medium opacity-90 mb-2">кол-во проданных квартир</h3>
            <div className="text-3xl font-bold">{stats.soldApartments}</div>
          </div>
          
          <div className="bg-blue-500 text-white rounded-lg p-6">
            <h3 className="text-sm font-medium opacity-90 mb-2">Средняя цена за м²</h3>
            <div className="text-3xl font-bold">{stats.averagePrice}кР</div>
          </div>
          
          <div className="bg-blue-500 text-white rounded-lg p-6">
            <h3 className="text-sm font-medium opacity-90 mb-2">Общий оборот</h3>
            <div className="text-3xl font-bold">{stats.totalRevenue}млнР</div>
          </div>
          
          <div className="bg-blue-500 text-white rounded-lg p-6">
            <h3 className="text-sm font-medium opacity-90 mb-2">Доля непроданных</h3>
            <div className="text-3xl font-bold">{stats.unsoldPercentage} %</div>
          </div>
        </div>

        {/* Chart Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="h-64 flex items-end justify-between space-x-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center space-y-1">
                  {/* Sold bars (red) */}
                  <div 
                    className="w-8 bg-red-400 rounded-t"
                    style={{ height: `${data.sold * 2}px` }}
                  ></div>
                  {/* Unsold bars (blue) */}
                  <div 
                    className="w-8 bg-blue-400 rounded-b"
                    style={{ height: `${data.unsold * 2}px` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          
          {/* Chart Legend */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span className="text-sm text-gray-600">Проданные</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">Непроданные</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Reservations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Top-5 по продажам</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-blue-600">ЖК</th>
                  <th className="text-left py-2 font-medium text-blue-600">Комнатность</th>
                  <th className="text-left py-2 font-medium text-blue-600">Броней</th>
                </tr>
              </thead>
              <tbody>
                {topReservations.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-blue-600">{item.complex}</td>
                    <td className="py-2 text-gray-700">{item.rooms}</td>
                    <td className="py-2 font-semibold">{item.reserved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Stagnant */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Top-5 "зависших"</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-blue-600">ЖК</th>
                  <th className="text-left py-2 font-medium text-blue-600">Комнатность</th>
                  <th className="text-left py-2 font-medium text-blue-600">Дней без продаж</th>
                </tr>
              </thead>
              <tbody>
                {topStagnant.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-2 text-blue-600">{item.complex}</td>
                    <td className="py-2 text-gray-700">{item.rooms}</td>
                    <td className="py-2 font-semibold">{item.daysWithoutSales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics; 