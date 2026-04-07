/**
 * GeoWiki Bootstrap
 * Единая точка входа приложения с гарантированным lifecycle
 * 
 * Архитектура:
 * 1. loadConfig() - загрузка конфигурации
 * 2. loadData() - загрузка данных (countries.json)
 * 3. initMap() - инициализация Leaflet + контейнер
 * 4. renderUI() - рендер UI компонентов
 * 5. startApp() - запуск приложения
 * 
 * Защита:
 * - try/catch вокруг каждого этапа
 * - timeout 10 секунд
 * - fallback UI если что-то сломалось
 */

class GeoWikiBootstrap {
    constructor() {
        this.config = {
            dataPath: './data/countries.json',
            mapContainer: 'map',
            appTimeout: 10000,
            debug: true
        };
        
        this.state = {
            isLoading: false,
            isReady: false,
            error: null,
            startTime: 0,
            stages: {}
        };
        
        this.modules = {};
        this.timeoutId = null;
    }

    /**
     * Основной инициализатор
     */
    async init() {
        try {
            this.log('🚀 Starting GeoWiki Bootstrap...');
            this.state.startTime = Date.now();
            this.state.isLoading = true;
            this.setLoading(true);

            // Установить timeout для защиты от бесконечной загрузки
            this.startTimeout();

            // Последовательная инициализация
            await this.loadConfig();
            await this.loadData();
            await this.initMap();
            await this.renderUI();
            await this.startApp();

            // Успешно завершено
            this.clearTimeout();
            this.state.isReady = true;
            this.state.isLoading = false;
            this.setLoading(false);
            
            this.log('✅ GeoWiki Bootstrap completed successfully', 'success');
            window.GeoWikiBootstrap = this;
            
        } catch (error) {
            this.handleBootstrapError(error);
        }
    }

    /**
     * Загрузить конфигурацию
     */
    async loadConfig() {
        this.log('⚙️ Loading configuration...');
        
        try {
            // Здесь можно добавить загрузку конфига с сервера
            this.log('✅ Configuration loaded', 'success');
            this.state.stages.config = 'completed';
        } catch (error) {
            throw new Error(`Config loading failed: ${error.message}`);
        }
    }

    /**
     * Загрузить данные (countries.json)
     */
    async loadData() {
        this.log('📊 Loading data layer...');
        
        try {
            const response = await fetch(this.config.dataPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format: expected array of countries');
            }
            
            // Сохранить данные в глобальное пространство
            window.countriesData = data;
            this.modules.data = data;
            
            this.log(`✅ Loaded ${data.length} countries`, 'success');
            this.state.stages.data = 'completed';
            
        } catch (error) {
            throw new Error(`Data loading failed: ${error.message}`);
        }
    }

    /**
     * Инициализировать карту
     */
    async initMap() {
        this.log('🗺️ Initializing map...');
        
        try {
            // Проверить, есть ли контейнер
            const mapContainer = document.getElementById(this.config.mapContainer);
            if (!mapContainer) {
                this.log('⚠️ Map container not found on this page (OK for landing page)', 'warn');
                this.state.stages.map = 'skipped';
                return;
            }

            // Проверить, загружена ли Leaflet библиотека
            if (!window.L) {
                throw new Error('Leaflet library not loaded');
            }

            // Инициализировать карту
            const map = L.map(this.config.mapContainer).setView([20, 0], 2);
            
            // Добавить tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            this.modules.map = map;
            
            this.log('✅ Map initialized successfully', 'success');
            this.state.stages.map = 'completed';
            
        } catch (error) {
            throw new Error(`Map initialization failed: ${error.message}`);
        }
    }

    /**
     * Рендер UI компонентов
     */
    async renderUI() {
        this.log('🎨 Rendering UI...');
        
        try {
            // Инициализировать менеджеры UI
            if (window.LandingManager && document.querySelector('.continents-grid')) {
                this.modules.landing = new window.LandingManager();
                await this.modules.landing.init?.();
            }

            if (window.MapManager && document.getElementById('map')) {
                this.modules.mapManager = new window.MapManager();
                await this.modules.mapManager.init?.();
            }

            if (window.EncyclopediaManager && document.querySelector('.encyclopedia-container')) {
                this.modules.encyclopedia = new window.EncyclopediaManager();
                await this.modules.encyclopedia.init?.();
            }

            if (window.QuizManager && document.querySelector('.quiz-container')) {
                this.modules.quiz = new window.QuizManager();
                await this.modules.quiz.init?.();
            }

            if (window.ProfileManager && document.querySelector('.profile-container')) {
                this.modules.profile = new window.ProfileManager();
                await this.modules.profile.init?.();
            }

            this.log('✅ UI rendered successfully', 'success');
            this.state.stages.ui = 'completed';
            
        } catch (error) {
            throw new Error(`UI rendering failed: ${error.message}`);
        }
    }

