// Конфигурация
const CONFIG = {
    WEATHER_API_KEY: '6a90b5bf4cccf3fef3d15e2e40395b92', // Ключ для OpenWeatherMap
    WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    GEOCODING_BASE_URL: 'https://api.openweathermap.org/geo/1.0',
    UNITS: 'metric',
    LANGUAGE: 'ru',
    STORAGE_KEY: 'weather_app_cities',
    MAX_CITIES: 5
};

// Состояние приложения
const state = {
    cities: [],
    currentWeatherData: {},
    isLoading: false,
    selectedCity: null
};

// Элементы DOM
let elements = {}; 

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Элементы инициализируются после загрузки DOM
    elements = {
        weatherContainer: document.getElementById('weatherContainer'),
        loading: document.getElementById('loading'),
        emptyState: document.getElementById('emptyState'),
        addCityBtn: document.getElementById('addCityBtn'),
        addFirstCityBtn: document.getElementById('addFirstCityBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        cityModal: document.getElementById('cityModal'),
        locationModal: document.getElementById('locationModal'),
        closeModalBtn: document.getElementById('closeModalBtn'),
        cityInput: document.getElementById('cityInput'),
        citySuggestions: document.getElementById('citySuggestions'),
        saveCityBtn: document.getElementById('saveCityBtn'),
        cancelBtn: document.getElementById('cancelBtn'),
        cityError: document.getElementById('cityError'),
        allowLocationBtn: document.getElementById('allowLocationBtn'),
        denyLocationBtn: document.getElementById('denyLocationBtn')
    };
    
    initializeApp();
    setupEventListeners();
});

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// Инициализация приложения
function initializeApp() {
    // Загрузка сохраненных городов из localStorage
    loadSavedCities();
    
    // Проверка, есть ли сохраненные города
    if (state.cities.length === 0) {
        // Запрос на геолокацию
        setTimeout(() => {
            elements.locationModal.classList.add('active');
        }, 500);
    } else {
        // Загрузка погоды для сохраненных городов
        updateAllWeather();
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки добавления города
    elements.addCityBtn.addEventListener('click', () => showCityModal());
    elements.addFirstCityBtn.addEventListener('click', () => showCityModal());
    
    // Кнопка обновления
    elements.refreshBtn.addEventListener('click', () => {
        updateAllWeather();
        showNotification('Погода обновляется...');
    });
    
    // Модальное окно добавления города
    elements.closeModalBtn.addEventListener('click', () => hideCityModal());
    elements.cancelBtn.addEventListener('click', () => hideCityModal());
    
    // Закрытие модальных окон при клике вне окна
    document.addEventListener('click', (e) => {
        if (e.target === elements.cityModal) {
            hideCityModal();
        }
        if (e.target === elements.locationModal) {
            hideLocationModal();
        }
    });
    
    // Поиск городов с debounce
    let searchTimeout;
    elements.cityInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchCities, 300);
    });
    
    // Добавление города
    elements.saveCityBtn.addEventListener('click', addSelectedCity);
    
    // Обработка нажатия Enter в поле ввода
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addSelectedCity();
        }
    });
    
    // Геолокация
    elements.allowLocationBtn.addEventListener('click', getUserLocation);
    elements.denyLocationBtn.addEventListener('click', () => {
        hideLocationModal();
        showCityModal();
    });
}

// Загрузка сохраненных городов из localStorage
function loadSavedCities() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            state.cities = JSON.parse(saved);
            console.log('Загружены сохраненные города:', state.cities);
        }
    } catch (error) {
        console.error('Ошибка загрузки из localStorage:', error);
        state.cities = [];
    }
}

// Сохранение городов в localStorage
function saveCities() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.cities));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
}

