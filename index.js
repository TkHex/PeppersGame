let blocks = [];
let boosts = [];
let balls = [];
let platform = null;
let ball = null;
let pointsCounter = null;
let lifesCounter = null;
let gameStarted = false;
let winState = false;
let animationID = null;
let isGameRunning = false;
let isButtonListenerBeing = false;
let flag = false;
let chanceToSpawnBoost = null;
let isBoostSpawn = false;
let isBoostNeeded = false;
let deltaTime = 0;
let lastTimeStamp = 0;

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
const MAX_WIDTH = PLATFORM_WIDTH * 2;
const MAX_BALLS = 10;
const PLATFORM_SPEED = 600;
const BALL_SPEED = 400;
const BOOST_SPEED = 300;
const MAX_DELTA_TIME = 0.033; // рассчитано на минимальный FPS в 30 кадров.

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
    balls = [];

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
        speed: PLATFORM_SPEED
    };

    const initialBall = {
        x: platform.x + platform.width / 2,
        y: platform.y - BALL_RADIUS,
        radius: BALL_RADIUS,
        color: "red",
        vx: 0,
        vy: 0,
        isMain: true
    };

    balls = [initialBall];
    ball = initialBall;

    createBlocks();
    setupControls();
    isGameRunning = true;
    gameLoop(performance.now());
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
                ball.vx = BALL_SPEED;
                ball.vy = -BALL_SPEED;
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

function gameLoop(currentTime) {
    if (!isGameRunning) return;

    deltaTime = 0;
    if (lastTimeStamp !== 0) {
        deltaTime = Math.min(MAX_DELTA_TIME, (currentTime - lastTimeStamp) / 1000);
    }

    lastTimeStamp = currentTime;

    updateGame(deltaTime);
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

function updateGame(deltaTime) {
    if (keys.left && platform.x > 0) {
        platform.x -= platform.speed * deltaTime;
    }

    if (keys.right && platform.x + platform.width < CANVAS_WIDTH) {
        platform.x += platform.speed * deltaTime;
    }

    if (gameStarted) {
        balls.forEach(ball => {
            ball.x += ball.vx * deltaTime;
            ball.y += ball.vy * deltaTime;
        });

        updateBoosts(deltaTime);

        checkBorders();
        checkPlatform();
        checkBlocks();

        checkGameOver();
    } else {
        if (balls.length === 1) {
            balls[0].x = platform.x + platform.width / 2;
        }
    }
}

function updateBoosts() {
    for ( let i = 0; i < boosts.length; i++) {
        const boost = boosts[i];
        boost.y += boost.speed * deltaTime;

        if (boost.y > CANVAS_HEIGHT) {
            boosts.splice(i, 1);
            i--;
            continue;
        }

        if (boost.y + boost.height >= platform.y
            && boost.y <= platform.y + platform.height
            && boost.x + boost.width >= platform.x
            && boost.x <= platform.x + platform.width) {

            applyBoostEffect(boost.type);
            boosts.splice(i, 1);
            i--;
        }
    }

    if (boosts.length === 0) {
        isBoostSpawn = false;
    }
}

function checkBorders() {
    for (let i = 0; i < balls.length; i++) {
        const currentBall = balls[i];

        if (currentBall.x - currentBall.radius <= 0) {
            currentBall.vx = Math.abs(currentBall.vx);
            currentBall.x = currentBall.radius;
        }

        if (currentBall.x + currentBall.radius >= CANVAS_WIDTH) {
            currentBall.vx = -Math.abs(currentBall.vx);
            currentBall.x = CANVAS_WIDTH - currentBall.radius;
        }

        if (currentBall.y - currentBall.radius <= 0) {
            currentBall.vy = Math.abs(currentBall.vy);
            currentBall.y = currentBall.radius;
        }

        if (currentBall.y + currentBall.radius >= CANVAS_HEIGHT) {
            balls.splice(i, 1);
            i--;
        }
    }

    if (balls.length === 0) {
        loseLife();
    }
}

function checkPlatform() {
    balls.forEach(ball => {
        if (ball.y + ball.radius / 2 >= platform.y
            &&  ball.y - ball.radius <= platform.y + platform.height
            &&  ball.x + ball.radius >= platform.x
            &&  ball.x - ball.radius <= platform.x + platform.width ) {
            
            const hitPos = (ball.x - platform.x) / platform.width;
            const currentSpeed = Math.hypot(ball.vx, ball.vy);
            ball.vy = -Math.abs(ball.vy);
            
            const horisontalFactor = (hitPos - 0.5) * 2;
            ball.vx = horisontalFactor * BALL_SPEED;

            const newSpeed = Math.hypot(ball.vx, ball.vy);
            if (newSpeed > 0) {
                ball.vx = (ball.vx / newSpeed) * currentSpeed;
                ball.vy = (ball.vy / newSpeed) * currentSpeed;
            }

            ball.y = platform.y - ball.radius;
        }
    });
}

function checkBlocks() {

    let blockDestroyed = false;
    let destroyedBlockX = null;
    let destroyedBlockY = null;

    for (const bl of balls) {
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];

            if (bl.x + bl.radius > block.x
                && bl.x - bl.radius < block.x + block.width
                && bl.y + bl.radius > block.y
                && bl.y - bl.radius < block.y + block.height) {

                const overlayLeft = (bl.x + bl.radius) - block.x;
                const overlayRight = (block.x + block.width) - (bl.x - bl.radius);
                const overlayTop = (bl.y + bl.radius) - block.y;
                const overlayBottom = (block.y + block.height) - (bl.y - bl.radius);
                const minOverlay = Math.min(overlayBottom, overlayLeft, overlayRight, overlayTop);

                if (minOverlay === overlayLeft || minOverlay === overlayRight) {
                    bl.vx = -bl.vx;
                } else {
                    bl.vy = -bl.vy;
                }

                block.hits--;

                if (block.hits <= 0) {
                    const addPoints = block.maxHits === 2 ? 20 : 10;
                    pointsCounter += addPoints;
                    pointsDisplay.textContent = pointsCounter.toString();
                    destroyedBlockX = block.x + block.width / 2;
                    destroyedBlockY = block.y + block.height / 2;
                    blockDestroyed = true;

                    blocks.splice(i , 1);
                }

                break;
            }
        }

        if (blockDestroyed) {
            trySpawnBoost(destroyedBlockX, destroyedBlockY);
        }
    }
}

