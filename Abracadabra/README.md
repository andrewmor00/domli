# 🏠 DomLi - Платформа недвижимости с AI-помощником

Современная платформа для работы с недвижимостью в Краснодаре с интегрированным умным AI-ассистентом.

## 📋 Содержание

- [Особенности](#-особенности)
- [Технический стек](#-технический-стек)
- [Быстрый старт](#-быстрый-старт)
- [Установка](#-установка)
- [Конфигурация](#-конфигурация)
- [AI Интеграция](#-ai-интеграция)
- [Docker](#-docker)
- [API Документация](#-api-документация)
- [Разработка](#-разработка)
- [Развертывание](#-развертывание)
- [Устранение неполадок](#-устранение-неполадок)

## ✨ Особенности

### 🏢 Основные функции
- **Каталог недвижимости** - просмотр объектов с фильтрацией
- **Детальные карточки** - полная информация об объектах
- **Фотогалереи** - загрузка и просмотр изображений
- **Система бронирования** - резервирование объектов
- **Избранное** - сохранение понравившихся объектов
- **Профиль пользователя** - личный кабинет
- **Аутентификация** - безопасная система входа

### 🤖 AI-Помощник
- **Умный поиск** - поиск недвижимости на естественном языке
- **Персональные рекомендации** - подбор объектов по критериям
- **Диалоговый интерфейс** - общение с AI на русском языке
- **История разговоров** - сохранение контекста беседы
- **Fallback режим** - работа без AI при недоступности сервиса

### 💼 Бизнес-функции
- **CRM интеграция** - связь с менеджерами
- **Заявки** - автоматическое создание бронирований
- **Аналитика** - отслеживание активности пользователей
- **Уведомления** - система Toast-уведомлений

## 🛠 Технический стек

### Frontend
- **React 18** - основная библиотека UI
- **Vite** - сборщик проекта
- **Tailwind CSS** - стилизация
- **React Router** - маршрутизация
- **Lucide React** - иконки
- **Context API** - управление состоянием

### Backend
- **Node.js** - среда выполнения
- **Express.js** - веб-фреймворк
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **Bcrypt** - хеширование паролей
- **Multer** - загрузка файлов
- **AI Chat Integration** - умный ассистент

### Инфраструктура
- **Docker** - контейнеризация
- **PM2** - процесс менеджер
- **Nginx** - веб-сервер
- **AWS S3** - хранение файлов

## 🚀 Быстрый старт

```bash
# Клонирование репозитория
git clone <repository-url>
cd domli

# Установка зависимостей
npm install

# Настройка окружения
cp backend/.env.example backend/.env
# Отредактируйте backend/.env с вашими настройками

# Запуск с Docker
docker-compose up -d

# Или запуск вручную
npm run dev
```

Приложение будет доступно по адресу: http://localhost:5173

## 📦 Установка

### Предварительные требования
- **Node.js** 18+ и npm
- **PostgreSQL** 12+
- **Docker** и Docker Compose (опционально)
- **Git**

### Пошаговая установка

1. **Клонирование проекта**
```bash
git clone <repository-url>
cd domli
```

2. **Установка зависимостей**
```bash
# Корневые зависимости
npm install

# Backend зависимости
cd backend && npm install

# Frontend зависимости
cd ../frontend && npm install
```

3. **Настройка базы данных**
```bash
# Создание базы данных
createdb domli_db

# Запуск миграций
cd backend
npm run migrate
```

4. **Настройка переменных окружения**
```bash
cp backend/.env.example backend/.env
# Отредактируйте файл с вашими настройками
```

5. **Запуск приложения**
```bash
# Разработка
npm run dev

# Или по отдельности
npm run dev:backend  # Backend на порту 3000
npm run dev:frontend # Frontend на порту 5173
```

## ⚙️ Конфигурация

### Переменные окружения

Создайте файл `backend/.env` со следующими переменными:

```bash
# База данных
DATABASE_URL=postgresql://username:password@localhost:5432/domli_db

# Сервер
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key

# AI Assistant Configuration
GIGACHAT_CLIENT_ID=your-client-id-from-sberbank
GIGACHAT_CLIENT_SECRET=your-client-secret-from-sberbank
GIGACHAT_IS_PERSONAL=true
GIGACHAT_IGNORE_TSL=true
GIGACHAT_MODEL=GigaChat:latest
GIGACHAT_MAX_TOKENS=1000
GIGACHAT_TEMPERATURE=0.7
GIGACHAT_TIMEOUT=30000

# AWS S3 (опционально)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket

# Email (опционально)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

### Структура базы данных

```sql
-- Пользователи
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Недвижимость
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  property_type VARCHAR(100),
  address TEXT,
  price VARCHAR(50),
  rooms INTEGER,
  area DECIMAL(10,2),
  developer VARCHAR(255),
  deadline VARCHAR(100),
  main_photo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Бронирования и избранное
CREATE TABLE property_reservations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  status VARCHAR(50) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);
```

## 🤖 AI Интеграция

### Получение API ключей

1. Зарегистрируйтесь на [портале разработчиков Сбербанка](https://developers.sber.ru/studio)
2. Создайте новое приложение
3. Сохраните **Client ID** и **Client Secret** (НЕ закрывайте окно до сохранения!)
4. Добавьте оба значения в переменные окружения

**Важно:** 
- Client ID и Client Secret показываются только один раз
- Система автоматически создаст Authorization Key из пары `Client ID:Client Secret` в base64
- Для персонального использования установите `GIGACHAT_IS_PERSONAL=true`

### Настройка AI-ассистента

```bash
# Обязательные параметры
GIGACHAT_CLIENT_ID=ваш-client-id-от-сбербанка
GIGACHAT_CLIENT_SECRET=ваш-client-secret-от-сбербанка
GIGACHAT_IS_PERSONAL=true  # true для физлиц, false для юрлиц

# Опциональные параметры
GIGACHAT_IGNORE_TSL=true   # игнорировать SSL сертификаты
GIGACHAT_MODEL=GigaChat:latest
GIGACHAT_MAX_TOKENS=1000   # максимум токенов в ответе
GIGACHAT_TEMPERATURE=0.7   # креативность (0.0-1.0)
GIGACHAT_TIMEOUT=30000     # таймаут в миллисекундах
```

### Возможности AI

AI-помощник понимает запросы на русском языке:

- **"Покажи однокомнатные квартиры до 5 млн"**
- **"Найди квартиры в центре Краснодара"**
- **"Что есть из готового жилья?"**
- **"Покажи трехкомнатные от 3 до 7 миллионов"**

### API эндпоинты чата

- `POST /api/chat/message` - отправка сообщения
- `GET /api/chat/history/:sessionId` - история разговора
- `DELETE /api/chat/history/:sessionId` - очистка истории
- `GET /api/chat/suggestions` - предложенные вопросы
- `GET /api/chat/health` - статус сервиса

## 🐳 Docker

### Разработка

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Production

```bash
# Сборка и запуск продакшн версии
docker-compose -f docker-compose.prod.yml up -d

# Обновление
./deploy.sh
```

### Конфигурация контейнеров

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: domli_db
      POSTGRES_USER: domli_user
      POSTGRES_PASSWORD: domli_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 📚 API Документация

### Аутентификация

```bash
# Регистрация
POST /api/auth/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password",
  "name": "Имя пользователя"
}

# Вход
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password"
}

# Выход
POST /api/auth/logout
Authorization: Bearer <token>
```

### Недвижимость

```bash
# Получение всех объектов
GET /api/properties

# Получение объекта по ID
GET /api/properties/:id

# Поиск с фильтрами
GET /api/properties?type=квартира&rooms=2&minPrice=1000000
```

### Бронирования

```bash
# Создание бронирования
POST /api/reservations
Authorization: Bearer <token>
Content-Type: application/json
{
  "propertyId": 1,
  "notes": "Заинтересован в покупке"
}

# Получение бронирований пользователя
GET /api/reservations/user
Authorization: Bearer <token>

# Отмена бронирования
DELETE /api/reservations/:id
Authorization: Bearer <token>
```

### Чат с AI

```bash
# Отправка сообщения AI
POST /api/chat/message
Content-Type: application/json
{
  "message": "Покажи однокомнатные квартиры",
  "sessionId": "session_123"
}

# Получение предложенных вопросов
GET /api/chat/suggestions
```

## 👨‍💻 Разработка

### Структура проекта

```
domli/
├── backend/                 # Backend приложение
│   ├── config/             # Конфигурация
│   ├── routes/             # API маршруты
│   ├── services/           # Бизнес-логика
│   ├── middleware/         # Промежуточные обработчики
│   ├── migrations/         # Миграции БД
│   └── server.js           # Точка входа
├── frontend/               # Frontend приложение
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/          # Страницы
│   │   ├── context/        # Context API
│   │   └── services/       # API сервисы
│   └── public/             # Статические файлы
├── scripts/                # Скрипты автоматизации
├── docker-compose.yml      # Docker конфигурация
└── package.json            # Корневые зависимости
```

### Команды разработки

```bash
# Запуск в режиме разработки
npm run dev

# Запуск только backend
npm run dev:backend

# Запуск только frontend
npm run dev:frontend

# Линтинг
npm run lint

# Сборка продакшн версии
npm run build

# Миграции БД
npm run migrate

# Заполнение тестовыми данными
npm run seed
```

### Добавление новых функций

1. **Backend API:**
   - Создайте новый файл маршрута в `backend/routes/`
   - Добавьте бизнес-логику в `backend/services/`
   - Зарегистрируйте маршрут в `server.js`

2. **Frontend компонент:**
   - Создайте компонент в `frontend/src/components/`
   - Добавьте стили с Tailwind CSS
   - Интегрируйте с API через `services/api.js`

3. **База данных:**
   - Создайте миграцию в `backend/migrations/`
   - Обновите схему в README
   - Запустите миграцию

### Код стайл

- **ESLint** для проверки кода
- **Prettier** для форматирования
- **Conventional Commits** для коммитов
- **Camel Case** для переменных JavaScript
- **Snake Case** для полей БД

## 🚀 Развертывание

### Продакшн сервер

1. **Подготовка сервера:**
```bash
# Установка Docker и Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Клонирование проекта
git clone <repository-url>
cd domli
```

2. **Конфигурация продакшн:**
```bash
# Копирование переменных окружения
cp backend/.env.example backend/.env
# Отредактируйте с продакшн настройками

# Сборка и запуск
docker-compose -f docker-compose.prod.yml up -d
```

3. **Настройка Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Автоматическое развертывание

Используйте скрипт `deploy.sh`:

```bash
chmod +x deploy.sh
./deploy.sh
```

### Мониторинг

- **Логи:** `docker-compose logs -f`
- **Метрики:** PM2 dashboard
- **Здоровье:** `/health` и `/api/chat/health`

## 🔧 Устранение неполадок

### Частые проблемы

**База данных недоступна:**
```bash
# Проверка статуса
docker-compose ps

# Перезапуск БД
docker-compose restart db

# Проверка логов
docker-compose logs db
```

**AI-ассистент не отвечает:**
- Проверьте `GIGACHAT_CLIENT_ID` и `GIGACHAT_CLIENT_SECRET`
- Убедитесь, что значения получены с портала Сбербанка
- Убедитесь в наличии интернет-соединения
- Проверьте логи: `docker-compose logs backend`

**Frontend не загружается:**
- Проверьте доступность backend на порту 3000
- Убедитесь в правильности CORS настроек
- Очистите кеш браузера

**Ошибки аутентификации:**
- Проверьте `JWT_SECRET` в переменных окружения
- Убедитесь в правильности паролей пользователей
- Проверьте время жизни токенов

### Логи и отладка

```bash
# Просмотр всех логов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend

# Подключение к контейнеру
docker-compose exec backend bash

# Проверка переменных окружения
docker-compose exec backend env
```

### Сброс системы

```bash
# Полная очистка
docker-compose down -v
docker system prune -a

# Пересборка
docker-compose build --no-cache
docker-compose up -d
```

## 🤝 Участие в разработке

1. Форкните проект
2. Создайте ветку функции (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

- **Email:** support@domli.ru
- **Telegram:** @domli_support
- **Issues:** GitHub Issues

---

**DomLi** - современное решение для рынка недвижимости с собственным AI-ассистентом 🏠🤖 