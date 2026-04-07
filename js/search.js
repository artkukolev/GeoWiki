/**
 * GeoWiki Search Module
 * Handles country search functionality
 */

class GeoWikiSearch {
    constructor() {
        this.countries = [];
        this.searchInput = null;
        this.searchBtn = null;
        this.searchResults = null;
        this.debounceTimer = null;
    }

    /**
     * Initialize search
     */
    async init() {
        // Get DOM elements
        this.searchInput = document.getElementById('landing-search');
        this.searchBtn = document.getElementById('landing-search-btn');
        this.searchResults = document.getElementById('search-results');

        if (!this.searchInput) return; // No search on this page

        // Load countries data
        await this.loadCountries();

        // Setup event listeners
        this.setupListeners();
    }

    /**
     * Load countries data
     */
    async loadCountries() {
        try {
            const response = await fetch('./data/countries.json');
            if (!response.ok) throw new Error('Failed to load countries');
            this.countries = await response.json();
        } catch (error) {
            // Silently fail - search won't work but app continues
        }
    }

    /**
     * Setup event listeners
     */
    setupListeners() {
        // Search input with debounce
        this.searchInput.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 200);
        });

        // Search button
        this.searchBtn.addEventListener('click', () => {
            this.performSearch(this.searchInput.value);
        });

        // Enter key
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(this.searchInput.value);
            }
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-bar')) {
                this.hideResults();
            }
        });
    }

    /**
     * Perform search
     */
    performSearch(query) {
        const trimmed = query.toLowerCase().trim();

        if (!trimmed || trimmed.length < 1) {
            this.hideResults();
            return;
        }

        // Filter countries
        const results = this.countries.filter(country =>
            country.name.toLowerCase().includes(trimmed) ||
            country.capital.toLowerCase().includes(trimmed)
        ).slice(0, 8); // Limit to 8 results

        // Show results
        if (results.length > 0) {
            this.showResults(results);
        } else {
            this.showNoResults();
        }
    }

    /**
     * Show search results
     */
    showResults(results) {
        this.searchResults.innerHTML = results.map(country => `
            <div class="search-result-item" onclick="geoWikiSearch.goToCountry('${country.id}')">
                <span class="search-result-name">${country.flag} ${country.name}</span>
                <span class="search-result-capital">Столица: ${country.capital}</span>
            </div>
        `).join('');
        this.searchResults.style.display = 'block';
    }

    /**
     * Show no results message
     */
    showNoResults() {
        this.searchResults.innerHTML = `
            <div class="search-result-item" style="cursor: default; text-align: center; color: var(--text-light);">
                Страна не найдена
            </div>
        `;
        this.searchResults.style.display = 'block';
    }

    /**
     * Hide results
     */
    hideResults() {
        this.searchResults.style.display = 'none';
    }

    /**
     * Go to country (navigate to map with filter)
     */
    goToCountry(countryId) {
        // Find country to get continent
        const country = this.countries.find(c => c.id === countryId);
        if (country) {
            // Navigate to map with country highlighted
            window.location.href = `map.html?continent=${country.continent}&country=${country.id}`;
        }
    }
}

// Initialize on DOM ready
let geoWikiSearch;
document.addEventListener('DOMContentLoaded', () => {
    geoWikiSearch = new GeoWikiSearch();
    geoWikiSearch.init();
});
