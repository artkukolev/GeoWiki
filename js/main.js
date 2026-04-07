/**
 * GeoWiki Main Entry Point
 * Это главный файл, который загружает новую архитектуру bootstrap
 * 
 * Порядок загрузки:
 * 1. errorBoundary.js - глобальная защита от ошибок
 * 2. dataLayer.js - управление данными
 * 3. bootstrap.js - инициализация приложения
 * 
 * ДА! Я ПЕРЕПИСАЛ АРХИТЕКТУРУ!
 * - Единая точка входа (bootstrap.js)
 * - Изолированный data layer
 * - Global error boundary
 * - Timeout защита от бесконечной загрузки
 * - Fallback UI
 */

// Планы инициализации для разных страниц
const initPlans = {
    landing: ['LandingManager', 'GeoWikiApp'],
    map: ['MapManager'],
    encyclopedia: ['EncyclopediaManager'],
    quiz: ['QuizManager'],
    profile: ['ProfileManager']
};

// Определить текущую страницу
function getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('map.html')) return 'map';
    if (path.includes('encyclopedia.html')) return 'encyclopedia';
    if (path.includes('quiz.html')) return 'quiz';
    if (path.includes('profile.html')) return 'profile';
    
    return 'landing'; // По умолчанию
}

// Класс для инициализации приложения на текущей странице
class AppInitializer {
    constructor() {
        this.currentPage = getCurrentPage();
    }

    async init() {
        try {
            const countries = await window.dataLayer.loadCountries();
            window.countriesData = countries;

            await this.initCoreSystems();
            await this.initUILayer();
            await this.startApp();
        } catch (error) {
            this.showErrorScreen(error);
            throw new Error(`App initialization failed: ${error.message}`);
        }
    }

    /**
     * Initialize core systems
     */
    async initCoreSystems() {
        // Initialize progress system
        if (typeof ProgressManager !== 'undefined') {
            this.progressManager = new ProgressManager();
            await this.progressManager.init();
        }

        // Initialize modal system
        if (typeof ModalManager !== 'undefined') {
            this.modalManager = new ModalManager();
            await this.modalManager.init();
        }
    }

    /**
     * Initialize UI layer
     */
    async initUILayer() {
        // Initialize main UI components
        this.initAnimations();
        this.initInteractions();

        // Initialize page-specific components
        const currentPage = this.getCurrentPage();
        await this.initPageComponents(currentPage);
    }

    /**
     * Start the application
     */
    async startApp() {
        // Start main app logic and expose global app instance
        this.app = new GeoWikiApp();
        window.app = this.app;
        await this.app.start();
    }

