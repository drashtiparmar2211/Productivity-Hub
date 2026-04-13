// Quotes for top bar
const quotes = [
    "Strive for progress, not perfection.",
    "The secret of getting ahead is getting started.",
    "Small daily improvements over time lead to stunning results.",
    "You don't have to be great to start, but you have to start to be great.",
    "What you do today can improve all your tomorrows."
];

// App State Management using LocalStorage
const AppState = {
    get: (key, def) => JSON.parse(localStorage.getItem(key)) || def,
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),

    getTasks: (type) => AppState.get(`tasks_${type}`, []),
    saveTasks: (type, tasks) => AppState.set(`tasks_${type}`, tasks),

    getAPIKey: () => localStorage.getItem('groq_api_key') || '',
    saveAPIKey: (key) => localStorage.setItem('groq_api_key', key),

    getRoutines: () => AppState.get('routines', []),
    saveRoutines: (r) => AppState.set('routines', r),

    getExams: () => AppState.get('exams', []),
    saveExams: (e) => AppState.set('exams', e),

    getProjects: () => AppState.get('projects', []),
    saveProjects: (p) => AppState.set('projects', p),

    getMarks: () => AppState.get('marks', []),
    saveMarks: (m) => AppState.set('marks', m)
};

// UI Elements
const modalContainer = document.getElementById('modal-container');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalBtn = document.getElementById('close-modal');

const settingsModal = document.getElementById('settings-modal');
const settingsIcon = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const saveSettingsBtn = document.getElementById('save-settings');
const apiKeyInput = document.getElementById('groq-api-key');

// Format Dates
const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Set random quote
    document.getElementById('daily-quote-text').innerText = quotes[Math.floor(Math.random() * quotes.length)];

    // Setup Modals logic
    closeModalBtn.addEventListener('click', () => modalContainer.classList.add('hidden'));

    // Setup Settings
    settingsIcon.addEventListener('click', () => {
        apiKeyInput.value = AppState.getAPIKey();
        settingsModal.classList.remove('hidden');
        document.getElementById('settings-msg').innerText = '';
    });
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));

    saveSettingsBtn.addEventListener('click', () => {
        AppState.saveAPIKey(apiKeyInput.value);
        document.getElementById('settings-msg').innerText = 'API Key saved successfully!';
        setTimeout(() => settingsModal.classList.add('hidden'), 1000);
    });

    // Close modals on outside click
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) modalContainer.classList.add('hidden');
    });
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.classList.add('hidden');
    });

    // Initialize WOW Animations
    if (typeof anime !== 'undefined') {
        anime({
            targets: '.circle-widget',
            scale: [0, 1],
            opacity: [0, 1],
            delay: anime.stagger(150),
            duration: 1200,
            easing: 'easeOutElastic(1, .6)'
        });

        anime({
            targets: '.dock-item',
            translateY: [50, 0],
            opacity: [0, 1],
            delay: anime.stagger(100, { start: 600 }),
            duration: 800,
            easing: 'easeOutExpo'
        });
    }

    // 3D Tilt effect
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll(".circle-widget"), {
            max: 15,
            speed: 400,
            glare: true,
            "max-glare": 0.3,
            scale: 1.05
        });

        VanillaTilt.init(document.querySelectorAll(".dock-item"), {
            max: 10,
            speed: 300,
            scale: 1.1
        });
    }

    applySeasonalBackground();
    setupModuleListeners();
    updateReminderBadge();
});

function setupModuleListeners() {
    // Core Modules
    document.getElementById('mod-todo').addEventListener('click', () => openToDoList('todo'));
    document.getElementById('mod-imp').addEventListener('click', () => openToDoList('imp'));
    document.getElementById('mod-routine').addEventListener('click', openRoutine);
    document.getElementById('mod-exams').addEventListener('click', openExamsProject);
    document.getElementById('mod-result').addEventListener('click', openResult);
    document.getElementById('mod-reminder').addEventListener('click', openReminder);

    // Sub Options
    document.getElementById('sub-games').addEventListener('click', openGames);
    document.getElementById('sub-movies').addEventListener('click', () => openListTracker('Movies'));
    document.getElementById('sub-series').addEventListener('click', () => openListTracker('Series'));
    document.getElementById('sub-books').addEventListener('click', openBooks);
    document.getElementById('sub-news').addEventListener('click', openNewsAndFacts);
    document.getElementById('sub-perfect').addEventListener('click', openPerfectionist);
}

// --------------------------------------------------------------------------
// 1. To Do List & IMP Tasks
// --------------------------------------------------------------------------
function openToDoList(type) {
    const isImp = type === 'imp';
    modalTitle.innerText = isImp ? 'Important Tasks & Deadlines' : 'Daily To-Do List';

    const tasks = AppState.getTasks(type);

    let html = `
        <div class="flex-row mb-1">
            <input type="text" id="new-task-input" placeholder="What needs to be done?">
            ${isImp ? `<input type="date" id="new-task-date">` : ''}
            <button class="primary-btn" id="add-task-btn" style="width: auto;">Add</button>
        </div>
        <div class="item-list" id="task-list"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const renderTasks = () => {
        const list = document.getElementById('task-list');
        list.innerHTML = '';
        const currentTasks = AppState.getTasks(type);

        if (currentTasks.length === 0) {
            list.innerHTML = `<p style="text-align:center; color:var(--text-secondary); margin-top:2rem;">No tasks yet. You're all caught up!</p>`;
        }

        currentTasks.forEach((t, i) => {
            const dateUi = isImp && t.date ? `<span class="status-badge ${new Date(t.date) < new Date() && !t.completed ? 'status-pending' : ''}">${formatDate(t.date)}</span>` : '';

            const li = document.createElement('div');
            li.className = 'list-item';
            li.innerHTML = `
                <div class="item-content ${t.completed ? 'completed' : ''}">
                    <div class="checkbox ${t.completed ? 'checked' : ''}" data-idx="${i}"></div>
                    <div>
                        <strong>${t.text}</strong>
                        ${dateUi ? `<div class="mt-1">${dateUi}</div>` : ''}
                    </div>
                </div>
                <span class="material-icons-outlined delete-btn" data-idx="${i}">delete</span>
            `;
            list.appendChild(li);
        });

        // Add event listeners for toggling and deleting
        document.querySelectorAll('.checkbox').forEach(box => {
            box.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                const t = AppState.getTasks(type);
                t[idx].completed = !t[idx].completed;
                AppState.saveTasks(type, t);
                renderTasks();
                if (isImp) updateReminderBadge();
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                const t = AppState.getTasks(type);
                t.splice(idx, 1);
                AppState.saveTasks(type, t);
                renderTasks();
                if (isImp) updateReminderBadge();
            });
        });
    };

    renderTasks();

    // Add new task
    document.getElementById('add-task-btn').addEventListener('click', () => {
        const input = document.getElementById('new-task-input');
        const dateInput = document.getElementById('new-task-date');
        const text = input.value.trim();
        if (!text) return;

        const newTask = { text, completed: false, date: dateInput ? dateInput.value : null };
        const t = AppState.getTasks(type);
        t.push(newTask);
        AppState.saveTasks(type, t);
        input.value = '';
        if (dateInput) dateInput.value = '';
        renderTasks();
        if (isImp) updateReminderBadge();
    });
}

