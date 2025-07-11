// Глобальные переменные
let currentUser = null;
let activities = [];
let favorites = [];
let history = [];

// API базовый URL
const API_BASE = 'http://localhost:3000/api';

// Глобальная функция обновления UI авторизации
function updateAuthUI(user) {
    console.log('updateAuthUI вызвана с пользователем:', user);
    
    const usernameDisplay = document.getElementById('usernameDisplay');
    const usernameDisplayFooter = document.getElementById('usernameDisplayFooter');
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    console.log('Найденные элементы:', {
        usernameDisplay: !!usernameDisplay,
        usernameDisplayFooter: !!usernameDisplayFooter,
        authButtons: !!authButtons,
        userMenu: !!userMenu
    });
    
    if (user) {
        console.log('Пользователь авторизован:', user.name);
        
        // Скрываем кнопки входа и регистрации
        if (authButtons) {
            authButtons.style.display = 'none';
            console.log('Кнопки авторизации скрыты');
        }
        if (userMenu) {
            userMenu.style.display = 'flex';
            console.log('Меню пользователя показано');
        }
        
        // Показываем имя пользователя
        const displayName = user.name || user.email.split('@')[0];
        console.log('Отображаемое имя:', displayName);
        
        if (usernameDisplay) {
            usernameDisplay.textContent = displayName;
            console.log('Имя установлено в header:', displayName);
        }
        if (usernameDisplayFooter) {
            usernameDisplayFooter.textContent = displayName;
            console.log('Имя установлено в footer:', displayName);
        }
        
        // Обновляем аватар пользователя
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
            userAvatar.title = displayName;
            console.log('Аватар обновлен');
        }
    } else {
        console.log('Пользователь не авторизован');
        
        // Показываем кнопки входа и регистрации
        if (authButtons) {
            authButtons.style.display = 'flex';
            console.log('Кнопки авторизации показаны');
        }
        if (userMenu) {
            userMenu.style.display = 'none';
            console.log('Меню пользователя скрыто');
        }
        
        // Показываем "Гость"
        if (usernameDisplay) {
            usernameDisplay.textContent = 'Гость';
            console.log('Установлено "Гость" в header');
        }
        if (usernameDisplayFooter) {
            usernameDisplayFooter.textContent = 'Гость';
            console.log('Установлено "Гость" в footer');
        }
        
        // Сбрасываем аватар
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            userAvatar.innerHTML = `<i class="fas fa-user"></i>`;
            userAvatar.title = 'Гость';
            console.log('Аватар сброшен');
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, проверяем localStorage...');
    
    // Всегда обновляем UI по localStorage при загрузке
    const savedUser = localStorage.getItem('currentUser');
    console.log('Сохраненный пользователь в localStorage:', savedUser);
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        console.log('Пользователь найден:', currentUser);
        updateAuthUI(currentUser);
    } else {
        console.log('Пользователь не найден в localStorage');
        updateAuthUI(null);
    }
    initApp();
});

async function initApp() {
    await loadActivities();
    initAuth();
    initNavigation();
    initUserMenu(); // Добавляем инициализацию меню пользователя
    initRecommendations();
    initFavorites();
    initHistory();
    initSettings();
    initTheme();
    initRangeSlider();
    
    // Проверяем авторизацию при загрузке
    checkAuthStatus();
}

// Загрузка активностей с сервера
async function loadActivities() {
    try {
        const response = await fetch(`${API_BASE}/activities`);
        const data = await response.json();
        activities = data.activities || [];
        updateRecommendations();
    } catch (error) {
        console.error('Ошибка загрузки активностей:', error);
        activities = [];
    }
}

// Система авторизации
function initAuth() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');

    // Обработчики кнопок авторизации
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/login';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = '/register';
        });
    }

    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthUI(currentUser);
        loadUserData();
    } else {
        updateAuthUI(null);
    }
}