// Получение геолокации пользователя
function getUserLocation() {
    hideLocationModal();
    showLoading();
    
    if (!navigator.geolocation) {
        showNotification('Геолокация не поддерживается вашим браузером', 'error');
        showCityModal();
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Получение названия города по координатам
                const cityName = await getCityNameByCoords(latitude, longitude);
                
                // Добавление текущего местоположения в список
                const locationCity = {
                    id: 'current_location',
                    name: 'Текущее местоположение',
                    lat: latitude,
                    lon: longitude,
                    isCurrentLocation: true
                };
                
                // Проверка, нет ли уже такого города в списке
                const exists = state.cities.some(city => city.isCurrentLocation);
                if (!exists) {
                    state.cities.unshift(locationCity);
                    saveCities();
                }
                
                // Загрузка погоды
                await updateAllWeather();
                hideLoading();
                
            } catch (error) {
                console.error('Ошибка получения местоположения:', error);
                showNotification('Не удалось определить ваше местоположение', 'error');
                showCityModal();
            }
        },
        (error) => {
            hideLoading();
            console.error('Ошибка геолокации:', error);
            showCityModal();
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Получение названия города по координатам
async function getCityNameByCoords(lat, lon) {
    try {
        const url = `${CONFIG.GEOCODING_BASE_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${CONFIG.WEATHER_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Ошибка получения названия города');
        }
        
        const data = await response.json();
        return data[0]?.name || 'Текущее местоположение';
    } catch (error) {
        console.error('Ошибка получения названия города:', error);
        return 'Текущее местоположение';
    }
}

// Поиск городов
async function searchCities() {
    const query = elements.cityInput.value.trim();
    
    if (query.length < 2) {
        elements.citySuggestions.style.display = 'none';
        elements.saveCityBtn.disabled = true;
        return;
    }
    
    try {
        elements.cityError.style.display = 'none';
        
        const url = `${CONFIG.GEOCODING_BASE_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${CONFIG.WEATHER_API_KEY}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Ошибка поиска городов');
        }
        
        const cities = await response.json();
        
        if (cities.length === 0) {
            elements.citySuggestions.innerHTML = '<div class="suggestion-item">Город не найден</div>';
            elements.citySuggestions.style.display = 'block';
            elements.saveCityBtn.disabled = true;
            return;
        }
        
        // Очистка и заполнение списка предложений
        elements.citySuggestions.innerHTML = '';
        
        cities.forEach((city, index) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = `${city.name}, ${city.country}`;
            item.dataset.city = JSON.stringify({
                name: city.name,
                lat: city.lat,
                lon: city.lon,
                country: city.country
            });
            
            item.addEventListener('click', () => {
                elements.cityInput.value = `${city.name}, ${city.country}`;
                elements.citySuggestions.style.display = 'none';
                elements.saveCityBtn.disabled = false;
            });
            
            elements.citySuggestions.appendChild(item);
        });
        
        elements.citySuggestions.style.display = 'block';
        elements.saveCityBtn.disabled = false;
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        showCityError('Ошибка при поиске города. Попробуйте еще раз.');
    }
}

// Добавление выбранного города
function addSelectedCity() {
    const query = elements.cityInput.value.trim();
    
    if (!query) {
        showCityError('Введите название города');
        return;
    }
    
    // Поиск выбранного города в списке предложений
    const suggestionItems = elements.citySuggestions.querySelectorAll('.suggestion-item');
    let selectedCity = null;
    
    suggestionItems.forEach(item => {
        if (item.textContent === query) {
            selectedCity = JSON.parse(item.dataset.city);
        }
    });
    
    if (!selectedCity) {
        showCityError('Выберите город из списка');
        return;
    }
    
    // Проверка, не добавлен ли уже этот город
    const cityExists = state.cities.some(city => 
        city.name === selectedCity.name && city.country === selectedCity.country
    );
    
    if (cityExists) {
        showCityError('Этот город уже добавлен');
        return;
    }
    
    // Проверка лимита городов
    if (state.cities.length >= CONFIG.MAX_CITIES) {
        showCityError(`Максимум ${CONFIG.MAX_CITIES} городов`);
        return;
    }
    
    // Добавление города
    const newCity = {
        id: Date.now().toString(),
        name: selectedCity.name,
        lat: selectedCity.lat,
        lon: selectedCity.lon,
        country: selectedCity.country,
        isCurrentLocation: false
    };
    
    state.cities.push(newCity);
    saveCities();
    
    // Скрытие модального окна и обновление погоды
    hideCityModal();
    updateAllWeather();
    
    showNotification(`${selectedCity.name} добавлен`);
}

