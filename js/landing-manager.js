/**
 * Landing Manager
 * Handles main landing page interactions
 */

class LandingManager {
    constructor() {
        this.currentSection = 'hero';
    }

    /**
     * Initialize landing page
     */
    async init() {
        // Setup continent selection
        this.setupContinentCards();

        // Setup smooth scrolling
        this.setupSmoothScrolling();

        // Setup animations
        this.setupAnimations();
    }

    /**
     * Setup continent card interactions
     */
    setupContinentCards() {
        const continentCards = document.querySelectorAll('.continent-card');

        continentCards.forEach(card => {
            card.addEventListener('click', () => {
                const continent = card.dataset.continent;
                this.navigateToContinent(continent);
            });

            // Add hover effects
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 30px rgba(77, 163, 255, 0.3)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            });
        });
    }

    /**
     * Navigate to continent map
     */
    navigateToContinent(continent) {
        const continentNames = {
            'europe': 'Европа',
            'asia': 'Азия',
            'africa': 'Африка',
            'americas': 'Америка'
        };

        // Show loading state
        this.showLoadingState(`Загрузка карты ${continentNames[continent]}...`);

        // Navigate after short delay for UX
        setTimeout(() => {
            window.location.href = `map.html?continent=${continent}`;
        }, 500);
    }

    /**
     * Setup smooth scrolling for navigation
     */
    setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Setup animations and interactions
     */
    setupAnimations() {
        // Animate stats on scroll
        this.setupStatsAnimation();

        // Animate continent cards on scroll
        this.setupContinentAnimation();
    }

    /**
     * Setup statistics counter animation
     */
    setupStatsAnimation() {
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateStats();
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const heroStats = document.querySelector('.hero-stats');
        if (heroStats) {
            observer.observe(heroStats);
        }
    }

    /**
     * Animate statistics numbers
     */
    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(stat => {
            const target = parseInt(stat.textContent.replace(/\D/g, '')) || 0;
            const isInfinite = stat.textContent.includes('∞');

            if (isInfinite) return;

            this.animateNumber(stat, 0, target, 2000);
        });
    }

    /**
     * Animate number counting up
     */
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Setup continent cards animation
     */
    setupContinentAnimation() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 200);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const continentCards = document.querySelectorAll('.continent-card');
        continentCards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'all 0.6s ease-out';
            observer.observe(card);
        });
    }

    /**
     * Show loading state
     */
    showLoadingState(message) {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(11, 18, 32, 0.9);
            backdrop-filter: blur(5px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;

        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="width: 40px; height: 40px; border: 3px solid rgba(77, 163, 255, 0.3); border-top: 3px solid #4DA3FF; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <p style="font-size: 18px; margin: 0;">${message}</p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Add spin animation
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

// Export for global use
window.LandingManager = LandingManager;