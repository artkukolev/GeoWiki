/**
 * Profile Manager
 * Handles user profile and achievements
 */

class ProfileManager {
    constructor() {
        this.achievements = [
            {
                id: 'first-quiz',
                name: 'Первый тест',
                description: 'Прошёл первый тест по стране',
                icon: '🧠',
                unlocked: false,
                condition: () => window.app?.exploredCountries.length >= 1
            },
            {
                id: 'geography-enthusiast',
                name: 'Любитель географии',
                description: 'Исследовал 5 стран',
                icon: '🗺️',
                unlocked: false,
                condition: () => window.app?.exploredCountries.length >= 5
            },
            {
                id: 'world-explorer',
                name: 'Исследователь мира',
                description: 'Исследовал 10 стран',
                icon: '🌍',
                unlocked: false,
                condition: () => window.app?.exploredCountries.length >= 10
            },
            {
                id: 'continent-master',
                name: 'Мастер континентов',
                description: 'Исследовал все континенты',
                icon: '🌎',
                unlocked: false,
                condition: () => this.hasAllContinents()
            },
            {
                id: 'xp-100',
                name: '100 XP',
                description: 'Набрал 100 очков опыта',
                icon: '⭐',
                unlocked: false,
                condition: () => window.app?.xp >= 100
            },
            {
                id: 'xp-500',
                name: '500 XP',
                description: 'Набрал 500 очков опыта',
                icon: '🌟',
                unlocked: false,
                condition: () => window.app?.xp >= 500
            },
            {
                id: 'xp-1000',
                name: '1000 XP',
                description: 'Набрал 1000 очков опыта',
                icon: '🏆',
                unlocked: false,
                condition: () => window.app?.xp >= 1000
            },
            {
                id: 'quiz-master',
                name: 'Мастер тестов',
                description: 'Прошёл 20 тестов',
                icon: '🎯',
                unlocked: false,
                condition: () => window.app?.exploredCountries.length >= 20
            }
        ];

        this.levels = [
            { level: 1, xpRequired: 0, name: 'Новичок' },
            { level: 2, xpRequired: 50, name: 'Ученик' },
            { level: 3, xpRequired: 150, name: 'Исследователь' },
            { level: 4, xpRequired: 300, name: 'Географ' },
            { level: 5, xpRequired: 500, name: 'Эксперт' },
            { level: 6, xpRequired: 750, name: 'Мастер' },
            { level: 7, xpRequired: 1000, name: 'Легенда' },
            { level: 8, xpRequired: 1300, name: 'Гуру' }
        ];
    }

    /**
     * Initialize profile
     */
    async init() {
        console.log('👤 Initializing profile...');

        // Wait for app to be ready
        await this.waitForApp();

        this.updateAchievements();
        this.renderProfile();

        console.log('✅ Profile initialized');
    }

    /**
     * Wait for app to be initialized
     */
    waitForApp() {
        return new Promise((resolve) => {
            const checkApp = () => {
                if (window.app) {
                    resolve();
                } else {
                    setTimeout(checkApp, 100);
                }
            };
            checkApp();
        });
    }

    /**
     * Check if user has explored all continents
     */
    hasAllContinents() {
        if (!window.app || !window.countriesData) return false;

        const exploredCountries = window.app.exploredCountries;
        const continents = new Set();

        exploredCountries.forEach(countryId => {
            const country = window.countriesData.find(c => c.id === countryId);
            if (country) {
                continents.add(country.continent);
            }
        });

        return continents.size >= 4; // Europe, Asia, Africa, Americas
    }

    /**
     * Update achievements based on current progress
     */
    updateAchievements() {
        if (!window.app) return;

        this.achievements.forEach(achievement => {
            if (!achievement.unlocked && achievement.condition()) {
                achievement.unlocked = true;
            }
        });
    }

    /**
     * Get current level info
     */
    getCurrentLevel() {
        if (!window.app) return this.levels[0];

        const currentXP = window.app.xp;
        let currentLevel = this.levels[0];

        for (const level of this.levels) {
            if (currentXP >= level.xpRequired) {
                currentLevel = level;
            } else {
                break;
            }
        }

        return currentLevel;
    }