    /**
     * Запустить приложение
     */
    async startApp() {
        this.log('🎯 Starting application...');
        
        try {
            // Инициализировать глобальное приложение
            if (window.GeoWikiApp) {
                window.app = window.GeoWikiApp;
                await window.app.start?.();
            }

            this.log('✅ Application started', 'success');
            this.state.stages.app = 'completed';
            
        } catch (error) {
            throw new Error(`Application start failed: ${error.message}`);
        }
    }

    /**
     * Обработка ошибок bootstrap
     */
    handleBootstrapError(error) {
        this.state.isLoading = false;
        this.state.error = error;
        this.clearTimeout();
        
        console.error('❌ Bootstrap Error:', error);
        this.log(`❌ Bootstrap failed: ${error.message}`, 'error');
        
        this.showErrorScreen(error);
        this.setLoading(false);
    }

    /**
     * Показать экран ошибки
     */
    showErrorScreen(error) {
        const errorScreen = document.createElement('div');
        errorScreen.id = 'error-screen';
        errorScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #0B1220 0%, #1a2a4a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            font-family: 'Inter', sans-serif;
            color: white;
        `;
        
        errorScreen.innerHTML = `
            <div style="
                text-align: center;
                max-width: 600px;
                padding: 40px;
                background: rgba(77, 163, 255, 0.05);
                border: 1px solid rgba(77, 163, 255, 0.2);
                border-radius: 20px;
                backdrop-filter: blur(10px);
            ">
                <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
                <h1 style="margin: 0 0 10px 0; font-size: 28px;">Ошибка загрузки</h1>
                <p style="margin: 0 0 20px 0; color: #b0b0b0; font-size: 16px;">
                    Приложение не смогло инициализироваться.
                </p>
                <div style="
                    background: rgba(0, 0, 0, 0.3);
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: left;
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    max-height: 200px;
                    overflow-y: auto;
                ">
                    <strong style="color: #ff6b6b;">Error:</strong><br>
                    ${error.message || 'Unknown error'}
                </div>
                <button onclick="location.reload()" style="
                    padding: 12px 30px;
                    background: linear-gradient(135deg, #4da3ff 0%, #357abd 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.boxShadow='0 0 30px rgba(77, 163, 255, 0.5)'" 
                   onmouseout="this.style.boxShadow='none'">
                    Перезагрузить страницу
                </button>
                <p style="margin-top: 20px; font-size: 12px; color: #888;">
                    <a href="index.html" style="color: #4da3ff; text-decoration: none;">
                        ← Вернуться на главную
                    </a>
                </p>
            </div>
        `;
        
        document.body.appendChild(errorScreen);
    }

    /**
     * Установить timeout защиту
     */
    startTimeout() {
        this.timeoutId = setTimeout(() => {
            if (!this.state.isReady && this.state.isLoading) {
                const error = new Error(
                    `Application loading timeout (${this.config.appTimeout}ms). ` +
                    `Last stage: ${JSON.stringify(this.state.stages)}. ` +
                    `Check data path, map container, or network connection.`
                );
                this.handleBootstrapError(error);
            }
        }, this.config.appTimeout);
    }

    /**
     * Очистить timeout
     */
    clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    /**
     * Управление loader
     */
    setLoading(isLoading) {
        const loader = document.getElementById('preloader');
        if (loader) {
            if (isLoading) {
                loader.style.display = 'flex';
            } else {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.5s ease';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }
        }
    }

    /**
     * Логирование
     */
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const elapsed = Date.now() - this.state.startTime;
        
        const logMessage = `[${timestamp}] [${elapsed}ms] ${message}`;
        
        if (this.config.debug) {
            switch (type) {
                case 'success':
                    console.log('%c' + logMessage, 'color: #4ade80; font-weight: bold;');
                    break;
                case 'error':
                    console.error('%c' + logMessage, 'color: #ff6b6b; font-weight: bold;');
                    break;
                case 'warn':
                    console.warn('%c' + logMessage, 'color: #fbbf24; font-weight: bold;');
                    break;
                default:
                    console.log('%c' + logMessage, 'color: #4da3ff; font-weight: bold;');
            }
        }
    }

    /**
     * Получить состояние
     */
    getState() {
        return {
            isReady: this.state.isReady,
            isLoading: this.state.isLoading,
            error: this.state.error?.message,
            stages: this.state.stages,
            elapsed: Date.now() - this.state.startTime + 'ms',
            modules: Object.keys(this.modules)
        };
    }
}

// Экспортировать глобально
window.GeoWikiBootstrap = GeoWikiBootstrap;
