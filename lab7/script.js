'use strict';

const gameMenu = document.querySelector('.game-menu');
const startButton = document.querySelector('.button-start-game');
const endlessButton = document.querySelector('.button-start-endless');
const wrapper = document.querySelector('.wrapper');
const gameScreen = document.querySelector('.game-screen');
const canvas = document.getElementById('gunmanCanvas');
const ctx = canvas.getContext('2d');
const message = document.querySelector('.message');
const restartButton = document.querySelector('.button-restart');
const nextLevelButton = document.querySelector('.button-next-level');
const winScreen = document.querySelector('.win-screen');
const backToMenuButton = document.querySelector('.button-back-to-menu');
const scoreNum = document.querySelector('.score-panel__score_num');
const levelDisplay = document.querySelector('.score-panel__level');
const timeYou = document.querySelector('.time-panel__you');
const timeGunman = document.querySelector('.time-panel__gunman');
const gamePanels = document.querySelector('.game-panels');
const endlessScorePanel = document.querySelector('.score-panel__endless-score');
const campaignScorePanel = document.querySelector('.score-panel__final-score');
const resultScorePanel = document.querySelector('.win-screen .score-panel .score-panel__final-score');

let gameState = 'menu';
let countdownTime = 0;
let playerShot = false;
let enemyShot = false;
let score = 0;
let level = 1;
let playerTime = 0;
let gunmanTime = 0;
let startTime = 0;
let spriteLoaded = false;
let timerStopped = false;
let hasWonOnce = false;
let walkBackTimeout = null;
let isEndless = false;
let enemyType = 0;
let endlessScore = 0;
let campaignScore = 0;

// Gunman animation states
let gunmanState = 'idle';
let gunmanX = 800;
let gunmanY = 224; // 480 (canvas height) - 256 (gunman height)
let gunmanWidth = 128; // 32 * 4 (scaled)
let gunmanHeight = 256; // 64 * 4 (scaled)
let currentFrame = 0;
let frameCount = 0;
let animationSpeed = 10; // Frames per second (adjustable)
let walkBackStartTime = 0; // Track when walkBack starts
let walkStartTime = 0; // Track when walk starts

// Movement speeds
const walkDistance = 800 - 340; // 460px
const walkDuration = 5000; // 5 seconds
const walkSpeed = walkDistance / walkDuration; // 92px/s
const walkBackDistance = 340; // 340px
const walkBackDuration = walkBackDistance / walkSpeed; // ~3.7 seconds

// Sprite sheet data
const spriteSheet = new Image();
spriteSheet.src = 'img/gunman.png';
spriteSheet.onload = () => {
    spriteLoaded = true;
    console.log('Gunman sprite loaded successfully');
};
spriteSheet.onerror = () => {
    console.error('Failed to load gunman sprite');
};

// Animation frames for each state
const enemies = [
    // enemy 1
    {
        walk: [0, 33, 66],
        standing: [100],
        ready: [202],
        shooting: [236, 270, 236, 304],
        death: [338, 372, 404, 6000],
        width: {
            walk: 32,
            standing: 32,
            ready: 32,
            shooting: 32,
            death: 32
        },
        height: 64,
        coordinateY: 0
    },
    // enemy 2
    {
        walk: [0, 34, 68],
        standing: [208],
        ready: [102],
        shooting: [132, 158, 132, 184],
        death: [208, 239, 6000],
        width: {
            walk: 32,
            standing: 30,
            ready: 28,
            shooting: 24,
            death: 30
        },
        height: 72,
        coordinateY: 68
    },
    // enemy 3
    {
        walk: [0, 28, 56],
        standing: [174],
        ready: [84],
        shooting: [114, 144, 114, 174],
        death: [206, 238, 6000],
        width: {
            walk: 26,
            standing: 30,
            ready: 29,
            shooting: 29,
            death: 26
        },
        height: 80,
        coordinateY: 144
    },
    // enemy 4
    {
        walk: [0, 34, 68],
        standing: [201],
        ready: [102],
        shooting: [135, 168, 135, 201],
        death: [234, 268, 6000],
        width: {
            walk: 32,
            standing: 32,
            ready: 32,
            shooting: 32,
            death: 32
        },
        height: 64,
        coordinateY: 228
    },
    // enemy 5
    {
        walk: [0, 34, 68],
        standing: [195],
        ready: [102],
        shooting: [133, 164, 195],
        death: [226, 260, 292, 6000],
        width: {
            walk: 32,
            standing: 30,
            ready: 30,
            shooting: 30,
            death: 24
        },
        height: 69,
        coordinateY: 295
    }
];

// Sounds
const sounds = {
    intro: new Audio("sfx/intro.m4a"),
    win: new Audio("sfx/win.m4a"),
    fire: new Audio("sfx/fire.m4a"),
    death: new Audio("sfx/death.m4a"),
    foul: new Audio("sfx/foul.m4a"),
    shot: new Audio("sfx/shot.m4a"),
    shotFall: new Audio("sfx/shot-fall.m4a"),
    wait: new Audio("sfx/wait.m4a")
}

