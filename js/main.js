/**
 * GEOWIKI Main Module
 * Core animations, interactions, and wow effects
 */

class MainManager {
    constructor() {
        this.cursor = null;
        this.cursorFollower = null;
        this.particles = [];
        this.animationFrame = null;
    }

    init() {
        this.initPreloader();
        this.initCustomCursor();
        this.initScrollAnimations();
        this.initWowEffects();
        this.initInteractions();
        this.initParallax();
        this.initDynamicBackground();
    }

    /**
     * Initialize preloader with premium animation
     */
    initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
                this.startWowSequence();
            }, 1000);
        });
    }

    /**
     * Start wow sequence after preloader
     */
    startWowSequence() {
        // Sequential reveal of hero elements
        const elements = [
            '.hero-title',
            '.hero-subtitle',
            '.hero-cta',
            '.hero-stats'
        ];

        elements.forEach((selector, index) => {
            setTimeout(() => {
                const element = document.querySelector(selector);
                if (element) {
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(30px)';
                    element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';

                    requestAnimationFrame(() => {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    });
                }
            }, index * 200);
        });
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
     * Initialize card hover effects
     */
    initCardEffects() {
        document.querySelectorAll('.level-card, .symbol-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-15px) rotateX(5deg)';
                this.style.boxShadow = '0 30px 80px rgba(0, 0, 0, 0.2)';
            });
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) rotateX(0)';
                this.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
            });
        });
    }

    /**
     * Initialize parallax effects
     */
    initParallax() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroVisual = document.querySelector('.hero-visual');
            if (heroVisual) {
                heroVisual.style.transform = `translateY(${scrolled * 0.5}px)`;
            }

            const animatedBg = document.querySelector('.animated-bg');
            if (animatedBg) {
                animatedBg.style.transform = `translateY(${scrolled * -0.5}px)`;
            }
        });
    }

    /**
     * Initialize dynamic background gradient
     */
    initDynamicBackground() {
        let hue = 0;
        const updateBackground = () => {
            hue = (hue + 0.5) % 360;
            const animatedBg = document.querySelector('.animated-bg');
            if (animatedBg) {
                animatedBg.style.filter = `hue-rotate(${hue}deg)`;
            }
            requestAnimationFrame(updateBackground);
        };
        updateBackground();
    }

    /**
     * Initialize notification system
     */
    initNotificationSystem() {
        window.showNotification = (message, type = 'success') => {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${type === 'success' ? '✓' : '⚠'}</span>
                    <span class="notification-text">${message}</span>
                </div>
            `;
            notification.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${type === 'success' ? 'var(--beginner-color)' : 'var(--pro-color)'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius-lg);
                box-shadow: var(--shadow-glow);
                z-index: 1000;
                transform: translateX(100%);
                transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            `;
            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);

            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        };

        window.unlockAchievement = (achievementId) => {
            const achievement = document.getElementById(achievementId);
            if (achievement && !achievement.classList.contains('unlocked')) {
                achievement.classList.add('unlocked');
                achievement.style.animation = 'bounce 0.6s ease';
                setTimeout(() => {
                    achievement.style.animation = '';
                }, 600);
                window.showNotification('Новое достижение разблокировано!', 'success');
            }
        };

        window.animateProgress = (element, percentage) => {
            element.style.width = percentage + '%';
        };
    }

    /**
     * Cleanup method
     */
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        // Remove event listeners if needed
    }
}

// Global instance
window.MainManager = MainManager;

// Export init function for app.js
window.initMain = () => {
    const mainManager = new MainManager();
    mainManager.init();
    window.mainManager = mainManager;
};