import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCAmVSx7u_qETnBwlmiQkcfXmGNpiYCRxM",
    authDomain: "sync-runner.firebaseapp.com",
    databaseURL: "https://sync-runner-default-rtdb.firebaseio.com",
    projectId: "sync-runner",
    storageBucket: "sync-runner.firebasestorage.app",
    messagingSenderId: "824002855664",
    appId: "1:824002855664:web:bc6183f533d742bac97835",
    measurementId: "G-5HL2ZL9M5N"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Shared Context Variables Object References
export const state = {
    roomCode: null,
    myId: Math.random().toString(36).substring(2, 9),
    players: {},
    obstacleX: 800,
    isGameRunning: false,
    isHost: false,
    isMultiplayerMode: false,
    myY: 200,
    velocity: 0,
    gravity: 0.65,
    jumpStrength: -13,
    groundY: 200,
    myScore: 0,
    myIsDead: false
};

// UI Cache Framework
export const ui = {
    modeMenu: document.getElementById('modeMenu'),
    singleBtn: document.getElementById('singleBtn'),
    multiBtn: document.getElementById('multiBtn'),
    menu: document.getElementById('menu'),
    gameContainer: document.getElementById('gameContainer'),
    createBtn: document.getElementById('createBtn'),
    joinBtn: document.getElementById('joinBtn'),
    nameInput: document.getElementById('nameInput'),
    roomInput: document.getElementById('roomInput'),
    displayCode: document.getElementById('displayCode'),
    roomDisplayArea: document.getElementById('roomDisplayArea'),
    statusText: document.getElementById('statusText'),
    readyBtn: document.getElementById('readyBtn'),
    rematchBtn: document.getElementById('rematchBtn'),
    singleRestartBtn: document.getElementById('singleRestartBtn'),
    mobileHint: document.getElementById('mobileHint'),
    canvas: document.getElementById('gameCanvas'),
    ctx: document.getElementById('gameCanvas').getContext('2d')
};

// Common rendering pipeline call shared across loops
export function draw() {
    const { ctx, canvas } = ui;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#374151'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 230); ctx.lineTo(canvas.width, 230); ctx.stroke();

    ctx.fillStyle = '#ef4444'; ctx.shadowBlur = 10; ctx.shadowColor = '#ef4444';
    ctx.fillRect(state.obstacleX, 190, 22, 40);

    Object.values(state.players).forEach(p => {
        const isMe = p.id === state.myId;
        ctx.fillStyle = isMe ? '#6366f1' : '#10b981';
        ctx.shadowColor = isMe ? '#6366f1' : '#10b981';
        ctx.shadowBlur = p.isDead ? 0 : 12;

        const renderingName = p.name ? p.name : "PLAYER";

        if (!p.isDead) {
            ctx.fillRect(isMe ? 50 : 90, p.y, 22, 30);
            ctx.fillStyle = '#9ca3af'; ctx.shadowBlur = 0; ctx.font = 'bold 11px sans-serif';
            ctx.fillText(`${renderingName}: ${p.score}`, (isMe ? 50 : 90) - 10, p.y - 12);
        } else {
            ctx.strokeStyle = isMe ? 'rgba(99, 102, 241, 0.25)' : 'rgba(16, 185, 129, 0.25)';
            ctx.shadowBlur = 0; ctx.strokeRect(isMe ? 50 : 90, 210, 22, 20);
        }
    });
    ctx.shadowBlur = 0;
}