// Получение погоды для города
async function getWeatherForCity(city) {
    try {
        const url = `${CONFIG.WEATHER_BASE_URL}/forecast?lat=${city.lat}&lon=${city.lon}&appid=${CONFIG.WEATHER_API_KEY}&units=${CONFIG.UNITS}&lang=${CONFIG.LANGUAGE}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        //  Обработка для отображения
        return processWeatherData(data, city);
        
    } catch (error) {
        console.error('Ошибка получения погоды:', error);
        throw error;
    }
}

// Обработка данных погоды
function processWeatherData(data, city) {
    const current = data.list[0];
    
    // Сортировка прогноза по дням
    const forecastByDay = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
        
        if (!forecastByDay[day]) {
            forecastByDay[day] = {
                temp_min: item.main.temp_min,
                temp_max: item.main.temp_max,
                weather: item.weather[0],
                date: date
            };
        } else {
            forecastByDay[day].temp_min = Math.min(forecastByDay[day].temp_min, item.main.temp_min);
            forecastByDay[day].temp_max = Math.max(forecastByDay[day].temp_max, item.main.temp_max);
        }
    });
    
    // Прогноз на 3 дня (сегодня + 2 следующих)
    const forecastDays = Object.entries(forecastByDay)
        .slice(0, 3)
        .map(([day, data]) => ({
            day,
            temp_min: Math.round(data.temp_min),
            temp_max: Math.round(data.temp_max),
            icon: getWeatherIcon(data.weather.icon),
            description: data.weather.description
        }));
    
    return {
        id: city.id,
        name: city.name,
        isCurrentLocation: city.isCurrentLocation,
        country: city.country,
        current: {
            temp: Math.round(current.main.temp),
            feels_like: Math.round(current.main.feels_like),
            humidity: current.main.humidity,
            pressure: Math.round(current.main.pressure * 0.750062),
            wind_speed: Math.round(current.wind.speed),
            wind_deg: current.wind.deg,
            description: current.weather[0].description,
            icon: getWeatherIcon(current.weather[0].icon),
            main: current.weather[0].main
        },
        forecast: forecastDays,
        updated: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
}

// Получение иконки погоды
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-rain',
        '09n': 'fas fa-cloud-rain',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };
    
    return iconMap[iconCode] || 'fas fa-question';
}

// Обновление всей погоды
async function updateAllWeather() {
    if (state.cities.length === 0) {
        showEmptyState();
        return;
    }
    
    showLoading();
    
    try {
        // Загрузка погоды для всех городов параллельно
        const weatherPromises = state.cities.map(city => getWeatherForCity(city));
        const weatherData = await Promise.all(weatherPromises);
        
        // Сохранение данных погоды
        weatherData.forEach(data => {
            state.currentWeatherData[data.id] = data;
        });
        
        // Создание карточек
        renderWeatherCards();
        hideLoading();
        
    } catch (error) {
        console.error('Ошибка обновления погоды:', error);
        showNotification('Ошибка загрузки погоды', 'error');
        hideLoading();
    }
}

// Рендеринг карточек погоды
function renderWeatherCards() {
    if (state.cities.length === 0) {
        showEmptyState();
        return;
    }
    
    hideEmptyState();
    
    // Очистка контейнера
    elements.weatherContainer.innerHTML = '';
    
    // Вывод сначала текущего местоположения, потом остальных городов
    const sortedCities = [...state.cities].sort((a, b) => {
        if (a.isCurrentLocation && !b.isCurrentLocation) return -1;
        if (!a.isCurrentLocation && b.isCurrentLocation) return 1;
        return 0;
    });
    
    // Создание карточек для каждого города
    sortedCities.forEach(city => {
        const weatherData = state.currentWeatherData[city.id];
        
        if (weatherData) {
            const card = createWeatherCard(weatherData);
            elements.weatherContainer.appendChild(card);
        }
    });
}

// Создание карточек погоды
function createWeatherCard(data) {
    const card = document.createElement('div');
    card.className = `weather-card ${data.isCurrentLocation ? 'current' : ''}`;
    card.dataset.cityId = data.id;
    
    const windDirection = getWindDirection(data.current.wind_deg);
    const locationType = data.isCurrentLocation ? 'Текущее местоположение' : data.country;
    
    // Прогноз на 3 дня
    const forecastHtml = data.forecast.map(day => `
        <div class="forecast-day">
            <div class="day">${day.day}</div>
            <div class="weather-icon-small"><i class="${day.icon}"></i></div>
            <div class="temp">${day.temp_max}°</div>
            <div class="temp-min">${day.temp_min}°</div>
        </div>
    `).join('');
    
    card.innerHTML = `
        <div class="weather-card-header">
            <div class="city-info">
                <h3>${data.name}</h3>
                <span class="location-type">${locationType}</span>
            </div>
            <div class="temp-display">
                <div class="current-temp">${data.current.temp}°C</div>
                <div class="feels-like">Ощущается как ${data.current.feels_like}°C</div>
            </div>
        </div>
        
        <div class="weather-main">
            <i class="${data.current.icon} weather-icon"></i>
            <span>${capitalizeFirstLetter(data.current.description)}</span>
        </div>
        
        <div class="weather-details">
            <div class="detail-item">
                <i class="fas fa-tint"></i>
                <span>Влажность: ${data.current.humidity}%</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-wind"></i>
                <span>Ветер: ${data.current.wind_speed} м/с ${windDirection}</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-tachometer-alt"></i>
                <span>Давление: ${data.current.pressure} мм рт. ст.</span>
            </div>
            <div class="detail-item">
                <i class="fas fa-clock"></i>
                <span>Обновлено: ${data.updated}</span>
            </div>
        </div>
        
        <div class="forecast">
            <h4>Прогноз на 3 дня</h4>
            <div class="forecast-days">
                ${forecastHtml}
            </div>
        </div>
        
        ${!data.isCurrentLocation ? `
            <button class="delete-btn" onclick="deleteCity('${data.id}')">
                <i class="fas fa-trash"></i>
            </button>
        ` : ''}
    `;
    
    return card;
}

// Удаление города
function deleteCity(cityId) {
    if (confirm('Удалить этот город из списка?')) {
        state.cities = state.cities.filter(city => city.id !== cityId);
        delete state.currentWeatherData[cityId];
        saveCities();
        renderWeatherCards();
        showNotification('Город удален');
    }
}

// Показать модальное окно добавления города
function showCityModal() {
    elements.cityModal.classList.add('active');
    elements.cityInput.value = '';
    elements.citySuggestions.style.display = 'none';
    elements.cityError.style.display = 'none';
    elements.saveCityBtn.disabled = true;
    elements.cityInput.focus();
}

// Скрыть модальное окно добавления города
function hideCityModal() {
    elements.cityModal.classList.remove('active');
}

// Скрыть модальное окно геолокации
function hideLocationModal() {
    elements.locationModal.classList.remove('active');
}

// Показать ошибку города
function showCityError(message) {
    elements.cityError.textContent = message;
    elements.cityError.style.display = 'block';
}

// Показать состояние загрузки
function showLoading() {
    elements.loading.style.display = 'block';
    elements.weatherContainer.style.opacity = '0.5';
}

// Скрыть состояние загрузки
function hideLoading() {
    elements.loading.style.display = 'none';
    elements.weatherContainer.style.opacity = '1';
}

// Показать пустое состояние
function showEmptyState() {
    elements.emptyState.style.display = 'block';
    elements.weatherContainer.style.display = 'none';
}

// Скрыть пустое состояние
function hideEmptyState() {
    elements.emptyState.style.display = 'none';
    elements.weatherContainer.style.display = 'grid';
}

// Показать уведомление
function showNotification(message, type = 'success') {
    // Создание временного уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'error' ? '#e74c3c' : '#27ae60',
        color: 'white',
        padding: '15px 25px',
        borderRadius: '8px',
        zIndex: '1000',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        animation: 'slideIn 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Удаление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
    
    // Добавление стилей анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Вспомогательные функции
function getWindDirection(degrees) {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Функцию удаления - глобально доступная
window.deleteCity = deleteCity;