// --------------------------------------------------------------------------
// Update Reminder Badge
// --------------------------------------------------------------------------
function updateReminderBadge() {
    const imps = AppState.getTasks('imp');
    const exams = AppState.getExams();
    let count = 0;

    const today = new Date();

    // Count incomplete imp tasks with deadlines < 3 days
    imps.forEach(i => {
        if (!i.completed && i.date) {
            const diffTime = new Date(i.date) - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 3) count++;
        }
    });

    // Count uncompleted exams < 7 days
    exams.forEach(e => {
        if (!e.completed && e.date) {
            const diffTime = new Date(e.date) - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays <= 7) count++;
        }
    });

    const badge = document.getElementById('reminder-badge');
    if (count > 0) {
        badge.innerText = count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// --------------------------------------------------------------------------
// Routine Module Placeholder
// --------------------------------------------------------------------------
function openRoutine() {
    modalTitle.innerText = 'Daily Routine';

    const routines = AppState.getRoutines();

    // Map words to icons for the watermark
    const iconMap = {
        'work': 'work', 'study': 'menu_book', 'gym': 'fitness_center', 'exercise': 'fitness_center',
        'sleep': 'bed', 'eat': 'restaurant', 'code': 'code', 'play': 'sports_esports'
    };

    const getIcon = (name) => {
        name = name.toLowerCase();
        for (let key in iconMap) {
            if (name.includes(key)) return iconMap[key];
        }
        return 'event_note'; // default
    }

    let html = `
        <div class="flex-row mb-1">
            <input type="time" id="routine-time">
            <input type="text" id="routine-name" placeholder="E.g., Gym, Study, Read">
            <button class="primary-btn" id="add-routine-btn" style="width: auto;">Add Slot</button>
        </div>
        <div class="item-list" id="routine-list"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const renderRoutines = () => {
        const list = document.getElementById('routine-list');
        list.innerHTML = '';
        const rTasks = AppState.getRoutines().sort((a, b) => a.time.localeCompare(b.time));

        rTasks.forEach((r, i) => {
            const li = document.createElement('div');
            li.className = 'list-item routine-slot flex-between';
            li.innerHTML = `
                <div>
                    <h3 style="margin-bottom:0.3rem">${r.name}</h3>
                    <span class="text-secondary">${r.time}</span>
                </div>
                <span class="material-icons-outlined watermark">${getIcon(r.name)}</span>
                <span class="material-icons-outlined delete-btn" data-idx="${i}" style="z-index:2">delete</span>
            `;
            list.appendChild(li);
        });

        document.querySelectorAll('.routine-slot .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                const t = AppState.getRoutines();
                t.splice(idx, 1);
                AppState.saveRoutines(t);
                renderRoutines();
            });
        });
    };

    renderRoutines();

    document.getElementById('add-routine-btn').addEventListener('click', () => {
        const time = document.getElementById('routine-time').value;
        const name = document.getElementById('routine-name').value.trim();
        if (!time || !name) return;

        const r = AppState.getRoutines();
        r.push({ time, name });
        AppState.saveRoutines(r);
        document.getElementById('routine-time').value = '';
        document.getElementById('routine-name').value = '';
        renderRoutines();
    });
}

// --------------------------------------------------------------------------
// Remainder module stub
// --------------------------------------------------------------------------
function openReminder() {
    modalTitle.innerText = 'Reminders & Deadlines';

    const imps = AppState.getTasks('imp').filter(t => !t.completed && t.date).sort((a, b) => new Date(a.date) - new Date(b.date));
    const exams = AppState.getExams().filter(e => !e.completed && e.date).sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = `<div class="flex-col">`;

    if (imps.length === 0 && exams.length === 0) {
        html += `<p style="text-align:center; color:var(--text-secondary);">No active deadlines. Relax!</p>`;
    }

    if (exams.length > 0) {
        html += `<h3>Upcoming Exams</h3><div class="item-list">`;
        exams.forEach(e => {
            html += `<div class="list-item">
                <div class="item-content"><span class="material-icons-outlined" style="color:var(--primary-color)">school</span>
                <div><strong>${e.name}</strong><br><span class="text-secondary">Date: ${formatDate(e.date)}</span></div></div>
            </div>`;
        });
        html += `</div>`;
    }

    if (imps.length > 0) {
        html += `<h3 class="mt-2">Important Tasks</h3><div class="item-list">`;
        imps.forEach(t => {
            html += `<div class="list-item">
                <div class="item-content"><span class="material-icons-outlined" style="color:var(--secondary-color)">priority_high</span>
                <div><strong>${t.text}</strong><br><span class="text-secondary">Due: ${formatDate(t.date)}</span></div></div>
            </div>`;
        });
        html += `</div>`;
    }

    html += `</div>`;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');
}

// Stubs for other functions (will build next)
async function callAI(prompt) {
    const apiKey = AppState.getAPIKey();
    if (!apiKey) {
        return "Please save your Groq API Key in Settings first.";
    }
    try {
        const response = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            })
        });
        const data = await response.json();
        if (data.error) return `Error: ${data.error.message}`;
        return data.choices[0].message.content;
    } catch (err) {
        return `Error: ${err.message}`;
    }
}

// --------------------------------------------------------------------------
// Result Analysis
// --------------------------------------------------------------------------
function openResult() {
    modalTitle.innerText = 'Result Analysis';

    let html = `
        <div class="flex-row mb-1">
            <input type="text" id="subject-name" placeholder="Subject Name">
            <input type="number" id="subject-marks" placeholder="Marks (0-100)" min="0" max="100">
            <button class="primary-btn" id="add-mark-btn" style="width: auto;">Add</button>
        </div>
        <div class="flex-row">
            <div style="flex:1;"><canvas id="resultChart"></canvas></div>
            <div style="flex:1;" class="ai-box">
                <h3><span class="material-icons-outlined">psychology</span> AI Advice</h3>
                <div id="ai-advice-content" style="max-height:300px; overflow-y:auto;">
                    <p class="text-secondary">Click 'Analyze Progress' to get AI suggestions on your performance.</p>
                </div>
                <button class="secondary-btn mt-1" id="analyze-btn" style="width:100%">Analyze Progress</button>
            </div>
        </div>
        <div class="item-list mt-2" id="marks-list"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    let chartInstance = null;

    const renderMarks = () => {
        const list = document.getElementById('marks-list');
        list.innerHTML = '';
        const marks = AppState.getMarks();

        marks.forEach((m, i) => {
            const li = document.createElement('div');
            li.className = 'list-item flex-between';
            li.innerHTML = `
                <div><strong>${m.subject}</strong>: ${m.marks}%</div>
                <span class="material-icons-outlined delete-btn" data-idx="${i}">delete</span>
            `;
            list.appendChild(li);
        });

        document.querySelectorAll('#marks-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                marks.splice(idx, 1);
                AppState.saveMarks(marks);
                renderMarks();
            });
        });

        // Update Chart
        if (chartInstance) chartInstance.destroy();
        const ctx = document.getElementById('resultChart').getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: marks.map(m => m.subject),
                datasets: [{
                    label: 'Marks',
                    data: marks.map(m => m.marks),
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                scales: {
                    y: { beginAtZero: true, max: 100, ticks: { color: '#fff' } },
                    x: { ticks: { color: '#fff' } }
                },
                plugins: { legend: { labels: { color: '#fff' } } }
            }
        });
    };

    renderMarks();

    document.getElementById('add-mark-btn').addEventListener('click', () => {
        const sub = document.getElementById('subject-name').value.trim();
        const m = document.getElementById('subject-marks').value;
        if (!sub || !m) return;

        const marks = AppState.getMarks();
        marks.push({ subject: sub, marks: Number(m) });
        AppState.saveMarks(marks);
        document.getElementById('subject-name').value = '';
        document.getElementById('subject-marks').value = '';
        renderMarks();
    });

    document.getElementById('analyze-btn').addEventListener('click', async () => {
        const contentDiv = document.getElementById('ai-advice-content');
        const marks = AppState.getMarks();
        if (marks.length === 0) {
            contentDiv.innerHTML = "<p>Add some marks first!</p>";
            return;
        }

        contentDiv.innerHTML = '<p class="ai-typing">Analyzing your performance</p>';
        const prompt = `I am a student. Here are my recent marks: ${marks.map(m => `${m.subject}: ${m.marks}%`).join(', ')}. Act as a supportive academic advisor. Provide a short, structured analysis indicating my strong areas, weak areas to focus on, and a few actionable tips to score better in weak subjects. Use simple markdown. Keep it concise.`;

        const advice = await callAI(prompt);
        contentDiv.innerHTML = marked.parse(advice);
    });
}

