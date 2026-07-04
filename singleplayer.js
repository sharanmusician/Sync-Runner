import { state, ui, draw } from './config.js';

export function initSinglePlayer() {
    state.players = {};
    state.players[state.myId] = { id: state.myId, name: "PLAYER", x: 50, y: 200, score: 0, isDead: false };
    state.obstacleX = 800;
    state.myY = state.groundY;
    state.velocity = 0;
    state.myScore = 0;
    state.myIsDead = false;
    state.isGameRunning = true;
    ui.statusText.innerText = "SINGLE PLAYER";
    ui.mobileHint.classList.remove('hidden');
    singlePlayerLoop();
}

function singlePlayerLoop() {
    if (!state.isGameRunning || state.isMultiplayerMode) return;

    state.velocity += state.gravity;
    state.myY += state.velocity;
    if (state.myY > state.groundY) { state.myY = state.groundY; state.velocity = 0; }
    state.myScore++;

    state.obstacleX -= 5;
    if (state.obstacleX < -30) state.obstacleX = 800 + Math.random() * 150;

    state.players[state.myId].y = state.myY;
    state.players[state.myId].score = state.myScore;

    if (state.obstacleX < 70 && state.obstacleX > 30 && state.myY > 170) {
        state.isGameRunning = false;
        state.myIsDead = true;
        state.players[state.myId].isDead = true;
        ui.statusText.innerText = `GAME OVER! SCORE: ${state.myScore}`;
        ui.mobileHint.classList.add('hidden');
        ui.singleRestartBtn.classList.remove('hidden');
    }

    draw();
    if (state.isGameRunning) requestAnimationFrame(singlePlayerLoop);
}
