import { state, ui } from './config.js';
import { initSinglePlayer } from './singleplayer.js';
import { createRoom, joinRoom } from './multiplayer.js';
import { ref, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { db } from './config.js';

// Intro Scene Sequencing Logic Execution
window.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashScreen');
    const company = document.getElementById('companyBrand');
    const gameTitle = document.getElementById('gameBrand');
    const mainApp = document.getElementById('appContent');
    
    setTimeout(() => company.classList.add('animate-intro-in'), 300);
    setTimeout(() => { company.classList.remove('animate-intro-in'); company.classList.add('animate-intro-out'); }, 1800);
    setTimeout(() => { company.classList.add('hidden'); gameTitle.classList.remove('hidden'); gameTitle.classList.add('animate-intro-in'); }, 2500);
    setTimeout(() => { gameTitle.classList.remove('animate-intro-in'); gameTitle.classList.add('animate-intro-out'); }, 4000);
    setTimeout(() => { 
        splash.classList.add('hidden'); 
        mainApp.classList.remove('hidden');
        setTimeout(() => mainApp.classList.remove('opacity-0'), 50);
    }, 4700);
});

// Navigation Mode Select Handlers
ui.singleBtn.onclick = () => {
    state.isMultiplayerMode = false;
    ui.modeMenu.classList.add('hidden');
    ui.gameContainer.classList.remove('hidden');
    ui.roomDisplayArea.classList.add('hidden');
    initSinglePlayer();
};

ui.multiBtn.onclick = () => {
    state.isMultiplayerMode = true;
    ui.modeMenu.classList.add('hidden');
    ui.menu.classList.remove('hidden');
};

// UI Element Interactions Hooks Setup
ui.createBtn.onclick = () => {
    if(!ui.nameInput.value.trim()) { alert("PLEASE ENTER YOUR NAME FIRST!"); return; }
    createRoom();
};

ui.joinBtn.onclick = () => {
    if(!ui.nameInput.value.trim()) { alert("PLEASE ENTER YOUR NAME FIRST!"); return; }
    joinRoom(ui.roomInput.value.trim().toUpperCase());
};

ui.readyBtn.onclick = (e) => {
    e.stopPropagation();
    set(ref(db, `rooms/${state.roomCode}/players/${state.myId}/isReady`), true);
    ui.readyBtn.classList.add('hidden');
    ui.statusText.innerText = "READY! WAITING FOR PEER...";
};

ui.rematchBtn.onclick = (e) => {
    e.stopPropagation();
    set(ref(db, `rooms/${state.roomCode}/players/${state.myId}/wantsRematch`), true);
    ui.rematchBtn.classList.add('opacity-50', 'pointer-events-none');
    ui.rematchBtn.innerText = "WAITING FOR OPPONENT...";
};

ui.singleRestartBtn.onclick = (e) => {
    e.stopPropagation();
    ui.singleRestartBtn.classList.add('hidden');
    initSinglePlayer();
};

window.addEventListener('touchstart', () => { 
    if(state.isGameRunning && !state.myIsDead && state.myY === state.groundY) {
        state.velocity = state.jumpStrength; 
    }
});
