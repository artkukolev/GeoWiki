// QuizManager - Управление тестами

class QuizManager {
    constructor() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.questions = [];
        this.levelName = '';
        this.init();
    }

    init() {
        // Определяем уровень по URL
        const path = window.location.pathname;
        if (path.includes('beginner')) {
            this.levelName = 'beginner';
            this.questions = this.getBeginnerQuestions();
        } else if (path.includes('confident')) {
            this.levelName = 'confident';
            this.questions = this.getConfidentQuestions();
        } else if (path.includes('expert')) {
            this.levelName = 'expert';
            this.questions = this.getExpertQuestions();
        } else if (path.includes('professional')) {
            this.levelName = 'professional';
            this.questions = this.getProfessionalQuestions();
        } else if (path.includes('geographer')) {
            this.levelName = 'geographer';
            this.questions = this.getGeographerQuestions();
        }

        this.bindEvents();
        this.showQuestion(0);
        this.updateProgress();
    }

    bindEvents() {
        const nextBtn = document.getElementById('nextBtn');
        const options = document.getElementById('options');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        if (options) {
            options.addEventListener('click', (e) => {
                if (e.target.classList.contains('option-btn')) {
                    this.selectAnswer(e.target);
                }
            });
        }
    }

    selectAnswer(button) {
        const options = document.querySelectorAll('.option-btn');
        options.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');

        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.disabled = false;
        }
    }

    showQuestion(index) {
        if (index >= this.questions.length) {
            this.showResults();
            return;
        }

        const questionEl = document.getElementById('question');
        const optionsEl = document.getElementById('options');
        const currentQuestionEl = document.querySelector('.current-question');
        const totalQuestionsEl = document.querySelector('.total-questions');

        if (questionEl) {
            questionEl.innerHTML = `<p>${this.questions[index].question}</p>`;
        }

        if (optionsEl) {
            optionsEl.innerHTML = this.questions[index].options.map((option, i) =>
                `<button class="option-btn" data-answer="${String.fromCharCode(65 + i)}">${option}</button>`
            ).join('');
        }

        if (currentQuestionEl) {
            currentQuestionEl.textContent = index + 1;
        }

        if (totalQuestionsEl) {
            totalQuestionsEl.textContent = this.questions.length;
        }

        this.currentQuestionIndex = index;
        this.updateProgress();
    }

    nextQuestion() {
        const selectedBtn = document.querySelector('.option-btn.selected');
        if (!selectedBtn) return;

        const answer = selectedBtn.dataset.answer;
        const correctAnswer = this.questions[this.currentQuestionIndex].correct.toUpperCase();

        if (answer === correctAnswer) {
            this.score++;
        }

        this.showQuestion(this.currentQuestionIndex + 1);
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        // Можно добавить визуальный прогресс бар
    }

    showResults() {
        const quizCard = document.querySelector('.quiz-card');
        const resultsDiv = document.getElementById('results');
        const scoreEl = resultsDiv.querySelector('.score');
        const percentageEl = resultsDiv.querySelector('.percentage');
        const feedbackEl = resultsDiv.querySelector('.feedback');

        const percentage = Math.round((this.score / this.questions.length) * 100);

        if (scoreEl) scoreEl.textContent = `${this.score}/${this.questions.length}`;
        if (percentageEl) percentageEl.textContent = `${percentage}%`;
        if (feedbackEl) feedbackEl.textContent = this.getFeedbackMessage(percentage);

        if (quizCard) quizCard.style.display = 'none';
        if (resultsDiv) resultsDiv.style.display = 'block';

        // Сохраняем прогресс
        if (window.ProgressManager) {
            window.ProgressManager.updateLevelProgress(this.levelName, percentage);
        }

        window.showNotification(`Тест завершен! Результат: ${percentage}%`, percentage >= 70 ? 'success' : 'error');
    }

    getFeedbackMessage(percentage) {
        if (percentage >= 90) return 'Превосходный результат! Ты настоящий эксперт!';
        if (percentage >= 80) return 'Отличный результат! Продолжай в том же духе!';
        if (percentage >= 70) return 'Хороший результат! Ты прошел уровень!';
        if (percentage >= 50) return 'Неплохо! Повтори материал и попробуй снова.';
        return 'Нужно подучить! Повтори теорию и пройди тест еще раз.';
    }

    // Вопросы для разных уровней
    getBeginnerQuestions() {
        return [
            {
                question: "Что обозначает условный знак 🏔️ на карте?",
                options: ["Горы", "Реки", "Леса", "Города"],
                correct: "A"
            },
            {
                question: "Какой цвет обычно используется для обозначения воды?",
                options: ["Красный", "Синий", "Зеленый", "Желтый"],
                correct: "B"
            },
            {
                question: "Что показывает масштаб карты?",
                options: ["Время", "Расстояние", "Высоту", "Температуру"],
                correct: "B"
            }
        ];
    }

    getConfidentQuestions() {
        return [
            {
                question: "Какой условный знак используется для обозначения гор?",
                options: ["Красные точки", "Вертикальная штриховка", "Голубые круги", "Желтые треугольники"],
                correct: "B"
            },
            {
                question: "Что такое картографическая проекция?",
                options: ["Способ рисования карт", "Способ проецирования сферы на плоскость", "Тип компаса", "Масштаб карты"],
                correct: "B"
            }
        ];
    }

    getExpertQuestions() {
        return [
            {
                question: "Что такое геодезическая высота?",
                options: ["Высота над уровнем моря", "Расстояние от центра Земли", "Высота относительно эллипсоида", "Абсолютная высота точки"],
                correct: "C"
            }
        ];
    }

    getProfessionalQuestions() {
        return [
            {
                question: "Какой инструмент используется для создания топографических карт?",
                options: ["Paint", "ArcGIS", "Word", "Excel"],
                correct: "B"
            }
        ];
    }

    getGeographerQuestions() {
        return [
            {
                question: "Что является основой современной географии?",
                options: ["Только карты", "Интеграция наук", "Туризм", "Климатология"],
                correct: "B"
            }
        ];
    }
}

