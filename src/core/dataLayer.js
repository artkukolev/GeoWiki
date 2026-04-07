/**
 * GeoWiki Data Layer
 * Безопасная загрузка и управление данными
 * 
 * Функции:
 * 1. Загружать countries.json с fallback
 * 2. Кешировать данные в localStorage
 * 3. Валидировать структуру данных
 * 4. Предоставлять API для доступа к данным
 */

class DataLayer {
    constructor() {
        this.cache = {};
        this.isLoaded = false;
        this.cacheDuration = 24 * 60 * 60 * 1000; // 24 часа
    }

    /**
     * Загрузить данные о странах
     */
    async loadCountries() {
        try {
            // Проверить кеш первым
            const cached = this.getFromCache('countries');
            if (cached) {
                console.log('📦 Using cached countries data');
                this.cache.countries = cached;
                return cached;
            }

            console.log('📥 Fetching countries data...');

            // Попытаться загрузить с разных путей
            const paths = [
                './data/countries.json',
                '/data/countries.json',
                '../data/countries.json'
            ];

            let data = null;
            let error = null;

            for (const path of paths) {
                try {
                    const response = await fetch(path);
                    if (response.ok) {
                        data = await response.json();
                        console.log(`✅ Loaded from ${path}`);
                        break;
                    }
                } catch (e) {
                    error = e;
                }
            }

            if (!data) {
                throw new Error(
                    `Failed to load countries.json from any path: ${error?.message || 'Unknown'}`
                );
            }

            // Валидировать данные
            this.validateCountriesData(data);

            // Сохранить в кеш
            this.saveToCache('countries', data);
            this.cache.countries = data;

            console.log(`✅ Loaded ${data.length} countries`);
            return data;

        } catch (error) {
            console.error('❌ Failed to load countries:', error);
            throw error;
        }
    }

    /**
     * Валидировать структуру countries.json
     */
    validateCountriesData(data) {
        if (!Array.isArray(data)) {
            throw new Error('Countries data must be an array');
        }

        if (data.length === 0) {
            throw new Error('Countries data is empty');
        }

        // Проверить первый элемент
        const first = data[0];
        const requiredFields = ['name', 'region', 'continent'];
        
        for (const field of requiredFields) {
            if (!(field in first)) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        console.log('✅ Data validation passed');
    }

    /**
     * Получить страну по ID
     */
    getCountry(countryId) {
        if (!this.cache.countries) {
            return null;
        }

        return this.cache.countries.find(c => 
            c.id === countryId || c.name.toLowerCase() === countryId.toLowerCase()
        );
    }

    /**
     * Получить страны по континенту
     */
    getCountriesByContinent(continent) {
        if (!this.cache.countries) {
            return [];
        }

        return this.cache.countries.filter(c => 
            c.continent.toLowerCase() === continent.toLowerCase()
        );
    }

    /**
     * Получить все уникальные континенты
     */
    getContinents() {
        if (!this.cache.countries) {
            return [];
        }

        const continents = new Set(this.cache.countries.map(c => c.continent));
        return Array.from(continents).sort();
    }

    /**
     * Поиск стран
     */
    searchCountries(query) {
        if (!this.cache.countries) {
            return [];
        }

        const q = query.toLowerCase();
        return this.cache.countries.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.region?.toLowerCase().includes(q)
        );
    }

    /**
     * Сохранить в localStorage
     */
    saveToCache(key, data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(`geowiki-${key}`, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    }

    /**
     * Получить из localStorage
     */
    getFromCache(key) {
        try {
            const item = localStorage.getItem(`geowiki-${key}`);
            if (!item) return null;

            const cacheData = JSON.parse(item);
            
            // Проверить срок действия
            if (Date.now() - cacheData.timestamp > this.cacheDuration) {
                localStorage.removeItem(`geowiki-${key}`);
                return null;
            }

            return cacheData.data;
        } catch (e) {
            console.warn('Failed to read from localStorage:', e);
            return null;
        }
    }

    /**
     * Очистить все кеши
     */
    clearCache() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('geowiki-')) {
                    localStorage.removeItem(key);
                }
            });
            this.cache = {};
            console.log('✅ Cache cleared');
        } catch (e) {
            console.warn('Failed to clear cache:', e);
        }
    }

    /**
     * Получить статус загрузки
     */
    getStatus() {
        return {
            isLoaded: !!this.cache.countries,
            countriesCount: this.cache.countries?.length || 0,
            continents: this.getContinents(),
            cacheSize: this.getFormattedCacheSize()
        };
    }

    /**
     * Получить размер кеша в читаемом формате
     */
    getFormattedCacheSize() {
        try {
            let size = 0;
            for (let key in localStorage) {
                if (key.startsWith('geowiki-')) {
                    size += localStorage[key].length;
                }
            }
            return (size / 1024).toFixed(2) + ' KB';
        } catch (e) {
            return 'unknown';
        }
    }
}

// Экспортировать глобально
window.DataLayer = DataLayer;
window.dataLayer = new DataLayer();
