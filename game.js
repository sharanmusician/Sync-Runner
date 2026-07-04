// public/game.js
const socket = io();

const menu = document.getElementById('menu');
const gameContainer = document.getElementById('gameContainer');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const roomInput = document.getElementById('roomInput');
const displayCode = document.getElementById('displayCode');
const statusText = document.getElementById('statusText');
const readyBtn = document.getElementById('readyBtn');
const mobileHint = document.getElementById('mobileHint');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let roomCode = null;
let myId = null;
let players = [];
let obstacleX = 800;
let isGameRunning = false;

// Physics / Dino Properties adapted for the updated canvas height (250)
let myY = 200;
let velocity = 0;
const gravity = 0.65; // Slightly heavier fall for sharper controls
const jumpStrength = -13;
const groundY = 200;
let myScore = 0;
let myIsDead = false;

// UI Actions
createBtn.onclick = () => socket.emit('createRoom');
joinBtn.onclick = () => {
    const code = roomInput.value.trim();
    if(code) socket.emit('joinRoom', code);
};
readyBtn.onclick = (e) => {
    e.stopPropagation(); // Prevents ready click from triggering a jump instantly
    socket.emit('playerReady', roomCode);
    readyBtn.classList.add('opacity-50', 'pointer-events-none');
    statusText.innerText = "Ready! Waiting...";
};

// --- MOBILE TOUCH CONTROLS ---
// Tapping anywhere on the window handles the jump
window.addEventListener('touchstart', handleJump, { passive: false });
// Backup desktop keyboard control just in case
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') handleJump(e);
});

function handleJump(e) {
    // Check if game is running, player is alive, and on the ground
    if (isGameRunning && !myIsDead && myY === groundY) {
        if(e.cancelable) e.preventDefault(); // Stop mobile scrolling bounce
        velocity = jumpStrength;
    }
}

// Socket Events
socket.on('roomCreated', (data) => initLobby(data.roomCode, data.playerId));
socket.on('roomJoined', (data) => initLobby(data.roomCode, socket.id));

socket.on('startGame', (startingPlayers) => {
    players = startingPlayers;
    myIsDead = false;
    myScore = 0;
    myY = groundY;
    velocity = 0;
    isGameRunning = true;
    readyBtn.classList.add('hidden');
    mobileHint.classList.remove('hidden');
    statusText.innerText = "🔴 LIVE MATCH";
    gameLoop();
});

socket.on('gameStateUpdate', (data) => { players = data.players; });
socket.on('obstacleSync', (data) => { obstacleX = data.obstacleX; });

socket.on('gameOver', (finalPlayers) => {
    isGameRunning = false;
    statusText.innerText = "Game Over!";
    mobileHint.classList.add('hidden');
    readyBtn.classList.remove('hidden', 'opacity-50', 'pointer-events-none');
});

socket.on('error', (msg) => alert(msg));

function initLobby(code, id) {
    roomCode = code;
    myId = id;
    menu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    readyBtn.classList.remove('hidden');
    displayCode.innerText = roomCode;
}

// Main Loop
function gameLoop() {
    if (!isGameRunning) return;

    if (!myIsDead) {
        velocity += gravity;
        myY += velocity;
        if (myY > groundY) {
            myY = groundY;
            velocity = 0;
        }
        myScore++;

        // Collision Logic matching new dimensions (Ground Y = 200, Player height = 30)
        if (obstacleX < 70 && obstacleX > 30 && myY > 170) {
            myIsDead = true;
            statusText.innerText = "Spectating opponent...";
        }
    }

    socket.emit('playerUpdate', { roomCode, y: myY, score: myScore, isDead: myIsDead });
    draw();
    requestAnimationFrame(gameLoop);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ground Line
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 230);
    ctx.lineTo(canvas.width, 230);
    ctx.stroke();

    // Red Neon Obstacle
    ctx.fillStyle = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ef4444';
    ctx.fillRect(obstacleX, 190, 22, 40);

    // Draw Players
    players.forEach(p => {
        const isMe = p.id === myId;
        ctx.fillStyle = isMe ? '#6366f1' : '#10b981';
        ctx.shadowColor = isMe ? '#6366f1' : '#10b981';
        ctx.shadowBlur = p.isDead ? 0 : 12;

        if (!p.isDead) {
            ctx.fillRect(p.x, p.y, 22, 30);
            
            // Scaled text markers
            ctx.fillStyle = '#9ca3af';
            ctx.shadowBlur = 0;
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(isMe ? `You: ${p.score}` : `Peer: ${p.score}`, p.x - 10, p.y - 12);
        } else {
            ctx.strokeStyle = isMe ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)';
            ctx.shadowBlur = 0;
            ctx.strokeRect(p.x, 210, 22, 20);
        }
    });
    ctx.shadowBlur = 0;
                                 }
