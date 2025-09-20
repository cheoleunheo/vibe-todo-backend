// API 기본 설정
// 브라우저에서는 process.env를 사용할 수 없으므로 호스트명으로 판단
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction 
    ? '/api'  // 프로덕션: 상대 경로 (Caddy 프록시 사용)
    : 'http://localhost:5000/api';  // 개발: 절대 경로

// 토큰 관리
class TokenManager {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }
}

// API 요청 헬퍼
class ApiClient {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const token = TokenManager.getToken();

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API 요청 실패');
            }

            return data;
        } catch (error) {
            console.error('API 요청 오류:', error);
            // 네트워크 에러인 경우 더 구체적인 메시지 제공
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
            }
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async patch(endpoint, data) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// 인증 API
class AuthAPI {
    static async register(userData) {
        return ApiClient.post('/auth/register', userData);
    }

    static async login(credentials) {
        return ApiClient.post('/auth/login', credentials);
    }

    static async getCurrentUser() {
        return ApiClient.get('/auth/me');
    }
}

// 할일 API
class TodoAPI {
    static async getAllTodos(filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        });

        const endpoint = queryParams.toString() 
            ? `/todos?${queryParams.toString()}`
            : '/todos';
            
        return ApiClient.get(endpoint);
    }

    static async getTodoById(id) {
        return ApiClient.get(`/todos/${id}`);
    }

    static async createTodo(todoData) {
        return ApiClient.post('/todos', todoData);
    }

    static async updateTodo(id, todoData) {
        return ApiClient.put(`/todos/${id}`, todoData);
    }

    static async toggleTodo(id) {
        return ApiClient.patch(`/todos/${id}/toggle`);
    }

    static async deleteTodo(id) {
        return ApiClient.delete(`/todos/${id}`);
    }

    static async getStats() {
        return ApiClient.get('/todos/stats/summary');
    }

    static async getDueSoon() {
        return ApiClient.get('/todos/due-soon');
    }
}

// 에러 처리 유틸리티
class ErrorHandler {
    static handle(error) {
        console.error('에러 발생:', error);
        
        if (error.message.includes('토큰') || error.message.includes('인증')) {
            // 인증 오류 시 로그아웃 처리
            TokenManager.removeToken();
            window.location.reload();
            return;
        }

        // 일반적인 에러 메시지 표시
        NotificationManager.show(error.message, 'error');
    }
}

// 알림 관리
class NotificationManager {
    static show(message, type = 'success') {
        const notification = document.getElementById('notification');
        const messageElement = document.getElementById('notification-message');
        
        if (!notification || !messageElement) return;

        messageElement.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';

        // 3초 후 자동 숨김
        setTimeout(() => {
            this.hide();
        }, 3000);
    }

    static hide() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.style.display = 'none';
        }
    }

    static success(message) {
        this.show(message, 'success');
    }

    static error(message) {
        this.show(message, 'error');
    }

    static warning(message) {
        this.show(message, 'warning');
    }
}

// 로딩 관리
class LoadingManager {
    static show() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    static hide() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }
}

// 폼 유틸리티
class FormUtils {
    static getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        return data;
    }

    static clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    }

    static validateForm(formId, rules) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let isValid = true;
        const errors = [];

        Object.entries(rules).forEach(([fieldName, rule]) => {
            const field = form.querySelector(`[name="${fieldName}"]`) || 
                         form.querySelector(`#${fieldName}`);
            
            if (!field) return;

            const value = field.value.trim();

            // 필수 필드 검증
            if (rule.required && !value) {
                errors.push(`${rule.label || fieldName}은(는) 필수입니다.`);
                isValid = false;
                return;
            }

            // 최소 길이 검증
            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.label || fieldName}은(는) 최소 ${rule.minLength}자 이상이어야 합니다.`);
                isValid = false;
            }

            // 최대 길이 검증
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.label || fieldName}은(는) 최대 ${rule.maxLength}자까지 가능합니다.`);
                isValid = false;
            }

            // 이메일 형식 검증
            if (rule.email && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors.push('올바른 이메일 형식이 아닙니다.');
                    isValid = false;
                }
            }

            // 비밀번호 확인 검증
            if (rule.confirmPassword && value) {
                const confirmField = form.querySelector(`#${rule.confirmPassword}`);
                if (confirmField && value !== confirmField.value) {
                    errors.push('비밀번호가 일치하지 않습니다.');
                    isValid = false;
                }
            }
        });

        if (!isValid) {
            NotificationManager.error(errors.join(' '));
        }

        return isValid;
    }
}

// 날짜 유틸리티
class DateUtils {
    static formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const isToday = dateOnly.getTime() === today.getTime();
        const isTomorrow = dateOnly.getTime() === tomorrow.getTime();
        const isOverdue = date < now && !isToday;
        
        const timeStr = date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        
        if (isToday) return `오늘 ${timeStr}`;
        if (isTomorrow) return `내일 ${timeStr}`;
        if (isOverdue) return `지연됨 (${timeStr})`;
        
        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        }) + ` ${timeStr}`;
    }

    static getDaysUntilDue(dateString) {
        if (!dateString) return null;
        
        const dueDate = new Date(dateString);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }

    static isOverdue(dateString) {
        if (!dateString) return false;
        
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return dueDate < today;
    }
}

// 우선순위 유틸리티
class PriorityUtils {
    static getLabel(priority) {
        const labels = {
            low: '낮음',
            medium: '보통',
            high: '높음'
        };
        return labels[priority] || priority;
    }

    static getClass(priority) {
        return `todo-priority ${priority}`;
    }
}

// 전역 객체로 내보내기
window.ApiClient = ApiClient;
window.AuthAPI = AuthAPI;
window.TodoAPI = TodoAPI;
window.TokenManager = TokenManager;
window.ErrorHandler = ErrorHandler;
window.NotificationManager = NotificationManager;
window.LoadingManager = LoadingManager;
window.FormUtils = FormUtils;
window.DateUtils = DateUtils;
window.PriorityUtils = PriorityUtils;
