// Знаходимо всі завдання та всі колонки (зони для кидання)
const tasks = document.querySelectorAll('.task');
const taskLists = document.querySelectorAll('.task-list');

// --- ЛОГІКА ДЛЯ ЗАВДАНЬ (DRAG START / END) ---
tasks.forEach(task => {
    // Коли починаємо тягнути
    task.addEventListener('dragstart', () => {
        // Додаємо клас, щоб змінити прозорість (CSS) і мати змогу знайти цей елемент
        task.classList.add('dragging');
    });

    // Коли відпускаємо мишку
    task.addEventListener('dragend', () => {
        task.classList.remove('dragging');
    });
});

// --- ЛОГІКА ДЛЯ КОЛОНОК (DRAG OVER / DROP) ---
taskLists.forEach(list => {
    // Подія dragover спрацьовує постійно, поки елемент знаходиться над колонкою
    list.addEventListener('dragover', e => {
        e.preventDefault(); // Обов'язково! Це дозволяє "кинути" елемент у цю зону

        // Знаходимо елемент, ПІД яким знаходиться курсор (щоб вставляти між картками)
        const afterElement = getDragAfterElement(list, e.clientY);

        // Знаходимо картку, яку ми зараз тягнемо
        const draggable = document.querySelector('.dragging');

        // Якщо ми тягнемо в самий низ (після всіх карток)
        if (afterElement == null) {
            list.appendChild(draggable);
        }
        // Якщо ми тягнемо між якимись картками
        else {
            list.insertBefore(draggable, afterElement);
        }
    });
});

// Допоміжна функція: визначає, ПЕРЕД яким елементом потрібно вставити картку
function getDragAfterElement(container, y) {
    // Знаходимо всі картки в цій колонці, КРІМ тієї, яку ми зараз тягнемо
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    // Знаходимо найближчий елемент до курсору
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect(); // Розміри і позиція картки
        // Визначаємо відстань від курсору до центру картки
        const offset = y - box.top - box.height / 2;

        // Якщо курсор вище центру картки (offset < 0) і ближче, ніж попередній знайдений
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}