function loseLife() {
    lifesCounter--;
    lifesDisplay.textContent = lifesCounter.toString();

    if (platform.width !== PLATFORM_WIDTH) {
        platform.width = PLATFORM_WIDTH;

        if (platform.x + platform.width > CANVAS_WIDTH) {
            platform.x = CANVAS_WIDTH - platform.width;
        }
    }

    if (lifesCounter <= 0) {
        gameStarted = false;
        endGame(false);
    } else {
        gameStarted = false;

        balls = [{
            x: platform.x + platform.width / 2,
            y: platform.y - BALL_RADIUS * 2,
            radius: BALL_RADIUS,
            color: "red",
            vx: 0,
            vy: 0,
            isMain: true
        }];

        boosts = [];
        ball = balls[0];
    }

    balls.forEach(ball => {
        console.log(ball);
    })
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

    balls.forEach(ball => {
        ctx.beginPath();
        ctx.fillStyle = ball.isClone ? "grey" : "black";
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    });

    blocks.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);

        if (block.maxHits === 2 && block.hits === 1) {
            ctx.fillStyle = "orange";
            ctx.fillRect(block.x + 5, block.y + 5, block.width - 10, 5);
        }
    });

    boosts.forEach(bst => {
        if (bst.type === "ballBoost") {
            const ballBoostGrad = ctx.createLinearGradient(
                bst.x, bst.y,
                bst.x + bst.width, bst.y + bst.height
            );

            ballBoostGrad.addColorStop(0, "#ffc800");
            ballBoostGrad.addColorStop(1, "#d60303");
            ctx.fillStyle = ballBoostGrad;
        } else {
            const platformBoostGrad = ctx.createLinearGradient(
                bst.x, bst.y,
                bst.x + bst.width, bst.y + bst.height
            );

            platformBoostGrad.addColorStop(0, "red");
            platformBoostGrad.addColorStop(1, "blue");
            ctx.fillStyle = platformBoostGrad;
        }

        ctx.fillRect(bst.x, bst.y, bst.width, bst.height);

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

function trySpawnBoost(x, y) {
    const chance = Math.random();

    if (chance < 0.05) {
        boosts.push({
            x: x,
            y: y,
            width: BLOCK_WIDTH / 4,
            height: BLOCK_HEIGHT / 4,
            type: "platformBoost",
            speed: BOOST_SPEED
        });

        isBoostSpawn = true;
    } else if (chance < 0.1) {
        boosts.push({
            x: x,
            y: y,
            width: BLOCK_WIDTH / 4,
            height: BLOCK_HEIGHT / 4,
            type: "ballBoost",
            speed: BOOST_SPEED
        });

        isBoostSpawn = true;
    }
}

function applyBoostEffect(type) {
    if (type === "platformBoost") {
        platform.width = Math.min(platform.width + 20, MAX_WIDTH);

        if (platform.x + platform.width > CANVAS_WIDTH) {
            platform.x = CANVAS_WIDTH - platform.width;
        }
    } else if (type === "ballBoost") {
        const currentBallsCount = balls.length;
        if (currentBallsCount >= MAX_BALLS) {
            return;
        }

        const newBalls = [];
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];

            if (newBalls.length + balls.length > MAX_BALLS) {
                break;
            }

            const clone = {
                x: ball.x,
                y: ball.y,
                radius: ball.radius,
                color: "grey",
                vx: -ball.vx,
                vy: ball.vy,
                isClone: true
            };

            newBalls.push(clone);
        }

        newBalls.forEach(nBall => {
            balls.push(nBall);
        })
    }
}