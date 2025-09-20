// 메인 애플리케이션 초기화
class App {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.setupKeyboardShortcuts();
        this.checkOnlineStatus();
    }

    setupGlobalEventListeners() {
        // 페이지 로드 완료 시
        document.addEventListener('DOMContentLoaded', () => {
            console.log('Todo App이 로드되었습니다.');
        });

        // 온라인/오프라인 상태 변경
        window.addEventListener('online', () => {
            if (window.NotificationManager) {
                NotificationManager.success('인터넷 연결이 복구되었습니다.');
            }
            this.handleOnlineStatusChange(true);
        });

        window.addEventListener('offline', () => {
            if (window.NotificationManager) {
                NotificationManager.warning('인터넷 연결이 끊어졌습니다. 일부 기능이 제한될 수 있습니다.');
            }
            this.handleOnlineStatusChange(false);
        });

        // 에러 처리
        window.addEventListener('error', (event) => {
            console.error('전역 에러:', event.error);
            if (window.NotificationManager) {
                NotificationManager.error('예상치 못한 오류가 발생했습니다.');
            }
        });

        // Promise rejection 처리
        window.addEventListener('unhandledrejection', (event) => {
            console.error('처리되지 않은 Promise rejection:', event.reason);
            // 네트워크 관련 에러만 사용자에게 알림
            if (event.reason && event.reason.message && 
                (event.reason.message.includes('fetch') || 
                 event.reason.message.includes('network') ||
                 event.reason.message.includes('Failed to fetch'))) {
                if (window.NotificationManager) {
                    NotificationManager.error('네트워크 연결을 확인해주세요.');
                }
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: 할일 추가
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                const addForm = document.getElementById('add-todo-form');
                if (addForm && addForm.style.display !== 'none') {
                    e.preventDefault();
                    addForm.dispatchEvent(new Event('submit'));
                }
            }

            // Escape: 모달 닫기
            if (e.key === 'Escape') {
                const editModal = document.getElementById('edit-modal');
                if (editModal && editModal.style.display === 'flex') {
                    todoManager.closeEditModal();
                }
            }

            // Ctrl/Cmd + K: 검색 포커스
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.focus();
                }
            }
        });
    }

    checkOnlineStatus() {
        const isOnline = navigator.onLine;
        this.handleOnlineStatusChange(isOnline);
    }

    handleOnlineStatusChange(isOnline) {
        // 온라인 상태에 따른 UI 업데이트
        const body = document.body;
        if (isOnline) {
            body.classList.remove('offline');
            // 오프라인 상태에서 온라인으로 복구 시 데이터 동기화
            if (window.authManager && window.authManager.isAuthenticated()) {
                if (window.todoManager) {
                    todoManager.refresh();
                }
            }
        } else {
            body.classList.add('offline');
        }
    }
}

// 접근성 개선
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Tab 키로 포커스 가능한 요소들에 대한 스타일링
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupScreenReaderSupport() {
        // 동적으로 생성되는 요소들에 대한 ARIA 라벨 추가
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.addAriaLabels(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    addAriaLabels(element) {
        // 버튼에 적절한 ARIA 라벨 추가
        const buttons = element.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                const icon = button.querySelector('i');
                if (icon) {
                    const iconClass = icon.className;
                    if (iconClass.includes('fa-plus')) {
                        button.setAttribute('aria-label', '할일 추가');
                    } else if (iconClass.includes('fa-edit')) {
                        button.setAttribute('aria-label', '할일 편집');
                    } else if (iconClass.includes('fa-trash')) {
                        button.setAttribute('aria-label', '할일 삭제');
                    } else if (iconClass.includes('fa-check')) {
                        button.setAttribute('aria-label', '할일 완료 토글');
                    }
                }
            }
        });
    }

    setupFocusManagement() {
        // 모달이 열릴 때 포커스 관리
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const target = mutation.target;
                    if (target.id === 'edit-modal') {
                        if (target.style.display === 'flex') {
                            // 모달이 열릴 때 첫 번째 입력 필드에 포커스
                            const firstInput = target.querySelector('input');
                            if (firstInput) {
                                setTimeout(() => firstInput.focus(), 100);
                            }
                        }
                    }
                }
            });
        });

        observer.observe(document.body, {
            attributes: true,
            subtree: true
        });
    }
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 메인 앱 초기화
    window.app = new App();
    
    // 접근성 관리자 초기화
    window.accessibilityManager = new AccessibilityManager();
    
    console.log('Todo App이 성공적으로 초기화되었습니다.');
});

// 전역 에러 핸들러
window.addEventListener('error', (event) => {
    console.error('전역 에러:', event.error);
    
    // 사용자에게 친화적인 에러 메시지 표시
    if (event.error && event.error.message && window.NotificationManager) {
        NotificationManager.error('예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요.');
    }
});

// 네트워크 에러 처리
window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise rejection:', event.reason);
    
    // 네트워크 관련 에러인 경우
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('fetch') || event.reason.message.includes('network'))) {
        if (window.NotificationManager) {
            NotificationManager.error('네트워크 연결을 확인해주세요.');
        }
    }
});
