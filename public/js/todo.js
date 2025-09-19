// 할일 관리 기능
class TodoManager {
    constructor() {
        this.todos = [];
        this.filters = {
            search: '',
            priority: '',
            status: ''
        };
        this.editingTodoId = null;
        this.selectedTodos = new Set(); // 선택된 할일 ID들을 저장
        this.init();
    }

    init() {
        this.setupEventListeners();
        // 인증된 사용자만 할일 로드
        if (authManager && authManager.isAuthenticated()) {
            this.loadTodos();
        }
    }


    setupEventListeners() {
        // 할일 추가 폼
        const addTodoForm = document.getElementById('add-todo-form');
        if (addTodoForm) {
            addTodoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddTodo();
            });
        }

        // 검색 및 필터
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        const filterPriority = document.getElementById('filter-priority');
        if (filterPriority) {
            filterPriority.addEventListener('change', (e) => {
                this.filters.priority = e.target.value;
                this.applyFilters();
            });
        }

        const filterStatus = document.getElementById('filter-status');
        if (filterStatus) {
            filterStatus.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        // 일괄 삭제 버튼
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.handleBulkDelete();
            });
        }

        // 편집 모달
        const closeModal = document.getElementById('close-modal');
        const cancelEdit = document.getElementById('cancel-edit');
        const editModal = document.getElementById('edit-modal');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.closeEditModal();
            });
        }

        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => {
                this.closeEditModal();
            });
        }

        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.closeEditModal();
                }
            });
        }

        // 편집 폼
        const editTodoForm = document.getElementById('edit-todo-form');
        if (editTodoForm) {
            editTodoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditTodo();
            });
        }
    }

    async loadTodos() {
        if (!authManager.isAuthenticated()) return;

        try {
            LoadingManager.show();
            const response = await TodoAPI.getAllTodos();
            this.todos = response.data || [];
            this.renderTodos();
            this.updateStats();
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            LoadingManager.hide();
        }
    }

    async handleAddTodo() {
        const title = document.getElementById('todo-title').value.trim();
        const description = document.getElementById('todo-description').value.trim();
        const priority = document.getElementById('todo-priority').value;
        const dueDate = document.getElementById('todo-due-date').value;

        if (!title) {
            NotificationManager.error('할일 제목을 입력해주세요.');
            return;
        }

        try {
            LoadingManager.show();
            const todoData = {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null
            };

            const response = await TodoAPI.createTodo(todoData);
            this.todos.unshift(response.data);
            
            NotificationManager.success('할일이 추가되었습니다.');
            this.renderTodos();
            this.updateStats();
            this.clearAddForm();
            
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            LoadingManager.hide();
        }
    }

    async handleToggleTodo(todoId) {
        try {
            const response = await TodoAPI.toggleTodo(todoId);
            const todoIndex = this.todos.findIndex(todo => todo._id === todoId);
            
            if (todoIndex !== -1) {
                this.todos[todoIndex] = response.data;
                this.renderTodos();
                this.updateStats();
                
                const status = response.data.completed ? '완료' : '미완료';
                NotificationManager.success(`할일이 ${status}로 변경되었습니다.`);
            }
        } catch (error) {
            ErrorHandler.handle(error);
        }
    }

    async handleDeleteTodo(todoId) {
        if (!confirm('정말로 이 할일을 삭제하시겠습니까?')) {
            return;
        }

        try {
            await TodoAPI.deleteTodo(todoId);
            this.todos = this.todos.filter(todo => todo._id !== todoId);
            
            NotificationManager.success('할일이 삭제되었습니다.');
            this.renderTodos();
            this.updateStats();
            
        } catch (error) {
            ErrorHandler.handle(error);
        }
    }

    openEditModal(todoId) {
        const todo = this.todos.find(t => t._id === todoId);
        if (!todo) return;

        this.editingTodoId = todoId;
        
        // 폼에 데이터 채우기
        document.getElementById('edit-title').value = todo.title;
        document.getElementById('edit-description').value = todo.description || '';
        document.getElementById('edit-priority').value = todo.priority;
        
        // 날짜/시간 형식으로 변환
        if (todo.dueDate) {
            const date = new Date(todo.dueDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            document.getElementById('edit-due-date').value = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else {
            document.getElementById('edit-due-date').value = '';
        }
        
        document.getElementById('edit-completed').checked = todo.completed;

        // 모달 표시
        document.getElementById('edit-modal').style.display = 'flex';
    }

    closeEditModal() {
        this.editingTodoId = null;
        document.getElementById('edit-modal').style.display = 'none';
        FormUtils.clearForm('edit-todo-form');
    }

    async handleEditTodo() {
        if (!this.editingTodoId) return;

        const title = document.getElementById('edit-title').value.trim();
        const description = document.getElementById('edit-description').value.trim();
        const priority = document.getElementById('edit-priority').value;
        const dueDate = document.getElementById('edit-due-date').value;
        const completed = document.getElementById('edit-completed').checked;

        if (!title) {
            NotificationManager.error('할일 제목을 입력해주세요.');
            return;
        }

        try {
            LoadingManager.show();
            const todoData = {
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                completed
            };

            const response = await TodoAPI.updateTodo(this.editingTodoId, todoData);
            const todoIndex = this.todos.findIndex(todo => todo._id === this.editingTodoId);
            
            if (todoIndex !== -1) {
                this.todos[todoIndex] = response.data;
                this.renderTodos();
                this.updateStats();
                
                NotificationManager.success('할일이 수정되었습니다.');
                this.closeEditModal();
            }
            
        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            LoadingManager.hide();
        }
    }

    applyFilters() {
        this.renderTodos();
    }

    getFilteredTodos() {
        let filteredTodos = [...this.todos];

        // 검색 필터
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredTodos = filteredTodos.filter(todo => 
                todo.title.toLowerCase().includes(searchTerm) ||
                (todo.description && todo.description.toLowerCase().includes(searchTerm))
            );
        }

        // 우선순위 필터
        if (this.filters.priority) {
            filteredTodos = filteredTodos.filter(todo => 
                todo.priority === this.filters.priority
            );
        }

        // 상태 필터
        if (this.filters.status !== '') {
            const isCompleted = this.filters.status === 'true';
            filteredTodos = filteredTodos.filter(todo => 
                todo.completed === isCompleted
            );
        }

        return filteredTodos;
    }

    renderTodos() {
        const todosList = document.getElementById('todos-list');
        const emptyState = document.getElementById('empty-state');
        
        if (!todosList || !emptyState) return;

        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todosList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        todosList.style.display = 'block';
        emptyState.style.display = 'none';

        todosList.innerHTML = filteredTodos.map(todo => this.createTodoElement(todo)).join('');
        
        // 체크박스 이벤트 리스너 추가
        todosList.querySelectorAll('.todo-select').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const todoId = e.target.dataset.id;
                this.handleTodoSelect(todoId, e.target.checked);
            });
        });
    }

    createTodoElement(todo) {
        const isOverdue = DateUtils.isOverdue(todo.dueDate);
        const dueDateClass = isOverdue ? 'overdue' : '';
        const dueDateText = DateUtils.formatDate(todo.dueDate);
        const isSelected = this.selectedTodos.has(todo._id);
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''} ${isSelected ? 'selected' : ''}" data-id="${todo._id}">
                <div class="todo-select-checkbox">
                    <input type="checkbox" class="todo-select" data-id="${todo._id}" ${isSelected ? 'checked' : ''}>
                </div>
                <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                     onclick="todoManager.handleToggleTodo('${todo._id}')">
                    ${todo.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                
                <div class="todo-content">
                    <div class="todo-title">${this.escapeHtml(todo.title)}</div>
                    ${todo.description ? `<div class="todo-description">${this.escapeHtml(todo.description)}</div>` : ''}
                    
                    <div class="todo-meta">
                        <span class="${PriorityUtils.getClass(todo.priority)}">
                            ${PriorityUtils.getLabel(todo.priority)}
                        </span>
                        ${todo.dueDate ? `
                            <span class="todo-due-date ${dueDateClass}">
                                <i class="fas fa-calendar"></i>
                                ${dueDateText}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="todo-actions">
                    <button class="btn btn-secondary" onclick="todoManager.openEditModal('${todo._id}')">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button class="btn btn-danger" onclick="todoManager.handleDeleteTodo('${todo._id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
    }

    async updateStats() {
        try {
            const response = await TodoAPI.getStats();
            const stats = response.data;

            document.getElementById('total-todos').textContent = stats.total || 0;
            document.getElementById('completed-todos').textContent = stats.completed || 0;
            document.getElementById('pending-todos').textContent = stats.incomplete || 0;
            
        } catch (error) {
            console.error('통계 업데이트 실패:', error);
        }
    }

    clearAddForm() {
        FormUtils.clearForm('add-todo-form');
        document.getElementById('todo-priority').value = 'medium';
        // 기본 시간 재설정
        const todoDueDateInput = document.getElementById('todo-due-date');
        if (todoDueDateInput) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            todoDueDateInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 일괄 삭제 관련 메서드들
    handleTodoSelect(todoId, isSelected) {
        if (isSelected) {
            this.selectedTodos.add(todoId);
        } else {
            this.selectedTodos.delete(todoId);
        }
        this.updateBulkDeleteButton();
        this.renderTodos(); // 선택 상태 업데이트를 위해 다시 렌더링
    }

    updateBulkDeleteButton() {
        const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
        if (bulkDeleteBtn) {
            if (this.selectedTodos.size > 0) {
                bulkDeleteBtn.style.display = 'inline-flex';
                bulkDeleteBtn.innerHTML = `<i class="fas fa-trash"></i> 선택 삭제 (${this.selectedTodos.size})`;
            } else {
                bulkDeleteBtn.style.display = 'none';
            }
        }
    }

    async handleBulkDelete() {
        if (this.selectedTodos.size === 0) return;

        const count = this.selectedTodos.size;
        if (!confirm(`선택된 ${count}개의 할일을 삭제하시겠습니까?`)) {
            return;
        }

        try {
            LoadingManager.show();
            const deletePromises = Array.from(this.selectedTodos).map(todoId => 
                TodoAPI.deleteTodo(todoId)
            );

            await Promise.all(deletePromises);

            // 삭제된 할일들을 목록에서 제거
            this.todos = this.todos.filter(todo => !this.selectedTodos.has(todo._id));
            this.selectedTodos.clear();

            NotificationManager.success(`${count}개의 할일이 삭제되었습니다.`);
            this.renderTodos();
            this.updateStats();
            this.updateBulkDeleteButton();

        } catch (error) {
            ErrorHandler.handle(error);
        } finally {
            LoadingManager.hide();
        }
    }

    // 외부에서 호출할 수 있는 메서드들
    refresh() {
        this.loadTodos();
    }

    getTodos() {
        return this.todos;
    }

    getFilteredTodos() {
        let filteredTodos = [...this.todos];

        // 검색 필터
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filteredTodos = filteredTodos.filter(todo => 
                todo.title.toLowerCase().includes(searchTerm) ||
                (todo.description && todo.description.toLowerCase().includes(searchTerm))
            );
        }

        // 우선순위 필터
        if (this.filters.priority) {
            filteredTodos = filteredTodos.filter(todo => 
                todo.priority === this.filters.priority
            );
        }

        // 상태 필터
        if (this.filters.status !== '') {
            const isCompleted = this.filters.status === 'true';
            filteredTodos = filteredTodos.filter(todo => 
                todo.completed === isCompleted
            );
        }

        return filteredTodos;
    }
}

// 전역 할일 매니저 인스턴스
window.todoManager = new TodoManager();
