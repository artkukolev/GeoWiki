/**
 * GeoWiki Bootstrap v2.1
 * Non-blocking initialization - UI renders immediately
 * Data loads asynchronously in the background
 * 
 * Принципы:
 * 1. UI рендится СРАЗУ (без preloader)
 * 2. Данные загружаются асинхронно в background
 * 3. Skeleton loading внутри компонентов
 * 4. НЕ блокирует First Contentful Paint
 */

class GeoWikiBootstrap {
    constructor() {
        this.config = {
            dataPath: './data/countries.json',
            mapContainer: 'map',
            dataTimeout: 5000,
            debug: true
        };
        
        this.state = {
            dataLoaded: false,
            mapReady: false,
            uiReady: true, // UI рендится сразу!
            error: null,
            startTime: 0
        };
        
        this.modules = {};
    }

    /**
     * Главный метод инициализации (НЕ блокирующий)
     */
    async init() {
        try {
            this.log('🚀 Starting GeoWiki (non-blocking)...', 'info');
            this.state.startTime = Date.now();

            // STAGE 1: UI рендится СРАЗУ (без ожидания)
            this.log('✅ UI ready (immediate render)', 'success');
            
            // STAGE 2: Загружать данные и карту В ФОНЕ (асинхронно)
            this.loadDataInBackground();
            this.initMapInBackground();

            // STAGE 3: Настроить обработчик ошибок
            this.setupErrorHandling();

            this.log('✅ GeoWiki initialized (non-blocking)', 'success');

        } catch (error) {
            this.handleBootstrapError(error);
        }
    }

    /**
     * Загружать данные в фоне БЕЗ блокировки UI
     */
    loadDataInBackground() {
        // Использовать requestIdleCallback для неблокирующей загрузки
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.loadData(), { timeout: this.config.dataTimeout });
        } else {
            // Fallback для старых браузеров
            setTimeout(() => this.loadData(), 100);
        }
    }

    /**
     * Загрузить данные о странах (async фон)
     */
    async loadData() {
        try {
            this.log('📊 Loading countries data...', 'info');

            const response = await fetch(this.config.dataPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            
            // Сохранить данные
            window.countriesData = data;
            this.modules.data = data;
            this.state.dataLoaded = true;
            
            this.log(`✅ Loaded ${data.length} countries`, 'success');
            
            // Уведомить компоненты о готовности данных
            this.notifyDataReady(data);
            
        } catch (error) {
            this.log(`❌ Data loading error: ${error.message}`, 'error');
            this.state.error = error;
            this.notifyDataError(error);
        }
    }

    /**
     * Инициализировать карту в фоне БЕЗ блокировки UI
     */
    initMapInBackground() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => this.initMap(), { timeout: 3000 });
        } else {
            setTimeout(() => this.initMap(), 200);
        }
    }

    /**
     * Инициализировать карту
     */
    async initMap() {
        try {
            // Проверить, есть ли контейнер
            const mapContainer = document.getElementById(this.config.mapContainer);
            if (!mapContainer) {
                this.log('⚠️ Map container not found (OK for landing)', 'warn');
                return;
            }

            this.log('🗺️ Initializing map...', 'info');

            // Проверить наличие Leaflet
            if (!window.L) {
                this.log('⚠️ Leaflet not loaded yet', 'warn');
                return;
            }

            // Инициализировать карту
            const map = L.map(this.config.mapContainer).setView([20, 0], 2);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            this.modules.map = map;
            this.state.mapReady = true;
            
            this.log('✅ Map initialized', 'success');

        } catch (error) {
            this.log(`❌ Map init error: ${error.message}`, 'error');
        }
    }

    /**
     * Уведомить компоненты о готовности данных
     */
    notifyDataReady(data) {
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('geowiki:data-ready', {
            detail: { data: data }
        }));

        // Обновить компоненты вручную если нужно
        if (window.updateCountryCards) {
            window.updateCountryCards(data);
        }
    }

    /**
     * Уведомить компоненты об ошибке
     */
    notifyDataError(error) {
        window.dispatchEvent(new CustomEvent('geowiki:data-error', {
            detail: { error: error.message }
        }));

        // Показать мини-ошибку
        this.showMiniError(error.message);
    }

    /**
     * Показать мини-ошибку (не блокирующую весь экран)
     */
    showMiniError(message) {
        // Создать мини-уведомление вместо полноэкранного
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 16px 20px;
            border-radius: 10px;
            max-width: 400px;
            font-family: 'Inter', sans-serif;
            z-index: 9998;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            border-left: 4px solid #ff6b6b;
        `;

        notification.innerHTML = `
            <strong style="font-size: 14px;">⚠️ Ошибка</strong>
            <p style="margin: 5px 0 0 0; font-size: 12px;">
                ${message}
            </p>
        `;

        document.body.appendChild(notification);

        // Автоматически удалить через 5 секунд
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Настроить глобальную обработку ошибок
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.log(`❌ Uncaught error: ${event.message}`, 'error');
            // НЕ блокировать UI - только логировать
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.log(`❌ Unhandled promise: ${event.reason}`, 'error');
            // НЕ преотвращать default - позволить браузеру обработать
        });
    }

    /**
     * Обработка критических ошибок bootstrap (редко)
     */
    handleBootstrapError(error) {
        this.log(`❌ Critical bootstrap error: ${error.message}`, 'error');
        // Показать мини-ошибку вместо полноэкранной
        this.showMiniError(error.message);
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
            dataLoaded: this.state.dataLoaded,
            mapReady: this.state.mapReady,
            uiReady: this.state.uiReady,
            error: this.state.error?.message,
            elapsed: Date.now() - this.state.startTime + 'ms'
        };
    }
}

// Экспортировать глобально
window.GeoWikiBootstrap = GeoWikiBootstrap;