// --------------------------------------------------------------------------
// Exams & Projects
// --------------------------------------------------------------------------
function openExamsProject() {
    modalTitle.innerText = 'Exams & Projects';

    let html = `
        <div class="flex-row mb-1">
            <button class="secondary-btn" id="show-exams" style="flex:1; background:var(--primary-color)">Exams</button>
            <button class="secondary-btn" id="show-projects" style="flex:1">Projects</button>
        </div>
        <div id="ep-target"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const targetDiv = document.getElementById('ep-target');
    const btnE = document.getElementById('show-exams');
    const btnP = document.getElementById('show-projects');

    const renderExams = () => {
        btnE.style.background = 'var(--primary-color)';
        btnP.style.background = 'transparent';

        targetDiv.innerHTML = `
            <div class="flex-row mb-1">
                <input type="text" id="exam-name" placeholder="Exam Name / Syllabus topic">
                <input type="date" id="exam-date">
                <button class="primary-btn" id="add-exam-btn" style="width: auto;">Add</button>
            </div>
            <div class="item-list" id="exam-list"></div>
        `;

        const list = document.getElementById('exam-list');
        const eData = AppState.getExams();

        eData.forEach((e, i) => {
            const li = document.createElement('div');
            li.className = 'list-item';
            li.innerHTML = `
                <div class="item-content ${e.completed ? 'completed' : ''}">
                    <div class="checkbox ${e.completed ? 'checked' : ''}" data-idx="${i}"></div>
                    <div>
                        <strong>${e.name}</strong>
                        ${e.date ? `<div class="mt-1">${formatDate(e.date)}</div>` : ''}
                    </div>
                </div>
                <span class="material-icons-outlined delete-btn" data-idx="${i}">delete</span>
            `;
            list.appendChild(li);
        });

        // events
        document.querySelectorAll('#exam-list .checkbox').forEach(box => {
            box.addEventListener('click', (ev) => {
                const idx = ev.target.getAttribute('data-idx');
                eData[idx].completed = !eData[idx].completed;
                AppState.saveExams(eData);
                renderExams();
                updateReminderBadge();
            });
        });
        document.querySelectorAll('#exam-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                const idx = ev.target.getAttribute('data-idx');
                eData.splice(idx, 1);
                AppState.saveExams(eData);
                renderExams();
                updateReminderBadge();
            });
        });

        document.getElementById('add-exam-btn').addEventListener('click', () => {
            const name = document.getElementById('exam-name').value.trim();
            const date = document.getElementById('exam-date').value;
            if (!name) return;
            eData.push({ name, date, completed: false });
            AppState.saveExams(eData);
            renderExams();
            updateReminderBadge();
        });
    };

    const renderProjects = () => {
        btnP.style.background = 'var(--primary-color)';
        btnE.style.background = 'transparent';

        const pData = AppState.getProjects();
        let currentP = pData.length > 0 ? pData[0] : { name: '', report: '' };

        targetDiv.innerHTML = `
            <div class="flex-col">
                <input type="text" id="proj-name" placeholder="Project Name" value="${currentP.name}">
                <textarea id="proj-report" placeholder="Write your project report here...">${currentP.report}</textarea>
                <button class="primary-btn" id="save-proj-btn">Save Project</button>
            </div>
            <div class="ai-box mt-2">
                <h3><span class="material-icons-outlined">psychology</span> AI Assistant</h3>
                <input type="text" id="ai-proj-ask" placeholder="Ask AI to expand on a topic, check grammar, or suggest ideas">
                <button class="secondary-btn mt-1" id="ai-proj-btn" style="width:100%">Ask AI</button>
                <div id="ai-proj-res" class="mt-1" style="max-height:200px; overflow-y:auto;"></div>
            </div>
        `;

        document.getElementById('save-proj-btn').addEventListener('click', () => {
            currentP.name = document.getElementById('proj-name').value;
            currentP.report = document.getElementById('proj-report').value;
            AppState.saveProjects([currentP]);
            alert('Project Saved Locally');
        });

        document.getElementById('ai-proj-btn').addEventListener('click', async () => {
            const ask = document.getElementById('ai-proj-ask').value;
            const rep = document.getElementById('proj-report').value;
            if (!ask) return;

            const contentDiv = document.getElementById('ai-proj-res');
            contentDiv.innerHTML = '<p class="ai-typing">Thinking</p>';

            const prompt = `Context: The user is writing a project report. Current report content: "${rep}". User's question/request: "${ask}". Provide useful, constructive assistance, avoiding extremely long essays unless requested. Use markdown.`;
            const res = await callAI(prompt);
            contentDiv.innerHTML = marked.parse(res);
        });
    };

    btnE.addEventListener('click', renderExams);
    btnP.addEventListener('click', renderProjects);

    // Initial render
    renderExams();
}

