/**
 * Encyclopedia Manager
 * Handles country detail pages
 */

class EncyclopediaManager {
    constructor() {
        this.currentCountry = null;
    }

    /**
     * Initialize encyclopedia page
     */
    async init() {
        console.log('📖 Initializing encyclopedia...');

        // Get country from URL
        const urlParams = new URLSearchParams(window.location.search);
        const countryId = urlParams.get('country');

        if (!countryId) {
            this.showError('Страна не указана');
            return;
        }

        // Load country data
        await this.loadCountryData(countryId);

        console.log('✅ Encyclopedia initialized');
    }

    /**
     * Load country data
     */
    async loadCountryData(countryId) {
        try {
            const response = await fetch('./data/countries.json');
            if (!response.ok) throw new Error('Failed to load countries data');

            const countries = await response.json();
            const country = countries.find(c => c.id === countryId);

            if (!country) {
                this.showError('Страна не найдена');
                return;
            }

            this.currentCountry = country;
            this.renderCountryPage(country);

        } catch (error) {
            console.error('Error loading country:', error);
            this.showError('Не удалось загрузить данные страны');
        }
    }

    /**
     * Render country page
     */
    renderCountryPage(country) {
        const main = document.querySelector('main') || document.body;

        // Create country content
        const content = document.createElement('div');
        content.className = 'encyclopedia-content';
        content.innerHTML = `
            <div class="country-header">
                <div class="country-flag-large">${country.flag}</div>
                <div class="country-info-main">
                    <h1 class="country-title">${country.name}</h1>
                    <div class="country-subtitle">
                        <span class="continent-badge">${this.getContinentName(country.continent)}</span>
                        <span class="capital-info">Столица: ${country.capital}</span>
                    </div>
                </div>
            </div>

            <div class="country-stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">👥</div>
                    <div class="stat-content">
                        <div class="stat-value">${country.population}</div>
                        <div class="stat-label">Население</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">📏</div>
                    <div class="stat-content">
                        <div class="stat-value">${country.area}</div>
                        <div class="stat-label">Площадь</div>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🌡️</div>
                    <div class="stat-content">
                        <div class="stat-value">${country.climate}</div>
                        <div class="stat-label">Климат</div>
                    </div>
                </div>
            </div>

            <div class="country-sections">
                <section class="country-section">
                    <h2 class="section-title">🌍 География</h2>
                    <div class="section-content">
                        <p>${country.fact}</p>
                        <div class="coordinates">
                            Координаты: ${country.coords[0]}°, ${country.coords[1]}°
                        </div>
                    </div>
                </section>

                <section class="country-section">
                    <h2 class="section-title">🏛️ Столица</h2>
                    <div class="section-content">
                        <p><strong>${country.capital}</strong> — столица ${country.name}.</p>
                    </div>
                </section>

                <section class="country-section">
                    <h2 class="section-title">📊 Статистика</h2>
                    <div class="section-content">
                        <ul class="stats-list">
                            <li><strong>Континент:</strong> ${this.getContinentName(country.continent)}</li>
                            <li><strong>Население:</strong> ${country.population}</li>
                            <li><strong>Площадь:</strong> ${country.area}</li>
                            <li><strong>Климат:</strong> ${country.climate}</li>
                        </ul>
                    </div>
                </section>
            </div>

            <div class="country-actions">
                <a href="map.html" class="action-button primary">
                    🗺️ Вернуться к карте
                </a>
                <a href="quiz.html?country=${country.id}" class="action-button success">
                    🧠 Пройти тест
                </a>
                <a href="levels/beginner.html" class="action-button secondary">
                    📚 Начать обучение
                </a>
            </div>
        `;

        // Replace main content
        const existingContent = main.querySelector('.encyclopedia-content');
        if (existingContent) {
            existingContent.replaceWith(content);
        } else {
            main.appendChild(content);
        }
    }

    /**
     * Get continent name in Russian
     */
    getContinentName(continentId) {
        const continents = {
            'europe': 'Европа',
            'asia': 'Азия',
            'africa': 'Африка',
            'americas': 'Америка'
        };
        return continents[continentId] || continentId;
    }

    /**
     * Show error message
     */
    showError(message) {
        const main = document.querySelector('main') || document.body;
        main.innerHTML = `
            <div class="error-page">
                <h1>🚨 Ошибка</h1>
                <p>${message}</p>
                <a href="map.html" class="error-button">Вернуться к карте</a>
            </div>
        `;
    }
}

// Export for global use
window.EncyclopediaManager = EncyclopediaManager;