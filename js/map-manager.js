/**
 * Map Manager
 * Handles interactive map functionality
 */

class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentFilter = null;
    }

    /**
     * Initialize the map
     */
    async init() {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.currentFilter = urlParams.get('continent');

        // Create map container if it doesn't exist
        this.createMapContainer();

        // Initialize Leaflet map
        this.initLeafletMap();

        // Load and display countries
        await this.loadCountries();

        // Setup map interactions
        this.setupInteractions();
    }

    /**
     * Create map container
     */
    createMapContainer() {
        if (!document.getElementById('map')) {
            const mapContainer = document.createElement('div');
            mapContainer.id = 'map';
            mapContainer.style.height = '600px';
            mapContainer.style.width = '100%';
            mapContainer.style.borderRadius = '16px';
            mapContainer.style.overflow = 'hidden';

            const main = document.querySelector('main') || document.body;
            main.appendChild(mapContainer);
        }
    }

    /**
     * Initialize Leaflet map
     */
    initLeafletMap() {
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 3,
            minZoom: 2,
            maxZoom: 8,
            zoomControl: true,
            scrollWheelZoom: true
        });

        // Add dark tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
    }

    /**
     * Load countries data and create markers
     */
    async loadCountries() {
        try {
            const response = await fetch('./data/countries.json');
            if (!response.ok) throw new Error('Failed to load countries data');

            const countries = await response.json();
            this.displayCountries(countries);
        } catch (error) {
            console.error('Error loading countries:', error);
            this.showError('Не удалось загрузить данные стран');
        }
    }

    /**
     * Display countries on map
     */
    displayCountries(countries) {
        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];

        // Filter countries if needed
        let filteredCountries = countries;
        if (this.currentFilter) {
            filteredCountries = countries.filter(country => country.continent === this.currentFilter);
        }

        // Create markers
        filteredCountries.forEach(country => {
            this.createCountryMarker(country);
        });

        // Fit map to markers if filtered
        if (this.currentFilter && this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    /**
     * Create country marker
     */
    createCountryMarker(country) {
        const marker = L.marker(country.coords, {
            icon: L.divIcon({
                className: 'country-marker',
                html: country.flag,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
            })
        });

        // Create popup content
        const popupContent = this.createPopupContent(country);

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'country-popup'
        });

        marker.on('click', () => {
            // Track exploration
            if (window.bootstrap && window.bootstrap.app) {
                window.bootstrap.app.updateProgress('explore_country', { countryId: country.id });
            }
        });

        marker.addTo(this.map);
        this.markers.push(marker);
    }

    /**
     * Create popup content
     */
    createPopupContent(country) {
        return `
            <div class="country-popup-content">
                <div class="country-header">
                    <span class="country-flag">${country.flag}</span>
                    <h3 class="country-name">${country.name}</h3>
                </div>
                <div class="country-info">
                    <p><strong>Столица:</strong> ${country.capital}</p>
                    <p><strong>Население:</strong> ${country.population}</p>
                    <p><strong>Площадь:</strong> ${country.area}</p>
                    <p><strong>Климат:</strong> ${country.climate}</p>
                    <p class="country-fact">${country.fact}</p>
                </div>
                <div class="country-actions">
                    <a href="encyclopedia.html?country=${country.id}" class="popup-button">
                        📖 Узнать больше
                    </a>
                </div>
            </div>
        `;
    }

    /**
     * Setup map interactions
     */
    setupInteractions() {
        // Add continent filter controls
        this.addContinentFilter();

        // Add search functionality
        this.addSearchControl();
    }

    /**
     * Add continent filter
     */
    addContinentFilter() {
        const continents = [
            { id: 'all', name: 'Все', icon: '🌍' },
            { id: 'europe', name: 'Европа', icon: '🇪🇺' },
            { id: 'asia', name: 'Азия', icon: '🌏' },
            { id: 'africa', name: 'Африка', icon: '🌍' },
            { id: 'americas', name: 'Америка', icon: '🌎' }
        ];

        const filterContainer = document.createElement('div');
        filterContainer.className = 'map-filter';
        filterContainer.innerHTML = `
            <div class="filter-buttons">
                ${continents.map(continent => `
                    <button class="filter-btn ${this.currentFilter === continent.id || (!this.currentFilter && continent.id === 'all') ? 'active' : ''}"
                            data-continent="${continent.id}">
                        ${continent.icon} ${continent.name}
                    </button>
                `).join('')}
            </div>
        `;

        // Add event listeners
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const continent = btn.dataset.continent;
                this.filterByContinent(continent === 'all' ? null : continent);

                // Update active state
                filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Add to map
        this.map.getContainer().appendChild(filterContainer);
    }

    /**
     * Filter countries by continent
     */
    async filterByContinent(continent) {
        this.currentFilter = continent;

        // Reload countries with filter
        const response = await fetch('./data/countries.json');
        const countries = await response.json();
        this.displayCountries(countries);

        // Update URL
        const url = new URL(window.location);
        if (continent) {
            url.searchParams.set('continent', continent);
        } else {
            url.searchParams.delete('continent');
        }
        window.history.pushState({}, '', url);
    }

    /**
     * Add search control
     */
    addSearchControl() {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'map-search';
        searchContainer.innerHTML = `
            <input type="text" placeholder="Поиск страны..." class="search-input">
            <button class="search-btn">🔍</button>
        `;

        const searchInput = searchContainer.querySelector('.search-input');
        const searchBtn = searchContainer.querySelector('.search-btn');

        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query) {
                this.searchCountry(query);
            }
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });

        this.map.getContainer().appendChild(searchContainer);
    }

    /**
     * Search for country
     */
    async searchCountry(query) {
        const response = await fetch('./data/countries.json');
        const countries = await response.json();

        const found = countries.find(country =>
            country.name.toLowerCase().includes(query) ||
            country.capital.toLowerCase().includes(query) ||
            country.id === query
        );

        if (found) {
            this.map.setView(found.coords, 6);
            // Find and open marker popup
            const marker = this.markers.find(m => {
                const latlng = m.getLatLng();
                return latlng.lat === found.coords[0] && latlng.lng === found.coords[1];
            });
            if (marker) {
                marker.openPopup();
            }
        } else {
            this.showNotification('Страна не найдена');
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'map-error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 3000);
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'map-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 2000);
    }
}

// Export for global use
window.MapManager = MapManager;