function openGames() {
    modalTitle.innerText = 'Mind Games';

    let html = `
        <div class="flex-row mb-1">
            <button class="secondary-btn" id="btn-memory" style="flex:1; background:var(--primary-color)">Memory Match</button>
            <button class="secondary-btn" id="btn-tictactoe" style="flex:1">Tic Tac Toe</button>
        </div>
        <div id="game-target" class="flex-col" style="align-items:center; width:100%; max-height:60vh; overflow-y:auto; padding: 10px;"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const target = document.getElementById('game-target');
    const btnM = document.getElementById('btn-memory');
    const btnT = document.getElementById('btn-tictactoe');

    const renderMemory = () => {
        btnM.style.background = 'var(--primary-color)';
        btnT.style.background = 'transparent';
        target.innerHTML = `
            <p style="text-align:center; margin-bottom:1rem;">Match pairs to challenge your mind and improve memory.</p>
            <button class="secondary-btn" id="start-game-btn">Start Memory Match</button>
            <div id="game-board" class="memory-grid" style="width:100%;"></div>
        `;
        document.getElementById('start-game-btn').addEventListener('click', startMemoryGame);
    };

    const renderTicTacToe = () => {
        btnT.style.background = 'var(--primary-color)';
        btnM.style.background = 'transparent';
        target.innerHTML = `
            <p style="text-align:center; margin-bottom:1rem;">Strategy challenge against yourself.</p>
            <div id="ttt-board" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; width:250px; margin-top:20px;">
                ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<div class="memory-card ttt-cell" data-i="${i}" style="height:80px; font-size:3rem; cursor:pointer;"></div>`).join('')}
            </div>
            <button class="secondary-btn mt-2" id="reset-ttt-btn">Reset Board</button>
        `;

        let turn = 'X';
        const cells = document.querySelectorAll('.ttt-cell');

        cells.forEach(c => {
            c.addEventListener('click', () => {
                if (c.innerText !== '') return;
                c.innerText = turn;
                c.style.color = turn === 'X' ? 'var(--primary-color)' : 'var(--secondary-color)';
                turn = turn === 'X' ? 'O' : 'X';
            });
        });

        document.getElementById('reset-ttt-btn').addEventListener('click', () => {
            cells.forEach(c => { c.innerText = ''; c.style.color = 'inherit'; });
            turn = 'X';
        });
    };

    btnM.addEventListener('click', renderMemory);
    btnT.addEventListener('click', renderTicTacToe);

    renderMemory();
}

function startMemoryGame() {
    const emojis = ['🌟', '🧠', '🚀', '🔮', '📚', '🧩', '🎨', '🎯'];
    const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

    const board = document.getElementById('game-board');
    board.innerHTML = '';

    let flippedCards = [];
    let matchedPairs = 0;

    cards.forEach((emoji, idx) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.val = emoji;
        card.dataset.idx = idx;

        card.addEventListener('click', () => {
            if (card.classList.contains('flipped') || card.classList.contains('matched') || flippedCards.length >= 2) return;

            card.classList.add('flipped');
            card.innerText = emoji;
            flippedCards.push(card);

            if (flippedCards.length === 2) {
                setTimeout(() => {
                    if (flippedCards[0].dataset.val === flippedCards[1].dataset.val) {
                        flippedCards[0].classList.add('matched');
                        flippedCards[1].classList.add('matched');
                        matchedPairs++;
                        if (matchedPairs === emojis.length) {
                            alert('Congratulations! You completed the game!');
                        }
                    } else {
                        flippedCards[0].classList.remove('flipped');
                        flippedCards[0].innerText = '';
                        flippedCards[1].classList.remove('flipped');
                        flippedCards[1].innerText = '';
                    }
                    flippedCards = [];
                }, 1000);
            }
        });
        board.appendChild(card);
    });
}

