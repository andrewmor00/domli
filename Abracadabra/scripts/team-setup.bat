@echo off
setlocal enabledelayedexpansion

echo 🚀 Настройка Domli для разработки команды...

:: Проверка требований
echo === Проверка требований ===

:: Проверка Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] Node.js не установлен. Пожалуйста, установите Node.js 18+ сначала.
    echo Посетите: https://nodejs.org/
    pause
    exit /b 1
)

:: Проверка npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] npm не установлен. Пожалуйста, установите npm сначала.
    pause
    exit /b 1
)

:: Проверка PostgreSQL
psql --version >nul 2>&1
if errorlevel 1 (
    echo [ОШИБКА] PostgreSQL не установлен. Пожалуйста, установите PostgreSQL сначала.
    echo Посетите: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

echo [ИНФО] Версия Node.js: 
node --version
echo [ИНФО] Версия npm: 
npm --version
echo [ИНФО] Версия PostgreSQL: 
psql --version

:: Установка зависимостей
echo === Установка зависимостей ===

echo [ИНФО] Установка корневых зависимостей...
call npm install

echo [ИНФО] Установка зависимостей backend...
cd backend
call npm install
cd ..

echo [ИНФО] Установка зависимостей frontend...
cd frontend
call npm install
cd ..

echo [ИНФО] Все зависимости установлены успешно!

:: Настройка файлов окружения
echo === Настройка файлов окружения ===

:: Окружение backend
if not exist "backend\.env" (
    echo [ИНФО] Создание backend\.env
    (
        echo # Конфигурация базы данных
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=domli_db
        echo DB_USER=domli_user
        echo DB_PASSWORD=domli_password_123
        echo.
        echo # Конфигурация JWT
        echo JWT_SECRET=ваш_супер_секретный_jwt_ключ_измените_это_в_продакшене
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # Конфигурация сервера
        echo PORT=3000
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:5173
    ) > backend\.env
) else (
    echo [ИНФО] backend\.env уже существует
)

:: Окружение frontend
if not exist "frontend\.env" (
    echo [ИНФО] Создание frontend\.env
    (
        echo # Конфигурация API
        echo VITE_API_URL=http://localhost:3000/api
        echo VITE_NODE_ENV=development
    ) > frontend\.env
) else (
    echo [ИНФО] frontend\.env уже существует
)

:: Настройка базы данных
echo === Настройка базы данных ===
echo [ПРЕДУПРЕЖДЕНИЕ] Пожалуйста, настройте базу данных PostgreSQL вручную:
echo 1. Откройте pgAdmin или psql
echo 2. Создайте базу данных: CREATE DATABASE domli_db;
echo 3. Создайте пользователя: CREATE USER domli_user WITH PASSWORD 'domli_password_123';
echo 4. Предоставьте привилегии: GRANT ALL PRIVILEGES ON DATABASE domli_db TO domli_user;

set /p continue="Вы настроили базу данных? (y/N): "
if /i "%continue%"=="y" (
    echo [ИНФО] Запуск миграций базы данных...
    cd backend
    call npm run migrate
    cd ..
    
    echo [ИНФО] Заполнение базы данных...
    cd backend
    call npm run seed
    cd ..
) else (
    echo [ПРЕДУПРЕЖДЕНИЕ] Пропуск настройки базы данных. Пожалуйста, запустите миграции вручную позже.
)

:: Показать финальные инструкции
echo === Настройка завершена! ===
echo.
echo 🎉 Ваша среда разработки Domli готова!
echo.
echo 📋 Следующие шаги:
echo 1. Запустите приложение: npm run dev
echo 2. Откройте браузер по адресу: http://localhost:5173
echo 3. Backend API: http://localhost:3000
echo.
echo 📝 Важные заметки:
echo - Учетные данные базы данных находятся в backend\.env
echo - Измените JWT_SECRET в backend\.env для продакшена
echo - Пользователь базы данных 'domli_user' с паролем 'domli_password_123'
echo.
echo 🔧 Полезные команды:
echo   npm run dev          - Запуск frontend и backend
echo   npm run build        - Сборка для продакшена
echo   npm run start        - Запуск с PM2
echo   npm run logs         - Просмотр логов PM2
echo.

echo [ИНФО] Настройка завершена успешно! 🎉
pause 