// Проверка статуса авторизации
async function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        try {
            const response = await fetch(`${API_BASE}/user/${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                updateAuthUI(currentUser);
                loadUserData();
            } else {
                // Пользователь не найден, очищаем сессию
                logout();
            }
        } catch (error) {
            console.error('Ошибка проверки авторизации:', error);
            // В случае ошибки сети, показываем пользователя из localStorage
            updateAuthUI(currentUser);
        }
    } else {
        updateAuthUI(null);
    }
}

// Выход из системы
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI(null);
    showSection('recommendationsSection');
    
    // Очищаем данные
    favorites = [];
    history = [];
    
    // Показываем уведомление
    showNotification('Вы успешно вышли из системы', 'success');
}

// Инициализация меню пользователя
function initUserMenu() {
    const userAvatar = document.getElementById('userAvatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            // Создаем выпадающее меню
            showUserDropdown();
        });
    }
}

// Показать выпадающее меню пользователя
function showUserDropdown() {
    // Удаляем существующее меню
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const userAvatar = document.getElementById('userAvatar');
    const rect = userAvatar.getBoundingClientRect();
    
    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: ${rect.bottom + 10}px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0.1);
        padding: 8px 0;
        z-index: 1000;
        min-width: 200px;
        backdrop-filter: blur(20px);
    `;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const displayName = currentUser.name || currentUser.email?.split('@')[0] || 'Пользователь';
    
    dropdown.innerHTML = `
        <div style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-weight: 600; color: #1D1D1F;">
            ${displayName}
        </div>
        <div style="padding: 8px 0;">
            <button onclick="showSection('настройки')" style="width: 100%; padding: 8px 16px; border: none; background: none; text-align: left; cursor: pointer; color: #1D1D1F; font-size: 14px;">
                <i class="fas fa-cog" style="margin-right: 8px; color: #007AFF;"></i>
                Настройки
            </button>
            <button onclick="logout()" style="width: 100%; padding: 8px 16px; border: none; background: none; text-align: left; cursor: pointer; color: #FF3B30; font-size: 14px;">
                <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>
                Выйти
            </button>
        </div>
    `;
    
    document.body.appendChild(dropdown);
    
    // Закрываем меню при клике вне его
    document.addEventListener('click', function closeDropdown(e) {
        if (!dropdown.contains(e.target) && !userAvatar.contains(e.target)) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    });
}

// Загрузка данных пользователя
async function loadUserData() {
    if (!currentUser) return;
    
    try {
        // Загружаем избранное
        const favResponse = await fetch(`${API_BASE}/user/${currentUser.id}/favorites`);
        if (favResponse.ok) {
            const favData = await favResponse.json();
            favorites = favData.activities || [];
        }

        // Загружаем историю
        const histResponse = await fetch(`${API_BASE}/user/${currentUser.id}/history`);
        if (histResponse.ok) {
            const histData = await histResponse.json();
            history = histData.activities || [];
        }
    } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
    }
}

// Навигация
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            
            // Проверяем авторизацию для защищенных разделов
            if ((section === 'избранное' || section === 'история' || section === 'настройки') && !currentUser) {
                showNotification('Для доступа к этому разделу необходимо авторизоваться', 'warning');
                return;
            }
            
            // Обновляем активную навигацию
            navItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем соответствующую секцию
            showSection(section);
        });
    });
}

// Показать секцию
function showSection(sectionName) {
    const sections = {
        'главная': 'recommendationsSection',
        'избранное': 'favoritesSection',
        'история': 'historySection',
        'настройки': 'settingsSection'
    };
    
    const sectionId = sections[sectionName];
    if (!sectionId) return;
    
    // Скрываем все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Показываем нужную секцию
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        
        // Загружаем данные для секции
        switch (sectionName) {
            case 'избранное':
                loadFavorites();
                break;
            case 'история':
                loadHistory();
                break;
            case 'настройки':
                loadSettings();
                break;
        }
    }
}