function openListTracker(type) {
    modalTitle.innerText = `${type} Tracker`;

    let html = `
        <div class="flex-row mb-1">
            <input type="text" id="track-name" placeholder="Add a ${type === 'Movies' ? 'Movie' : 'Series'} to watchlist">
            ${type === 'Series' ? `<input type="number" id="track-ep" placeholder="Current Ep" style="width:120px;" min="0">` : ''}
            <button class="primary-btn" id="add-track-btn" style="width: auto;">Add</button>
        </div>
        <div class="item-list" id="track-list"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const renderList = () => {
        const list = document.getElementById('track-list');
        list.innerHTML = '';
        const items = AppState.get(`watchlist_${type}`, []);

        items.forEach((item, i) => {
            const li = document.createElement('div');
            li.className = 'list-item flex-between';
            li.innerHTML = `
                <div class="item-content ${item.completed ? 'completed' : ''}">
                    <div class="checkbox ${item.completed ? 'checked' : ''}" data-idx="${i}"></div>
                    <div>
                        <strong>${item.name}</strong>
                        ${type === 'Series' ? `<span class="status-badge status-pending" style="margin-left:10px;">Ep: ${item.ep || 0}</span>` : ''}
                    </div>
                </div>
                <div class="flex-row">
                    ${type === 'Series' ? `<button class="secondary-btn inc-ep-btn" data-idx="${i}" style="padding:0.2rem 0.5rem;">+1 Ep</button>` : ''}
                    <span class="material-icons-outlined delete-btn" data-idx="${i}">delete</span>
                </div>
            `;
            list.appendChild(li);
        });

        document.querySelectorAll('#track-list .checkbox').forEach(box => {
            box.addEventListener('click', (ev) => {
                const idx = ev.target.getAttribute('data-idx');
                const t = AppState.get(`watchlist_${type}`, []);
                t[idx].completed = !t[idx].completed;
                AppState.set(`watchlist_${type}`, t);
                renderList();
            });
        });

        document.querySelectorAll('#track-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                const idx = ev.target.getAttribute('data-idx');
                const t = AppState.get(`watchlist_${type}`, []);
                t.splice(idx, 1);
                AppState.set(`watchlist_${type}`, t);
                renderList();
            });
        });

        if (type === 'Series') {
            document.querySelectorAll('#track-list .inc-ep-btn').forEach(btn => {
                btn.addEventListener('click', (ev) => {
                    const idx = ev.target.getAttribute('data-idx');
                    const t = AppState.get(`watchlist_${type}`, []);
                    t[idx].ep = Number(t[idx].ep || 0) + 1;
                    AppState.set(`watchlist_${type}`, t);
                    renderList();
                });
            });
        }
    };

    renderList();

    document.getElementById('add-track-btn').addEventListener('click', () => {
        const name = document.getElementById('track-name').value.trim();
        const ep = type === 'Series' ? document.getElementById('track-ep').value : 0;
        if (!name) return;
        const items = AppState.get(`watchlist_${type}`, []);
        items.push({ name, ep, completed: false });
        AppState.set(`watchlist_${type}`, items);
        renderList();
    });
}

function openBooks() {
    modalTitle.innerText = 'Book Library';

    let html = `
        <div class="ai-box mb-1">
            <h3><span class="material-icons-outlined">search</span> AI Book Finder</h3>
            <div class="flex-row">
                <input type="text" id="ai-book-search" placeholder="Type a topic or book title...">
                <button class="secondary-btn" id="ai-book-btn">Find Recommendations</button>
            </div>
            <div id="ai-book-res" class="mt-1"></div>
        </div>
        <hr style="border-color:var(--glass-border); margin:2rem 0;">
        <h3>My Shelves</h3>
        <p class="text-secondary mt-1">Due to browser restrictions, we cannot store actual PDF files in localStorage easily. You can add links to your books here.</p>
        <div class="flex-row mt-1 mb-1">
            <input type="text" id="book-title" placeholder="Book Title">
            <input type="url" id="book-link" placeholder="URL Link to PDF/Store">
            <button class="primary-btn" id="add-book-btn" style="width: auto;">Add</button>
        </div>
        <div class="category-grid" id="book-grid"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const renderBooks = () => {
        const grid = document.getElementById('book-grid');
        grid.innerHTML = '';
        const books = AppState.get('my_books', []);

        books.forEach((b, i) => {
            const el = document.createElement('div');
            el.className = 'category-card';
            el.innerHTML = `
                <span class="material-icons-outlined" style="font-size:3rem; color:var(--primary-color)">menu_book</span>
                <h3>${b.title}</h3>
                <a href="${b.link}" target="_blank" class="secondary-btn" style="display:block; margin-top:1rem; text-decoration:none;">Read / Open</a>
                <span class="material-icons-outlined delete-btn" style="display:block; margin-top:1rem;" data-idx="${i}">delete</span>
            `;
            grid.appendChild(el);
        });

        document.querySelectorAll('#book-grid .delete-btn').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                const idx = ev.target.getAttribute('data-idx');
                books.splice(idx, 1);
                AppState.set('my_books', books);
                renderBooks();
            });
        });
    };
    renderBooks();

    document.getElementById('add-book-btn').addEventListener('click', () => {
        const title = document.getElementById('book-title').value.trim();
        const link = document.getElementById('book-link').value.trim();
        if (!title) return;
        const books = AppState.get('my_books', []);
        books.push({ title, link });
        AppState.set('my_books', books);
        renderBooks();
    });

    document.getElementById('ai-book-btn').addEventListener('click', async () => {
        const query = document.getElementById('ai-book-search').value;
        if (!query) return;
        const resDiv = document.getElementById('ai-book-res');
        resDiv.innerHTML = '<p class="ai-typing">Finding books...</p>';
        const prompt = `Recommend 3 highly-rated books related to: "${query}". Provide the title, author, and a 1-sentence summary for each. Format nicely with markdown.`;
        const ans = await callAI(prompt);
        resDiv.innerHTML = marked.parse(ans);
    });
}

