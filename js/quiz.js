class QuizManager {
    constructor() {
        this.quizContainer = document.getElementById('quiz-container');
        if (!this.quizContainer) return;

        this.questionCards = Array.from(document.querySelectorAll('.question-card'));
        this.prevBtn = document.getElementById('prev-question');
        this.nextBtn = document.getElementById('next-question');
        this.submitBtn = document.getElementById('submit-quiz');
        this.resultsDiv = document.getElementById('results');
        this.scoreNumber = document.getElementById('score-number');
        this.resultsMessage = document.getElementById('results-message');
        this.completeBtn = document.getElementById('complete-level');
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = {
            q1: 'a',
            q2: 'b',
            q3: 'b',
            q4: 'b',
            q5: 'b'
        };

        this.bindEvents();
        this.showQuestion(0);
    }

    bindEvents() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.previousQuestion());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', () => this.submitQuiz());
        }

        if (this.completeBtn) {
            this.completeBtn.addEventListener('click', () => this.completeLevel());
            this.completeBtn.style.display = 'none';
        }

        this.questionCards.forEach(card => {
            card.addEventListener('change', () => this.updateNavigation());
        });
    }

    showQuestion(index) {
        this.questionCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });

        this.currentQuestionIndex = index;
        this.updateNavigation();
        this.updateProgressText();
    }

    currentAnswerSelected() {
        return !!this.questionCards[this.currentQuestionIndex].querySelector('input[type="radio"]:checked');
    }

    updateProgressText() {
        const currentQuestionEl = document.getElementById('current-question');
        const totalQuestionsEl = document.getElementById('total-questions');
        if (currentQuestionEl) currentQuestionEl.textContent = String(this.currentQuestionIndex + 1);
        if (totalQuestionsEl) totalQuestionsEl.textContent = String(this.questionCards.length);
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex -= 1;
            this.showQuestion(this.currentQuestionIndex);
        }
    }

    nextQuestion() {
        if (!this.currentAnswerSelected()) return;
        if (this.currentQuestionIndex < this.questionCards.length - 1) {
            this.currentQuestionIndex += 1;
            this.showQuestion(this.currentQuestionIndex);
        }
    }

    updateNavigation() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentQuestionIndex === 0;
        }

        if (this.nextBtn) {
            this.nextBtn.style.display = this.currentQuestionIndex === this.questionCards.length - 1 ? 'none' : 'inline-flex';
            this.nextBtn.disabled = !this.currentAnswerSelected();
        }

        if (this.submitBtn) {
            this.submitBtn.style.display = this.currentQuestionIndex === this.questionCards.length - 1 ? 'inline-flex' : 'none';
            this.submitBtn.disabled = !this.currentAnswerSelected();
        }
    }

    submitQuiz() {
        if (!this.currentAnswerSelected()) return;

        this.score = 0;
        this.questionCards.forEach((card, index) => {
            const selected = card.querySelector('input[type="radio"]:checked');
            const questionId = `q${index + 1}`;
            if (selected && selected.value.toLowerCase() === this.correctAnswers[questionId]) {
                this.score += 1;
            }
        });

        const percentage = Math.round((this.score / this.questionCards.length) * 100);
        this.showResults(percentage);
    }

    showResults(percentage) {
        if (this.quizContainer) {
            this.quizContainer.style.display = 'none';
        }

        if (this.resultsDiv) {
            this.resultsDiv.style.display = 'block';
        }

        if (this.scoreNumber) {
            this.scoreNumber.textContent = String(this.score);
        }

        if (this.resultsMessage) {
            this.resultsMessage.innerHTML = `<p>Ты ответил правильно на ${this.score} из ${this.questionCards.length} вопросов (${percentage}%).</p>`;
        }

        if (percentage >= 70) {
            if (this.completeBtn) {
                this.completeBtn.style.display = 'inline-flex';
            }
            if (window.showNotification) {
                window.showNotification('Отлично! Ты прошел тест! 🎉', 'success');
            }
            if (window.progressManager) {
                window.progressManager.completeLevel(this.getLevelName());
            }
        } else {
            if (window.showNotification) {
                window.showNotification('Попробуй еще раз! 💪', 'error');
            }
        }
    }

    getLevelName() {
        return window.location.pathname.split('/').pop().replace('.html', '') || 'beginner';
    }

    completeLevel() {
        if (window.progressManager) {
            window.progressManager.completeLevel(this.getLevelName());
        }
        window.location.href = '../index.html';
    }
}

window.QuizManager = QuizManager;