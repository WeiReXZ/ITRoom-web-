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
                activities: []
            };
            writeDB(defaultDB);
            return defaultDB;
        }
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (error) {
        console.error('Error reading DB:', error);
        return { users: [], activities: [] };
    }
}

// Запись в базу данных
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ======== ЭНДПОИНТЫ АКТИВНОСТЕЙ ======== //

// Получение всех активностей
app.get('/api/activities', (req, res) => {
    const db = readDB();
    res.json({ activities: db.activities });
});

// Фильтрация активностей
app.get('/api/activities/filter', (req, res) => {
    const db = readDB();
    const { mood, time, budget, people, category, distance } = req.query;
    
    let filtered = db.activities;
    
    if (mood) {
        filtered = filtered.filter(a => a.mood.includes(mood));
    }
    
    if (time) {
        const timeNum = parseInt(time);
        filtered = filtered.filter(a => a.time <= timeNum);
    }
    
    if (budget && budget !== 'any') {
        filtered = filtered.filter(a => a.budget === budget);
    }
    
    if (people && people !== 'any') {
        filtered = filtered.filter(a => a.people.includes(people));
    }
    
    if (category && category !== 'any') {
        filtered = filtered.filter(a => a.category === category);
    }
    
    res.json({ activities: filtered });
});

// Добавление активности
app.post('/api/activities', (req, res) => {
    const newActivity = req.body;
    const db = readDB();
    
    // Генерация ID
    const newId = db.activities.length > 0 
        ? Math.max(...db.activities.map(a => a.id)) + 1 
        : 1;
    
    newActivity.id = newId;
    db.activities.push(newActivity);
    writeDB(db);
    
    res.json({ success: true, activity: newActivity });
});

// Удаление активности
app.delete('/api/activities/:id', (req, res) => {
    const activityId = parseInt(req.params.id);
    const db = readDB();
    
    const initialLength = db.activities.length;
    db.activities = db.activities.filter(a => a.id !== activityId);
    
    if (db.activities.length < initialLength) {
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Активность не найдена' });
    }
});

// ======== ЭНДПОИНТЫ ПОЛЬЗОВАТЕЛЕЙ ======== //

// Регистрация
app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }
    
    const db = readDB();
    if (db.users.some(u => u.email === email)) {
        return res.status(400).json({ error: 'Email уже зарегистрирован' });
    }
    
    const user = {
        id: Date.now().toString(),
        name,
        email,
        password,
        favorites: [],
        history: [],
        preferences: { darkMode: false, notifications: true },
        createdAt: new Date().toISOString()
    };
    
    db.users.push(user);
    writeDB(db);
    
    res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email }
    });
});

// Авторизация
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }
    
    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
        return res.status(400).json({ error: 'Неверный email или пароль' });
    }
    
    res.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email }
    });
});

// Получение информации о пользователе
app.get('/api/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const db = readDB();
    
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ user });
});

// Обновление настроек пользователя
app.put('/api/user/:userId/preferences', (req, res) => {
    const userId = req.params.userId;
    const { darkMode, username } = req.body;
    
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    db.users[userIndex].preferences = { 
        ...db.users[userIndex].preferences, 
        darkMode: darkMode 
    };
    
    if (username) {
        db.users[userIndex].name = username;
    }
    
    writeDB(db);
    res.json({ success: true, user: db.users[userIndex] });
});

// ======== ЭНДПОИНТЫ ИЗБРАННОГО ======== //

// Получение избранного пользователя
app.get('/api/user/:userId/favorites', (req, res) => {
    const userId = req.params.userId;
    const db = readDB();
    
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const favoriteActivities = user.favorites.map(favId => 
        db.activities.find(a => a.id === favId)
    ).filter(Boolean);
    
    res.json({ activities: favoriteActivities });
});

// Добавление в избранное
app.post('/api/user/:userId/favorites', (req, res) => {
    const userId = req.params.userId;
    const { activityId } = req.body;
    
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (!db.users[userIndex].favorites.includes(activityId)) {
        db.users[userIndex].favorites.push(activityId);
        writeDB(db);
    }
    
    res.json({ success: true });
});

// Удаление из избранного
app.delete('/api/user/:userId/favorites/:activityId', (req, res) => {
    const userId = req.params.userId;
    const activityId = req.params.activityId;
    
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    db.users[userIndex].favorites = db.users[userIndex].favorites.filter(
        id => id !== activityId
    );
    
    writeDB(db);
    res.json({ success: true });
});

// ======== ЭНДПОИНТЫ ИСТОРИИ ======== //

// Получение истории пользователя
app.get('/api/user/:userId/history', (req, res) => {
    const userId = req.params.userId;
    const db = readDB();
    
    const user = db.users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const historyActivities = user.history.map(hist => ({
        ...db.activities.find(a => a.id === hist.activityId),
        viewedAt: hist.viewedAt
    })).filter(Boolean);
    
    res.json({ activities: historyActivities });
});

// Добавление в историю
app.post('/api/user/:userId/history', (req, res) => {
    const userId = req.params.userId;
    const { activityId } = req.body;
    
    const db = readDB();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Проверяем, есть ли уже такая активность в истории
    const existingIndex = db.users[userIndex].history.findIndex(
        h => h.activityId === activityId
    );
    
    if (existingIndex >= 0) {
        // Обновляем дату просмотра
        db.users[userIndex].history[existingIndex].viewedAt = new Date().toISOString();
    } else {
        // Добавляем новую запись
        db.users[userIndex].history.push({
            activityId,
            viewedAt: new Date().toISOString()
        });
    }
    
    writeDB(db);
    res.json({ success: true });
});

