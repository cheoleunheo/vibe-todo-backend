// 인증 관련 기능
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // 탭 전환
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 로그인 폼
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // 회원가입 폼
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // 로그아웃 버튼
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // 알림 닫기 버튼
        const notificationClose = document.getElementById('notification-close');
        if (notificationClose) {
            notificationClose.addEventListener('click', () => {
                NotificationManager.hide();
            });
        }
    }

    async checkAuthStatus() {
        if (!TokenManager.isAuthenticated()) {
            LoadingManager.hide();
            this.showAuthContainer();
            return;
        }

        try {
            const response = await AuthAPI.getCurrentUser();
            this.currentUser = response.user;
            this.showAppContainer();
            this.updateUserDisplay();
            
            // 할일 로드
            if (window.todoManager) {
                todoManager.loadTodos();
            }
        } catch (error) {
            console.error('인증 상태 확인 실패:', error);
            // 토큰이 유효하지 않은 경우에만 제거
            if (error.message.includes('토큰') || error.message.includes('인증')) {
                TokenManager.removeToken();
            }
            this.showAuthContainer();
        } finally {
            LoadingManager.hide();
        }
    }

    switchTab(tabName) {
        // 탭 버튼 활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 폼 표시/숨김
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}-form`).classList.add('active');
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            NotificationManager.error('이메일과 비밀번호를 입력해주세요.');
            return;
        }

        try {
            LoadingManager.show();
            const response = await AuthAPI.login({ email, password });
            
            TokenManager.setToken(response.token);
            this.currentUser = response.user;
            
            NotificationManager.success('로그인 성공!');
            this.showAppContainer();
            this.updateUserDisplay();
            
            // 할일 로드
            if (window.todoManager) {
                todoManager.loadTodos();
            }
            
            // 폼 초기화
            FormUtils.clearForm('login-form');
            
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            LoadingManager.hide();
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // 폼 검증
        const isValid = FormUtils.validateForm('register-form', {
            'register-username': {
                required: true,
                minLength: 3,
                maxLength: 20,
                label: '사용자명'
            },
            'register-email': {
                required: true,
                email: true,
                label: '이메일'
            },
            'register-password': {
                required: true,
                minLength: 6,
                label: '비밀번호'
            },
            'register-confirm-password': {
                required: true,
                confirmPassword: 'register-password',
                label: '비밀번호 확인'
            }
        });

        if (!isValid) return;

        try {
            LoadingManager.show();
            const response = await AuthAPI.register({
                username,
                email,
                password
            });
            
            TokenManager.setToken(response.token);
            this.currentUser = response.user;
            
            NotificationManager.success('회원가입 성공!');
            this.showAppContainer();
            this.updateUserDisplay();
            
            // 할일 로드
            if (window.todoManager) {
                todoManager.loadTodos();
            }
            
            // 폼 초기화
            FormUtils.clearForm('register-form');
            
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            LoadingManager.hide();
        }
    }

    handleLogout() {
        TokenManager.removeToken();
        this.currentUser = null;
        this.showAuthContainer();
        NotificationManager.success('로그아웃되었습니다.');
    }

    showAuthContainer() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }

    showAppContainer() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
        
        // 기본 시간 설정
        setTimeout(() => {
            const todoDueDateInput = document.getElementById('todo-due-date');
            if (todoDueDateInput && !todoDueDateInput.value) {
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const day = String(now.getDate()).padStart(2, '0');
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                todoDueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
            }
        }, 200);
    }

    updateUserDisplay() {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay && this.currentUser) {
            usernameDisplay.textContent = this.currentUser.username;
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return TokenManager.isAuthenticated() && this.currentUser;
    }
}

// 전역 인증 매니저 인스턴스
window.authManager = new AuthManager();
