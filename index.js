let blocksWithOne = [];
let blocksWithTwo = [];
let blockWidth = 58;
let blockHeight = 30;
let platform = null;
let ball = null;
let boosts = [];
let blockID = null;
let counter = null;
let stringCount = '';

let keys = {
    left: false,
    right: false
}

let gameStarted = false;
let winState = false;

let canvas = null;
let ctx = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
    const hero = document.querySelector(".hero");
    const button = document.querySelector(".hero-button");
    counter = document.querySelector(".counter");

    // if (!gameStarted) {
    //     button.addEventListener('click', () => {
    //         hero.style.animation = "fadeOut linear 1s"
    //         setTimeout(() => {
    //             hero.style.display = "none";
    //             canvasStart();
    //         }, 1000);
    //     });
    // }

    canvasStart();
}

function canvasStart() {
    canvas = document.getElementById("canvas");

    canvas.style.animation = "fadeIn linear 0.5s forwards";
    setTimeout(() => {
        canvas.style.display = "flex";
    }, 500);

    canvas.width = 900;
    canvas.height = 600;
    ctx = canvas.getContext('2d');

    platform = {
        x: canvas.width / 2 - 60,
        y: canvas.height - 50,
        width: 120,
        height: 30,
        color: "black",
        speed: 10
    };

    ball = {
        x: platform.x + platform.width / 2,
        y: platform.y - platform.height,
        radius: 20,
        color: "red",
        vx: 0,
        vy: 0
    };

    drawBlocks(canvas);
    setupControls();

    gameLoop();
}

function gameLoop() {
    updateDesk();
    drawMainElements();

    requestAnimationFrame(gameLoop);
}

function drawBlocks(canvas) {
    let floor = 100;
    for (let i = 0; i < canvas.width - 30; i += 60) {
        blocksWithTwo.push({
            x: i,
            y: 100,
            width: blockWidth,
            height: blockHeight,
            color: "black",
            hits: 0
        });

        if (floor <= 260) {
            for (let j = 0; j < canvas.width - 30; j += 60) {
                blocksWithOne.push({
                    x: j,
                    y: floor + 40,
                    width: blockWidth,
                    height: blockHeight,
                    color: "green"
                });
            }
        }

        floor += 40;
    }
}

function drawMainElements() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);

    ctx.beginPath();
    ctx.fillStyle = ball.color;
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    blocksWithOne.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });

    blocksWithTwo.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });
}

function updateDesk() {
    if (keys.left && platform.x > 0) {
        platform.x -= platform.speed;
    }

    if (keys.right && (platform.x + platform.width) < canvas.width) {
        platform.x += platform.speed;
    }

    if (!gameStarted) {
        ball.x = platform.x + platform.width / 2;
    } else {
        updateBall();
    }
}

function setupControls() {
    document.addEventListener('keydown', (e) => {
        if (e.key == "A" || e.key == "a" || e.key == "ф" || e.key == "Ф" || e.key == "ArrowLeft") {
            e.preventDefault();
            keys.left = true;
        }

        if (e.key == "D" || e.key == "d" || e.key == "В" || e.key == "в" || e.key == "ArrowRight") {
            e.preventDefault();
            keys.right = true;
        }

        if (e.key == ' ') {

            if (!gameStarted) {
                gameStarted = true;
                ball.vx = 5;
                ball.vy = -5;
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key == "A" || e.key == "a" || e.key == "ф" || e.key == "Ф" || e.key == "ArrowLeft") {
            keys.left = false;
        }

        if (e.key == "D" || e.key == "d" || e.key == "В" || e.key == "в" || e.key == "ArrowRight") {
            keys.right = false;
        }
    });
}

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    ballAndBorts();
    ballAndBlocks();

}

function ballAndBorts() {
    if (ball.x >= canvas.width - 20) {
        ball.vx = -ball.vx;
        ball.x = canvas.width - 20;
    }
    if (ball.x <= 20) {
        ball.vx = -ball.vx;
        ball.x = 20;
    }

    if (ball.y <= 20) {
        ball.vy = -ball.vy;
        ball.y = 20;
    }

    if (blocksWithOne.length !== 0 || blocksWithTwo.length !== 0) {
    }

    if (ball.y + ball.radius / 2 >= platform.y
        && ball.x + ball.radius / 2 > platform.x
        && ball.x - ball.radius / 2 < platform.x + platform.width) {

        ball.vy = -ball.vy;
        ball.y = platform.y - ball.radius;

    }

    if (ball.y + ball.radius >= canvas.height) {
        gameStarted = false;
        ball.vx = 0;
        ball.vy = 0;
        ball.x = platform.x + platform.width / 2;
        ball.y = platform.y - platform.height;
    }
}

function ballAndBlocks() {
    for (let i = blocksWithOne.length - 1; i >= 0; i--) {
        const block = blocksWithOne[i];

        if (ball.x + ball.radius > block.x
            && ball.x - ball.radius < block.x + block.width
            && ball.y + ball.radius > block.y
            && ball.y - ball.radius < block.y + block.height
        ) {
            let ballCenterX = ball.x;
            let ballCenterY = ball.y;

            let blockCenterX = block.x + block.width / 2;
            let blockCenterY = block.y + block.height / 2;

            let dx = ballCenterX - blockCenterX;
            let dy = ballCenterY - blockCenterY;

            if (Math.abs(dx) / block.width > Math.abs(dy) / block.height) {
                ball.vx = -ball.vx;
            } else {
                ball.vy = -ball.vy;
            }

            blocksWithOne.splice(i, 1);
            break;
        }
    }

    for (let i = blocksWithTwo.length - 1; i >= 0; i--) {
        const block = blocksWithTwo[i];

        if (ball.x + ball.radius > block.x
            && ball.x - ball.radius < block.x + block.width
            && ball.y + ball.radius > block.y
            && ball.y - ball.radius < block.y + block.height
        ) {
            let ballCenterX = ball.x;
            let ballCenterY = ball.y;

            let blockCenterX = block.x + block.width / 2;
            let blockCenterY = block.y + block.height / 2;

            let dx = ballCenterX - blockCenterX;
            let dy = ballCenterY - blockCenterY;

            if (Math.abs(dx) / block.width > Math.abs(dy) / block.height) {
                ball.vx = -ball.vx;
            } else {
                ball.vy = -ball.vy;
            }

            block.hits += 1;

            if (block.hits === 2) {
                blocksWithTwo.splice(i, 1);
            }
        }
    }
}

function randomBoosts() {

}