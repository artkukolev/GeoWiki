/**
 * Main GeoWiki Application Class
 * Orchestrates the entire application
 */

class GeoWikiApp {
    constructor() {
        this.currentView = 'landing';
        this.userProgress = this.loadProgress();
    }

    get exploredCountries() {
        return this.userProgress?.exploredCountries || [];
    }

    get completedLevels() {
        return this.userProgress?.completedLevels || [];
    }

    get xp() {
        return this.userProgress?.xp || 0;
    }

    get achievements() {
        return this.userProgress?.achievements || [];
    }

    /**
     * Start the application
     */
    async start() {
        // Setup navigation
        this.setupNavigation();

        // Setup continent selection
        this.setupContinentSelection();

        // Show initial view
        this.showView('landing');
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    // Scroll to section
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    // Navigate to page
                    window.location.href = href;
                }
            });
        });
    }

    /**
     * Setup continent selection
     */
    setupContinentSelection() {
        const continentCards = document.querySelectorAll('.continent-card');
        continentCards.forEach(card => {
            card.addEventListener('click', () => {
                const continent = card.dataset.continent;
                this.navigateToMap(continent);
            });
        });
    }

    /**
     * Navigate to map with continent filter
     */
    navigateToMap(continent) {
        window.location.href = `map.html?continent=${continent}`;
    }

    /**
     * Show specific view
     */
    showView(view) {
        this.currentView = view;
        // Update UI based on view if needed
    }

    /**
     * Load user progress from localStorage
     */
    loadProgress() {
        const progress = localStorage.getItem('geoWikiProgress');
        return progress ? JSON.parse(progress) : {
            exploredCountries: [],
            completedLevels: [],
            xp: 0,
            achievements: []
        };
    }

    /**
     * Save user progress
     */
    saveProgress() {
        localStorage.setItem('geoWikiProgress', JSON.stringify(this.userProgress));
    }

    /**
     * Update user progress
     */
    updateProgress(type, data) {
        switch (type) {
            case 'explore_country':
                if (!this.userProgress.exploredCountries.includes(data.countryId)) {
                    this.userProgress.exploredCountries.push(data.countryId);
                    this.userProgress.xp += 10;
                }
                break;
            case 'complete_level':
                if (!this.userProgress.completedLevels.includes(data.levelId)) {
                    this.userProgress.completedLevels.push(data.levelId);
                    this.userProgress.xp += 50;
                }
                break;
        }
        this.saveProgress();
        this.checkAchievements();
    }

    /**
     * Check for new achievements
     */
    checkAchievements() {
        const achievements = [];

        // Explorer achievement
        if (this.userProgress.exploredCountries.length >= 5 && !this.userProgress.achievements.includes('explorer')) {
            achievements.push('explorer');
        }

        // Scholar achievement
        if (this.userProgress.completedLevels.length >= 1 && !this.userProgress.achievements.includes('scholar')) {
            achievements.push('scholar');
        }

        // Add new achievements
        achievements.forEach(achievement => {
            this.userProgress.achievements.push(achievement);
            this.showAchievementNotification(achievement);
        });

        if (achievements.length > 0) {
            this.saveProgress();
        }
    }

    /**
     * Show achievement notification
     */
    showAchievementNotification(achievement) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(`🏆 Achievement unlocked: ${achievement}`, 'success');
        }
    }

    /**
     * Initialize the application
     */
    async init() {
        await this.start();
    }
}

// Export for global use
window.GeoWikiApp = GeoWikiApp;
window.app = null;