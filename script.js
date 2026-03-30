// Game Variables
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const gameState = {
    running: false,
    paused: false,
    playerScore: 0,
    computerScore: 0
};

// Paddle dimensions
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 6;

// Ball dimensions
const BALL_SIZE = 8;
const BALL_SPEED = 5;

// Paddle positions
const playerPaddle = {
    x: 15,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const computerPaddle = {
    x: canvas.width - PADDLE_WIDTH - 15,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: BALL_SPEED,
    dy: BALL_SPEED,
    size: BALL_SIZE
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Start button
document.getElementById('startBtn').addEventListener('click', () => {
    gameState.running = !gameState.running;
    document.getElementById('startBtn').textContent = gameState.running ? 'Pause Game' : 'Resume Game';
});

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size);
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 20;
    ctx.fillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size);
    ctx.shadowBlur = 0;
}

function drawNet() {
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameArea() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawNet();
}

// Update functions
function updatePlayerPaddle() {
    // Keyboard controls
    if (keys['ArrowUp'] && playerPaddle.y > 0) {
        playerPaddle.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += PADDLE_SPEED;
    }

    // Mouse controls
    const targetY = mouseY - playerPaddle.height / 2;
    const diff = targetY - playerPaddle.y;
    
    if (Math.abs(diff) > 5) {
        playerPaddle.y += diff * 0.2;
    }

    // Boundary check
    playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, playerPaddle.y));
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const difficulty = 0.08; // AI difficulty (higher = smarter)

    if (computerCenter < ball.y - 35) {
        computerPaddle.y += PADDLE_SPEED - 1;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= PADDLE_SPEED - 1;
    }

    // Boundary check
    computerPaddle.y = Math.max(0, Math.min(canvas.height - computerPaddle.height, computerPaddle.y));
}

function updateBall() {
    if (!gameState.running) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom collision
    if (ball.y - ball.size / 2 < 0 || ball.y + ball.size / 2 > canvas.height) {
        ball.dy *= -1;
        ball.y = Math.max(ball.size / 2, Math.min(canvas.height - ball.size / 2, ball.y));
    }

    // Player paddle collision
    if (
        ball.x - ball.size / 2 < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = playerPaddle.x + playerPaddle.width + ball.size / 2;
        
        // Add spin based on paddle hit location
        const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height;
        ball.dy = BALL_SPEED * (hitPos - 0.5) * 2;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size / 2 > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx *= -1;
        ball.x = computerPaddle.x - ball.size / 2;
        
        // Add spin based on paddle hit location
        const hitPos = (ball.y - computerPaddle.y) / computerPaddle.height;
        ball.dy = BALL_SPEED * (hitPos - 0.5) * 2;
    }

    // Out of bounds - scoring
    if (ball.x < 0) {
        gameState.computerScore++;
        resetBall();
    } else if (ball.x > canvas.width) {
        gameState.playerScore++;
        resetBall();
    }

    // Update scoreboard
    document.getElementById('playerScore').textContent = gameState.playerScore;
    document.getElementById('computerScore').textContent = gameState.computerScore;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * BALL_SPEED;
    ball.dy = (Math.random() - 0.5) * BALL_SPEED * 2;
}

// Animation loop
function gameLoop() {
    drawGameArea();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();

    if (gameState.running) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();