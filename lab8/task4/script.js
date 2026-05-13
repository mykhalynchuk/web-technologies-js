const cardsData = [
    { id: 'js', title: 'JavaScript', sub: 'веб / скрипти', icon: '🟨', color: '#fcf4db' },
    { id: 'py', title: 'Python', sub: 'дані / AI', icon: '🐍', color: '#e8f5e9' },
    { id: 'java', title: 'Java', sub: 'бекенд / ентерпрайз', icon: '☕', color: '#fbe9e7' },
    { id: 'ts', title: 'TypeScript', sub: 'типізований JS', icon: '🔷', color: '#e3f2fd' },
    { id: 'rust', title: 'Rust', sub: 'системи / швидкість', icon: '🦀', color: '#fce4ec' },
    { id: 'go', title: 'Go', sub: 'хмара / мікросервіси', icon: '🐹', color: '#e0f7fa' },
    { id: 'kotlin', title: 'Kotlin', sub: 'Android / JVM', icon: '💜', color: '#f3e5f5' },
    { id: 'swift', title: 'Swift', sub: 'iOS / macOS', icon: '🍎', color: '#ffebee' },
    { id: 'cpp', title: 'C++', sub: 'ігри / системи', icon: '⚡', color: '#eef2f6' },
    { id: 'php', title: 'PHP', sub: 'веб / сервер', icon: '🐘', color: '#eceff1' }
];

let isEditMode = false;
let draggedItem = null;

const grid = document.getElementById('card-grid');
const editBtn = document.getElementById('edit-btn');
const headerText = document.getElementById('header-text');

const placeholder = document.createElement('div');
placeholder.className = 'placeholder';

function init() {
    renderCards();
    setupEditToggle();
    setupGridDragEvents();
}

function renderCards() {
    grid.innerHTML = '';

    cardsData.forEach(data => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = data.id;

        card.innerHTML = `
            <div class="delete-btn">✕</div>
            <div class="icon" style="background-color: ${data.color}">${data.icon}</div>
            <h3>${data.title}</h3>
            <p>${data.sub}</p>
        `;

        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isEditMode) {
                card.remove();
            }
        });

        setupCardDragEvents(card);
        grid.appendChild(card);
    });
}

function setupEditToggle() {
    editBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;

        if (isEditMode) {
            editBtn.textContent = 'Готово';
            headerText.textContent = 'Перетягуйте картки або натискайте ✕ щоб видалити';
            grid.classList.add('edit-mode');
        } else {
            editBtn.textContent = 'Редагувати';
            headerText.textContent = 'Натисніть «Редагувати» для керування картками';
            grid.classList.remove('edit-mode');
        }

        const cards = grid.querySelectorAll('.card');
        cards.forEach(card => card.setAttribute('draggable', isEditMode));
    });
}

function setupCardDragEvents(card) {
    card.addEventListener('dragstart', function(e) {
        if (!isEditMode) {
            e.preventDefault();
            return;
        }

        draggedItem = this;

        placeholder.style.width = this.offsetWidth + 'px';
        placeholder.style.height = this.offsetHeight + 'px';

        setTimeout(() => {
            this.classList.add('dragging-hidden');
            grid.insertBefore(placeholder, this);
        }, 0);
    });

    card.addEventListener('dragend', function() {
        if (!isEditMode) return;

        this.classList.remove('dragging-hidden');

        if (placeholder.parentNode) {
            grid.insertBefore(this, placeholder);
            placeholder.remove();
        }

        draggedItem = null;
    });
}

function setupGridDragEvents() {
    grid.addEventListener('dragover', e => {
        e.preventDefault();

        if (!isEditMode || !draggedItem) return;

        const afterElement = getDragAfterElement(grid, e.clientX, e.clientY);

        if (afterElement == null) {
            grid.appendChild(placeholder);
        } else {
            grid.insertBefore(placeholder, afterElement);
        }
    });
}

function getDragAfterElement(container, x, y) {

    const draggableElements = [...container.querySelectorAll('.card:not(.dragging-hidden)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();

        const centerX = box.left + box.width / 2;
        const centerY = box.top + box.height / 2;

        const distance = Math.hypot(x - centerX, y - centerY);

        if (distance < closest.distance) {
            return { distance: distance, element: child };
        } else {
            return closest;
        }
    }, { distance: Number.POSITIVE_INFINITY }).element;
}

init();