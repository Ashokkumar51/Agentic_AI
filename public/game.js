// ===== BASIC HEXTRIS ENGINE (separated from HTML) =====

// canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);
}
window.addEventListener("resize", resize);
resize();

let rotation = 0;
let targetRotation = 0;
let score = 0;

let autoRotation = 0;        // current automatic spin
let autoRotationSpeed = 0;   // speed depends on level
let level = 1;               // game level


let difficulty = "MEDIUM";
let gameSpeed = 2; // default




document.addEventListener("keydown", e => {
    if (e.code === "ArrowLeft") targetRotation--;
    if (e.code === "ArrowRight") targetRotation++;
});

function drawHex(x, y, r, rot, color) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI * 2) / 6;
        ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function draw() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);
    const cx = w / 2, cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // player rotation smoothing
    rotation += (targetRotation - rotation) * 0.15;

    // ===== LEVEL BASED AUTO ROTATION =====
    level = Math.floor(score / 1000) + 1;
    autoRotationSpeed = Math.min(0.002 * level, 0.04);
    autoRotation += autoRotationSpeed;

    // combine rotations
    const finalRotation = rotation + autoRotation;

    // DRAW HEXAGON USING FINAL ROTATION
    drawHex(cx, cy, 80, finalRotation, "#252a34");
    drawHex(cx, cy, 75, finalRotation, "#0f0c29");
}



function setDifficulty(level) {

    difficulty = level;

    document.querySelectorAll(".diff-btn").forEach(b => b.classList.remove("active"));
    event.target.classList.add("active");

    if (level === "LOW") gameSpeed = 1;
    if (level === "MEDIUM") gameSpeed = 2;
    if (level === "HARD") gameSpeed = 3.5;
}

function updateLevel() {

    // example level rule (you can connect to real scoring later)
    level = Math.floor(score / 1000) + 1;

    // Auto spin speed increases each level
    autoRotationSpeed = Math.min(0.002 * level, 0.04);
}


function loop() {

    updateLevel(); // <-- ADD THIS

    draw();
    requestAnimationFrame(loop);
}
loop();

// ===== UI =====
function startGame(mode) {
    document.getElementById("mode-select").classList.add("hidden");
}

function showMainMenu() {
    document.getElementById("overlay").classList.add("hidden");
    document.getElementById("mode-select").classList.remove("hidden");
}

function setDifficulty(d) { }
function openLobby() { }
