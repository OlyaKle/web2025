// основной код приложения ToDo

class TodoApp {
    constructor() {
        this.tasks = [];
        this.filter = 'all';
        this.searchTerm = '';
        this.sortOrder = 'asc';
        this.editingId = null;
        this.init();
    }

    init() {
        this.createAppStructure();
        this.loadTasks();
        this.renderTasks();
        this.setupEventListeners();
    }

    // Создание структуры приложения
    createAppStructure() {
        const container = document.querySelector('.container');

        // Заголовок
        const header = document.createElement('header');
        const title = document.createElement('h1');
        title.textContent = 'ToDo List';
        header.appendChild(title);
        container.appendChild(header);

        // Форма добавления задачи
        const inputSection = document.createElement('div');
        inputSection.className = 'input-section';

        const taskInput = document.createElement('input');
        taskInput.type = 'text';
        taskInput.placeholder = 'Новая задача...';
        taskInput.id = 'taskInput';

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.id = 'dateInput';

        const addButton = document.createElement('button');
        addButton.id = 'addButton';
        addButton.textContent = 'Добавить';

        inputSection.appendChild(taskInput);
        inputSection.appendChild(dateInput);
        inputSection.appendChild(addButton);
        container.appendChild(inputSection);

        // Панель управления
        const controls = document.createElement('div');
        controls.className = 'controls';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Поиск задач...';
        searchInput.className = 'search-box';
        searchInput.id = 'searchInput';

        const filterSelect = document.createElement('select');
        filterSelect.id = 'filterSelect';
        const filterOptions = [
            { value: 'all', text: 'Все задачи' },
            { value: 'completed', text: 'Выполненные' },
            { value: 'pending', text: 'Невыполненные' }
        ];
        
        filterOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            filterSelect.appendChild(optionElement);
        });

        const sortButton = document.createElement('button');
        sortButton.id = 'sortButton';
        sortButton.textContent = 'Сортировать по дате';

        controls.appendChild(searchInput);
        controls.appendChild(filterSelect);
        controls.appendChild(sortButton);
        container.appendChild(controls);

        // Список задач
        const taskList = document.createElement('ul');
        taskList.className = 'task-list';
        taskList.id = 'taskList';
        container.appendChild(taskList);
    }

    // Загрузка задач из localStorage
    loadTasks() {
        const savedTasks = localStorage.getItem('todoTasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
    }

    // Сохранение задач в localStorage
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Добавление новой задачи
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const dateInput = document.getElementById('dateInput');
        
        const text = taskInput.value.trim();
        const date = dateInput.value || new Date().toISOString().split('T')[0];
        
        if (text) {
            const newTask = {
                id: Date.now().toString(),
                text: text,
                date: date,
                completed: false,
                order: this.tasks.length
            };
            
            this.tasks.push(newTask);
            this.saveTasks();
            this.renderTasks();
            
            // Очистка полей ввода
            taskInput.value = '';
            dateInput.value = '';
        }
    }

    // Удаление задачи
    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    // Переключение статуса выполнения
    toggleComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    // Начало редактирования задачи
    startEdit(id) {
        this.editingId = id;
        this.renderTasks();
    }

    // Завершение редактирования задачи
    finishEdit(id, newText, newDate) {
        const task = this.tasks.find(task => task.id === id);
        if (task && newText.trim()) {
            task.text = newText.trim();
            task.date = newDate;
            this.saveTasks();
        }
        this.editingId = null;
        this.renderTasks();
    }

    // Фильтрация задач
    filterTasks() {
        const filterSelect = document.getElementById('filterSelect');
        this.filter = filterSelect.value;
        this.renderTasks();
    }

    // Поиск задач
    searchTasks() {
        const searchInput = document.getElementById('searchInput');
        this.searchTerm = searchInput.value.toLowerCase();
        this.renderTasks();
    }

    // Сортировка задач по дате
    sortTasks() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        this.renderTasks();
    }

    // Получение отфильтрованных и отсортированных задач
    getFilteredTasks() {
        let filteredTasks = [...this.tasks];
        
        // Применение фильтра
        if (this.filter === 'completed') {
            filteredTasks = filteredTasks.filter(task => task.completed);
        } else if (this.filter === 'pending') {
            filteredTasks = filteredTasks.filter(task => !task.completed);
        }
        
        // Применение поиска
        if (this.searchTerm) {
            filteredTasks = filteredTasks.filter(task => 
                task.text.toLowerCase().includes(this.searchTerm)
            );
        }
        
        // Сортировка по дате
        filteredTasks.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            if (this.sortOrder === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
        
        return filteredTasks;
    }

    // Отображение задач
    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        // Очистка списка
        while (taskList.firstChild) {
            taskList.removeChild(taskList.firstChild);
        }
        
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = this.tasks.length === 0 
                ? 'Нет задач. Добавьте первую задачу!' 
                : 'Задачи не найдены. Попробуйте изменить фильтры или поисковый запрос.';
            taskList.appendChild(emptyState);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.draggable = true;
            taskItem.dataset.id = task.id;
            
            // Чекбокс выполнения
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            
            // Текст задачи (редактируемый)
            const textSpan = document.createElement('span');
            textSpan.className = 'task-text';
            
            // Дата задачи (редактируемая)
            const dateSpan = document.createElement('span');
            dateSpan.className = 'task-date';
            
            if (this.editingId === task.id) {
                // Режим редактирования
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.value = task.text;
                textInput.className = 'edit-input';
                
                const dateInput = document.createElement('input');
                dateInput.type = 'date';
                dateInput.value = task.date;
                dateInput.className = 'edit-date';
                
                const saveButton = document.createElement('button');
                saveButton.textContent = 'Сохранить';
                saveButton.className = 'btn-save';
                
                const cancelButton = document.createElement('button');
                cancelButton.textContent = 'Отмена';
                cancelButton.className = 'btn-cancel';
                
                textSpan.appendChild(textInput);
                dateSpan.appendChild(dateInput);
                
                taskItem.appendChild(checkbox);
                taskItem.appendChild(textSpan);
                taskItem.appendChild(dateSpan);
                taskItem.appendChild(saveButton);
                taskItem.appendChild(cancelButton);
            } else {
                // Обычный режим отображения
                textSpan.textContent = task.text;
                dateSpan.textContent = new Date(task.date).toLocaleDateString('ru-RU');
                
                const space = document.createTextNode(' ');
                
                // Кнопки действий
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'task-actions';
                
                const editButton = document.createElement('button');
                editButton.textContent = 'Редактировать';
                editButton.className = 'btn-edit';
                
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Удалить';
                deleteButton.className = 'btn-delete';
                
                actionsDiv.appendChild(editButton);
                actionsDiv.appendChild(deleteButton);
                
                taskItem.appendChild(checkbox);
                taskItem.appendChild(textSpan);
                taskItem.appendChild(space);  // Добавляю пробел, тк его не было
                taskItem.appendChild(dateSpan);
                taskItem.appendChild(actionsDiv);
            }
            
            taskList.appendChild(taskItem);
        });
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Добавление задачи
        document.getElementById('addButton').addEventListener('click', () => {
            this.addTask();
        });
        
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // Фильтрация
        document.getElementById('filterSelect').addEventListener('change', () => {
            this.filterTasks();
        });
        
        // Поиск
        document.getElementById('searchInput').addEventListener('input', () => {
            this.searchTasks();
        });
        
        // Сортировка
        document.getElementById('sortButton').addEventListener('click', () => {
            this.sortTasks();
        });
        
        // Делегирование событий для списка задач
        document.getElementById('taskList').addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.id;
            
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleComplete(taskId);
            } else if (e.target.classList.contains('btn-edit')) {
                this.startEdit(taskId);
            } else if (e.target.classList.contains('btn-delete')) {
                this.deleteTask(taskId);
            } else if (e.target.classList.contains('btn-save')) {
                const textInput = taskItem.querySelector('.edit-input');
                const dateInput = taskItem.querySelector('.edit-date');
                this.finishEdit(taskId, textInput.value, dateInput.value);
            } else if (e.target.classList.contains('btn-cancel')) {
                this.editingId = null;
                this.renderTasks();
            }
        });
        
        // Drag and Drop
        this.setupDragAndDrop();
    }

    // Настройка Drag and Drop
    setupDragAndDrop() {
        const taskList = document.getElementById('taskList');
        let draggedItem = null;
        
        taskList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-item')) {
                draggedItem = e.target;
                setTimeout(() => {
                    e.target.classList.add('dragging');
                }, 0);
            }
        });
        
        taskList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-item')) {
                e.target.classList.remove('dragging');
                draggedItem = null;
            }
        });
        
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = this.getDragAfterElement(taskList, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (draggable && afterElement) {
                taskList.insertBefore(draggable, afterElement);
            } else if (draggable) {
                taskList.appendChild(draggable);
            }
        });
        
        taskList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedItem) {
                // Обновление порядка задач в массиве
                const taskItems = Array.from(taskList.querySelectorAll('.task-item'));
                const newOrder = [];
                
                taskItems.forEach((item, index) => {
                    const taskId = item.dataset.id;
                    const task = this.tasks.find(t => t.id === taskId);
                    if (task) {
                        task.order = index;
                        newOrder.push(task);
                    }
                });
                
                this.tasks = newOrder;
                this.saveTasks();
            }
        });
    }

    // Вспомогательная функция для определения позиции при перетаскивании
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
