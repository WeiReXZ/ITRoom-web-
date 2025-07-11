const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;
const DB_FILE = 'db.json';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Логирование всех запросов
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`, req.body);
    next();
});

// Чтение базы данных
function readDB() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            const defaultDB = {
                users: [],
                activities: [
                    // ... ваш существующий список активностей ...
                ]
            };
            writeDB(defaultDB);
            return defaultDB;
        }
        
        const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        
        // ... ваш существующий код ...
        
        return data;
    } catch (error) {
        console.error('Error reading DB:', error);
        return {
            users: [],
            activities: []
        };
    }
}

// Запись в базу данных
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Эндпоинт для получения всех активностей
app.get('/api/activities', (req, res) => {
    const db = readDB();
    res.json({ activities: db.activities });
});

// Эндпоинт для получения отфильтрованных активностей
app.get('/api/activities/filter', (req, res) => {
    // ... ваш существующий код ...
});

// Регистрация пользователя
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    
    console.log('🔵 Попытка регистрации:', { name, email });
    
    if (!name || !email || !password) {
        console.log('❌ Ошибка регистрации: не все поля заполнены');
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    const db = readDB();
    
    if (db.users.find(u => u.email === email)) {
        console.log('❌ Ошибка регистрации: email уже существует:', email);
        return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }
    
    const user = {
        id: Date.now().toString(),
        name,
        email,
        password,
        favorites: [],
        history: [],
        preferences: {
            darkMode: false,
            notifications: true
        },
        createdAt: new Date().toISOString()
    };
    
    db.users.push(user);
    writeDB(db);
    
    console.log('✅ Пользователь успешно зарегистрирован:', { name, email, id: user.id });
    
    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// Вход пользователя
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log('🔵 Попытка входа:', { email });
    
    if (!email || !password) {
        console.log('❌ Ошибка входа: не все поля заполнены');
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        console.log('❌ Ошибка входа: неверные данные для:', email);
        return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    
    console.log('✅ Пользователь успешно вошел:', { name: user.name, email, id: user.id });
    
    res.json({
        success: true,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

// ... остальные эндпоинты ...

// Статические файлы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/favorites', (req, res) => {
    res.sendFile(path.join(__dirname, 'favorites.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'settings.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 База данных: ${DB_FILE}`);
    console.log(`🌐 Откройте браузер и перейдите по адресу выше`);
});