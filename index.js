let blocks = [];
let boosts = [];
let platform = null;
let ball = null;
let pointsCounter = null;
let lifesCounter = null;
let gameStarted = false;
let winState = false;
let animationID = null;
let isGameRunning = false;
let isButtonListenerBeing = false;

let hero = null;
let heroDead = null;
let heroWin = null;
let canvas = null;
let ctx = null;
let canvasCounters = null;
let pointsDisplay = null;
let lifesDisplay = null;

const BLOCK_WIDTH = 58;
const BLOCK_HEIGHT = 30;
const PLATFORM_WIDTH = 160;
const PLATFORM_HEIGHT = 30;
const BALL_RADIUS = 12;
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

const keys = {
    left: false,
    right: false
}

document.addEventListener('DOMContentLoaded', init);

function init() {
    hero = document.querySelector(".hero");
    heroDead = document.querySelector(".hero-dead");
    heroWin = document.querySelector(".hero-win");
    canvas = document.getElementById("canvas");
    canvasCounters = document.querySelector(".canvas-block-score");
    pointsDisplay = document.querySelector(".points");
    lifesDisplay = document.querySelector(".lifes-counter");
    const button = document.querySelector(".hero-button");

    heroWin.style.display = "none";
    heroDead.style.display = "none";
    hero.style.display = "";

    if (isButtonListenerBeing) {
        button.removeEventListener('click', startGame);
        isButtonListenerBeing = false;
    }

    button.addEventListener('click', startGame);

    resetGame();
}

function startGame() {
    setTimeout(() => {
        heroWin.style.display = "none";
        heroDead.style.display = "none";
        document.querySelector(".help-title-1").style.display = "none";
    }, 1000);
    hero.style.display = "";

    resetGame();

    hero.style.animation = "fadeOut linear 1s";
    setTimeout(() => {
        hero.style.display = "none";
        initGame();
    }, 1000);
}

function resetGame() {
    if (animationID) {
        cancelAnimationFrame(animationID);
        animationID = null;
    }

    isGameRunning = false;
    gameStarted = false;
    winState = false;
    lifesCounter = 3;
    pointsCounter = 0;

    blocks = [];
    boosts = [];

    keys.left = false; 
    keys.right = false;
    
    if (pointsDisplay) pointsDisplay.textContent = "0";
    if (lifesDisplay) lifesDisplay.textContent = "3";
}

function initGame() {
    canvasCounters.style.display = "block";
    pointsDisplay.textContent = "0";
    lifesDisplay.textContent = "3";

    canvas.style.display = "block";
    canvas.style.animation = "fadeIn linear 1s forwards";
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    ctx = canvas.getContext("2d");

    platform = {
        x: CANVAS_WIDTH / 2 - PLATFORM_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        color: "black",
        speed: 5
    };

    ball = {
        x: platform.x + platform.width / 2,
        y: platform.y - BALL_RADIUS,
        radius: BALL_RADIUS,
        color: "red",
        vx: 0,
        vy: 0
    };

    createBlocks();
    setupControls();
    isGameRunning = true;
    gameLoop();
}

function createBlocks() {
    blocks = [];

    const startX = 50;
    const startY = 60;
    const blockSpacing = 2;
    const colors = [
        { hits: 2, color: "grey" },
        { hits: 1, color: "orange" },
        { hits: 1, color: "yellow" },
        { hits: 1, color: "green" },
        { hits: 1, color: "blue" }
    ];

    for (let i = 0; i < 5; i++) {
        const blockConfig = colors[i % colors.length];
        const y = startY + i * (BLOCK_HEIGHT + blockSpacing);
        const blocksInRow = Math.floor((CANVAS_WIDTH - startX * 2) / (BLOCK_WIDTH + blockSpacing));

        for (let j = 0; j < blocksInRow; j++) {
            const x = startX + j * (BLOCK_WIDTH + blockSpacing);

            blocks.push({
                x: x,
                y: y,
                width: BLOCK_WIDTH,
                height: BLOCK_HEIGHT,
                color: blockConfig.color,
                hits: blockConfig.hits,
                maxHits: blockConfig.hits
            });
        }
    }
}

function setupControls() {
    const keyDownHandler  = (e) => {
        const key = e.key.toLowerCase();

        if (key === 'a' || key === 'ф' || key === 'arrowleft') {
            e.preventDefault();
            keys.left = true;
        }

        if (key === 'd' || key === 'в' || key === 'arrowright') {
            e.preventDefault();
            keys.right = true;
        }

        if (key === " ") {
            e.preventDefault();
            if (!gameStarted && isGameRunning) {
                gameStarted = true;
                ball.vx = 3;
                ball.vy = -3;
            }
        }
    };

    const keyUpHandler = (e) => {
        const key = e.key.toLowerCase();

        if (key === 'a' || key === 'ф' || key === 'arrowleft') {
            keys.left = false;
        }

        if (key === 'd' || key === 'в' || key === 'arrowright') {
            keys.right = false;
        }
    };

    document.removeEventListener('keydown', keyDownHandler);
    document.removeEventListener('keyup', keyUpHandler);
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
}

function gameLoop() {
    if (!isGameRunning) return;

    updateGame();
    drawGame();

    if (!winState && lifesCounter > 0 && isGameRunning) {
        animationID = requestAnimationFrame(gameLoop);
    } else {
        isGameRunning = false;
        if (animationID) {
            cancelAnimationFrame(animationID);
            animationID = null;
        }
    }
}