// ======== СТАТИЧЕСКИЕ РОУТЫ ======== //

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

app.get('/admin', (req, res) => {
    const db = readDB();
    
    // Генерация HTML с таблицей активностей
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Админ-панель</title>
        <style>
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            body {
                background-color: #f5f7fa;
                color: #333;
                line-height: 1.6;
                padding: 20px;
            }
            
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
                padding: 30px;
            }
            
            header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
            }
            
            h1 {
                color: #2c3e50;
                font-size: 28px;
            }
            
            .admin-stats {
                display: flex;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                flex: 1;
                background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            
            .stat-card h3 {
                font-size: 16px;
                margin-bottom: 10px;
                opacity: 0.9;
            }
            
            .stat-card p {
                font-size: 28px;
                font-weight: bold;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                background: white;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
                overflow: hidden;
            }
            
            th, td {
                padding: 16px 20px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            th {
                background-color: #3498db;
                color: white;
                font-weight: 600;
                text-transform: uppercase;
                font-size: 14px;
            }
            
            tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            
            tr:hover {
                background-color: #f1f8ff;
            }
            
            .actions {
                display: flex;
                gap: 10px;
            }
            
            .delete-btn {
                background-color: #e74c3c;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.3s;
                font-weight: 500;
            }
            
            .delete-btn:hover {
                background-color: #c0392b;
            }
            
            .no-activities {
                text-align: center;
                padding: 40px;
                color: #7f8c8d;
                font-size: 18px;
            }
            
            .add-activity-form {
                margin-top: 40px;
                padding: 25px;
                background: #f8f9fa;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            
            .add-activity-form h2 {
                margin-bottom: 20px;
                color: #2c3e50;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                color: #2c3e50;
            }
            
            .form-group input, 
            .form-group textarea,
            .form-group select {
                width: 100%;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 16px;
            }
            
            .form-group textarea {
                min-height: 100px;
                resize: vertical;
            }
            
            .submit-btn {
                background-color: #2ecc71;
                color: white;
                border: none;
                padding: 12px 25px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 500;
                transition: background-color 0.3s;
            }
            
            .submit-btn:hover {
                background-color: #27ae60;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Админ-панель</h1>
                <div class="admin-actions">
                    <button class="logout-btn" onclick="location.href='/'">Выйти</button>
                </div>
            </header>
            
            <div class="admin-stats">
                <div class="stat-card">
                    <h3>Всего активностей</h3>
                    <p>${db.activities.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Зарегистрировано пользователей</h3>
                    <p>${db.users.length}</p>
                </div>
            </div>
            
            <h2>Управление активностями</h2>
            ${db.activities.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Категория</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${db.activities.map(activity => `
                            <tr>
                                <td>${activity.id}</td>
                                <td>${activity.name || 'Без названия'}</td>
                                <td>${activity.description || '—'}</td>
                                <td>${activity.category || 'Общая'}</td>
                                <td class="actions">
                                    <button class="delete-btn" onclick="deleteActivity(${activity.id})">Удалить</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : `
                <div class="no-activities">
                    <p>Нет доступных активностей</p>
                </div>
            `}
            
            <div class="add-activity-form">
                <h2>Добавить новую активность</h2>
                <form id="addActivityForm" onsubmit="addActivity(event)">
                    <div class="form-group">
                        <label for="title">Название активности</label>
                        <input type="text" id="title" name="title" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Описание</label>
                        <textarea id="description" name="description"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="category">Категория</label>
                        <select id="category" name="category">
                            <option value="Спорт">Спорт</option>
                            <option value="Образование">Образование</option>
                            <option value="Развлечения">Развлечения</option>
                            <option value="Волонтерство">Волонтерство</option>
                        </select>
                    </div>
                    
                    <button type="submit" class="submit-btn">Добавить активность</button>
                </form>
            </div>
        </div>
        
        <script>
            async function deleteActivity(id) {
                if (confirm('Вы уверены, что хотите удалить активность?')) {
                    try {
                        const response = await fetch('/api/activities/' + id, {
                            method: 'DELETE'
                        });
                        
                        if (response.ok) {
                            alert('Активность успешно удалена!');
                            location.reload();
                        } else {
                            const error = await response.json();
                            alert('Ошибка: ' + error.error);
                        }
                    } catch (error) {
                        alert('Ошибка сети: ' + error.message);
                    }
                }
            }
            
            async function addActivity(event) {
                event.preventDefault();
                
                const form = event.target;
                const formData = {
                    name: form.title.value,
                    description: form.description.value,
                    category: form.category.value,
                    mood: ["happy", "neutral"],
                    time: 2,
                    budget: "free",
                    people: ["1", "2"],
                    rating: 4.5
                };
                
                try {
                    const response = await fetch('/api/activities', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    if (response.ok) {
                        alert('Активность успешно добавлена!');
                        form.reset();
                        location.reload();
                    } else {
                        const error = await response.json();
                        alert('Ошибка: ' + error.error);
                    }
                } catch (error) {
                    alert('Ошибка сети: ' + error.message);
                }
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(htmlContent);
});

// ======== ОБРАБОТКА ОШИБОК ======== //
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Что-то пошло не так!' });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📁 База данных: ${DB_FILE}`);
    console.log(`👨‍💻 Админ-панель: http://localhost:${PORT}/admin`);
});