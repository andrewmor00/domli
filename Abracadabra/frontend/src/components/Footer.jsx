export default function Footer() {
  return (
    <footer className="bg-blue-50 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl sm:text-2xl font-bold text-blue-600">Домли</span>
            </div>
            <div className="text-gray-700 text-sm sm:text-base">Ваш путь к новому дому начинается здесь</div>
          </div>
          <div className="w-full md:w-auto">
            <div className="text-blue-700 font-bold mb-2 text-sm sm:text-base">Способ Покупки</div>
            <ul className="text-blue-700 space-y-1 text-sm sm:text-base">
              <li>Ипотека</li>
              <li>Рассрочка</li>
              <li>Материнский капитал</li>
              <li>Покупка на всю стоимость</li>
            </ul>
            <div className="text-blue-700 font-bold mt-4 text-sm sm:text-base">Контакты</div>
            <div className="text-blue-700 text-sm sm:text-base mt-1">
              <p>Телефон: +7 (800) 123-45-67</p>
              <p>Email: info@domli.ru</p>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-blue-100 text-center">
          <p className="text-gray-600 text-xs sm:text-sm">
            © 2024 Домли. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
} 