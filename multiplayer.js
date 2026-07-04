import { db, state, ui, draw } from './config.js';
import { ref, set, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

export function generateCode() { return Math.random().toString(36).substring(2, 6).toUpperCase(); }

export async function createRoom() {
    state.roomCode = generateCode();
    state.isHost = true;
    const roomRef = ref(db, `rooms/${state.roomCode}`);
    const initialData = {
        obstacleX: 800,
        gameStarted: false,
        players: {}
    };
    initialData.players[state.myId] = { id: state.myId, name: ui.nameInput.value.trim().toUpperCase(), x: 50, y: 200, score: 0, isDead: false, isReady: false, wantsRematch: false, role: 'host' };
    
    await set(roomRef, initialData);
    initLobby(state.roomCode);
    ui.statusText.innerText = "WAITING FOR OPPONENT...";
    listenToRoom();
}

export async function joinRoom(code) {
    if(!code) return;
    const roomRef = ref(db, `rooms/${code}`);
    const snapshot = await get(roomRef);
    if(!snapshot.exists()) { alert("Room not found!"); return; }
    
    const roomData = snapshot.val();
    if(Object.keys(roomData.players || {}).length >= 2) { alert("Room Full!"); return; }

    state.roomCode = code;
    state.isHost = false;
    await set(ref(db, `rooms/${state.roomCode}/players/${state.myId}`), { id: state.myId, name: ui.nameInput.value.trim().toUpperCase(), x: 50, y: 200, score: 0, isDead: false, isReady: false, wantsRematch: false, role: 'peer' });
    initLobby(state.roomCode);
    listenToRoom();
}

function initLobby(code) {
    ui.menu.classList.add('hidden');
    ui.gameContainer.classList.remove('hidden');
    ui.displayCode.innerText = code;
}

export function listenToRoom() {
    onValue(ref(db, `rooms/${state.roomCode}`), (snapshot) => {
        const data = snapshot.val();
        if (!data || !state.isMultiplayerMode) return;

        state.players = data.players || {};
        state.obstacleX = data.obstacleX;

        const playerIds = Object.keys(state.players);
        
        if (data.gameStarted === false && state.isGameRunning === false) {
            const activePlayersList = Object.values(state.players);
            if (activePlayersList.length === 2) {
                const myPlayerNode = state.players[state.myId];
                const opponentPlayerNode = activePlayersList.find(p => p.id !== state.myId);

                if (myPlayerNode && opponentPlayerNode) {
                    if (opponentPlayerNode.wantsRematch && !myPlayerNode.wantsRematch) {
                        ui.rematchBtn.classList.remove('hidden');
                        ui.rematchBtn.innerText = `${opponentPlayerNode.name} WANTS A REMATCH! TAP TO ACCEPT`;
                    } else if (!myPlayerNode.wantsRematch) {
                        ui.rematchBtn.classList.remove('hidden');
                        ui.rematchBtn.innerText = "REQUEST REMATCH";
                    }

                    if (myPlayerNode.wantsRematch && opponentPlayerNode.wantsRematch) {
                        ui.rematchBtn.classList.add('hidden');
                        ui.rematchBtn.classList.remove('opacity-50', 'pointer-events-none');
                        state.isGameRunning = true;
                        state.myIsDead = false;
                        state.myScore = 0;
                        state.myY = state.groundY;
                        ui.mobileHint.classList.remove('hidden');
                        ui.statusText.innerText = "🔴 LIVE MATCH";
                        if (state.isHost) {
                            update(ref(db, `rooms/${state.roomCode}`), { gameStarted: true });
                            activePlayersList.forEach(p => {
                                update(ref(db, `rooms/${state.roomCode}/players/${p.id}`), { wantsRematch: false, isDead: false, score: 0, y: 200 });
                            });
                        }
                        gameLoop();
                    }
                }
            }
        }

        if (playerIds.length === 2 && !state.isGameRunning && !data.gameStarted) {
            const allReady = Object.values(state.players).every(p => p.isReady);
            const myPlayerNode = state.players[state.myId];
            if (myPlayerNode && !myPlayerNode.isReady && !myPlayerNode.wantsRematch) {
                ui.readyBtn.classList.remove('hidden');
                ui.statusText.innerText = "PLAYER JOINED. READY UP!";
            }

            if (allReady) {
                state.isGameRunning = true;
                state.myIsDead = false;
                state.myScore = 0;
                state.myY = state.groundY;
                ui.readyBtn.classList.add('hidden');
                ui.mobileHint.classList.remove('hidden');
                ui.statusText.innerText = "🔴 LIVE MATCH";
                if(state.isHost) update(ref(db, `rooms/${state.roomCode}`), { gameStarted: true });
                gameLoop();
            }
        }

        if (data.gameStarted && Object.values(state.players).every(p => p.isDead) && state.isGameRunning) {
            state.isGameRunning = false;
            ui.statusText.innerText = "GAME OVER!";
            ui.mobileHint.classList.add('hidden');
            if(state.isHost) update(ref(db, `rooms/${state.roomCode}`), { gameStarted: false });
        }
    });
}

function gameLoop() {
    if (!state.isGameRunning || !state.isMultiplayerMode) return;

    if (!state.myIsDead) {
        state.velocity += state.gravity;
        state.myY += state.velocity;
        if (state.myY > state.groundY) { state.myY = state.groundY; state.velocity = 0; }
        state.myScore++;

        if (state.obstacleX < 70 && state.obstacleX > 30 && state.myY > 170) {
            state.myIsDead = true;
            ui.statusText.innerText = "SPECTATING OPPONENT...";
        }
    }

    update(ref(db, `rooms/${state.roomCode}/players/${state.myId}`), { y: state.myY, score: state.myScore, isDead: state.myIsDead });

    if (state.isHost) {
        let nextX = state.obstacleX - 5;
        if (nextX < -30) nextX = 800 + Math.random() * 150;
        update(ref(db, `rooms/${state.roomCode}`), { obstacleX: nextX });
    }

    draw();
    requestAnimationFrame(gameLoop);
                                        }