function openNewsAndFacts() {
    modalTitle.innerText = 'News & Facts';

    let html = `
        <div class="flex-row mb-1">
            <button class="secondary-btn" id="nav-news" style="flex:1; background:var(--primary-color)">News</button>
            <button class="secondary-btn" id="nav-facts" style="flex:1">Random Facts</button>
        </div>
        <div id="nf-target"></div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const target = document.getElementById('nf-target');
    const bNews = document.getElementById('nav-news');
    const bFacts = document.getElementById('nav-facts');

    const renderNews = () => {
        bNews.style.background = 'var(--primary-color)';
        bFacts.style.background = 'transparent';

        target.innerHTML = `
            <div class="flex-row mb-1" style="overflow-x:auto; padding-bottom:10px;">
                ${['Business', 'Studies', 'Global', 'India', 'Gujarat', 'Vadodara', 'Sports'].map(c =>
            `<span class="status-badge" style="background:rgba(255,255,255,0.1); cursor:pointer;" onclick="document.getElementById('news-q').value='${c}'">${c}</span>`
        ).join('')}
            </div>
            <div class="ai-box">
                <h3><span class="material-icons-outlined">psychology</span> AI News Curator</h3>
                <div class="flex-row">
                    <input type="text" id="news-q" placeholder="E.g., Global, Business, Vadodara">
                    <button class="secondary-btn" id="ai-news-btn">Fetch Summary</button>
                </div>
                <div id="news-res" class="mt-1"></div>
            </div>
        `;

        document.getElementById('ai-news-btn').addEventListener('click', async () => {
            const q = document.getElementById('news-q').value;
            if (!q) return;
            const res = document.getElementById('news-res');
            res.innerHTML = '<p class="ai-typing">Curating latest fictional news outline (as AI)</p>';
            const prompt = `Act as a news aggregator. Provide 3 short bullet points summarizing hypothetical but realistic recent top news for the category: "${q}". Make it sound like a brief morning newsletter.`;
            res.innerHTML = marked.parse(await callAI(prompt));
        });
    };

    const renderFacts = async () => {
        bFacts.style.background = 'var(--primary-color)';
        bNews.style.background = 'transparent';

        target.innerHTML = `
            <div class="ai-box">
                <h3><span class="material-icons-outlined">lightbulb</span> Mind-expanding Fact</h3>
                <div id="fact-res"><p class="ai-typing">Thinking of a fact...</p></div>
                <button class="secondary-btn mt-1" id="next-fact-btn">Get Another Fact</button>
            </div>
        `;

        const fetchFact = async () => {
            document.getElementById('fact-res').innerHTML = '<p class="ai-typing">Thinking of a fact...</p>';
            const prompt = `Tell me one extremely interesting, mind-blowing, and verifiable fact that helps people improve their general knowledge.`;
            document.getElementById('fact-res').innerHTML = marked.parse(await callAI(prompt));
        };
        fetchFact();
        document.getElementById('next-fact-btn').addEventListener('click', fetchFact);
    };

    bNews.addEventListener('click', renderNews);
    bFacts.addEventListener('click', renderFacts);
    renderNews();
}

function openPerfectionist() {
    modalTitle.innerText = 'Becoming a Perfectionist';

    let html = `
        <p style="text-align:center; color:var(--text-secondary); margin-bottom:2rem;">Your AI-powered coach for personal excellence.</p>
        <div class="flex-row mb-1">
            <button class="secondary-btn" id="p-beh" style="flex:1">Behavior</button>
            <button class="secondary-btn" id="p-com" style="flex:1">Communication</button>
            <button class="secondary-btn" id="p-fas" style="flex:1">Fashion</button>
        </div>
        <div id="p-target" class="ai-box" style="margin-top:2rem;">
            <p>Select a category above to get started.</p>
        </div>
    `;
    modalBody.innerHTML = html;
    modalContainer.classList.remove('hidden');

    const target = document.getElementById('p-target');

    document.getElementById('p-beh').addEventListener('click', async (e) => {
        document.querySelectorAll('[id^="p-"]').forEach(b => b.style.background = 'transparent');
        e.target.style.background = 'var(--primary-color)';
        target.innerHTML = '<p class="ai-typing">Analyzing successful behavior patterns...</p>';
        const prompt = `As a high-end behavioral coach, explain how highly successful people behave in 3 concise bullet points. Include mindset, discipline, and handling failure.`;
        target.innerHTML = marked.parse(await callAI(prompt));
    });

    document.getElementById('p-com').addEventListener('click', async (e) => {
        document.querySelectorAll('[id^="p-"]').forEach(b => b.style.background = 'transparent');
        e.target.style.background = 'var(--primary-color)';
        target.innerHTML = '<p class="ai-typing">Formulating communication advice...</p>';
        const prompt = `As an expert communications coach, give me 3 highly effective strategies for communicating with others confidently and clearly. Include active listening and articulation.`;
        target.innerHTML = marked.parse(await callAI(prompt));
    });

    document.getElementById('p-fas').addEventListener('click', async (e) => {
        document.querySelectorAll('[id^="p-"]').forEach(b => b.style.background = 'transparent');
        e.target.style.background = 'var(--primary-color)';

        target.innerHTML = `
            <h3><span class="material-icons-outlined">checkroom</span> Style Recommendations</h3>
            <p style="margin-bottom:1rem;">Select an occasion to get color and outfit suggestions:</p>
            <div class="flex-row" style="flex-wrap:wrap; gap:10px;">
                ${['College', 'Casual', 'Party', 'Wedding'].map(c =>
            `<button class="secondary-btn style-trigger" style="padding:0.4rem 0.8rem;" data-occ="${c}">${c}</button>`
        ).join('')}
            </div>
            <div id="style-res" class="mt-1 pt-1" style="border-top:1px solid var(--glass-border);"></div>
        `;

        document.querySelectorAll('.style-trigger').forEach(btn => {
            btn.addEventListener('click', async (ev) => {
                const occ = ev.target.getAttribute('data-occ');
                const res = document.getElementById('style-res');
                res.innerHTML = '<p class="ai-typing">Curating fashion advice...</p>';
                const prompt = `As an expert fashion stylist, recommend an elegant outfit for a ${occ} occasion. What colors should I wear? What color combinations are great? Also provide 1 realistic description of an item I should buy (like "Navy Blue Chinos" or "White Linen Shirt" with a mocked up Amazon search sentence).`;
                res.innerHTML = marked.parse(await callAI(prompt));
            });
        });
    });
}

// --------------------------------------------------------------------------
// Cultural & Seasonal Dynamic Background Logic (Vadodara Localized)
// --------------------------------------------------------------------------
/**
 * Vadodara Adaptive Dashboard - Seasonal & Festival Logic
 * Precise for the year 2026
 */

function applySeasonalBackground() {
    const today = new Date();
    const month = today.getMonth(); // 0 is January
    const day = today.getDate();
    const root = document.documentElement;
    const bgContainer = document.getElementById('seasonal-bg');

    // 1. Clear existing particles to prevent performance lag
    if (bgContainer) {
        bgContainer.innerHTML = '';
    } else {
        console.error("Element #seasonal-bg not found in HTML.");
        return;
    }

    // 2. 2026 Specific Festival Dates for Vadodara
    // Uttarayan: Jan 14-15
    const isUttarayan = (month === 0 && (day === 14 || day === 15));

    // Navratri 2026: 
    // Chaitra Navratri (March 19-27) OR Sharad Navratri (Oct 11-20)
    const isNavratri = (month === 2 && day >= 19 && day <= 27) ||
        (month === 9 && day >= 11 && day <= 20);

    // Diwali 2026: Nov 6-10 (Approximate week of festivities)
    const isDiwali = (month === 10 && day >= 6 && day <= 10);

    // 3. SVG Assets for Organic Autumn

    const realLeaf1 = `<svg viewBox="0 0 512 512" style="width:2.5em; height:2.5em; fill:currentColor; filter:drop-shadow(2px 4px 5px rgba(0,0,0,0.2));"><path d="M495.3 247.9l-49.8-49.8c-7.9-7.9-20.9-7.5-28.5 1-28.3 32.1-51.7 54.3-51.7 54.3-3.6 4-9.3 5.3-14.3 3.3-5-2-8.3-6.9-8.3-12.3v-49.8c0-30.7 7.7-65.7 6.1-98.8-1.1-22.3-11.4-43-29-58.4-16.7-14.7-39.2-22.1-61.9-20.5-25.1 1.7-48 13.9-63 33.6-21.2 28.1-17.6 62.7-17 76 1.1 26.5 10.7 59.8 10.7 59.8 1.9 6.5-1.9 13.3-8.5 15.1-6.6 1.8-13.4-1.2-16-7.5-15-37.1-50-61.3-88.7-61.3-43 0-79.6 30-89 71.9-8.7 38.6 10.7 77.5 45.9 94.6 20.3 9.9 44.5 10.6 65.5 3.1 7.2-2.5 15.3 1.1 18.2 8.2 2.9 7-1.1 15-8 18-20.5 9.1-39.7 26.1-53 49.3-17.6 30.6-18 64.6-2 94.2 14.5 26.9 39.5 45.4 68.3 50.8 12.3 2.3 25.1 1.9 37.3-1 25.4-6.1 47.9-21.3 62-43.2 13-20.1 18.8-43.6 14.7-66.3-1-5.6 2.6-11 8.2-12.1s11.1 2.5 12.2 8.1c8.1 43.1 36.4 78 77 92.6 11.2 4.1 23 6 34.9 5.8 28.8-.4 56.1-13 74.4-34.9 20.6-24.7 26.1-59.2 13.5-89.6-9.7-23.7-27.1-42.9-49.3-55.6-5.8-3.3-7.5-11.1-3.6-16.5s11.3-7.1 17-3.8c12 7 35.1 24.3 64.9 24.3 33 0 59.8-26.8 59.8-59.8 0-14.8-5.6-28.7-16-39.7z"/></svg>`;
    const realLeaf2 = `<svg viewBox="0 0 512 512" style="width:2em; height:2em; fill:currentColor; filter:drop-shadow(2px 4px 5px rgba(0,0,0,0.2));"><path d="M483.4 93.9c-8.9-10.7-22.1-16.8-35.9-16.8-9 0-18 2.5-25.5 7.3-15.6 10.1-23.7 29.5-20.4 48l11.4 64.8c-15.8-8.5-35.3-10.9-53-6.5C335 197 312 216 304 241.6c-4.3 13.7-3.2 28.4 2.9 41.5-18.7-12-42.2-13.6-62.3-4.1-17.7 8.3-31.1 23.4-37.3 42-4 11.9-4.8 24.3-2.6 36.3-19.1-19.4-48-26.6-74.4-18.4-23.7 7.4-42.6 25-51 47.9-6.3 17.5-6.8 36.6-1.5 54.4 7.2 24.4 22.8 45 44 58.3 11 6.9 24.1 10.9 36.9 11.9.9 5.8 2 11.5 3.3 17.3 3.6 16.9 8.2 33.5 13.2 49.3 1.9 6 6.7 10.6 12.6 12 10.3 2.5 19.3-5.2 20.3-15.7 1.7-17 3.3-34.6 4.7-52.5 22.5.4 46.5-6 66.8-19.9 25.1-16.9 43.1-41.2 50.8-70.2 4.4-16.5 4-33.6-1.2-49.4 17.3 18.2 44.5 25.1 69 17.4 21.6-6.8 38.6-22.7 45.8-43.2 6.3-18.1 4.3-37.6-5.5-54 18 10 39.5 10.2 57.6 1.4 16.3-7.9 28.5-21.7 34.3-38.6 6-17.5 4.9-36.6-3.2-53.5 17-6 32-19.5 39.3-37.9 7.7-19.3 5.4-40.4-6-57.5zm-59.5 142.1c11.9 20.3 6.9 46.5-12 60.1-4.8 3.5-10.4 5.9-16.3 6.9-6.9 1.1-13.8.4-20.2-1.9-8.5-3.1-15.6-8.7-20.3-16.1-5-7.9-7-17.1-5.7-26.1 1.7-11.8 8.1-22.5 17.7-29.3 14.1-10 33-10.3 47.5-.9l9.3 7.3zm-77.9-19c2.3 8.3 2.1 17-.6 25-2.7 8-7.7 15-14.2 19.7-7.2 5.2-16.3 7.6-25.3 6.6-8.6-.9-16.6-5.1-22-11.8-6-7.5-8.8-17-7.9-26.6.9-9.1 5.2-17.3 12.1-23 8.8-7.2 20.8-9.4 31.7-5.9 8.6 2.8 15.6 8.7 19.8 17z"/></svg>`;

    // 4. Helper Function to Create Particles
    function createParticles(contentHtml, count, animation, minDur, maxDur, isHtml = false) {
        const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)'];

        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'particle';

            if (isHtml) {
                p.innerHTML = contentHtml;
            } else {
                p.innerText = contentHtml;
            }

            // Randomize position and timing
            p.style.left = Math.random() * 100 + 'vw';
            p.style.fontSize = (Math.random() * 20 + 15) + 'px';
            p.style.animation = `${animation} ${Math.random() * (maxDur - minDur) + minDur}s ease-in-out infinite`;
            p.style.animationDelay = (Math.random() * 5) + 's';

            // Apply organic colors to SVGs or specific emojis
            if (isHtml || contentHtml === '✨' || contentHtml === '💧') {
                p.style.color = colors[Math.floor(Math.random() * colors.length)];
            }

            bgContainer.appendChild(p);
        }
    }

    // 5. Theme and Particle Execution Logic
    if (isUttarayan) {
        root.style.setProperty('--primary-color', '#3b82f6'); // Sky Blue
        root.style.setProperty('--secondary-color', '#f43f5e'); // Bright Red
        root.style.setProperty('--accent-color', '#facc15'); // Yellow
        createParticles('🪁', 20, 'floatKite', 6, 10, false);
    }
    else if (isNavratri) {
        root.style.setProperty('--primary-color', '#d97706'); // Marigold Orange
        root.style.setProperty('--secondary-color', '#10b981'); // Green
        root.style.setProperty('--accent-color', '#ec4899'); // Pink
        createParticles('✨', 35, 'sparkle', 2, 5, false);
        createParticles('🥢', 15, 'floatDandiya', 6, 12, false);
    }
    else if (isDiwali) {
        root.style.setProperty('--primary-color', '#f59e0b'); // Gold
        root.style.setProperty('--secondary-color', '#ef4444'); // Red
        root.style.setProperty('--accent-color', '#fbbf24'); // Yellow
        createParticles('🎇', 25, 'fireworkBurst', 3, 6, false);
        createParticles('🪔', 10, 'floatUp', 8, 12, false);
    }
    else {
        // SEASONAL FALLBACKS (If no festival today)
        if (month >= 2 && month <= 5) {
            // Summer (March to June)
            root.style.setProperty('--primary-color', '#facc15');
            root.style.setProperty('--secondary-color', '#fb923c');
            root.style.setProperty('--accent-color', '#f87171');
            createParticles('🔆', 15, 'floatUp', 6, 10, false);
        } else if (month >= 6 && month <= 8) {
            // Monsoon (July to Sept)
            root.style.setProperty('--primary-color', '#0ea5e9');
            root.style.setProperty('--secondary-color', '#3b82f6');
            root.style.setProperty('--accent-color', '#8b5cf6');
            createParticles('💧', 40, 'rainDrop', 2, 4, false);
        } else if (month >= 9 && month <= 10) {
            // Autumn (Oct to Nov)
            root.style.setProperty('--primary-color', '#f59e0b');
            root.style.setProperty('--secondary-color', '#d97706');
            root.style.setProperty('--accent-color', '#10b981');
            createParticles(realLeaf1, 15, 'fallingLeaf', 6, 11, true);
            createParticles(realLeaf2, 10, 'fallingLeaf', 7, 13, true);
        } else {
            // Winter (Dec to Feb)
            root.style.setProperty('--primary-color', '#60a5fa');
            root.style.setProperty('--secondary-color', '#818cf8');
            root.style.setProperty('--accent-color', '#3b82f6');
            createParticles('❄️', 30, 'fallingLeaf', 5, 9, false);
        }
    }
}

// Initialize the background on load
document.addEventListener('DOMContentLoaded', applySeasonalBackground);

// Optional: Refresh background if the window stays open for a long time (e.g., across midnight)
setInterval(applySeasonalBackground, 3600000); // Check once an hour

function createParticles(contentHtml, count, animation, minDur, maxDur, isHtml = false) {
    const bgContainer = document.getElementById('seasonal-bg');
    const colors = ['var(--primary-color)', 'var(--secondary-color)', 'var(--accent-color)'];

    // MOBILE OPTIMIZATION: 
    // If the screen is small, cut the particle count in half to save battery/CPU
    let optimizedCount = window.innerWidth < 600 ? Math.floor(count / 2) : count;

    for (let i = 0; i < optimizedCount; i++) {
        const p = document.createElement('div');
        p.className = 'particle';

        if (isHtml) p.innerHTML = contentHtml;
        else p.innerText = contentHtml;

        p.style.left = Math.random() * 100 + 'vw';

        // Slightly smaller particles for mobile
        const sizeMultiplier = window.innerWidth < 600 ? 0.7 : 1;
        p.style.fontSize = ((Math.random() * 20 + 15) * sizeMultiplier) + 'px';

        p.style.animation = `${animation} ${Math.random() * (maxDur - minDur) + minDur}s ease-in-out infinite`;
        p.style.animationDelay = (Math.random() * 5) + 's';

        if (isHtml || contentHtml === '✨' || contentHtml === '💧') {
            p.style.color = colors[Math.floor(Math.random() * colors.length)];
        }

        bgContainer.appendChild(p);
    }
}