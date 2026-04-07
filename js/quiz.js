/**
 * Quiz Manager
 * Dynamic quiz generation from countries data
 */

class QuizManager {
    constructor() {
        this.quizContainer = document.getElementById('quiz-container');
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.selectedCountry = null;
    }

    /**
     * Initialize quiz
     */
    async init() {
        // Wait for countries data to load
        if (!window.countriesData) {
            await this.waitForCountriesData();
        }

        // Get country from URL params
        const urlParams = new URLSearchParams(window.location.search);
        const countryId = urlParams.get('country');

        if (countryId) {
            this.selectedCountry = window.countriesData.find(c => c.id === countryId);
        }

        if (this.selectedCountry) {
            this.generateQuestions();
            this.renderQuiz();
            this.bindEvents();
        } else {
            this.showError('Страна не найдена');
        }
    }

    /**
     * Wait for countries data to load
     */
    waitForCountriesData() {
        return new Promise((resolve) => {
            const checkData = () => {
                if (window.countriesData) {
                    resolve();
                } else {
                    setTimeout(checkData, 100);
                }
            };
            checkData();
        });
    }

    /**
     * Generate questions for the selected country
     */
    generateQuestions() {
        const country = this.selectedCountry;

        this.questions = [
            {
                question: `Какой столицей является ${country.capital}?`,
                options: this.generateCapitalOptions(country),
                correct: country.capital,
                type: 'capital'
            },
            {
                question: `На каком континенте находится ${country.name}?`,
                options: this.generateContinentOptions(country),
                correct: this.getContinentName(country.continent),
                type: 'continent'
            },
            {
                question: `Какова примерная площадь ${country.name}?`,
                options: this.generateAreaOptions(country),
                correct: this.formatArea(country.area),
                type: 'area'
            },
            {
                question: `Какова примерная численность населения ${country.name}?`,
                options: this.generatePopulationOptions(country),
                correct: this.formatPopulation(country.population),
                type: 'population'
            },
            {
                question: `Какой климат преобладает в ${country.name}?`,
                options: this.generateClimateOptions(country),
                correct: country.climate,
                type: 'climate'
            }
        ];
    }