function updateGame() {
    if (keys.left && platform.x > 0) {
        platform.x -= platform.speed;
    }

    if (keys.right && platform.x + platform.width < CANVAS_WIDTH) {
        platform.x += platform.speed;
    }

    if (gameStarted) {
        ball.x += ball.vx;
        ball.y += ball.vy;

        checkBorders();
        checkPlatform();
        checkBlocks();

        checkGameOver();
    } else {
        ball.x = platform.x + platform.width / 2;
    }
}

function checkBorders() {
    if (ball.x - ball.radius <= 0) {
        ball.vx = Math.abs(ball.vx);
        ball.x = ball.radius;
    }

    if (ball.x + ball.radius >= CANVAS_WIDTH) {
        ball.vx = -Math.abs(ball.vx);
        ball.x = CANVAS_WIDTH - ball.radius;
    }

    if (ball.y - ball.radius <= 0) {
        ball.vy = Math.abs(ball.vy);
        ball.y = ball.radius;
    }

    if (ball.y + ball.radius >= CANVAS_HEIGHT) {
        loseLife();
    }
}

function checkPlatform() {
    if (ball.y + ball.radius / 2 >= platform.y
        &&  ball.y - ball.radius <= platform.y + platform.height
        &&  ball.x + ball.radius >= platform.x
        &&  ball.x - ball.radius <= platform.x + platform.width ) {
        
        const hitPos = (ball.x - platform.x) / platform.width;
        ball.vy = -Math.abs(ball.vy);
        ball.vx = (hitPos - 0.5) * 8;
        ball.vx = Math.min(Math.max(ball.vx, -6), 6);
        ball.y = platform.y - ball.radius;

    }
}

function checkBlocks() {
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];

        if (ball.x + ball.radius > block.x
            && ball.x - ball.radius < block.x + block.width
            && ball.y + ball.radius > block.y
            && ball.y - ball.radius < block.y + block.height
        ) {
            const overlayLeft = (ball.x + ball.radius) - block.x;
            const overlayRight = (block.x + block.width) - (ball.x - ball.radius);
            const overlayTop = (ball.y + ball.radius) - block.y;
            const overlayBottom = (block.y + block.height) - (ball.y - ball.radius);
            const minOverlay = Math.min(overlayBottom, overlayLeft, overlayRight, overlayTop);

            if (minOverlay === overlayLeft || minOverlay === overlayRight) {
                ball.vx = -ball.vx;
            } else {
                ball.vy = -ball.vy;
            }

            block.hits--;

            if (block.hits <= 0) {
                const addPoints = block.maxHits === 2 ? 20 : 10;
                pointsCounter += addPoints;
                pointsDisplay.textContent = pointsCounter.toString();
                blocks.splice(i, 1);
            }

            break;
        }
    }
}

function loseLife() {
    lifesCounter--;
    lifesDisplay.textContent = lifesCounter.toString();

    if (lifesCounter <= 0) {
        gameStarted = false;
        endGame(false);
    } else {
        gameStarted = false;
        ball.vx = 0;
        ball.vy = 0;
        ball.x = platform.x + platform.width / 2;
        ball.y = platform.y - ball.radius * 2;
    }
}

function checkGameOver() {
    if (blocks.length === 0) {
        endGame(true);
    }
}

function endGame(isWin) {
    isGameRunning = false;
    winState = isWin;
    gameStarted = false;

    if (animationID) {
        cancelAnimationFrame(animationID);
        animationID = null;
    }

    if (isWin) {
        showWin();
    } else {
        showDead();
    }
}

function drawGame() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


    const platformGrad = ctx.createLinearGradient(
        platform.x, platform.y + platform.height / 2,
        platform.x + platform.width, platform.y + platform.height / 2
    );

    platformGrad.addColorStop(0, "red");
    platformGrad.addColorStop(1, "blue");

    ctx.fillStyle = platformGrad;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 6;
    ctx.strokeRect(platform.x + 3, platform.y + 3, platform.width - 6, platform.height - 6);

    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    blocks.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);

        if (block.maxHits === 2 && block.hits === 1) {
            ctx.fillStyle = "orange";
            ctx.fillRect(block.x + 5, block.y + 5, block.width - 10, 5);
        }
    });
}

function showWin() {
    canvas.style.animation = "fadeOut 0.5s linear forwards";

    setTimeout(() => {
        canvas.style.display = "none";
        canvasCounters.style.display = "none";
    }, 500);

    heroWin.style.display = "block";
    hero.style.animation = "fadeIn 1s linear forwards";
    
    setTimeout(() => {
        hero.style.display = "";
        document.querySelector(".help-title-1").style.display = "";
    }, 1000);

    hero.querySelector(".hero-title").style.display = "none";
    heroDead.style.display = "none";
    console.log("Игра закончена");
}

function showDead() {
    
    canvas.style.animation = "fadeOut 0.5s linear forwards";

    setTimeout(() => {
        canvas.style.display = "none";
        canvasCounters.style.display = "none";
    }, 500);

    heroDead.style.display = "block";
    hero.style.animation = "fadeIn 1s linear forwards";
    
    setTimeout(() => {
        hero.style.display = "";
        document.querySelector(".help-title-1").style.display = "";
    }, 1000);

    hero.querySelector(".hero-title").style.display = "none";
    heroWin.style.display = "none";
    console.log("Игра закончена");
}