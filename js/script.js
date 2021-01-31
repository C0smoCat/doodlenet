let clearButton;
let canvas;
let ctx;

let classifier;
let statusLabel;
let lineWidth = 20;

const mouse = {
    isPressed: false,
    x: 0,
    y: 0,
    px: 0,
    py: 0
};

function main() {
    canvas = document.getElementById("canvas");
    document.getElementById("clearButton").addEventListener("click", resetCanvas);
    document.getElementById("lineWidth").addEventListener("input", e => {
        lineWidth = e.target.value || 16;
    });
    statusLabel = document.getElementById("status");

    ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    console.log(`ml5 version: ${ ml5.version }`);
    statusLabel.innerText = "Создание модели...";
    classifier = ml5.imageClassifier("DoodleNet", onModelReady);

    requestAnimationFrame(draw);
}

function onMouseDown(e) {
    if (e.button === 0) {
        const x = e.offsetX || e.layerX;
        const y = e.offsetY || e.layerY;

        mouse.x = mouse.px = x;
        mouse.y = mouse.py = y;
        mouse.isPressed = true;
    }
}

function onMouseMove(e) {
    if (e.button === 0 && mouse.isPressed) {
        const x = e.offsetX || e.layerX;
        const y = e.offsetY || e.layerY;

        mouse.px = mouse.x;
        mouse.py = mouse.y;
        mouse.x = x;
        mouse.y = y;
    }
}

function onMouseUp(e) {
    mouse.isPressed = false;
    classifyCanvas();
}

function onModelReady() {
    console.log("model loaded");
    resetCanvas();
}

function classifyCanvas() {
    statusLabel.innerText = "Это похоже на...";
    classifier.classify(canvas, gotResults);
}

function gotResults(error, results) {
    let content;
    if (error) {
        content = error;
        console.error(error);
    } else {
        content = results
            .map(result => `${ result.label }: ${ Math.round(100 * result.confidence) }%`)
            .join("\n");
    }
    statusLabel.innerText = content;
}

function resetCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    statusLabel.innerText = "Нарисуйте что-нибудь";
}

function draw() {
    if (mouse.isPressed) {
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.moveTo(mouse.px, mouse.py);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }
    requestAnimationFrame(draw);
}

addEventListener("load", main);
