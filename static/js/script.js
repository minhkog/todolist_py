document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const addBtn = document.getElementById('add-btn');
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');

    // 1. Fetch and Render Tasks
    function fetchTasks() {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    renderTask(task);
                });
            });
    }

    // 2. Render Single Task Element
    function renderTask(task) {
        const div = document.createElement('div');
        div.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
        div.dataset.id = task.id;

        div.innerHTML = `
            <div class="task-info">
                <div class="check-btn" onclick="toggleStatus(${task.id}, '${task.status}')"></div>
                <div class="priority-indicator p-${task.priority}" title="Priority Level"></div>
                <span class="task-title" onclick="toggleStatus(${task.id}, '${task.status}')">${task.title}</span>
            </div>
            <div class="actions">
                <button class="delete-btn" onclick="deleteTask(${task.id})">✕</button>
            </div>
        `;
        taskList.appendChild(div);
    }

    // 3. Add Task
    addBtn.addEventListener('click', () => {
        const title = taskInput.value.trim();
        const priority = prioritySelect.value;
        if (!title) return;

        fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, priority })
        })
            .then(res => res.json())
            .then(newTask => {
                renderTask(newTask);
                taskInput.value = '';
                // Re-fetch to sort correctly if needed, or insert manually.
                // For now, re-fetching sorts it automatically by priority
                fetchTasks();
            });
    });

    // Allow Enter key to submit
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    // 4. Delete Task
    window.deleteTask = function (id) {
        if (!confirm('Delete this task?')) return;

        // Find element and animate removal
        const card = document.querySelector(`.task-card[data-id="${id}"]`);
        card.style.transform = 'translateX(100%)';
        card.style.opacity = '0';

        setTimeout(() => {
            fetch(`/api/tasks/${id}`, { method: 'DELETE' })
                .then(() => fetchTasks());
        }, 300);
    };

    // 5. Toggle Status (Complete/Pending)
    window.toggleStatus = function (id, currentStatus) {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

        // Optimistic UI update
        const card = document.querySelector(`.task-card[data-id="${id}"]`);
        const title = card.querySelector('.task-title');
        const checkBtn = card.querySelector('.check-btn');

        card.classList.toggle('completed');
        // Update onclick to reflect new status immediately prevents rapid double-click bugs
        title.setAttribute('onclick', `toggleStatus(${id}, '${newStatus}')`);
        checkBtn.setAttribute('onclick', `toggleStatus(${id}, '${newStatus}')`);

        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
    };

    // Initial Load
    fetchTasks();
});
