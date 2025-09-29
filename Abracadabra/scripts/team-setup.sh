#!/bin/bash

# Скрипт настройки Domli для команды (Без Docker)
echo "🚀 Настройка Domli для разработки команды..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Без цвета

# Функция для вывода цветного текста
print_status() {
    echo -e "${GREEN}[ИНФО]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ПРЕДУПРЕЖДЕНИЕ]${NC} $1"
}

print_error() {
    echo -e "${RED}[ОШИБКА]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Проверка требований
check_prerequisites() {
    print_header "Проверка требований"
    
    # Проверка Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js не установлен. Пожалуйста, установите Node.js 18+ сначала."
        echo "Посетите: https://nodejs.org/"
        exit 1
    fi
    
    # Проверка npm
    if ! command -v npm &> /dev/null; then
        print_error "npm не установлен. Пожалуйста, установите npm сначала."
        exit 1
    fi
    
    # Проверка PostgreSQL
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL не установлен. Пожалуйста, установите PostgreSQL сначала."
        echo "Посетите: https://www.postgresql.org/download/"
        exit 1
    fi
    
    print_status "Версия Node.js: $(node --version)"
    print_status "Версия npm: $(npm --version)"
    print_status "Версия PostgreSQL: $(psql --version)"
}

# Установка зависимостей
install_dependencies() {
    print_header "Установка зависимостей"
    
    print_status "Установка корневых зависимостей..."
    npm install
    
    print_status "Установка зависимостей backend..."
    cd backend && npm install && cd ..
    
    print_status "Установка зависимостей frontend..."
    cd frontend && npm install && cd ..
    
    print_status "Все зависимости установлены успешно!"
}

# Настройка файлов окружения
setup_environment() {
    print_header "Настройка файлов окружения"
    
    # Окружение backend
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << EOF
# Конфигурация базы данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=domli_db
DB_USER=domli_user
DB_PASSWORD=domli_password_123

# Конфигурация JWT
JWT_SECRET=ваш_супер_секретный_jwt_ключ_измените_это_в_продакшене
JWT_EXPIRES_IN=7d

# Конфигурация сервера
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
        print_status "Создан backend/.env"
    else
        print_status "backend/.env уже существует"
    fi

    # Окружение frontend
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
# Конфигурация API
VITE_API_URL=http://localhost:3000/api
VITE_NODE_ENV=development
EOF
        print_status "Создан frontend/.env"
    else
        print_status "frontend/.env уже существует"
    fi
}

# Настройка базы данных
setup_database() {
    print_header "Настройка базы данных"
    
    print_warning "Это создаст новую базу данных PostgreSQL и пользователя."
    read -p "Хотите продолжить? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Создание базы данных и пользователя..."
        
        # Попытка создать базу данных и пользователя
        sudo -u postgres psql -c "CREATE DATABASE domli_db;" 2>/dev/null || print_warning "База данных может уже существовать"
        sudo -u postgres psql -c "CREATE USER domli_user WITH PASSWORD 'domli_password_123';" 2>/dev/null || print_warning "Пользователь может уже существовать"
        sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE domli_db TO domli_user;" 2>/dev/null || print_warning "Привилегии могут уже быть предоставлены"
        
        print_status "Настройка базы данных завершена!"
    else
        print_warning "Пропуск настройки базы данных. Пожалуйста, настройте базу данных вручную."
    fi
}

# Запуск миграций и заполнения
run_migrations() {
    print_header "Запуск миграций базы данных"
    
    print_status "Запуск миграций..."
    cd backend && npm run migrate && cd ..
    
    print_status "Заполнение базы данных..."
    cd backend && npm run seed && cd ..
}

# Показать финальные инструкции
show_instructions() {
    print_header "Настройка завершена!"
    
    echo ""
    echo "🎉 Ваша среда разработки Domli готова!"
    echo ""
    echo "📋 Следующие шаги:"
    echo "1. Запустите приложение: npm run dev"
    echo "2. Откройте браузер по адресу: http://localhost:5173"
    echo "3. Backend API: http://localhost:3000"
    echo ""
    echo "📝 Важные заметки:"
    echo "- Учетные данные базы данных находятся в backend/.env"
    echo "- Измените JWT_SECRET в backend/.env для продакшена"
    echo "- Пользователь базы данных 'domli_user' с паролем 'domli_password_123'"
    echo ""
    echo "🔧 Полезные команды:"
    echo "  npm run dev          - Запуск frontend и backend"
    echo "  npm run build        - Сборка для продакшена"
    echo "  npm run start        - Запуск с PM2"
    echo "  npm run logs         - Просмотр логов PM2"
    echo ""
}

# Основное выполнение
main() {
    print_header "Настройка команды Domli"
    
    check_prerequisites
    install_dependencies
    setup_environment
    setup_database
    run_migrations
    show_instructions
    
    print_status "Настройка завершена успешно! 🎉"
}

# Запуск основной функции
main 