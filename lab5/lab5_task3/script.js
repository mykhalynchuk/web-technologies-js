
const hourEl = document.getElementById('hour');
const minuteEl = document.getElementById('minute');
const secondEl = document.getElementById('second');

function updateClock() {
    const now = new Date();

    hourEl.textContent = String(now.getHours()).padStart(2, '0');
    minuteEl.textContent = String(now.getMinutes()).padStart(2, '0');
    secondEl.textContent = String(now.getSeconds()).padStart(2, '0');
}

setInterval(updateClock, 1000);
updateClock();

const countdownInput = document.getElementById('countdown-input');
const btnStartCountdown = document.getElementById('btn-start-countdown');
const countdownResult = document.getElementById('countdown-result');
let countdownInterval;

btnStartCountdown.addEventListener('click', () => {
    const targetDate = new Date(countdownInput.value);

    if (isNaN(targetDate.getTime())) {
        alert('Будь ласка, виберіть коректну дату та час!');
        return;
    }

    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            clearInterval(countdownInterval);
            countdownResult.textContent = "Час вийшов!";
            countdownResult.style.color = "red";
            return;
        }

        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        countdownResult.style.color = "black";
        countdownResult.textContent = `${d} днів, ${h} год, ${m} хв, ${s} сек`;
    }, 1000);
});

const monthInput = document.getElementById('month-input');

const today = new Date();
const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
const currentYear = today.getFullYear();
monthInput.value = `${currentYear}-${currentMonth}`;


const bdayInput = document.getElementById('bday-input');
const btnCalcBday = document.getElementById('btn-calc-bday');
const bdayResult = document.getElementById('bday-result');
let bdayInterval;

btnCalcBday.addEventListener('click', () => {
    if (!bdayInput.value) {
        alert("Будь ласка, вкажіть дату народження!");
        return;
    }

    clearInterval(bdayInterval);

    const calculateBday = () => {
        const now = new Date();
        const bdayDate = new Date(bdayInput.value);

        bdayDate.setFullYear(now.getFullYear());

        if (now > bdayDate) {
            bdayDate.setFullYear(now.getFullYear() + 1);
        }

        const diff = bdayDate - now;

        const secondsTotal = Math.floor(diff / 1000);
        const secs = secondsTotal % 60;
        const mins = Math.floor(secondsTotal / 60) % 60;
        const hours = Math.floor(secondsTotal / (60 * 60)) % 24;
        const daysTotal = Math.floor(secondsTotal / (60 * 60 * 24));

        const months = Math.floor(daysTotal / 30);
        const days = daysTotal % 30;

        bdayResult.textContent = `${months} міс, ${days} днів, ${hours} год, ${mins} хв, ${secs} сек.`;
    };

    calculateBday();
    bdayInterval = setInterval(calculateBday, 1000);
});