/**
 * GEOWIKI App Controller
 * Main application entry point and module orchestrator
 */

class GeoWikiApp {
    constructor() {
        this.modules = {};
        this.initialized = false;
    }

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;

        try {
            console.log('🚀 Initializing GEOWIKI...');

            // Initialize core modules
            await this.initModules();

            // Setup global event listeners
            this.setupGlobalEvents();

            // Start animations and interactions
            this.startApp();

            this.initialized = true;
            console.log('✅ GEOWIKI initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize GEOWIKI:', error);
        }
    }

    /**
     * Initialize all application modules
     */
    async initModules() {
        const modules = [
            { name: 'progress', path: './progress.js', class: 'ProgressManager' },
            { name: 'modal', path: './modal.js', class: 'ModalManager' },
            { name: 'quiz', path: './quiz.js', class: 'QuizManager' },
            { name: 'filter', path: './filter.js', class: 'FilterManager' },
            { name: 'miniGame', path: './mini-game.js', class: 'MiniGameManager' }
        ];

        for (const module of modules) {
            try {
                // Dynamic import for better performance
                const moduleScript = document.createElement('script');
                moduleScript.src = module.path;
                moduleScript.type = 'module';

                await new Promise((resolve, reject) => {
                    moduleScript.onload = resolve;
                    moduleScript.onerror = reject;
                    document.head.appendChild(moduleScript);
                });

                // Wait for module to be available globally
                await this.waitForModule(module.class);

                console.log(`✅ Module ${module.name} loaded`);

            } catch (error) {
                console.warn(`⚠️ Module ${module.name} failed to load:`, error);
            }
        }
    }

    /**
     * Wait for a module class to be available globally
     */
    waitForModule(className, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkModule = () => {
                if (window[className]) {
                    resolve(window[className]);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Module ${className} not found within ${timeout}ms`));
                } else {
                    setTimeout(checkModule, 100);
                }
            };

            checkModule();
        });
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseApp();
            } else {
                this.resumeApp();
            }
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-nav]')) {
                e.preventDefault();
                this.navigate(e.target.dataset.nav);
            }
        });
    }

    /**
     * Start the application
     */
    startApp() {
        // Initialize main.js functionality
        if (window.initMain) {
            window.initMain();
        }

        // Start scroll animations
        this.initScrollAnimations();

        // Initialize progress tracking
        if (window.ProgressManager) {
            this.modules.progress = new window.ProgressManager();
        }

        // Initialize modal system
        if (window.ModalManager) {
            this.modules.modal = new window.ModalManager();
        }

        // Initialize quiz system if on level page
        if (window.QuizManager && document.querySelector('.quiz-container')) {
            this.modules.quiz = new window.QuizManager();
        }

        // Initialize filter system if on symbols page
        if (window.FilterManager && document.querySelector('.filters-section')) {
            this.modules.filter = new window.FilterManager();
        }

        // Initialize mini-game if present
        if (window.MiniGameManager && document.querySelector('.mini-game-section')) {
            this.modules.miniGame = new window.MiniGameManager();
        }
    }

    /**
     * Initialize scroll animations
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                }
            });
        }, observerOptions);

        // Observe all elements with reveal class
        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update any responsive elements
        if (this.modules.modal) {
            this.modules.modal.updatePosition();
        }
    }

    /**
     * Navigate to a different section
     */
    navigate(target) {
        const sections = document.querySelectorAll('section');
        sections.forEach(section => section.classList.remove('active'));

        const targetSection = document.getElementById(target);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Pause application (when tab is hidden)
     */
    pauseApp() {
        // Pause animations, timers, etc.
        document.body.classList.add('paused');
    }

    /**
     * Resume application (when tab becomes visible)
     */
    resumeApp() {
        // Resume animations, timers, etc.
        document.body.classList.remove('paused');
    }

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Get application state
     */
    getState() {
        return {
            initialized: this.initialized,
            modules: Object.keys(this.modules),
            currentPage: window.location.pathname
        };
    }
}

// Global app instance
window.GeoWikiApp = new GeoWikiApp();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.GeoWikiApp.init());
} else {
    window.GeoWikiApp.init();
}

// Export for modules
window.app = window.GeoWikiApp;