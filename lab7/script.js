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


let gunmanState = 'idle';
let gunmanX = 800;
let gunmanY = 224;
let gunmanWidth = 128;
let gunmanHeight = 256;
let currentFrame = 0;
let frameCount = 0;
let animationSpeed = 10;
let walkBackStartTime = 0;
let walkStartTime = 0;


const walkDistance = 800 - 340;
const walkDuration = 5000;
const walkSpeed = walkDistance / walkDuration;
const walkBackDistance = 340;
const walkBackDuration = walkBackDistance / walkSpeed;


const spriteSheet = new Image();
spriteSheet.src = 'img/gunman.png';
spriteSheet.onload = () => {
    spriteLoaded = true;
    console.log('Gunman sprite loaded successfully');
};
spriteSheet.onerror = () => {
    console.error('Failed to load gunman sprite');
};


const enemies = [

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
    walkStartTime = performance.now();
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
    hasWonOnce = false;
    playerShot = false;
    enemyShot = false;
}

function restartGame() {

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
    winScreen.style.display = 'none';
    gunmanState = 'idle';
    gunmanX = 800;
    currentFrame = 0;
    frameCount = 0;
    message.className = 'message';
    message.textContent = '';
    restartButton.style.display = 'none';
    nextLevelButton.style.display = 'none';
    backToMenuButton.style.display = 'none';
    gameMenu.style.display = 'block';
    timerStopped = false;
    hasWonOnce = false;
    playerShot = false;
    enemyShot = false;
    walkBackStartTime = 0;
    walkStartTime = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


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
        backToMenuButton.style.display = 'block';
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
    walkStartTime = performance.now();
    currentFrame = 0;
    frameCount = 0;
    message.className = 'message';
    message.textContent = '';
    restartButton.style.display = 'none';
    nextLevelButton.style.display = 'none';
    timeYou.textContent = '0.00';
    timeGunman.textContent = '0.00';
    timerStopped = false;
}


function moveGunman() {
    if (gameState === 'countdown') {
        gunmanState = 'standing';
        gunmanX = 340;
        currentFrame = 0;
        frameCount = 0;
        setTimeout(prepareForDuel, 1000);
    }
}


function prepareForDuel() {
    if (gameState === 'countdown') {
        gameState = 'duel';
        gunmanState = 'ready';
        currentFrame = 0;
        frameCount = 0;
        message.className = 'message message--fire';
        startTime = performance.now();
        sounds.wait.play();

        let minTime, maxTime;
        minTime = 1000 / level;
        maxTime = 2000 / level;
        gunmanTime = Math.random() * (maxTime - minTime) + minTime;
        timeGunman.textContent = (gunmanTime / 1000).toFixed(2);
        setTimeout(gunmanShootsPlayer, gunmanTime);
    }
}


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
        }, 1000);
    }
}


function playerShootsGunman(e) {
    if (gameState !== 'duel' || playerShot) return;
    sounds.shot.play();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;


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


function drawGunman() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gunmanState === 'idle') return;
    let enemy = enemies[isEndless ? enemyType : (level-1) % enemies.length];
    const frames = enemy[gunmanState];
    const frame = frames[currentFrame];


    ctx.drawImage(
        spriteSheet,
        frame, enemy["coordinateY"],
        enemy["width"][gunmanState], enemy["height"],
        gunmanX, 250 - enemy["height"],
        4 * enemy["width"][gunmanState], 4 * enemy["height"]
    );


    frameCount++;
    if (frameCount >= 60 / animationSpeed) {
        frameCount = 0;
        currentFrame++;
        if (currentFrame >= frames.length) {
            if (gunmanState === 'death' || gunmanState === 'shooting') {
                currentFrame = frames.length - 1;
            } else {
                currentFrame = 0;
            }
        }
    }
}

function shut(){
    Object.values(sounds).forEach(function(sound){
        sound.pause();
        sound.currentTime = 0;
    });
}


function gameLoop() {
    if (gameState === 'countdown') {
        countdownTime -= 1 / 60;

        if (gunmanState === 'walk') {
            sounds.intro.play();
            const elapsed = performance.now() - walkStartTime;
            const progress = Math.min(elapsed / walkDuration, 1);
            gunmanX = 800 - (800 - 340) * progress;
            if (progress >= 1) {
                moveGunman();
            }
        }
    } else if (gameState === 'duel' || gameState === 'result') {
        timeCounter();
        if (gunmanState === 'walk') {
            const elapsed = performance.now() - walkBackStartTime;
            const progress = Math.min(elapsed / walkBackDuration, 1);
            gunmanX = 340 - (340) * progress;
            if (progress === 1) {
                gunmanState = 'idle';
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


startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);
nextLevelButton.addEventListener('click', nextLevel);
backToMenuButton.addEventListener('click', restartGame);
canvas.addEventListener('click', playerShootsGunman);
endlessButton.addEventListener('click', startEndless);

gameLoop();