
const lightRed = document.getElementById('light-red');
const lightYellow = document.getElementById('light-yellow');
const lightGreen = document.getElementById('light-green');

const statusDisplay = document.getElementById('status-display');
const btnNext = document.getElementById('btn-next');
const btnSettings = document.getElementById('btn-settings');

let times = {
    red: 5000,
    yellow: 3000,
    green: 7000
};

let currentTimer = null;
let blinkInterval = null;
let currentState = 'red';

function turnOffAll() {
    lightRed.classList.remove('active');
    lightYellow.classList.remove('active');
    lightGreen.classList.remove('active');
}

function switchState(newState) {

    clearTimeout(currentTimer);
    clearInterval(blinkInterval);
    turnOffAll();

    currentState = newState;

    switch (newState) {
        case 'red':
            lightRed.classList.add('active');
            statusDisplay.textContent = 'Червоний';
            statusDisplay.style.color = '#ff3333';

            currentTimer = setTimeout(() => switchState('yellow'), times.red);
            break;

        case 'yellow':
            lightYellow.classList.add('active');
            statusDisplay.textContent = 'Жовтий';
            statusDisplay.style.color = '#ffcc00';

            currentTimer = setTimeout(() => switchState('green'), times.yellow);
            break;

        case 'green':
            lightGreen.classList.add('active');
            statusDisplay.textContent = 'Зелений';
            statusDisplay.style.color = '#33cc33';

            currentTimer = setTimeout(() => switchState('blinking_yellow'), times.green);
            break;

        case 'blinking_yellow':
            statusDisplay.textContent = 'Миготливий Жовтий';
            statusDisplay.style.color = '#ffcc00';

            let blinks = 0;
            let isYellowOn = false;

            blinkInterval = setInterval(() => {
                if (isYellowOn) {
                    lightYellow.classList.remove('active');
                    blinks++;

                    if (blinks >= 3) {
                        clearInterval(blinkInterval);
                        switchState('red');
                    }
                } else {
                    lightYellow.classList.add('active');
                }
                isYellowOn = !isYellowOn;
            }, 500);
            break;
    }
}

btnNext.addEventListener('click', () => {
    if (currentState === 'red') {
        switchState('yellow');
    } else if (currentState === 'yellow') {
        switchState('green');
    } else if (currentState === 'green') {
        switchState('blinking_yellow');
    } else if (currentState === 'blinking_yellow') {
        switchState('red');
    }
});

btnSettings.addEventListener('click', () => {
    const newRed = prompt('Введіть тривалість ЧЕРВОНОГО (в секундах):', times.red / 1000);
    const newYellow = prompt('Введіть тривалість ЖОВТОГО (в секундах):', times.yellow / 1000);
    const newGreen = prompt('Введіть тривалість ЗЕЛЕНОГО (в секундах):', times.green / 1000);


    if (newRed !== null && newYellow !== null && newGreen !== null) {
        const r = parseFloat(newRed);
        const y = parseFloat(newYellow);
        const g = parseFloat(newGreen);

        if (!isNaN(r) && !isNaN(y) && !isNaN(g) && r > 0 && y > 0 && g > 0) {

            times.red = r * 1000;
            times.yellow = y * 1000;
            times.green = g * 1000;
            alert('Налаштування збережено! Вони вступлять у дію під час наступної зміни кольорів.');
        } else {
            alert('Помилка: Введено некоректні дані. Будь ласка, використовуйте лише числа більші за нуль.');
        }
    }
});

switchState('red');