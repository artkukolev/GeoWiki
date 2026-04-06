// modal.js - Управление модальными окнами

function showModal(title, description) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');

    if (modal && modalTitle && modalDescription) {
        modalTitle.textContent = title;
        modalDescription.textContent = description;
        modal.style.display = 'block';

        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// Закрытие по клику вне модального окна
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Закрытие по клавише Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});