class ModalManager {
    constructor() {
        this.modal = document.getElementById('modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalDescription = document.getElementById('modal-description');
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.closeModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showModal(title, description) {
        if (!this.modal || !this.modalTitle || !this.modalDescription) return;
        this.modalTitle.textContent = title;
        this.modalDescription.textContent = description;
        this.modal.style.display = 'block';
        setTimeout(() => this.modal.classList.add('show'), 10);
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('show');
        setTimeout(() => {
            if (this.modal) {
                this.modal.style.display = 'none';
            }
        }, 300);
    }
}

window.ModalManager = ModalManager;
window.showModal = (title, description) => {
    if (!window.modalManager) {
        window.modalManager = new ModalManager();
    }
    window.modalManager.showModal(title, description);
};
window.closeModal = () => {
    if (window.modalManager) {
        window.modalManager.closeModal();
    }
};