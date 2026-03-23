const blocksWithOne = [];
const blocksWithTwo = [];

document.addEventListener('DOMContentLoaded', init);

function init() {
    const hero = document.querySelector(".hero");
    const button = document.querySelector(".hero-button");

    button.addEventListener('click', () => {
        hero.style.animation = "fadeOut linear 1s"
        setTimeout(() => {
            hero.style.display = "none";
            canvasStart();
        }, 1000);
    });
}

function canvasStart() {
    let canvas = document.getElementById("canvas");
    canvas.style.animation = "fadeIn linear 0.5s forwards";
    setTimeout(() => {
        canvas.style.display = "flex";
    }, 500);
    canvas.width = 900;
    canvas.height = 600;
    
    let ctx = canvas.getContext('2d');
    createBlocks();
    drawBlocks(ctx);
}

function createBlocks() {
    let floor = 100;
    for (let i = 0; i < 870; i+=60) {
        blocksWithTwo.push({
            x: i,
            y: 100,
            width: 58,
            height: 30,
            color: "black",
            hits: 0
        });

        if (floor <= 260) {
            for (let j = 0; j < 870; j+=60) {
                blocksWithOne.push({
                    x: j,
                    y: floor + 40,
                    width: 58,
                    height: 30,
                    color: "green"
                });
            }
        }

        floor += 40;
    }
}

function drawBlocks(ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    blocksWithTwo.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });

    blocksWithOne.forEach(block => {
        ctx.fillStyle = block.color;
        ctx.fillRect(block.x, block.y, block.width, block.height);
    });

}