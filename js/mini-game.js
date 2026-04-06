// mini-game.js - Мини-игра "Угадай знак"

document.addEventListener('DOMContentLoaded', function() {
    const gameQuestion = document.getElementById('gameQuestion');
    const gameOptions = document.getElementById('gameOptions');
    const nextButton = document.getElementById('nextQuestion');
    const gameScore = document.getElementById('gameScore');

    // Sample symbols data (expand this with real symbols)
    const symbols = [
        { symbol: '🏔️', name: 'Гора', category: 'Рельеф' },
        { symbol: '🌊', name: 'Река', category: 'Водные объекты' },
        { symbol: '🏙️', name: 'Город', category: 'Населенные пункты' },
        { symbol: '🌲', name: 'Лес', category: 'Растительность' },
        { symbol: '🛤️', name: 'Железная дорога', category: 'Транспорт' },
        { symbol: '🏖️', name: 'Пляж', category: 'Природные объекты' },
        { symbol: '⛰️', name: 'Скалы', category: 'Рельеф' },
        { symbol: '🌉', name: 'Мост', category: 'Транспорт' },
        { symbol: '🏞️', name: 'Парк', category: 'Природные объекты' },
        { symbol: '🚗', name: 'Дорога', category: 'Транспорт' }
    ];

    let currentQuestion = {};
    let score = 0;
    let questionCount = 0;
    const maxQuestions = 5;

    // Generate wrong answers
    function getWrongAnswers(correctAnswer, count = 3) {
        const wrongAnswers = symbols
            .filter(s => s.name !== correctAnswer)
            .map(s => s.name)
            .sort(() => Math.random() - 0.5)
            .slice(0, count);
        return wrongAnswers;
    }

    // Generate question
    function generateQuestion() {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
        const wrongAnswers = getWrongAnswers(randomSymbol.name);
        const allAnswers = [randomSymbol.name, ...wrongAnswers].sort(() => Math.random() - 0.5);

        currentQuestion = {
            symbol: randomSymbol.symbol,
            correct: randomSymbol.name,
            answers: allAnswers
        };

        displayQuestion();
    }

    // Display question
    function displayQuestion() {
        gameQuestion.textContent = currentQuestion.symbol;
        gameOptions.innerHTML = '';

        currentQuestion.answers.forEach(answer => {
            const option = document.createElement('div');
            option.className = 'game-option';
            option.textContent = answer;
            option.addEventListener('click', () => checkAnswer(answer));
            gameOptions.appendChild(option);
        });

        nextButton.style.display = 'none';
    }

    // Check answer
    function checkAnswer(selectedAnswer) {
        const options = document.querySelectorAll('.game-option');
        options.forEach(option => {
            option.style.pointerEvents = 'none';
            if (option.textContent === currentQuestion.correct) {
                option.style.background = 'var(--beginner-color)';
                option.style.color = 'white';
            } else if (option.textContent === selectedAnswer && selectedAnswer !== currentQuestion.correct) {
                option.style.background = 'var(--pro-color)';
                option.style.color = 'white';
            }
        });

        if (selectedAnswer === currentQuestion.correct) {
            score++;
            gameScore.textContent = score;
            showNotification('Правильно! 🎉', 'success');
        } else {
            showNotification('Неправильно. Правильный ответ: ' + currentQuestion.correct, 'error');
        }

        nextButton.style.display = 'block';
        questionCount++;

        if (questionCount >= maxQuestions) {
            setTimeout(() => {
                showFinalScore();
            }, 1000);
        }
    }

    // Show final score
    function showFinalScore() {
        const percentage = Math.round((score / maxQuestions) * 100);
        gameQuestion.textContent = `Игра окончена!`;
        gameOptions.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center;">
                <h3>Твой результат: ${score}/${maxQuestions} (${percentage}%)</h3>
                <p>${getScoreMessage(percentage)}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--accent-gradient); color: white; border: none; border-radius: 8px; cursor: pointer;">Играть снова</button>
            </div>
        `;
        nextButton.style.display = 'none';

        // Update progress if score is good
        if (percentage >= 80) {
            unlockAchievement('achievement-2');
        }
    }

    // Get score message
    function getScoreMessage(percentage) {
        if (percentage >= 90) return 'Отличный результат! Ты настоящий географ! 🏆';
        if (percentage >= 70) return 'Хороший результат! Продолжай изучать! 📚';
        if (percentage >= 50) return 'Неплохо! Но есть куда расти 🌱';
        return 'Попробуй еще раз! У тебя получится! 💪';
    }

    // Next question
    nextButton.addEventListener('click', () => {
        if (questionCount < maxQuestions) {
            generateQuestion();
        }
    });

    // Start game
    generateQuestion();

    // Notification function (assuming it's defined in main.js)
    function showNotification(message, type) {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    // Achievement unlock function (assuming it's defined in main.js)
    function unlockAchievement(id) {
        if (window.unlockAchievement) {
            window.unlockAchievement(id);
        }
    }
});