    /**
     * Get next level info
     */
    getNextLevel() {
        const currentLevel = this.getCurrentLevel();
        const currentIndex = this.levels.findIndex(l => l.level === currentLevel.level);

        if (currentIndex < this.levels.length - 1) {
            return this.levels[currentIndex + 1];
        }

        return null;
    }

    /**
     * Get XP progress to next level
     */
    getLevelProgress() {
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.getNextLevel();

        if (!nextLevel) return { current: 100, needed: 0, percentage: 100 };

        const currentXP = window.app.xp;
        const currentLevelXP = currentXP - currentLevel.xpRequired;
        const nextLevelXP = nextLevel.xpRequired - currentLevel.xpRequired;

        return {
            current: currentLevelXP,
            needed: nextLevelXP,
            percentage: Math.min(100, (currentLevelXP / nextLevelXP) * 100)
        };
    }

    /**
     * Render profile page
     */
    renderProfile() {
        const profileContainer = document.querySelector('.profile-container');
        if (!profileContainer) return;

        const app = window.app;
        const currentLevel = this.getCurrentLevel();
        const nextLevel = this.getNextLevel();
        const progress = this.getLevelProgress();

        profileContainer.innerHTML = `
            <div class="profile-header">
                <div class="user-avatar">
                    <div class="avatar-icon">👤</div>
                    <div class="level-badge">Уровень ${currentLevel.level}</div>
                </div>
                <div class="user-info">
                    <h1 class="user-name">Географ</h1>
                    <p class="user-title">${currentLevel.name}</p>
                    <div class="xp-info">
                        <span class="xp-amount">${app.xp} XP</span>
                        ${nextLevel ? `<span class="xp-next"> / ${nextLevel.xpRequired} XP</span>` : '<span class="xp-max">Максимальный уровень!</span>'}
                    </div>
                </div>
            </div>

            ${nextLevel ? `
            <div class="level-progress-section">
                <h3>Прогресс до уровня ${nextLevel.level} (${nextLevel.name})</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                </div>
                <p class="progress-text">${progress.current} / ${progress.needed} XP</p>
            </div>
            ` : ''}

            <div class="stats-section">
                <h3>Статистика</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">🗺️</div>
                        <div class="stat-info">
                            <div class="stat-number">${app.exploredCountries.length}</div>
                            <div class="stat-label">Исследованных стран</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🏆</div>
                        <div class="stat-info">
                            <div class="stat-number">${this.achievements.filter(a => a.unlocked).length}</div>
                            <div class="stat-label">Достижений</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-info">
                            <div class="stat-number">${app.xp}</div>
                            <div class="stat-label">Очков опыта</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🎯</div>
                        <div class="stat-info">
                            <div class="stat-number">${app.exploredCountries.length}</div>
                            <div class="stat-label">Пройденных тестов</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="achievements-section">
                <h3>Достижения</h3>
                <div class="achievements-grid">
                    ${this.achievements.map(achievement => `
                        <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                            <div class="achievement-icon ${achievement.unlocked ? '' : 'locked'}">
                                ${achievement.unlocked ? achievement.icon : '🔒'}
                            </div>
                            <div class="achievement-info">
                                <h4 class="achievement-name">${achievement.name}</h4>
                                <p class="achievement-desc">${achievement.description}</p>
                            </div>
                            ${achievement.unlocked ? '<div class="achievement-badge">✓</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="explored-countries-section">
                <h3>Исследованные страны</h3>
                ${app.exploredCountries.length > 0 ? `
                    <div class="countries-grid">
                        ${app.exploredCountries.map(countryId => {
                            const country = window.countriesData.find(c => c.id === countryId);
                            return country ? `
                                <div class="country-card explored" onclick="window.location.href='encyclopedia.html?country=${country.id}'">
                                    <img src="${country.flag}" alt="${country.name}" class="country-flag">
                                    <h4>${country.name}</h4>
                                    <p>${country.capital}</p>
                                </div>
                            ` : '';
                        }).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">🗺️</div>
                        <p>Ты еще не исследовал ни одной страны.</p>
                        <a href="map.html" class="action-btn primary">Начать исследование</a>
                    </div>
                `}
            </div>
        `;
    }
}

// Export for global use
window.ProfileManager = ProfileManager;