// Рекомендации
function initRecommendations() {
    const form = document.getElementById('preferencesForm');
    if (!form) return;

    // Обновление рекомендаций при изменении фильтров
    const timeInput = document.getElementById('time');
    const budgetInput = document.getElementById('budget');
    const peopleInput = document.getElementById('people');
    const categoryInput = document.getElementById('category');
    const distanceInput = document.getElementById('distance');
    const moodInputs = document.querySelectorAll('input[name="mood"]');
    
    if (timeInput) timeInput.addEventListener('input', updateRecommendations);
    if (budgetInput) budgetInput.addEventListener('change', updateRecommendations);
    if (peopleInput) peopleInput.addEventListener('change', updateRecommendations);
    if (categoryInput) categoryInput.addEventListener('change', updateRecommendations);
    if (distanceInput) distanceInput.addEventListener('change', updateRecommendations);
    moodInputs.forEach(input => input.addEventListener('change', updateRecommendations));

    // Кнопка сброса предпочтений
    const resetBtn = document.getElementById('resetPreferences');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPreferences);
    }

    // Кнопка случайной идеи
    const quickSearchBtn = document.getElementById('quickSearch');
    if (quickSearchBtn) {
        quickSearchBtn.addEventListener('click', getRandomActivity);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Показываем секцию рекомендаций
        showSection('главная');
        
        // Обновляем активную навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === 'главная') {
                item.classList.add('active');
            }
        });
        
        await updateRecommendations();
    });
}

// Сброс предпочтений
function resetPreferences() {
    // Сброс настроения
    document.getElementById('mood-happy').checked = true;
    
    // Сброс времени
    const timeInput = document.getElementById('time');
    if (timeInput) {
        timeInput.value = 2;
        document.getElementById('timeValue').textContent = '2';
    }
    
    // Сброс бюджета
    const budgetInput = document.getElementById('budget');
    if (budgetInput) {
        budgetInput.value = 'low';
    }
    
    // Сброс количества людей
    const peopleInput = document.getElementById('people');
    if (peopleInput) {
        peopleInput.value = '1';
    }
    
    // Сброс категории (radio)
    const catAll = document.getElementById('cat-all');
    if (catAll) catAll.checked = true;
    
    // Сброс расстояния
    const distanceInput = document.getElementById('distance');
    if (distanceInput) {
        distanceInput.value = '';
    }
    
    // Обновляем рекомендации
    updateRecommendations();
    
    // Показываем уведомление
    showNotification('Предпочтения сброшены', 'info');
}

// Получение случайной активности
async function getRandomActivity() {
    try {
        const response = await fetch(`${API_BASE}/activities`);
        const data = await response.json();
        
        if (data.activities && data.activities.length > 0) {
            const randomActivity = data.activities[Math.floor(Math.random() * data.activities.length)];
            displayActivities([randomActivity]);
            
            // Показываем секцию рекомендаций
            showSection('главная');
            
            // Обновляем активную навигацию
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-section') === 'главная') {
                    item.classList.add('active');
                }
            });
            
            showNotification('Найдена случайная идея!', 'success');
        }
    } catch (error) {
        console.error('Ошибка получения случайной активности:', error);
        showNotification('Ошибка получения случайной идеи', 'error');
    }
}

// Обновление рекомендаций
async function updateRecommendations() {
    const mood = document.querySelector('input[name="mood"]:checked')?.value;
    const time = document.getElementById('time')?.value;
    const budget = document.getElementById('budget')?.value;
    const people = document.getElementById('people')?.value;
    // Получаем категорию из radio-кнопок
    const category = document.querySelector('input[name="category"]:checked')?.value;
    const distance = document.getElementById('distance')?.value;
    
    const params = new URLSearchParams();
    if (mood) params.append('mood', mood);
    if (time) params.append('time', time);
    if (budget) params.append('budget', budget);
    if (people) params.append('people', people);
    if (category) params.append('category', category);
    if (distance) params.append('distance', distance);
    
    try {
        const response = await fetch(`${API_BASE}/activities/filter?${params}`);
        const data = await response.json();
        displayActivities(data.activities || []);
    } catch (error) {
        console.error('Ошибка получения рекомендаций:', error);
        displayActivities([]);
    }
}