    /**
     * Generate options for capital question
     */
    generateCapitalOptions(correctCountry) {
        const options = [correctCountry.capital];
        const otherCountries = window.countriesData.filter(c => c.id !== correctCountry.id);

        // Add 3 random wrong capitals
        while (options.length < 4) {
            const randomCountry = otherCountries[Math.floor(Math.random() * otherCountries.length)];
            if (!options.includes(randomCountry.capital)) {
                options.push(randomCountry.capital);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * Generate options for continent question
     */
    generateContinentOptions(correctCountry) {
        const continents = ['Европа', 'Азия', 'Африка', 'Северная Америка', 'Южная Америка', 'Австралия'];
        const correctContinent = this.getContinentName(correctCountry.continent);

        const options = [correctContinent];
        const otherContinents = continents.filter(c => c !== correctContinent);

        // Add 3 random wrong continents
        while (options.length < 4) {
            const randomContinent = otherContinents[Math.floor(Math.random() * otherContinents.length)];
            if (!options.includes(randomContinent)) {
                options.push(randomContinent);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * Generate options for area question
     */
    generateAreaOptions(correctCountry) {
        const correctArea = this.formatArea(correctCountry.area);
        const options = [correctArea];

        // Generate similar areas
        for (let i = 0; i < 3; i++) {
            let variation;
            if (correctCountry.area < 10000) {
                variation = correctCountry.area + (Math.random() - 0.5) * 5000;
            } else if (correctCountry.area < 100000) {
                variation = correctCountry.area + (Math.random() - 0.5) * 50000;
            } else {
                variation = correctCountry.area + (Math.random() - 0.5) * 200000;
            }
            variation = Math.max(100, Math.round(variation / 1000) * 1000);
            const formatted = this.formatArea(variation);
            if (!options.includes(formatted)) {
                options.push(formatted);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * Generate options for population question
     */
    generatePopulationOptions(correctCountry) {
        const correctPop = this.formatPopulation(correctCountry.population);
        const options = [correctPop];

        // Generate similar populations
        for (let i = 0; i < 3; i++) {
            let variation;
            if (correctCountry.population < 1000000) {
                variation = correctCountry.population + (Math.random() - 0.5) * 500000;
            } else if (correctCountry.population < 10000000) {
                variation = correctCountry.population + (Math.random() - 0.5) * 2000000;
            } else {
                variation = correctCountry.population + (Math.random() - 0.5) * 10000000;
            }
            variation = Math.max(1000, Math.round(variation / 100000) * 100000);
            const formatted = this.formatPopulation(variation);
            if (!options.includes(formatted)) {
                options.push(formatted);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * Generate options for climate question
     */
    generateClimateOptions(correctCountry) {
        const climates = ['Умеренный', 'Субтропический', 'Тропический', 'Пустынный', 'Континентальный', 'Средиземноморский'];
        const correctClimate = correctCountry.climate;

        const options = [correctClimate];
        const otherClimates = climates.filter(c => c !== correctClimate);

        // Add 3 random wrong climates
        while (options.length < 4) {
            const randomClimate = otherClimates[Math.floor(Math.random() * otherClimates.length)];
            if (!options.includes(randomClimate)) {
                options.push(randomClimate);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * Get continent name in Russian
     */
    getContinentName(continentCode) {
        const continents = {
            'europe': 'Европа',
            'asia': 'Азия',
            'africa': 'Африка',
            'north-america': 'Северная Америка',
            'south-america': 'Южная Америка',
            'oceania': 'Австралия'
        };
        return continents[continentCode] || continentCode;
    }

    /**
     * Format area for display
     */
    formatArea(area) {
        if (area >= 1000000) {
            return `${(area / 1000000).toFixed(1)} млн км²`;
        } else if (area >= 1000) {
            return `${(area / 1000).toFixed(0)} тыс. км²`;
        } else {
            return `${area} км²`;
        }
    }

    /**
     * Format population for display
     */
    formatPopulation(population) {
        if (population >= 1000000) {
            return `${(population / 1000000).toFixed(1)} млн чел.`;
        } else if (population >= 1000) {
            return `${(population / 1000).toFixed(0)} тыс. чел.`;
        } else {
            return `${population} чел.`;
        }
    }

    /**
     * Shuffle array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Render quiz HTML
     */
    renderQuiz() {
        if (!this.quizContainer) return;

        const country = this.selectedCountry;

        this.quizContainer.innerHTML = `
            <div class="quiz-header">
                <div class="country-info">
                    <img src="${country.flag}" alt="${country.name}" class="country-flag">
                    <h2>Тест по ${country.name}</h2>
                </div>
                <div class="quiz-progress">
                    <span id="current-question">1</span> / <span id="total-questions">${this.questions.length}</span>
                </div>
            </div>

            <div class="questions-container">
                ${this.questions.map((q, index) => `
                    <div class="question-card ${index === 0 ? 'active' : ''}" data-question="${index}">
                        <h3 class="question-title">${q.question}</h3>
                        <div class="options">
                            ${q.options.map((option, optionIndex) => `
                                <label class="option">
                                    <input type="radio" name="q${index}" value="${option}" data-correct="${option === q.correct}">
                                    <span class="option-text">${option}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="quiz-navigation">
                <button id="prev-question" class="nav-btn" disabled>
                    <span class="btn-icon">←</span>
                    Назад
                </button>
                <button id="next-question" class="nav-btn primary">
                    Далее
                    <span class="btn-icon">→</span>
                </button>
                <button id="submit-quiz" class="nav-btn success" style="display: none;">
                    Завершить тест
                    <span class="btn-icon">✓</span>
                </button>
            </div>
        `;

        // Add results container
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'quiz-results';
        resultsDiv.className = 'quiz-results';
        resultsDiv.style.display = 'none';
        resultsDiv.innerHTML = `
            <div class="results-content">
                <div class="results-header">
                    <h2>Результаты теста</h2>
                    <div class="score-display">
                        <div class="score-number" id="score-number">0</div>
                        <div class="score-label">правильных ответов</div>
                    </div>
                </div>
                <div class="results-message" id="results-message"></div>
                <div class="results-actions">
                    <button id="retry-quiz" class="action-btn secondary">
                        <span class="btn-icon">↻</span>
                        Пройти еще раз
                    </button>
                    <button id="back-to-country" class="action-btn primary">
                        <span class="btn-icon">←</span>
                        Вернуться к стране
                    </button>
                    <button id="complete-quiz" class="action-btn success" style="display: none;">
                        <span class="btn-icon">✓</span>
                        Завершить уровень
                    </button>
                </div>
            </div>
        `;
        this.quizContainer.appendChild(resultsDiv);
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-quiz');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousQuestion());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitQuiz());
        }

        // Results buttons
        const retryBtn = document.getElementById('retry-quiz');
        const backBtn = document.getElementById('back-to-country');
        const completeBtn = document.getElementById('complete-quiz');

        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.retryQuiz());
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => this.backToCountry());
        }

        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.completeQuiz());
        }

        // Option change listeners
        document.querySelectorAll('input[type="radio"]').forEach(input => {
            input.addEventListener('change', () => this.updateNavigation());
        });
    }

    /**
     * Show specific question
     */
    showQuestion(index) {
        const cards = document.querySelectorAll('.question-card');
        cards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });

        this.currentQuestionIndex = index;
        this.updateNavigation();
        this.updateProgress();
    }

    /**
     * Update progress display
     */
    updateProgress() {
        const currentEl = document.getElementById('current-question');
        const totalEl = document.getElementById('total-questions');

        if (currentEl) currentEl.textContent = this.currentQuestionIndex + 1;
        if (totalEl) totalEl.textContent = this.questions.length;
    }

    /**
     * Check if current question has selected answer
     */
    hasSelectedAnswer() {
        const currentCard = document.querySelector('.question-card.active');
        if (!currentCard) return false;

        return !!currentCard.querySelector('input[type="radio"]:checked');
    }

    /**
     * Update navigation buttons
     */
    updateNavigation() {
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        const submitBtn = document.getElementById('submit-quiz');

        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentQuestionIndex === this.questions.length - 1 ? 'none' : 'inline-flex';
            nextBtn.disabled = !this.hasSelectedAnswer();
        }

        if (submitBtn) {
            submitBtn.style.display = this.currentQuestionIndex === this.questions.length - 1 ? 'inline-flex' : 'none';
            submitBtn.disabled = !this.hasSelectedAnswer();
        }
    }

    /**
     * Go to previous question
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion(this.currentQuestionIndex);
        }
    }

    /**
     * Go to next question
     */
    nextQuestion() {
        if (!this.hasSelectedAnswer()) return;

        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion(this.currentQuestionIndex);
        }
    }

    /**
     * Submit quiz
     */
    submitQuiz() {
        if (!this.hasSelectedAnswer()) return;

        this.score = 0;

        this.questions.forEach((question, index) => {
            const card = document.querySelector(`.question-card[data-question="${index}"]`);
            const selected = card.querySelector('input[type="radio"]:checked');

            if (selected && selected.value === question.correct) {
                this.score++;
            }
        });

        this.showResults();
    }

    /**
     * Show quiz results
     */
    showResults() {
        const quizContainer = document.getElementById('quiz-container');
        const resultsDiv = document.getElementById('quiz-results');
        const scoreNumber = document.getElementById('score-number');
        const resultsMessage = document.getElementById('results-message');
        const completeBtn = document.getElementById('complete-quiz');

        if (quizContainer) quizContainer.style.display = 'none';
        if (resultsDiv) resultsDiv.style.display = 'block';
        if (scoreNumber) scoreNumber.textContent = this.score;

        const percentage = Math.round((this.score / this.questions.length) * 100);
        const country = this.selectedCountry;

        let message = `<p>Ты ответил правильно на ${this.score} из ${this.questions.length} вопросов (${percentage}%).</p>`;

        if (percentage >= 80) {
            message += '<p class="success-message">Отлично! Ты отлично знаешь географию! 🌟</p>';
            if (completeBtn) completeBtn.style.display = 'inline-flex';

            // Update progress
            this.updateProgressData(true);

            if (window.showNotification) {
                window.showNotification(`Поздравляем! Ты прошел тест по ${country.name}! 🎉`, 'success');
            }
        } else if (percentage >= 60) {
            message += '<p class="warning-message">Хорошо! Но есть над чем работать. 💪</p>';

            if (window.showNotification) {
                window.showNotification('Хороший результат! Попробуй улучшить его! 📚', 'warning');
            }
        } else {
            message += '<p class="error-message">Нужно больше учить географию! 📖</p>';

            if (window.showNotification) {
                window.showNotification('Попробуй еще раз! Ты сможешь лучше! 💪', 'error');
            }
        }

        if (resultsMessage) resultsMessage.innerHTML = message;
    }

    /**
     * Update progress data
     */
    updateProgressData(passed) {
        if (!window.app) return;

        const country = this.selectedCountry;

        // Mark country as explored
        if (!window.app.exploredCountries.includes(country.id)) {
            window.app.exploredCountries.push(country.id);
        }

        // Add XP
        const xpGained = passed ? 50 : 10;
        window.app.xp += xpGained;

        // Check for achievements
        this.checkAchievements();

        // Save progress
        window.app.saveProgress();
    }

    /**
     * Check for achievements
     */
    checkAchievements() {
        if (!window.app) return;

        const achievements = [];

        // First quiz achievement
        if (window.app.exploredCountries.length === 1) {
            achievements.push('first-quiz');
        }

        // Geography enthusiast (5 countries)
        if (window.app.exploredCountries.length >= 5 && !window.app.achievements.includes('geography-enthusiast')) {
            achievements.push('geography-enthusiast');
        }

        // World explorer (10 countries)
        if (window.app.exploredCountries.length >= 10 && !window.app.achievements.includes('world-explorer')) {
            achievements.push('world-explorer');
        }

        // XP achievements
        if (window.app.xp >= 100 && !window.app.achievements.includes('xp-100')) {
            achievements.push('xp-100');
        }

        if (window.app.xp >= 500 && !window.app.achievements.includes('xp-500')) {
            achievements.push('xp-500');
        }

        if (window.app.xp >= 1000 && !window.app.achievements.includes('xp-1000')) {
            achievements.push('xp-1000');
        }

        achievements.forEach(achievement => {
            if (!window.app.achievements.includes(achievement)) {
                window.app.achievements.push(achievement);

                if (window.showNotification) {
                    const achievementNames = {
                        'first-quiz': 'Первый тест!',
                        'geography-enthusiast': 'Любитель географии!',
                        'world-explorer': 'Исследователь мира!',
                        'xp-100': '100 XP!',
                        'xp-500': '500 XP!',
                        'xp-1000': '1000 XP!'
                    };

                    window.showNotification(`🏆 ${achievementNames[achievement]}`, 'success');
                }
            }
        });
    }

    /**
     * Retry quiz
     */
    retryQuiz() {
        // Regenerate questions
        this.generateQuestions();

        // Reset state
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Re-render
        this.renderQuiz();
        this.bindEvents();
    }

    /**
     * Back to country page
     */
    backToCountry() {
        const country = this.selectedCountry;
        window.location.href = `encyclopedia.html?country=${country.id}`;
    }

    /**
     * Complete quiz (for level progression)
     */
    completeQuiz() {
        // This would integrate with level system
        if (window.showNotification) {
            window.showNotification('Уровень завершен! 🎉', 'success');
        }

        this.backToCountry();
    }

    /**
     * Show error message
     */
    showError(message) {
        if (this.quizContainer) {
            this.quizContainer.innerHTML = `
                <div class="error-message">
                    <h2>Ошибка</h2>
                    <p>${message}</p>
                    <button onclick="window.location.href='encyclopedia.html'" class="action-btn primary">
                        Вернуться к энциклопедии
                    </button>
                </div>
            `;
        }
    }
}

// Initialize quiz when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('quiz-container')) {
        window.quizManager = new QuizManager();
    }
});
