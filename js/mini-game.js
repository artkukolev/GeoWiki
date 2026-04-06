class MiniGameManager {
    constructor() {
        this.gameQuestion = document.getElementById('gameQuestion');
        this.gameOptions = document.getElementById('gameOptions');
        this.nextButton = document.getElementById('nextQuestion');
        this.gameScore = document.getElementById('gameScore');
        this.currentQuestion = null;
        this.score = 0;
        this.questionCount = 0;
        this.maxQuestions = 5;
        this.symbols = [
            { symbol: '🏔️', name: 'Гора' },
            { symbol: '🌊', name: 'Река' },
            { symbol: '🏙️', name: 'Город' },
            { symbol: '🌲', name: 'Лес' },
            { symbol: '🛤️', name: 'Железная дорога' },
            { symbol: '🏖️', name: 'Пляж' },
            { symbol: '⛰️', name: 'Скалы' },
            { symbol: '🌉', name: 'Мост' },
            { symbol: '🏞️', name: 'Парк' },
            { symbol: '🚂', name: 'Железная дорога' }
        ];

        if (this.gameQuestion && this.gameOptions && this.nextButton && this.gameScore) {
            this.bindEvents();
            this.generateQuestion();
        }
    }

    bindEvents() {
        this.nextButton.addEventListener('click', () => {
            if (this.questionCount < this.maxQuestions) {
                this.generateQuestion();
            }
        });
    }

    getWrongAnswers(correctAnswer) {
        return this.symbols
            .filter(symbol => symbol.name !== correctAnswer)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(symbol => symbol.name);
    }

    generateQuestion() {
        this.currentQuestion = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        const wrongAnswers = this.getWrongAnswers(this.currentQuestion.name);
        const answers = [this.currentQuestion.name, ...wrongAnswers].sort(() => Math.random() - 0.5);

        this.questionCount += 1;
        this.gameQuestion.textContent = this.currentQuestion.symbol;
        this.gameOptions.innerHTML = '';

        answers.forEach(answer => {
            const option = document.createElement('div');
            option.className = 'game-option';
            option.textContent = answer;
            option.addEventListener('click', () => this.checkAnswer(answer, option));
            this.gameOptions.appendChild(option);
        });

        this.nextButton.style.display = 'none';
    }

    checkAnswer(selectedAnswer, optionElement) {
        const options = this.gameOptions.querySelectorAll('.game-option');
        options.forEach(option => {
            option.style.pointerEvents = 'none';
            if (option.textContent === this.currentQuestion.name) {
                option.classList.add('correct');
            }
            if (option.textContent === selectedAnswer && selectedAnswer !== this.currentQuestion.name) {
                option.classList.add('wrong');
            }
        });

        if (selectedAnswer === this.currentQuestion.name) {
            this.score += 1;
            this.gameScore.textContent = this.score;
            this.showNotification('Правильно! 🎉', 'success');
        } else {
            this.showNotification(`Неправильно. Правильный ответ: ${this.currentQuestion.name}`, 'error');
        }

        if (this.questionCount >= this.maxQuestions) {
            this.showFinalScore();
        } else {
            this.nextButton.style.display = 'inline-flex';
        }
    }

    showFinalScore() {
        const percentage = Math.round((this.score / this.maxQuestions) * 100);
        this.gameQuestion.textContent = 'Игра окончена!';
        this.gameOptions.innerHTML = `
            <div class="game-end-card">
                <h3>Результат: ${this.score}/${this.maxQuestions}</h3>
                <p>${this.getScoreMessage(percentage)}</p>
                <button class="game-btn" onclick="window.location.reload()">Играть снова</button>
            </div>
        `;
        this.nextButton.style.display = 'none';
        this.showNotification(`Игра окончена! Ты набрал ${percentage}%`, percentage >= 70 ? 'success' : 'error');
    }

    getScoreMessage(percentage) {
        if (percentage >= 90) return 'Отлично! Ты настоящий мастер карт! 🏆';
        if (percentage >= 70) return 'Хороший результат! Продолжай в том же духе.';
        if (percentage >= 50) return 'Неплохо! Есть куда расти.';
        return 'Попробуй еще раз — ты сможешь!';
    }

    showNotification(message, type = 'success') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type}: ${message}`);
        }
    }
}

window.MiniGameManager = MiniGameManager;
