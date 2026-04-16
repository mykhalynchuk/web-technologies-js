let state = {
    tasks: [],
    sortBy: 'dateDesc',
    editingId: null,
    lastAddedId: null
};

const createTask = (text) => ({
    id: Date.now().toString(),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
});

const addTask = (tasks, newTask) => [...tasks, newTask];

const removeTask = (tasks, id) => tasks.filter(task => task.id !== id);

const toggleCompletion = (tasks, id) => tasks.map(task =>
    task.id === id
        ? { ...task, completed: !task.completed, updatedAt: Date.now() }
        : task
);

const updateTaskText = (tasks, id, newText) => tasks.map(task =>
    task.id === id
        ? { ...task, text: newText.trim(), updatedAt: Date.now() }
        : task
);

const sortTasks = (tasks, criteria) => {
    const copy = [...tasks];
    switch (criteria) {
        case 'dateDesc': return copy.sort((a, b) => b.createdAt - a.createdAt);
        case 'dateAsc': return copy.sort((a, b) => a.createdAt - b.createdAt);
        case 'status': return copy.sort((a, b) => Number(a.completed) - Number(b.completed));
        case 'updatedDesc': return copy.sort((a, b) => b.updatedAt - a.updatedAt);
        default: return copy;
    }
};

const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('uk-UA', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
};

const dispatch = (newStateUpdate) => {
    state = { ...state, ...newStateUpdate };
    render();
};

const render = () => {
    const listElement = document.getElementById('todo-list');
    const emptyStateElement = document.getElementById('empty-state');

    const visibleTasks = sortTasks(state.tasks, state.sortBy);

    listElement.innerHTML = '';

    if (visibleTasks.length === 0) {
        emptyStateElement.classList.remove('hidden');
    } else {
        emptyStateElement.classList.add('hidden');

        visibleTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

            const isEditing = state.editingId === task.id;

            if (isEditing) {
                li.innerHTML = `
                    <div class="task-content">
                        <input type="text" id="edit-input-${task.id}" class="edit-input" value="${task.text}">
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-save" onclick="handleSaveEdit('${task.id}')">Зберегти</button>
                        <button class="btn btn-danger" onclick="handleCancelEdit()">Скасувати</button>
                    </div>
                `;
            } else {
                li.innerHTML = `
                    <input type="checkbox" class="checkbox-custom" ${task.completed ? 'checked' : ''} onchange="handleToggle('${task.id}')">
                    <div class="task-content">
                        <span class="task-text" onclick="handleToggle('${task.id}')">${task.text}</span>
                        <span class="task-dates">Додано: ${formatDate(task.createdAt)}</span>
                    </div>
                    <div class="task-actions">
                        <button class="btn btn-edit" onclick="handleStartEdit('${task.id}')">Редагувати</button>
                        <button class="btn btn-danger" onclick="handleDelete('${task.id}')">Видалити</button>
                    </div>
                `;
            }

            listElement.appendChild(li);

            if (isEditing) {
                setTimeout(() => document.getElementById(`edit-input-${task.id}`).focus(), 0);
            }
        });
    }

    document.getElementById('sort-select').value = state.sortBy;
};

document.getElementById('todo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('new-task-input');
    const text = input.value;

    if (text.trim().length >= 3) {
        const newTask = createTask(text);
        dispatch({
            tasks: addTask(state.tasks, newTask),
            lastAddedId: newTask.id,
            sortBy: 'dateDesc'
        });
        input.value = '';
    }
});

window.handleToggle = (id) => {
    dispatch({ tasks: toggleCompletion(state.tasks, id) });
};

window.handleDelete = (id) => {
    const item = document.querySelector(`.todo-item[data-id="${id}"]`);
    if (item) {
        item.classList.add('slide-out');
        setTimeout(() => {
            dispatch({ tasks: removeTask(state.tasks, id) });
        }, 300);
    }
};

window.handleStartEdit = (id) => {
    dispatch({ editingId: id });
};

window.handleSaveEdit = (id) => {
    const input = document.getElementById(`edit-input-${id}`);
    if (input && input.value.trim().length > 0) {
        dispatch({
            tasks: updateTaskText(state.tasks, id, input.value),
            editingId: null
        });
    } else {
        handleCancelEdit();
    }
};

window.handleCancelEdit = () => {
    dispatch({ editingId: null });
};

document.getElementById('sort-select').addEventListener('change', (e) => {
    dispatch({ sortBy: e.target.value });
});

document.getElementById('todo-list').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && state.editingId) {
        handleSaveEdit(state.editingId);
    }
});

render();