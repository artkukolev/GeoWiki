// progress.js - Управление прогрессом пользователя

class ProgressManager {
    constructor() {
        this.levels = ['beginner', 'confident', 'expert', 'pro', 'geo'];
        this.currentLevel = 0;
        this.completedLevels = [];
        this.loadProgress();
        this.updateUI();
    }

    loadProgress() {
        const saved = localStorage.getItem('geowiki_progress');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentLevel = data.currentLevel || 0;
            this.completedLevels = data.completedLevels || [];
        }
    }

    saveProgress() {
        const data = {
            currentLevel: this.currentLevel,
            completedLevels: this.completedLevels
        };
        localStorage.setItem('geowiki_progress', JSON.stringify(data));
    }

    completeLevel(levelName) {
        if (!this.completedLevels.includes(levelName)) {
            this.completedLevels.push(levelName);
            this.currentLevel = Math.max(this.currentLevel, this.levels.indexOf(levelName) + 1);
            this.saveProgress();
            this.updateUI();
            if (window.showNotification) {
                window.showNotification(`Уровень "${this.getLevelDisplayName(levelName)}" пройден! 🎉`, 'success');
            }
        }
    }

    getLevelDisplayName(levelName) {
        const names = {
            'beginner': 'Начальный',
            'confident': 'Уверенный',
            'expert': 'Знаток',
            'pro': 'Профессионал',
            'geo': 'Географ'
        };
        return names[levelName] || levelName;
    }

    updateUI() {
        const progressPercent = (this.completedLevels.length / this.levels.length) * 100;
        const progressCircle = document.getElementById('progressCircle');
        const progressPercentEl = document.getElementById('progressPercent');
        const progressText = document.getElementById('progressText');

        if (progressCircle && progressPercentEl) {
            const circumference = 283; // 2 * π * 45 (radius)
            const offset = circumference - (progressPercent / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
            progressPercentEl.textContent = `${Math.round(progressPercent)}%`;
        }

        if (progressText) {
            const currentLevelName = this.currentLevel < this.levels.length ?
                this.getLevelDisplayName(this.levels[this.currentLevel]) : 'Географ';
            progressText.textContent = `Уровень: ${currentLevelName} (${this.completedLevels.length}/${this.levels.length} пройдено)`;
        }

        // Update level cards progress bars
        this.levels.forEach((level, index) => {
            const progressFill = document.getElementById(`progress-${level}`);
            if (progressFill) {
                if (this.completedLevels.includes(level)) {
                    progressFill.style.width = '100%';
                } else if (index === this.currentLevel) {
                    progressFill.style.width = '50%'; // Partial progress for current level
                } else if (index < this.currentLevel) {
                    progressFill.style.width = '100%';
                } else {
                    progressFill.style.width = '0%';
                }
            }
        });

        // Update achievements
        this.updateAchievements();
    }

    updateAchievements() {
        const achievements = [
            { id: 'achievement-1', threshold: 1 },
            { id: 'achievement-2', threshold: 3 },
            { id: 'achievement-3', threshold: 5 }
        ];

        achievements.forEach(achievement => {
            const el = document.getElementById(achievement.id);
            if (el) {
                if (this.completedLevels.length >= achievement.threshold) {
                    el.classList.add('unlocked');
                } else {
                    el.classList.remove('unlocked');
                }
            }
        });
    }

    resetProgress() {
        if (confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.')) {
            this.currentLevel = 0;
            this.completedLevels = [];
            this.saveProgress();
            this.updateUI();
            if (window.showNotification) {
                window.showNotification('Прогресс сброшен', 'success');
            }
        }
    }

    // Method to simulate level completion (for testing)
    simulateComplete(levelName) {
        this.completeLevel(levelName);
    }
}

// Глобальный экземпляр менеджера прогресса
const progressManager = new ProgressManager();

// Экспортируем для использования в других файлах
window.ProgressManager = ProgressManager;
window.progressManager = progressManager;