// Глобальная регистрация для app.js
window.QuizManager = QuizManager;

    showQuestion(index) {
        const questions = this.quizContainer.querySelectorAll('.question-card');
        questions.forEach((q, i) => {
            q.classList.toggle('active', i === index);
        });

        this.currentQuestionIndex = index;
        this.updateNavigation();
        this.updateProgress();

        // Scroll to question
        const activeQuestion = this.quizContainer.querySelector('.question-card.active');
        if (activeQuestion) {
            activeQuestion.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateNavigation() {
        if (this.prevBtn) {
            this.prevBtn.disabled = this.currentQuestionIndex === 0;
        }

        if (this.nextBtn && this.submitBtn) {
            const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
            this.nextBtn.style.display = isLastQuestion ? 'none' : 'flex';
            this.submitBtn.style.display = isLastQuestion ? 'flex' : 'none';
        }
    }

    updateProgress() {
        if (this.currentQuestionEl) {
            this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        }

        if (this.quizProgressFill) {
            const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            this.quizProgressFill.style.width = progress + '%';
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            // Save current answer
            this.saveCurrentAnswer();
            this.showQuestion(this.currentQuestionIndex + 1);
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            // Save current answer
            this.saveCurrentAnswer();
            this.showQuestion(this.currentQuestionIndex - 1);
        }
    }

    saveCurrentAnswer() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const selected = this.quizContainer.querySelector(`input[name="q${this.currentQuestionIndex + 1}"]:checked`);
        if (selected) {
            this.userAnswers[`q${this.currentQuestionIndex + 1}`] = selected.value;
        }
    }

    submitQuiz() {
        // Save final answer
        this.saveCurrentAnswer();

        // Calculate score
        this.score = 0;
        this.questions.forEach((q, index) => {
            const questionKey = `q${index + 1}`;
            if (this.userAnswers[questionKey] === q.correct) {
                this.score++;
            }
        });

        this.showResults();
    }

    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);

        // Hide quiz
        this.quizContainer.querySelector('#quiz-container').style.display = 'none';

        // Show results
        if (this.resultsDiv) {
            this.resultsDiv.style.display = 'block';

            const scoreNumber = this.resultsDiv.querySelector('#score-number');
            const resultsMessage = this.resultsDiv.querySelector('#results-message');

            if (scoreNumber) scoreNumber.textContent = this.score;
            if (resultsMessage) {
                resultsMessage.innerHTML = this.getResultsMessage(percentage);
            }
        }

        if (percentage >= 70) {
            if (this.completeBtn) {
                this.completeBtn.style.display = 'inline-block';
            }
            if (window.showNotification) {
                window.showNotification('Отлично! Ты прошел тест! 🎉', 'success');
            }
        } else {
            if (window.showNotification) {
                window.showNotification('Попробуй еще раз! 💪', 'error');
            }
        }
    }

    getResultsMessage(percentage) {
        if (percentage >= 90) {
            return '<div style="color: var(--beginner-color); font-weight: 600;">Превосходный результат! 🌟</div><p>Ты настоящий географ! Продолжай в том же духе.</p>';
        } else if (percentage >= 80) {
            return '<div style="color: var(--confident-color); font-weight: 600;">Отличный результат! 🎉</div><p>Ты хорошо усвоил материал. Иди дальше!</p>';
        } else if (percentage >= 70) {
            return '<div style="color: var(--expert-color); font-weight: 600;">Хороший результат! 👍</div><p>Ты прошел тест! Есть над чем работать, но основы усвоены.</p>';
        } else if (percentage >= 50) {
            return '<div style="color: var(--pro-color); font-weight: 600;">Неплохо! 📚</div><p>Ты на правильном пути. Повтори материал и попробуй снова.</p>';
        } else {
            return '<div style="color: var(--geo-color); font-weight: 600;">Нужно подучить! 💪</div><p>Не расстраивайся! Повтори теорию и пройди тест еще раз.</p>';
        }
    }

    retryQuiz() {
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};

        // Reset radio buttons
        const radios = this.quizContainer.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.checked = false;
        });

        // Show quiz, hide results
        this.quizContainer.querySelector('#quiz-container').style.display = 'block';
        if (this.resultsDiv) this.resultsDiv.style.display = 'none';
        if (this.completeBtn) this.completeBtn.style.display = 'none';

        this.showQuestion(0);
    }

    completeLevel() {
        if (window.progressManager) {
            window.progressManager.completeLevel(this.levelName);
        }

        // Show celebration
        if (window.showNotification) {
            window.showNotification('Уровень завершен! Продолжай обучение! 🚀', 'success');
        }

        // Redirect after delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 3000);
    }
}

