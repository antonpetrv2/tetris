const ROWS = 20;
const COLS = 10;
const CELL_SIZE = 30;

// Tetris piece definitions
const PIECES = {
    I: { shape: [[1,1,1,1]], color: '#00bcd4' },
    O: { shape: [[1,1],[1,1]], color: '#ffd54f' },
    T: { shape: [[0,1,0],[1,1,1]], color: '#e91e63' },
    S: { shape: [[0,1,1],[1,1,0]], color: '#00e676' },
    Z: { shape: [[1,1,0],[0,1,1]], color: '#ff5252' },
    J: { shape: [[1,0,0],[1,1,1]], color: '#2196f3' },
    L: { shape: [[0,0,1],[1,1,1]], color: '#ff9800' }
};

let board = [];
let currentPiece = null;
let gameActive = false;
let gameOver = false;
let score = 0;
let lines = 0;
let level = 1;
let dropSpeed = 500;
let dropInterval = null;

function initializeBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            if (board[row][col]) {
                cell.style.backgroundColor = board[row][col];
                cell.classList.add('filled');
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

function getRandomPiece() {
    const keys = Object.keys(PIECES);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const piece = PIECES[randomKey];
    return {
        shape: piece.shape,
        color: piece.color,
        x: 3,
        y: 0
    };
}

function canMovePiece(piece, newX, newY) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const x = newX + col;
                const y = newY + row;
                
                if (x < 0 || x >= COLS || y < 0 || y >= ROWS) {
                    return false;
                }
                
                if (y >= 0 && board[y][x]) {
                    return false;
                }
            }
        }
    }
    return true;
}

function placePiece(piece) {
    for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
            if (piece.shape[row][col]) {
                const x = piece.x + col;
                const y = piece.y + row;
                
                if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                    board[y][x] = piece.color;
                } else if (y < 0) {
                    gameOver = true;
                }
            }
        }
    }
}

function rotatePiece(piece) {
    const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
    );
    return rotated;
}

function clearLines() {
    let clearedLines = 0;
    
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            clearedLines++;
        }
    }
    
    if (clearedLines > 0) {
        lines += clearedLines;
        score += clearedLines * 100 * level;
        level = Math.floor(lines / 10) + 1;
        dropSpeed = Math.max(100, 500 - (level - 1) * 30);
        
        updateUI();
    }
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

function movePiece(dx, dy) {
    if (!currentPiece) return;
    
    const newX = currentPiece.x + dx;
    const newY = currentPiece.y + dy;
    
    if (canMovePiece(currentPiece, newX, newY)) {
        currentPiece.x = newX;
        currentPiece.y = newY;
        renderBoard();
        renderCurrentPiece();
        return true;
    }
    return false;
}

function dropPiece() {
    if (!movePiece(0, 1)) {
        placePiece(currentPiece);
        clearLines();
        currentPiece = getRandomPiece();
        
        if (!canMovePiece(currentPiece, currentPiece.x, currentPiece.y)) {
            gameOver = true;
            endGame();
        }
        
        renderBoard();
        renderCurrentPiece();
    }
}

function renderCurrentPiece() {
    if (!currentPiece) return;
    
    const gameBoard = document.getElementById('gameBoard');
    const cells = gameBoard.querySelectorAll('.cell');
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const x = currentPiece.x + col;
                const y = currentPiece.y + row;
                
                if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
                    const cellIndex = y * COLS + x;
                    if (cells[cellIndex]) {
                        cells[cellIndex].style.backgroundColor = currentPiece.color;
                        cells[cellIndex].classList.add('active');
                    }
                }
            }
        }
    }
}

function rotateCurrent() {
    if (!currentPiece) return;
    
    const oldShape = currentPiece.shape;
    currentPiece.shape = rotatePiece(currentPiece);
    
    if (!canMovePiece(currentPiece, currentPiece.x, currentPiece.y)) {
        currentPiece.shape = oldShape;
        return;
    }
    
    renderBoard();
    renderCurrentPiece();
}

function hardDrop() {
    while (movePiece(0, 1)) {}
    dropPiece();
}

function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    gameOver = false;
    document.getElementById('gameOverMsg').style.display = 'none';
    document.getElementById('startBtn').textContent = 'Pause Game';
    
    initializeBoard();
    currentPiece = getRandomPiece();
    score = 0;
    lines = 0;
    level = 1;
    updateUI();
    renderBoard();
    renderCurrentPiece();
    
    dropInterval = setInterval(dropPiece, dropSpeed);
}

function pauseGame() {
    gameActive = false;
    clearInterval(dropInterval);
    document.getElementById('startBtn').textContent = 'Resume Game';
}

function endGame() {
    gameActive = false;
    clearInterval(dropInterval);
    document.getElementById('gameOverMsg').style.display = 'block';
    document.getElementById('startBtn').textContent = 'Play Again';
}

function toggleGame() {
    if (gameOver) {
        startGame();
    } else if (gameActive) {
        pauseGame();
    } else {
        startGame();
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            e.preventDefault();
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            e.preventDefault();
            dropPiece();
            break;
        case 'w':
        case 'W':
        case 'ArrowUp':
            e.preventDefault();
            rotateCurrent();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
    }
});