// Отображение активностей
function displayActivities(activities) {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Ничего не найдено</h3>
                <p>Попробуйте изменить параметры поиска</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activities.map(activity => `
        <div class="recommendation-card fade-in" data-id="${activity.id}">
            <div class="recommendation-title">${activity.name}</div>
            <div class="recommendation-description">${activity.description}</div>
            <div class="recommendation-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${activity.time} ч</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${getBudgetText(activity.budget)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${getPeopleText(activity.people)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-star"></i>
                    <span>${activity.rating}</span>
                </div>
            </div>
            <div class="recommendation-actions">
                <button class="action-btn" onclick="viewActivity(${activity.id})">
                    <i class="fas fa-eye"></i>
                    <span>Подробнее</span>
                </button>
                ${currentUser ? `
                    <button class="action-btn ${favorites.includes(activity.id.toString()) ? 'active' : ''}" 
                            onclick="toggleFavorite(${activity.id})">
                        <i class="fas fa-heart"></i>
                        <span>${favorites.includes(activity.id.toString()) ? 'Убрать' : 'В избранное'}</span>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Просмотр активности
async function viewActivity(activityId) {
    if (currentUser) {
        try {
            await fetch(`${API_BASE}/user/${currentUser.id}/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activityId: activityId.toString() })
            });
        } catch (error) {
            console.error('Ошибка добавления в историю:', error);
        }
    }
    
    // Показываем детали активности (можно добавить модальное окно)
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
        showNotification(`Просмотрена активность: ${activity.name}`, 'info');
    }
}

// Избранное
function initFavorites() {
    // Инициализация уже выполнена в loadUserData
}

async function loadFavorites() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}/favorites`);
        if (response.ok) {
            const data = await response.json();
            favorites = data.activities || [];
            displayFavorites();
        }
    } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
    }
}

function displayFavorites() {
    const container = document.getElementById('favoritesContainer');
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <h3>Нет избранных идей</h3>
                <p>Добавьте понравившиеся идеи в избранное</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = favorites.map(activity => `
        <div class="activity-card fade-in" data-id="${activity.id}">
            <div class="recommendation-title">${activity.name}</div>
            <div class="recommendation-description">${activity.description}</div>
            <div class="recommendation-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${activity.time} ч</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${getBudgetText(activity.budget)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-users"></i>
                    <span>${getPeopleText(activity.people)}</span>
                </div>
            </div>
            <div class="recommendation-actions">
                <button class="action-btn" onclick="viewActivity(${activity.id})">
                    <i class="fas fa-eye"></i>
                    <span>Подробнее</span>
                </button>
                <button class="action-btn active" onclick="removeFromFavorites(${activity.id})">
                    <i class="fas fa-heart"></i>
                    <span>Убрать</span>
                </button>
            </div>
        </div>
    `).join('');
}

async function toggleFavorite(activityId) {
    if (!currentUser) return;
    
    const activityIdStr = activityId.toString();
    const isFavorite = favorites.some(fav => fav.id === activityId);
    
    try {
        if (isFavorite) {
            await removeFromFavorites(activityId);
        } else {
            await addToFavorites(activityId);
        }
    } catch (error) {
        console.error('Ошибка обновления избранного:', error);
        showNotification('Ошибка обновления избранного', 'error');
    }
}

async function addToFavorites(activityId) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activityId: activityId.toString() })
        });
        
        if (response.ok) {
            const activity = activities.find(a => a.id === activityId);
            if (activity) {
                favorites.push(activity);
                showNotification('Добавлено в избранное', 'success');
                updateRecommendations(); // Обновляем отображение
            }
        }
    } catch (error) {
        console.error('Ошибка добавления в избранное:', error);
        showNotification('Ошибка добавления в избранное', 'error');
    }
}

async function removeFromFavorites(activityId) {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}/favorites/${activityId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            favorites = favorites.filter(fav => fav.id !== activityId);
            showNotification('Удалено из избранного', 'success');
            displayFavorites(); // Обновляем отображение избранного
            updateRecommendations(); // Обновляем отображение рекомендаций
        }
    } catch (error) {
        console.error('Ошибка удаления из избранного:', error);
        showNotification('Ошибка удаления из избранного', 'error');
    }
}