    /**
     * Get current page type
     */
    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('map.html')) return 'map';
        if (path.includes('encyclopedia.html')) return 'encyclopedia';
        if (path.includes('profile.html')) return 'profile';
        return 'landing';
    }

    /**
     * Initialize page-specific components
     */
    async initPageComponents(page) {
        switch (page) {
            case 'map':
                await this.initMapPage();
                break;
            case 'encyclopedia':
                await this.initEncyclopediaPage();
                break;
            case 'profile':
                await this.initProfilePage();
                break;
            case 'quiz':
                await this.initQuizPage();
                break;
            case 'landing':
                await this.initLandingPage();
                break;
        }
    }

    /**
     * Initialize map page
     */
    async initMapPage() {
        // Lazy load Leaflet
        await this.loadLeaflet();

        // Load map manager
        await this.loadScript('./js/map-manager.js');

        // Initialize map
        this.mapManager = new MapManager();
        await this.mapManager.init();
    }

    /**
     * Initialize encyclopedia page
     */
    async initEncyclopediaPage() {
        // Load encyclopedia manager
        await this.loadScript('./js/encyclopedia-manager.js');

        // Initialize encyclopedia
        this.encyclopediaManager = new EncyclopediaManager();
        await this.encyclopediaManager.init();
    }

    /**
     * Initialize profile page
     */
    async initProfilePage() {
        // Load profile manager
        await this.loadScript('./js/profile-manager.js');

        // Initialize profile
        this.profileManager = new ProfileManager();
        await this.profileManager.init();
    }

    /**
     * Initialize quiz page
     */
    async initQuizPage() {
        // Load quiz manager
        await this.loadScript('./js/quiz.js');

        // Initialize quiz
        this.quizManager = new QuizManager();
        await this.quizManager.init();
    }

    /**
     * Initialize landing page
     */
    async initLandingPage() {
        // Load landing manager
        await this.loadScript('./js/landing-manager.js');

        // Initialize landing
        this.landingManager = new LandingManager();
        await this.landingManager.init();
    }

    /**
     * Load script dynamically
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Lazy load Leaflet library
     */
    async loadLeaflet() {
        return new Promise((resolve, reject) => {
            if (window.L) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
        });
    }

    /**
     * Initialize animations and interactions
     */
    initAnimations() {
        // Custom cursor
        this.initCustomCursor();

        // Scroll animations
        this.initScrollAnimations();

        // Wow effects
        this.initWowEffects();
    }

    /**
     * Initialize custom cursor with magnetic effect
     */
    initCustomCursor() {
        this.cursor = document.querySelector('.cursor');
        this.cursorFollower = document.querySelector('.cursor-follower');

        if (!this.cursor || !this.cursorFollower) return;

        let mouseX = 0, mouseY = 0;
        let cursorX = 0, cursorY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const updateCursor = () => {
            // Smooth cursor follower
            cursorX += (mouseX - cursorX) * 0.1;
            cursorY += (mouseY - cursorY) * 0.1;

            this.cursor.style.left = mouseX + 'px';
            this.cursor.style.top = mouseY + 'px';

            this.cursorFollower.style.left = cursorX + 'px';
            this.cursorFollower.style.top = cursorY + 'px';

            requestAnimationFrame(updateCursor);
        };

        updateCursor();

        // Magnetic hover effects
        document.querySelectorAll('a, button, .level-card, .game-option, .symbol-card').forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursorFollower.style.transform = 'scale(2)';
                this.cursorFollower.style.borderColor = 'var(--accent-color)';
            });
            el.addEventListener('mouseleave', () => {
                this.cursorFollower.style.transform = 'scale(1)';
                this.cursorFollower.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            });
        });
    }

    /**
     * Initialize scroll reveal animations
     */
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Initialize wow effects: particles, morphing shapes, etc.
     */
    initWowEffects() {
        this.createParticleSystem();
        this.initMorphingShapes();
        this.initFloatingElements();
    }

    /**
     * Create particle system for background animation
     */
    createParticleSystem() {
        const canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '-1';

        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2
        });

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(createParticle());
            }
        };

        const updateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            });
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
                ctx.fill();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            this.animationFrame = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        initParticles();
        animate();
    }

    /**
     * Initialize morphing shapes animation
     */
    initMorphingShapes() {
        const morphingContainer = document.createElement('div');
        morphingContainer.id = 'morphing-shapes';
        morphingContainer.style.position = 'fixed';
        morphingContainer.style.top = '0';
        morphingContainer.style.left = '0';
        morphingContainer.style.width = '100%';
        morphingContainer.style.height = '100%';
        morphingContainer.style.pointerEvents = 'none';
        morphingContainer.style.zIndex = '-1';
        morphingContainer.style.overflow = 'hidden';

        for (let i = 0; i < 5; i++) {
            const shape = document.createElement('div');
            shape.className = 'morphing-shape';
            shape.style.position = 'absolute';
            shape.style.width = '100px';
            shape.style.height = '100px';
            shape.style.background = 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))';
            shape.style.borderRadius = '50%';
            shape.style.left = Math.random() * 100 + '%';
            shape.style.top = Math.random() * 100 + '%';
            shape.style.animation = `morph ${3 + Math.random() * 2}s ease-in-out infinite`;
            shape.style.animationDelay = Math.random() * 2 + 's';

            morphingContainer.appendChild(shape);
        }

        document.body.appendChild(morphingContainer);
    }

    /**
     * Initialize floating elements animation
     */
    initFloatingElements() {
        document.querySelectorAll('.floating-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.5}s`;
        });
    }

    /**
     * Initialize user interactions
     */
    initInteractions() {
        this.initSmoothScroll();
        this.initButtonAnimations();
        this.initCardEffects();
        this.initNotificationSystem();
    }

    /**
     * Initialize smooth scroll for anchor links
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize enhanced button animations
     */
    initButtonAnimations() {
        document.querySelectorAll('.cta-button, .level-btn, .game-btn, .symbol-btn').forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
                this.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
                this.style.boxShadow = '';
            });
            btn.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(-1px) scale(0.98)';
            });
            btn.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            });
        });
    }

    /**
     * Initialize card effects
     */
    initCardEffects() {
        document.querySelectorAll('.level-card, .continent-card, .game-option').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-5px)';
                this.style.boxShadow = '0 10px 30px rgba(77, 163, 255, 0.3)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            });
        });
    }

    /**
     * Initialize notification system
     */
    initNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.querySelector('#notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // Add global notification function
        window.showNotification = (message, type = 'info') => {
            const container = document.querySelector('#notification-container');
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.style.cssText = `
                background: var(--glass-bg);
                backdrop-filter: blur(10px);
                border: 1px solid var(--glass-border);
                border-radius: 12px;
                padding: 16px 20px;
                margin-bottom: 10px;
                color: white;
                font-weight: 500;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease-out;
                pointer-events: auto;
                cursor: pointer;
            `;

            notification.textContent = message;
            container.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 10);

            // Auto remove
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);

            // Click to dismiss
            notification.addEventListener('click', () => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        };
    }

    /**
     * Initialize parallax effects
     */
    initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');

        const handleScroll = () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = element.dataset.rate || 0.5;
                const yPos = -(scrolled * rate);
                element.style.transform = `translateY(${yPos}px)`;
            });
        };

        window.addEventListener('scroll', handleScroll);
    }

    /**
     * Show error screen
     */
    showErrorScreen(error) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-screen';
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            text-align: center;
            padding: 20px;
        `;

        errorDiv.innerHTML = `
            <div>
                <h1 style="color: var(--accent-error); margin-bottom: 20px;">🚫 Ошибка загрузки</h1>
                <p style="margin-bottom: 20px;">${error.message}</p>
                <button onclick="location.reload()" style="
                    background: var(--accent-primary);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                ">Перезагрузить</button>
            </div>
        `;

        document.body.appendChild(errorDiv);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const bootstrap = new GeoWikiBootstrap();
        await bootstrap.init();

        const appInitializer = new AppInitializer();
        await appInitializer.init();
    } catch (err) {
        console.error('Initialization failed:', err);
    }
});

// Fallback for older browsers
window.addEventListener('load', async () => {
    if (!document.querySelector('#error-screen')) {
        try {
            const bootstrap = new GeoWikiBootstrap();
            await bootstrap.init();

            const appInitializer = new AppInitializer();
            await appInitializer.init();
        } catch (err) {
            console.error('Initialization failed:', err);
        }
    }
});