// Start game
function startGame() {
    if (!spriteLoaded) {
        console.warn('Sprite not loaded yet, waiting...');
        setTimeout(startGame, 100);
        return;
    }
    enemyType = Math.floor(Math.random() * enemies.length);
    gameMenu.style.display = 'none';
    wrapper.style.display = 'block';
    gamePanels.style.display = 'block';
    gameScreen.style.display = 'block';
    gameState = 'countdown';
    countdownTime = 3 + Math.random() * 2;
    gunmanState = 'walk';
    gunmanX = 800;
    walkStartTime = performance.now(); // Track start time of walk
    currentFrame = 0;
    frameCount = 0;
    scoreNum.textContent = score;
    levelDisplay.textContent = `Level ${level}`;
    timeYou.textContent = '0.00';
    timeGunman.textContent = '0.00';
    message.className = 'message';
    restartButton.style.display = 'none';
    nextLevelButton.style.display = 'none';
    timerStopped = false;
    hasWonOnce = false; // Reset on game start
    playerShot = false; // Reset shot state
    enemyShot = false; // Reset shot state
}

// Restart game
function restartGame() {
    // Clear any pending timeouts
    if (walkBackTimeout) {
        clearTimeout(walkBackTimeout);
        walkBackTimeout = null;
    }
    shut();
    campaignScorePanel.textContent = "Campaign score: " + campaignScore;
    endlessScorePanel.textContent = "Endless score: " + endlessScore;
    score = 0;
    level = 1;
    scoreNum.textContent = score;
    levelDisplay.textContent = `Level ${level}`;
    isEndless = false;
    gameState = 'menu';
    gameScreen.className = 'game-screen';
    wrapper.style.display = 'none';
    gamePanels.style.display = 'none';
    gameScreen.style.display = 'none';
    winScreen.style.display = 'none'; // Hide win screen
    gunmanState = 'idle';
    gunmanX = 800;
    currentFrame = 0;
    frameCount = 0;
    message.className = 'message';
    message.textContent = '';
    restartButton.style.display = 'none';
    nextLevelButton.style.display = 'none';
    backToMenuButton.style.display = 'none'; // Hide back to menu button
    gameMenu.style.display = 'block';
    timerStopped = false;
    hasWonOnce = false;
    playerShot = false; // Reset shot state
    enemyShot = false; // Reset shot state
    walkBackStartTime = 0; // Reset walk back time
    walkStartTime = 0; // Reset walk start time
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Next level
function nextLevel() {
    level++;
    if (level > 5 && !isEndless) {
        gunmanState = 'idle';
        gameState = 'win';
        wrapper.style.display = 'none';
        gamePanels.style.display = 'none';
        gameScreen.style.display = 'none';
        winScreen.style.display = 'block';
        let newRecord = score > campaignScore;
        campaignScore = score > campaignScore ? score : campaignScore;
        resultScorePanel.textContent = "Your score: " + score;
        resultScorePanel.innerHTML += newRecord ? "<br> New Record!!!" : "";
        backToMenuButton.style.display = 'block'; // Show back to menu button
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }
    enemyType = Math.floor(Math.random() * enemies.length);
    levelDisplay.textContent = `Level ${level}`;
    gameState = 'countdown';
    countdownTime = 3 + Math.random() * 2;
    playerShot = false;
    enemyShot = false;
    gunmanState = 'walk';
    gunmanX = 800;
    walkStartTime = performance.now(); // Reset walk start time
    currentFrame = 0;
    frameCount = 0;
    message.className = 'message'; // Reset message class
    message.textContent = ''; // Clear message text
    restartButton.style.display = 'none';
    nextLevelButton.style.display = 'none';
    timeYou.textContent = '0.00';
    timeGunman.textContent = '0.00';
    timerStopped = false;
}

// Move gunman
function moveGunman() {
    if (gameState === 'countdown') {
        gunmanState = 'standing';
        gunmanX = 340;
        currentFrame = 0;
        frameCount = 0;
        setTimeout(prepareForDuel, 1000);
    }
}

// Prepare for duel
function prepareForDuel() {
    if (gameState === 'countdown') {
        gameState = 'duel';
        gunmanState = 'ready';
        currentFrame = 0;
        frameCount = 0;
        message.className = 'message message--fire';
        startTime = performance.now();
        sounds.wait.play();
        // Adjust gunman reaction time based on level
        let minTime, maxTime;
        minTime = 1000 / level;
        maxTime = 2000 / level;
        gunmanTime = Math.random() * (maxTime - minTime) + minTime;
        timeGunman.textContent = (gunmanTime / 1000).toFixed(2);
        setTimeout(gunmanShootsPlayer, gunmanTime);
    }
}

// Time counter
function timeCounter() {
    if (gameState === 'duel' && !timerStopped) {
        const currentTime = performance.now();
        playerTime = (currentTime - startTime) / 1000;
        timeYou.textContent = playerTime.toFixed(2);
    } else if (gameState === 'result' && !timerStopped) {
        const currentTime = performance.now();
        playerTime = (currentTime - startTime) / 1000;
        timeYou.textContent = playerTime.toFixed(2);
        timerStopped = true;
    }
}

// Gunman shoots player
function gunmanShootsPlayer() {
    if (gameState === 'duel' && !playerShot) {
        shut();
        sounds.shot.play();
        sounds.death.play();
        enemyShot = true;
        gameState = 'result';
        gunmanState = 'shooting';
        currentFrame = 0;
        frameCount = 0;
        message.className = 'message message--dead';
        message.textContent = 'You Lose!';
        gameScreen.className = 'game-screen game-screen--death';
        if(isEndless){
            endlessScore = score > endlessScore ? score : endlessScore;
            endlessScorePanel.textContent = "Endless score: " + endlessScore;
        }
        else{
            campaignScore = score > campaignScore ? score : campaignScore;
            campaignScorePanel.textContent = "Campaign score: " + campaignScore;
        }
        restartButton.style.display = 'block';
        timeCounter();
        walkBackTimeout = setTimeout(() => {
            gunmanState = 'walk';
            walkBackStartTime = performance.now();
        }, 1000); // Start walking left after 1 second
    }
}

// Player shoots gunman
function playerShootsGunman(e) {
    if (gameState !== 'duel' || playerShot) return;
    sounds.shot.play();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if click is within gunman bounds
    if (
        mouseX >= gunmanX &&
        mouseX <= gunmanX + gunmanWidth &&
        mouseY >= gunmanY &&
        mouseY <= gunmanY + gunmanHeight
    ) {
        playerShot = true;
        timeCounter();
        timerStopped = true;
        if (!enemyShot) {
            sounds.win.play();
            gameState = 'result';
            gunmanState = 'death';
            currentFrame = 0;
            frameCount = 0;
            // Show "You Win!" only on the first victory
            if (!hasWonOnce) {
                message.className = 'message message--win';
                message.textContent = 'You Win!';
                hasWonOnce = true;
            }
            score += Math.floor(10 * level + (gunmanTime - playerTime)) ;
            scoreNum.textContent = score;
            nextLevelButton.style.display = 'block';
            sounds.shotFall.play();
        }
    }
}

// Draw gunman animation
function drawGunman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    if (gunmanState === 'idle') return;
    let enemy = enemies[isEndless ? enemyType : (level-1) % enemies.length];
    const frames = enemy[gunmanState];
    const frame = frames[currentFrame];

    // Draw the current frame
    ctx.drawImage(
        spriteSheet, // Image
        frame, enemy["coordinateY"], // Source x, y
        enemy["width"][gunmanState], enemy["height"], // Source width, height
        gunmanX, 250 - enemy["height"], // Destination x, y
        4 * enemy["width"][gunmanState], 4 * enemy["height"] // Destination width, height
    );

    // Update frame
    frameCount++;
    if (frameCount >= 60 / animationSpeed) {
        frameCount = 0;
        currentFrame++;
        if (currentFrame >= frames.length) {
            if (gunmanState === 'death' || gunmanState === 'shooting') {
                currentFrame = frames.length - 1; // Stay on last frame
            } else {
                currentFrame = 0; // Loop animation
            }
        }
    }
}

