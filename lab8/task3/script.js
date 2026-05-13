const tasks = document.querySelectorAll('.task');
const taskLists = document.querySelectorAll('.task-list');

tasks.forEach(task => {

    task.addEventListener('dragstart', () => {
        task.classList.add('dragging');
    });

    task.addEventListener('dragend', () => {
        task.classList.remove('dragging');
    });
});

taskLists.forEach(list => {
    list.addEventListener('dragover', e => {
        e.preventDefault();


        const afterElement = getDragAfterElement(list, e.clientY);

        const draggable = document.querySelector('.dragging');

        if (afterElement == null) {
            list.appendChild(draggable);
        }
        else {
            list.insertBefore(draggable, afterElement);
        }
    });
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}