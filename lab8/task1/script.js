const PURE = {
    generateDeck: (size) => {
        const emojis = ['🍎','🍌','🍇','🍉','🍓','🍒','🍑','🍍','🥝','🍋','🥥','🥭','🥑','🍏','🫐','🍈','🍐','🍊'];
        const pairsCount = size / 2;
        const selected = emojis.slice(0, pairsCount);
        const deck = [...selected, ...selected];

        return deck
            .sort(() => Math.random() - 0.5)
            .map((symbol, index) => ({
                id: index,
                symbol,
                isFlipped: false,
                isMatched: false
            }));
    },


    getTimeLimit: (difficulty) => {
        switch(difficulty) {
            case 'hard': return 60;
            case 'normal': return 120;
            case 'easy': default: return 180;
        }
    },

    formatTime: (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    },

    updateCardState: (deck, idsToUpdate, changes) => {
        return deck.map(card =>
            idsToUpdate.includes(card.id) ? { ...card, ...changes } : card
        );
    },

    isRoundComplete: (deck) => deck.every(card => card.isMatched)
};

const state = {
    settings: { mode: '1', p1Name: 'Player 1', p2Name: 'Player 2', gridSize: 16, difficulty: 'easy', totalRounds: 1 },
    deck: [],
    flippedIds: [],
    players: [],
    currentPlayerIndex: 0,
    round: 1,
    timeRemaining: 0,
    timerId: null,
    isLocked: false,
    stats: []
};

