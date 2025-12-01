// Класс игры 2048, содержит всю логику и состояние игры
class Game2048 {
    constructor() {
        // Основные параметры игры
        this.size = 4; // Размер игрового поля (4x4)
        this.score = 0; // Текущий счет
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0; // Лучший счет из localStorage
        this.gameOver = false; // Флаг окончания игры
        this.board = []; // Массив игрового поля
        this.previousState = null; // Предыдущее состояние для отмены хода
        this.leaders = JSON.parse(localStorage.getItem('leaders')) || []; // Таблица лидеров
        
        // Инициализация игры
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }

    // Инициализация новой игры
    initializeGame() {
        this.createBoard(); // Создание игрового поля
        this.addRandomTile(); // Добавление двух начальных плиток
        this.addRandomTile();
        this.saveState(); // Сохранение состояния
    }

    // Создание игрового поля в DOM
    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.textContent = ''; // Очистка поля
        
        // Создание 16 пустых ячеек
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            gameBoard.appendChild(cell);
        }
        
        // Инициализация двумерного массива нулями
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
    }

    // Добавление новой плитки на случайную пустую клетку
    addRandomTile() {
        const emptyCells = [];
        // Поиск всех пустых клеток
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }

        // Если есть пустые клетки, добавляем плитку
        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% вероятность плитки 2, 10% - плитки 4
            this.board[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // Сохранение текущего состояния для возможности отмены хода
    saveState() {
        this.previousState = {
            board: JSON.parse(JSON.stringify(this.board)), // Глубокое копирование массива
            score: this.score
        };
        this.saveToStorage(); // Сохранение в localStorage
    }

    // Сохранение состояния игры в localStorage
    saveToStorage() {
        localStorage.setItem('gameState', JSON.stringify({
            board: this.board,
            score: this.score
        }));
        localStorage.setItem('bestScore', this.bestScore.toString());
    }

    // Загрузка сохраненной игры из localStorage
    loadFromStorage() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.board = state.board;
            this.score = state.score;
            this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
            this.updateDisplay();
        }
    }

    // Основной метод движения плиток
    move(direction) {
        if (this.gameOver) return; // Если игра окончена, движение невозможно

        const boardBeforeMove = JSON.parse(JSON.stringify(this.board)); // Копия до движения
        let moved = false; // Флаг был ли сделан ход
        let scoreIncrease = 0; // Количество очков за ход

        // Выбор направления движения
        switch (direction) {
            case 'up':
                scoreIncrease = this.moveUp();
                break;
            case 'down':
                scoreIncrease = this.moveDown();
                break;
            case 'left':
                scoreIncrease = this.moveLeft();
                break;
            case 'right':
                scoreIncrease = this.moveRight();
                break;
        }

        // Проверка, изменилось ли поле
        moved = JSON.stringify(boardBeforeMove) !== JSON.stringify(this.board);

        // Если ход был сделан
        if (moved) {
            this.score += scoreIncrease;
            // Обновление лучшего счета
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
            }
            this.saveState(); // Сохранение состояния
            this.addRandomTile(); // Добавление новой плитки
            this.updateDisplay(); // Обновление отображения

            // Проверка окончания игры
            if (this.isGameOver()) {
                this.handleGameOver();
            }
        }
    }

    // Движение влево
    moveLeft() {
        let scoreIncrease = 0;
        for (let row = 0; row < this.size; row++) {
            // Убираем нули из строки
            const line = this.board[row].filter(cell => cell !== 0);
            // Объединение соседних одинаковых плиток
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2; // Удвоение значения
                    scoreIncrease += line[i]; // Добавление очков
                    line.splice(i + 1, 1); // Удаление объединенной плитки
                }
            }
            // Добавление нулей в конец
            while (line.length < this.size) {
                line.push(0);
            }
            this.board[row] = line;
        }
        return scoreIncrease;
    }

    // Движение вправо (аналогично движению влево, но в обратном порядке)
    moveRight() {
        let scoreIncrease = 0;
        for (let row = 0; row < this.size; row++) {
            const line = this.board[row].filter(cell => cell !== 0);
            // Объединение справа налево
            for (let i = line.length - 1; i > 0; i--) {
                if (line[i] === line[i - 1]) {
                    line[i] *= 2;
                    scoreIncrease += line[i];
                    line.splice(i - 1, 1);
                    i--;
                }
            }
            // Добавление нулей в начало
            while (line.length < this.size) {
                line.unshift(0);
            }
            this.board[row] = line;
        }
        return scoreIncrease;
    }

    // Движение вверх
    moveUp() {
        let scoreIncrease = 0;
        for (let col = 0; col < this.size; col++) {
            const line = [];
            // Сбор всех ненулевых значений в столбце
            for (let row = 0; row < this.size; row++) {
                if (this.board[row][col] !== 0) {
                    line.push(this.board[row][col]);
                }
            }
            // Объединение сверху вниз
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    scoreIncrease += line[i];
                    line.splice(i + 1, 1);
                }
            }
            // Добавление нулей в конец
            while (line.length < this.size) {
                line.push(0);
            }
            // Возвращение значений в столбец
            for (let row = 0; row < this.size; row++) {
                this.board[row][col] = line[row];
            }
        }
        return scoreIncrease;
    }

    // Движение вниз (аналогично движению вверх, но в обратном порядке)
    moveDown() {
        let scoreIncrease = 0;
        for (let col = 0; col < this.size; col++) {
            const line = [];
            for (let row = 0; row < this.size; row++) {
                if (this.board[row][col] !== 0) {
                    line.push(this.board[row][col]);
                }
            }
            // Объединение снизу вверх
            for (let i = line.length - 1; i > 0; i--) {
                if (line[i] === line[i - 1]) {
                    line[i] *= 2;
                    scoreIncrease += line[i];
                    line.splice(i - 1, 1);
                    i--;
                }
            }
            // Добавление нулей в начало
            while (line.length < this.size) {
                line.unshift(0);
            }
            for (let row = 0; row < this.size; row++) {
                this.board[row][col] = line[row];
            }
        }
        return scoreIncrease;
    }

    // Проверка окончания игры
    isGameOver() {
        // Проверка наличия пустых клеток
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 0) return false;
                
                // Проверка возможности слияния с правой плиткой
                if (col < this.size - 1 && this.board[row][col] === this.board[row][col + 1]) return false;
                // Проверка возможности слияния с нижней плиткой
                if (row < this.size - 1 && this.board[row][col] === this.board[row + 1][col]) return false;
            }
        }
        return true; // Ходов больше нет
    }

    // Обновление отображения игры
    updateDisplay() {
        const gameBoard = document.getElementById('game-board');
        // Удаление всех старых плиток
        const tiles = gameBoard.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());

        // Создание новых плиток на основе массива board
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const value = this.board[row][col];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`; // Класс определяет цвет
                    tile.textContent = value;
                    
                    // Расчет позиции и размера плитки
                    const cellSize = gameBoard.offsetWidth / this.size;
                    tile.style.left = `${col * cellSize + 10}px`;
                    tile.style.top = `${row * cellSize + 10}px`;
                    tile.style.width = `${cellSize - 20}px`;
                    tile.style.height = `${cellSize - 20}px`;
                    
                    gameBoard.appendChild(tile);
                }
            }
        }

        // Обновление счетчиков
        document.getElementById('score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;

        // Блокировка кнопки отмены, если предыдущего состояния нет
        const undoBtn = document.getElementById('undo-btn');
        undoBtn.disabled = !this.previousState;
    }

    // Обработка окончания игры
    handleGameOver() {
        this.gameOver = true;
        const gameOverElement = document.getElementById('game-over');
        gameOverElement.classList.remove('hidden'); // Показ окна окончания
        
        // Скрытие мобильных кнопок управления
        const mobileControls = document.getElementById('mobile-controls');
        mobileControls.classList.add('hidden');
    }

    // Отмена последнего хода
    undo() {
        if (this.gameOver || !this.previousState) return; // Нельзя отменить если игра окончена или нет предыдущего состояния

        // Восстановление предыдущего состояния
        this.board = this.previousState.board;
        this.score = this.previousState.score;
        this.previousState = null;
        this.gameOver = false;
        
        // Скрытие окна окончания игры
        const gameOverElement = document.getElementById('game-over');
        gameOverElement.classList.add('hidden');
        
        // Показ мобильных кнопок управления
        const mobileControls = document.getElementById('mobile-controls');
        if (window.innerWidth <= 768) {
            mobileControls.classList.remove('hidden');
        }
        
        this.updateDisplay();
        this.saveToStorage();
    }

    // Начало новой игры
    restart() {
        this.score = 0;
        this.gameOver = false;
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.previousState = null;
        
        // Скрытие окна окончания игры
        const gameOverElement = document.getElementById('game-over');
        gameOverElement.classList.add('hidden');
        
        // Сброс формы сохранения рекорда
        document.getElementById('save-score-form').classList.remove('hidden');
        document.getElementById('score-saved-message').classList.add('hidden');
        document.getElementById('player-name').value = '';
        
        // Показ мобильных кнопок управления
        const mobileControls = document.getElementById('mobile-controls');
        if (window.innerWidth <= 768) {
            mobileControls.classList.remove('hidden');
        }
        
        this.initializeGame();
        this.updateDisplay();
    }

    // Сохранение рекорда в таблицу лидеров
    saveScore(playerName) {
        if (!playerName.trim()) return; // Игнорирование пустого имени

        const leaderEntry = {
            name: playerName.trim(),
            score: this.score,
            date: new Date().toLocaleDateString('ru-RU') // Форматирование даты
        };

        // Добавление записи и сортировка по убыванию очков
        this.leaders.push(leaderEntry);
        this.leaders.sort((a, b) => b.score - a.score);
        this.leaders = this.leaders.slice(0, 10); // Сохранение только топ-10

        localStorage.setItem('leaders', JSON.stringify(this.leaders));

        // Обновление отображения формы
        const saveForm = document.getElementById('save-score-form');
        const savedMessage = document.getElementById('score-saved-message');
        saveForm.classList.add('hidden');
        savedMessage.classList.remove('hidden');
    }

    // Показ таблицы лидеров
    showLeaders() {
        const modal = document.getElementById('leaders-modal');
        const tbody = document.querySelector('#leaders-table tbody');
        tbody.textContent = ''; // Очистка таблицы

        // Заполнение таблицы данными
        this.leaders.forEach(leader => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${leader.name}</td>
                <td>${leader.score}</td>
                <td>${leader.date}</td>
            `;
            tbody.appendChild(row);
        });

        modal.classList.remove('hidden'); // Показ модального окна
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Обработка нажатий клавиш клавиатуры
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;

            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });

        // Обработчики для мобильных кнопок управления
        document.getElementById('up-btn').addEventListener('click', () => this.move('up'));
        document.getElementById('down-btn').addEventListener('click', () => this.move('down'));
        document.getElementById('left-btn').addEventListener('click', () => this.move('left'));
        document.getElementById('right-btn').addEventListener('click', () => this.move('right'));

        // Обработчики кнопок управления
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        document.getElementById('new-game-btn').addEventListener('click', () => this.restart());

        // Сохранение рекорда
        document.getElementById('save-score-btn').addEventListener('click', () => {
            const playerName = document.getElementById('player-name').value;
            this.saveScore(playerName);
        });

        // Управление таблицей лидеров
        document.getElementById('leaders-btn').addEventListener('click', () => this.showLeaders());
        document.getElementById('close-leaders-btn').addEventListener('click', () => {
            document.getElementById('leaders-modal').classList.add('hidden');
        });

        // Закрытие модального окна по клику вне его
        document.getElementById('leaders-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('leaders-modal')) {
                document.getElementById('leaders-modal').classList.add('hidden');
            }
        });

        // Обработка изменения размера окна (адаптивность)
        window.addEventListener('resize', () => {
            this.updateDisplay();
            const mobileControls = document.getElementById('mobile-controls');
            // Показ/скрытие мобильных кнопок в зависимости от размера экрана
            if (window.innerWidth <= 768 && !this.gameOver) {
                mobileControls.classList.remove('hidden');
            } else {
                mobileControls.classList.add('hidden');
            }
        });

        // Загрузка сохраненной игры
        this.loadFromStorage();
        
        // Инициализация отображения мобильных кнопок
        const mobileControls = document.getElementById('mobile-controls');
        if (window.innerWidth <= 768 && !this.gameOver) {
            mobileControls.classList.remove('hidden');
        }
    }
}

// Инициализация игры после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
