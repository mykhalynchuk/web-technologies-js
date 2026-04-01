const bulb = document.getElementById('bulb');
const toggleBtn = document.getElementById('toggleBtn');
const typeSelect = document.getElementById('typeSelect');
const brightnessBtn = document.getElementById('brightnessBtn');
const statusText = document.getElementById('statusText');
const timerDisplay = document.getElementById('timerDisplay');

let inactivityInterval;
const TOTAL_SECONDS = 5 * 60;
let timeLeft = TOTAL_SECONDS;

function updateTimerUI() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    timerDisplay.textContent = `Автовимкнення через: ${minutes}:${seconds}`;
}

function resetTimer() {
    if (bulb.classList.contains('on')) {
        timeLeft = TOTAL_SECONDS;
        updateTimerUI();
    }
}

function startTimer() {
    clearInterval(inactivityInterval);
    timeLeft = TOTAL_SECONDS;
    updateTimerUI();
    timerDisplay.style.display = 'block';

    inactivityInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();

        if (timeLeft <= 0) {
            clearInterval(inactivityInterval);
            turnOffBulb();
            alert('Лампочку вимкнено через 5 хвилин бездіяльності в керуванні.');
        }
    }, 1000);
}

function turnOffBulb() {
    bulb.classList.remove('on');
    toggleBtn.textContent = 'Включити';
    statusText.textContent = 'Стан: Вимкнено';
    timerDisplay.style.display = 'none';
    clearInterval(inactivityInterval);
}

toggleBtn.addEventListener('click', () => {
    if (!bulb.classList.contains('on')) {
        bulb.classList.add('on');
        toggleBtn.textContent = 'Виключити';
        statusText.textContent = 'Стан: Увімкнено';
        startTimer();
    } else {
        turnOffBulb();
    }
});

typeSelect.addEventListener('change', () => {
    bulb.classList.remove('standard', 'energy', 'led');
    bulb.classList.add(typeSelect.value);

    if (typeSelect.value === 'standard') {
        bulb.style.opacity = '1';
    }
    resetTimer();
});

brightnessBtn.addEventListener('click', () => {
    if (!bulb.classList.contains('on')) return alert('Увімкніть лампочку!');

    if (typeSelect.value === 'standard') {
        return alert('Звичайна лампочка не регулюється!');
    }

    const val = prompt('Яскравість 10-100%:', '100');
    if (val !== null && !isNaN(val) && val >= 10 && val <= 100) {
        bulb.style.opacity = val / 100;
        resetTimer();
    }
});