const DOM = {
    settingsPanel: document.getElementById('settings-panel'),
    gamePanel: document.getElementById('game-panel'),
    board: document.getElementById('game-board'),
    playersInfo: document.getElementById('players-info'),
    uiTimer: document.getElementById('ui-timer'),
    uiRound: document.getElementById('ui-round'),
    uiTotalRounds: document.getElementById('ui-total-rounds'),
    modal: document.getElementById('results-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalBody: document.getElementById('modal-body'),
    btnNextRound: document.getElementById('btn-next-round'),
    btnNewGame: document.getElementById('btn-new-game')
};

const initEvents = () => {
    document.getElementById('players-mode').addEventListener('change', (e) => {
        document.getElementById('p2-name-group').classList.toggle('hidden', e.target.value === '1');
    });

    document.getElementById('btn-reset-settings').addEventListener('click', resetSettings);
    document.getElementById('btn-start').addEventListener('click', startNewGameSession);
    document.getElementById('btn-restart').addEventListener('click', () => startRound(state.round));
    DOM.btnNextRound.addEventListener('click', () => {
        DOM.modal.classList.add('hidden');
        startRound(state.round + 1);
    });
    DOM.btnNewGame.addEventListener('click', () => {
        DOM.modal.classList.add('hidden');
        DOM.gamePanel.classList.add('hidden');
        DOM.settingsPanel.classList.remove('hidden');
    });
};

const resetSettings = () => {
    document.getElementById('players-mode').value = '1';
    document.getElementById('p1-name').value = 'Player 1';
    document.getElementById('p2-name').value = 'Player 2';
    document.getElementById('grid-size').value = '16';
    document.getElementById('difficulty').value = 'easy';
    document.getElementById('rounds-count').value = '1';
    document.getElementById('p2-name-group').classList.add('hidden');
};

const readSettings = () => ({
    mode: document.getElementById('players-mode').value,
    p1Name: document.getElementById('p1-name').value || 'Player 1',
    p2Name: document.getElementById('p2-name').value || 'Player 2',
    gridSize: parseInt(document.getElementById('grid-size').value),
    difficulty: document.getElementById('difficulty').value,
    totalRounds: parseInt(document.getElementById('rounds-count').value)
});

const startNewGameSession = () => {
    state.settings = readSettings();
    state.stats = [];
    state.round = 1;
    DOM.settingsPanel.classList.add('hidden');
    DOM.gamePanel.classList.remove('hidden');
    startRound(1);
};

const startRound = (roundNum) => {
    clearInterval(state.timerId);
    state.round = roundNum;
    state.currentPlayerIndex = 0;
    state.flippedIds = [];
    state.isLocked = false;
    state.deck = PURE.generateDeck(state.settings.gridSize);
    state.timeRemaining = PURE.getTimeLimit(state.settings.difficulty);

    state.players = [ { name: state.settings.p1Name, moves: 0, matches: 0 } ];
    if (state.settings.mode === '2') {
        state.players.push({ name: state.settings.p2Name, moves: 0, matches: 0 });
    }

    const cols = state.settings.gridSize === 36 ? 6 : (state.settings.gridSize === 20 ? 5 : 4);
    DOM.board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    DOM.uiRound.textContent = state.round;
    DOM.uiTotalRounds.textContent = state.settings.totalRounds;
    DOM.uiTimer.textContent = PURE.formatTime(state.timeRemaining);

    renderPlayers();
    renderBoard();

    state.timerId = setInterval(tickTimer, 1000);
};

const tickTimer = () => {
    state.timeRemaining--;
    DOM.uiTimer.textContent = PURE.formatTime(state.timeRemaining);

    if (state.timeRemaining <= 0) {
        clearInterval(state.timerId);
        endRound('timeup');
    }
};

const renderPlayers = () => {
    DOM.playersInfo.innerHTML = state.players.map((p, i) => `
    <div class="player-card ${i === state.currentPlayerIndex ? 'active' : ''}">
      <div><strong>${p.name}</strong></div>
      <div>Ходи: ${p.moves} | Пари: ${p.matches}</div>
    </div>
  `).join('');
};

const renderBoard = () => {
    DOM.board.innerHTML = '';
    state.deck.forEach(card => {
        const el = document.createElement('div');
        el.className = `card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`;
        el.innerHTML = `
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">${card.symbol}</div>
      </div>
    `;
        el.addEventListener('click', () => handleCardClick(card.id));
        DOM.board.appendChild(el);
    });
};

const handleCardClick = (id) => {
    if (state.isLocked) return;
    const card = state.deck.find(c => c.id === id);
    if (card.isFlipped || card.isMatched) return;

    state.deck = PURE.updateCardState(state.deck, [id], { isFlipped: true });
    state.flippedIds.push(id);
    renderBoard();

    if (state.flippedIds.length === 2) {
        state.isLocked = true;
        state.players[state.currentPlayerIndex].moves++;

        const [id1, id2] = state.flippedIds;
        const c1 = state.deck.find(c => c.id === id1);
        const c2 = state.deck.find(c => c.id === id2);

        if (c1.symbol === c2.symbol) {
            setTimeout(() => {
                state.deck = PURE.updateCardState(state.deck, [id1, id2], { isMatched: true });
                state.players[state.currentPlayerIndex].matches++;
                state.flippedIds = [];
                state.isLocked = false;
                renderPlayers();
                renderBoard();

                if (PURE.isRoundComplete(state.deck)) {
                    clearInterval(state.timerId);
                    endRound('win');
                }
            }, 500);
        } else {
            setTimeout(() => {
                state.deck = PURE.updateCardState(state.deck, [id1, id2], { isFlipped: false });
                state.flippedIds = [];

                if (state.players.length > 1) {
                    state.currentPlayerIndex = state.currentPlayerIndex === 0 ? 1 : 0;
                }

                state.isLocked = false;
                renderPlayers();
                renderBoard();
            }, 1000);
        }
        renderPlayers();
    }
};

const endRound = (reason) => {
    const timeTaken = PURE.getTimeLimit(state.settings.difficulty) - state.timeRemaining;

    state.stats.push({
        round: state.round,
        reason,
        timeTaken,
        players: JSON.parse(JSON.stringify(state.players))
    });

    showModal(reason);
};

const showModal = (reason) => {
    DOM.modalTitle.textContent = reason === 'timeup' ? 'Час вичерпано!' : `Раунд ${state.round} завершено!`;

    let html = '';
    const currentStat = state.stats[state.round - 1];

    if (state.players.length === 1) {
        html = `<p>Витрачено часу: ${PURE.formatTime(currentStat.timeTaken)}</p>
            <p>Зроблено ходів: ${currentStat.players[0].moves}</p>`;
    } else {
        // Визначення переможця раунду
        const p1 = currentStat.players[0];
        const p2 = currentStat.players[1];
        let winnerText = 'Нічия!';
        if (p1.matches > p2.matches) winnerText = `Переможець: ${p1.name}`;
        else if (p2.matches > p1.matches) winnerText = `Переможець: ${p2.name}`;

        html = `<p><strong>${winnerText}</strong></p>
            <p>Час раунду: ${PURE.formatTime(currentStat.timeTaken)}</p>
            <hr style="margin:10px 0;">
            <p>${p1.name}: ${p1.matches} пар (Ходів: ${p1.moves})</p>
            <p>${p2.name}: ${p2.matches} пар (Ходів: ${p2.moves})</p>`;
    }

    // Якщо це був останній раунд
    if (state.round >= state.settings.totalRounds) {
        DOM.btnNextRound.classList.add('hidden');
        html += `<h3 style="margin-top:20px; color:var(--primary);">Гру закінчено!</h3>`;
    } else {
        DOM.btnNextRound.classList.remove('hidden');
    }

    DOM.modalBody.innerHTML = html;
    DOM.modal.classList.remove('hidden');
};

// Запуск програми
initEvents();