// Данные для тестов по уровням
const beginnerQuestions = [
    { correct: 'a' }, // Землю и её поверхность
    { correct: 'b' }, // 🏔️
    { correct: 'b' }, // В лесах
    { correct: 'b' }, // Город
    { correct: 'b' }  // Чтобы показать, что находится на местности
];

// Инициализация тестов на страницах
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('quiz-container')) {
        const levelName = window.location.pathname.split('/').pop().replace('.html', '');
        new QuizManager('quiz-container', beginnerQuestions, levelName);
    }
});
        });

        this.score = 0;
        this.questions.forEach((q, index) => {
            const questionKey = `q${index + 1}`;
            if (answers[questionKey] === q.correct) {
                this.score++;
            }
        });

        this.showResults();
    }

    showResults() {
        const percentage = Math.round((this.score / this.questions.length) * 100);

        this.scoreP.textContent = `Правильных ответов: ${this.score} из ${this.questions.length} (${percentage}%)`;

        if (this.submitBtn) this.submitBtn.style.display = 'none';
        if (this.resultsDiv) this.resultsDiv.style.display = 'block';

        if (percentage >= 70) {
            if (this.completeBtn) {
                this.completeBtn.style.display = 'inline-block';
                showNotification('Отлично! Ты прошел тест!', 'success');
            }
        } else {
            showNotification('Попробуй еще раз!', 'error');
        }
    }

    retryQuiz() {
        this.score = 0;
        this.currentQuestion = 0;

        // Сброс радио-кнопок
        const radios = this.quizContainer.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => radio.checked = false);

        if (this.submitBtn) this.submitBtn.style.display = 'block';
        if (this.resultsDiv) this.resultsDiv.style.display = 'none';
        if (this.completeBtn) this.completeBtn.style.display = 'none';

        this.showQuestion(0);
    }

    completeLevel() {
        if (window.progressManager) {
            window.progressManager.completeLevel(this.levelName);
        }
        // Можно добавить редирект или показать поздравление
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }
}

// Данные для тестов по уровням
const beginnerQuestions = [
    { correct: 'a' }, // Землю
    { correct: 'b' }, // 🏔️
    { correct: 'b' }  // В лесах
];

// Экспорт для глобального доступа
window.QuizManager = QuizManager;

// Инициализация тестов на страницах
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('quiz-container')) {
        const levelName = window.location.pathname.split('/').pop().replace('.html', '');
        new QuizManager('quiz-container', beginnerQuestions, levelName);
    }
});