// Shut sounds
function shut(){
    Object.values(sounds).forEach(function(sound){
        sound.pause();
        sound.currentTime = 0;
    });
}

// Game loop
function gameLoop() {
    if (gameState === 'countdown') {
        countdownTime -= 1 / 60;
        // Smooth movement during "walk" (from right to left)
        if (gunmanState === 'walk') {
            sounds.intro.play();
            const elapsed = performance.now() - walkStartTime;
            const progress = Math.min(elapsed / walkDuration, 1);
            gunmanX = 800 - (800 - 340) * progress; // Move from 800 to 340
            if (progress >= 1) {
                moveGunman(); // Call moveGunman when walk is complete
            }
        }
    } else if (gameState === 'duel' || gameState === 'result') {
        timeCounter();
        if (gunmanState === 'walk') {
            const elapsed = performance.now() - walkBackStartTime;
            const progress = Math.min(elapsed / walkBackDuration, 1); // Adjusted duration for consistent speed
            gunmanX = 340 - (340) * progress; // Move from 340 to 0
            if (progress === 1) {
                gunmanState = 'idle'; // Stop at the left side
            }
        }
    }
    drawGunman();
    requestAnimationFrame(gameLoop);
}

function startEndless(){
    isEndless = true;
    startGame();
}

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
nextLevelButton.addEventListener('click', nextLevel);
backToMenuButton.addEventListener('click', restartGame);
canvas.addEventListener('click', playerShootsGunman);
endlessButton.addEventListener('click', startEndless);
// Start game loop
gameLoop();