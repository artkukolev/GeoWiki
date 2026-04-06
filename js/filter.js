// filter.js - Фильтрация условных знаков

class FilterManager {
    constructor() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.symbolCards = document.querySelectorAll('.symbol-card');
        this.init();
    }

    init() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilter(e));
        });
    }

    handleFilter(e) {
        const filter = e.target.getAttribute('data-filter');

        // Убираем активный класс у всех кнопок
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        // Добавляем активный класс текущей кнопке
        e.target.classList.add('active');

        // Фильтруем карточки
        this.symbolCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeInUp 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Экспорт для глобального доступа
window.FilterManager = FilterManager;