// История
function initHistory() {
    // Инициализация уже выполнена в loadUserData
}

async function loadHistory() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}/history`);
        if (response.ok) {
            const data = await response.json();
            history = data.activities || [];
            displayHistory();
        }
    } catch (error) {
        console.error('Ошибка загрузки истории:', error);
    }
}

function displayHistory() {
    const container = document.getElementById('historyContainer');
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <h3>История пуста</h3>
                <p>Вы ещё не просматривали активности</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = history.map(activity => `
        <div class="activity-card fade-in" data-id="${activity.id}">
            <div class="recommendation-title">${activity.name}</div>
            <div class="recommendation-description">${activity.description}</div>
            <div class="recommendation-meta">
                <div class="meta-item">
                    <i class="fas fa-clock"></i>
                    <span>${activity.time} ч</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${getBudgetText(activity.budget)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(activity.viewedAt)}</span>
                </div>
            </div>
            <div class="recommendation-actions">
                <button class="action-btn" onclick="viewActivity(${activity.id})">
                    <i class="fas fa-eye"></i>
                    <span>Подробнее</span>
                </button>
                <button class="action-btn" onclick="addToFavorites(${activity.id})">
                    <i class="fas fa-heart"></i>
                    <span>В избранное</span>
                </button>
            </div>
        </div>
    `).join('');
}

// Настройки
function initSettings() {
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', saveSettings);
    }
}

async function loadSettings() {
    if (!currentUser) return;
    
    const usernameInput = document.getElementById('profileUsername');
    const emailSpan = document.getElementById('profileEmail');
    const themeToggle = document.getElementById('themeToggle');
    
    if (usernameInput) usernameInput.value = currentUser.name || '';
    if (emailSpan) emailSpan.textContent = currentUser.email || '';
    if (themeToggle) themeToggle.checked = currentUser.preferences?.darkMode || false;
}

async function saveSettings(e) {
    e.preventDefault();
    
    if (!currentUser) return;
    
    const username = document.getElementById('profileUsername')?.value;
    const darkMode = document.getElementById('themeToggle')?.checked;
    
    try {
        const response = await fetch(`${API_BASE}/user/${currentUser.id}/preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                darkMode: darkMode,
                username: username
            })
        });
        
        if (response.ok) {
            currentUser.preferences = { ...currentUser.preferences, darkMode };
            currentUser.name = username;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            applyTheme(darkMode);
            showNotification('Настройки сохранены', 'success');
        }
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        showNotification('Ошибка сохранения настроек', 'error');
    }
}

// Тема
function initTheme() {
    const savedTheme = localStorage.getItem('darkTheme') === 'true';
    applyTheme(savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.checked = savedTheme;
        themeToggle.addEventListener('change', function() {
            applyTheme(this.checked);
            localStorage.setItem('darkTheme', this.checked);
        });
    }
}

function applyTheme(darkMode) {
    if (darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Слайдер времени
function initRangeSlider() {
    const timeSlider = document.getElementById('time');
    const timeValue = document.getElementById('timeValue');
    
    if (timeSlider && timeValue) {
        timeSlider.addEventListener('input', function() {
            timeValue.textContent = this.value;
        });
    }
}

// Утилиты
function getBudgetText(budget) {
    const budgetMap = {
        'free': 'Бесплатно',
        'low': 'До 1000 ₽',
        'medium': '1000-5000 ₽',
        'high': 'От 5000 ₽'
    };
    return budgetMap[budget] || budget;
}

function getPeopleText(people) {
    const peopleMap = {
        '1': 'Один',
        '2': 'Двое',
        '3': '3-5 человек',
        'group': '5+ человек'
    };
    return peopleMap[people] || people;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Уведомления
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Автоматическое удаление
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        success: '#34C759',
        error: '#FF3B30',
        warning: '#FF9500',
        info: '#007AFF'
    };
    return colors[type] || '#007AFF';
}