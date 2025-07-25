# WhatToDo - Умные рекомендации для досуга 🎯

Современное веб-приложение для поиска идей досуга в стиле Apple Design. Приложение предлагает персонализированные рекомендации на основе настроения, времени, бюджета и количества людей.

## ✨ Особенности

- 🎨 **Дизайн в стиле Apple** - минималистичный и элегантный интерфейс
- 🔍 **Умные рекомендации** - фильтрация по настроению, времени, бюджету
- ❤️ **Избранное** - сохраняйте понравившиеся идеи
- 📚 **История** - отслеживайте просмотренные активности
- 👤 **Авторизация** - персональные настройки и данные
- 🌙 **Темная тема** - комфортное использование в любое время
- 📱 **Адаптивный дизайн** - работает на всех устройствах

## 🚀 Быстрый старт

### Предварительные требования

- Node.js (версия 14 или выше)
- npm или yarn

### Установка

1. **Клонируйте репозиторий**
   ```bash
   git clone <repository-url>
   cd whattodo-app
   ```

2. **Установите зависимости**
   ```bash
   npm install
   ```

3. **Запустите сервер**
   ```bash
   npm start
   ```

4. **Откройте приложение**
   ```
   http://localhost:3000
   ```

## 📁 Структура проекта

```
whattodo-app/
├── server.js          # Express сервер
├── index.html         # Главная страница
├── login.html         # Страница входа
├── register.html      # Страница регистрации
├── script.js          # Основной JavaScript
├── styles.css         # Стили в стиле Apple
├── db.json           # База данных (создается автоматически)
├── package.json      # Зависимости и скрипты
└── README.md         # Документация
```

## 🛠️ Технологии

- **Backend**: Node.js, Express.js
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **База данных**: JSON файл (для простоты)
- **Дизайн**: Apple Design System
- **Иконки**: Font Awesome

## 📖 Использование

### Регистрация и вход
1. Нажмите "Регистрация" для создания аккаунта
2. Заполните форму: имя, email, пароль
3. Или войдите в существующий аккаунт

### Поиск идей
1. Выберите настроение (радостное, нейтральное, грустное и т.д.)
2. Укажите доступное время (1-12 часов)
3. Выберите бюджет (бесплатно, низкий, средний, высокий)
4. Укажите количество людей
5. Нажмите "Найти идеи"

### Работа с избранным
- Нажмите ❤️ на любой активности для добавления в избранное
- Перейдите в раздел "Избранное" для просмотра сохраненных идей
- Удалите из избранного кнопкой "Убрать"

### История просмотров
- Все просмотренные активности автоматически сохраняются
- Доступ к истории в соответствующем разделе

### Настройки
- Измените имя пользователя
- Включите/выключите темную тему
- Настройки сохраняются автоматически

## 🔧 API Endpoints

### Активности
- `GET /api/activities` - получить все активности
- `GET /api/activities/filter` - фильтрованные активности

### Пользователи
- `POST /api/register` - регистрация
- `POST /api/login` - вход
- `GET /api/user/:id` - получить пользователя
- `PUT /api/user/:id/preferences` - обновить настройки

### Избранное
- `GET /api/user/:id/favorites` - получить избранное
- `POST /api/user/:id/favorites` - добавить в избранное
- `DELETE /api/user/:id/favorites/:activityId` - удалить из избранного

### История
- `GET /api/user/:id/history` - получить историю
- `POST /api/user/:id/history` - добавить в историю

## 🎨 Дизайн

Приложение использует дизайн-систему Apple с:
- Минималистичным интерфейсом
- Стеклянными эффектами (glassmorphism)
- Плавными анимациями
- Адаптивной типографикой
- Интуитивной навигацией

### Цветовая схема
- **Primary**: #007AFF (Apple Blue)
- **Secondary**: #34C759 (Apple Green)
- **Danger**: #FF3B30 (Apple Red)
- **Warning**: #FF9500 (Apple Orange)

## 📱 Адаптивность

Приложение полностью адаптивно и работает на:
- 🖥️ Десктопах
- 💻 Ноутбуках
- 📱 Планшетах
- 📱 Смартфонах

## 🔒 Безопасность

- Пароли хранятся в открытом виде (для демонстрации)
- В продакшене рекомендуется использовать хеширование
- CORS настроен для локальной разработки

## 🚀 Развертывание

### Локально
```bash
npm start
```

### На сервере
1. Загрузите файлы на сервер
2. Установите зависимости: `npm install`
3. Запустите: `npm start`
4. Настройте reverse proxy (nginx) при необходимости

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License - см. файл LICENSE для деталей.

## 🆘 Поддержка

Если у вас возникли проблемы:
1. Проверьте, что Node.js установлен
2. Убедитесь, что порт 3000 свободен
3. Проверьте консоль браузера на ошибки
4. Создайте Issue в репозитории

## 🎯 Планы развития

- [ ] Добавление новых категорий активностей
- [ ] Интеграция с внешними API
- [ ] Push-уведомления
- [ ] Экспорт данных
- [ ] Социальные функции
- [ ] Мобильное приложение

---

**Создано с ❤️ для поиска лучших идей досуга**


