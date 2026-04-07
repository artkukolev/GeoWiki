/**
 * GeoWiki Error Boundary
 * Глобальная защита от ошибок с fallback UI
 * 
 * Обработка:
 * 1. Необработанные исключения (try/catch)
 * 2. Promise rejection errors
 * 3. Network errors
 * 4. Timeout errors
 */

class ErrorBoundary {
    constructor() {
        this.errors = [];
        this.isInitialized = false;
    }

    /**
     * Инициализировать error boundary
     */
    init() {
        if (this.isInitialized) return;
        
        // Перехватить необработанные исключения
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'uncaught',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Перехватить Promise rejection
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise-rejection',
                message: event.reason?.message || String(event.reason),
                error: event.reason
            });
        });

        this.isInitialized = true;
        console.log('✅ Error Boundary initialized');
    }

    /**
     * Обработать ошибку
     */
    handleError(errorInfo) {
        console.error('🚨 Error caught by boundary:', errorInfo);
        
        // Сохранить в историю
        this.errors.push({
            ...errorInfo,
            timestamp: new Date().toISOString()
        });

        // Показать уведомление пользователю
        this.showErrorNotification(errorInfo);

        // Отправить на сервер (если нужно логирование)
        this.sendErrorToServer(errorInfo);
    }

    /**
     * Показать уведомление об ошибке
     */
    showErrorNotification(errorInfo) {
        // Не показывать для незначительных ошибок
        if (this.isMinorError(errorInfo)) {
            return;
        }

        // Проверить, есть ли уже уведомление
        if (document.getElementById('error-notification')) {
            return; // Не создавать дубликаты
        }

        const notification = document.createElement('div');
        notification.id = 'error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            max-width: 400px;
            font-family: 'Inter', sans-serif;
            z-index: 9998;
            animation: slideIn 0.3s ease;
            border-left: 4px solid #ff6b6b;
        `;

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 10px;">
                <div>
                    <strong style="font-size: 14px;">Ошибка</strong>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">
                        ${errorInfo.message || 'Неизвестная ошибка'}
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Автоматически удалить через 5 секунд
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /**
     * Проверить, является ли ошибка незначительной
     */
    isMinorError(errorInfo) {
        const message = errorInfo.message?.toLowerCase() || '';
        
        // Игнорировать некритичные ошибки
        const ignoredPatterns = [
            'script error',
            'neterror',
            'undefined is not a function', // Часто от расширений браузера
            'non-error promise rejection caught',
            'tracking pixel', // Analytics
        ];

        return ignoredPatterns.some(pattern => message.includes(pattern));
    }

    /**
     * Отправить ошибку на сервер
     */
    async sendErrorToServer(errorInfo) {
        // Можно интегрировать с сервисом мониторинга
        // Например: Sentry, Rollbar, LogRocket и т.д.
        
        if (window.location.hostname === 'localhost') {
            return; // Не отправлять локальные ошибки
        }

        try {
            // Пример отправки на свой сервер
            /*
            await fetch('/api/errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...errorInfo,
                    url: window.location.href,
                    userAgent: navigator.userAgent
                })
            });
            */
        } catch (e) {
            // Молча игнорировать ошибки при отправке
        }
    }

    /**
     * Получить все ошибки
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Очистить историю ошибок
     */
    clearErrors() {
        this.errors = [];
    }
}

// Создать единственный экземпляр
window.errorBoundary = new ErrorBoundary();
window.errorBoundary.init();

// Добавить стили для анимаций
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
