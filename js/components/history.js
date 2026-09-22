import { store } from '../store.js';

let activeFilter = 'all'; // 'all', 'completed', 'carried', 'high'
let searchQuery = '';

export function renderHistory(container) {
  let filteredTasks = store.tasks;

  if (activeFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  } else if (activeFilter === 'carried') {
    filteredTasks = filteredTasks.filter(t => t.carriedForward);
  } else if (activeFilter === 'high') {
    filteredTasks = filteredTasks.filter(t => t.priority === 'high');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
      <div>
        <h1 class="font-headline-lg">Task History &amp; Carry-Over Audit</h1>
        <p class="font-body-md" style="color: var(--on-surface-variant); margin-top: 4px;">
          Complete historical timeline of completed tasks, rollover records, and audit milestones.
        </p>
      </div>
    </div>

    <!-- Filters & Search Bar Card -->
    <div class="card" style="padding: var(--space-md); margin-bottom: var(--space-lg);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
        <div class="capture-tabs" id="historyFilterTabs" style="margin-bottom: 0;">
          <button class="capture-tab-btn ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All Tasks (${store.tasks.length})</button>
          <button class="capture-tab-btn ${activeFilter === 'completed' ? 'active' : ''}" data-filter="completed">Completed (${store.tasks.filter(t => t.completed).length})</button>
          <button class="capture-tab-btn ${activeFilter === 'carried' ? 'active' : ''}" data-filter="carried">Carried Forward (${store.tasks.filter(t => t.carriedForward).length})</button>
          <button class="capture-tab-btn ${activeFilter === 'high' ? 'active' : ''}" data-filter="high">High Priority (${store.tasks.filter(t => t.priority === 'high').length})</button>
        </div>

        <div style="position: relative; width: 280px; max-width: 100%;">
          <input type="text" id="historySearchInput" class="form-control" style="padding-left: 36px;" placeholder="Search history..." value="${escapeHtml(searchQuery)}" />
          <span class="material-symbols-outlined" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--outline); font-size: 18px;">search</span>
        </div>
      </div>
    </div>

    <!-- History Cards / Table -->
    <div class="card">
      <div class="task-list">
        ${filteredTasks.length === 0 ? `
          <div style="text-align: center; padding: var(--space-2xl); color: var(--outline);">
            <span class="material-symbols-outlined" style="font-size: 40px; opacity: 0.4;">history_toggle_off</span>
            <p style="margin-top: 10px; font-size: 14px;">No tasks match the selected history filter.</p>
          </div>
        ` : filteredTasks.map(task => `
          <div class="task-item" style="padding: 14px 12px; border: 1px solid var(--surface-container); align-items: flex-start;" data-task-id="${task.id}">
            <div class="task-left" style="align-items: flex-start; gap: 12px; flex: 1; min-width: 0;">
              <div class="task-checkbox" data-action="toggle" style="margin-top: 2px; flex-shrink: 0; ${task.completed ? 'background: var(--secondary); border-color: var(--secondary); color: white;' : ''}">
                <span class="material-symbols-outlined" style="font-size: 16px; font-weight: 700;">check</span>
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span class="task-title" style="font-size: 15px; font-weight: 600; white-space: normal; word-break: break-word; line-height: 1.35; ${task.completed ? 'text-decoration: line-through; color: var(--outline);' : ''}">${escapeHtml(task.title)}</span>
                  ${task.carriedForward ? `
                    <span class="carried-forward-badge">
                      <span class="material-symbols-outlined" style="font-size: 12px;">forward</span>
                      <span>Carried ${task.carryForwardCount}x</span>
                    </span>` : ''}
                  <span class="priority-flag ${task.priority}" style="font-size: 11px; font-weight: 600; text-transform: uppercase; flex-shrink: 0;">
                    <span class="material-symbols-outlined filled" style="font-size: 13px;">flag</span>${task.priority}
                  </span>
                </div>

                ${task.description ? `
                  <p class="font-body-sm" style="color: var(--on-surface-variant); margin-top: 4px;">${escapeHtml(task.description)}</p>
                ` : ''}

                <div style="display: flex; align-items: center; gap: 14px; font-size: 11px; color: var(--outline); margin-top: 8px; flex-wrap: wrap;">
                  <span><strong style="color: var(--on-surface);">Category:</strong> ${escapeHtml(task.category || 'General')}</span>
                  <span><strong style="color: var(--on-surface);">Due Date:</strong> ${task.dueDate || 'None'}</span>
                  ${task.originalDueDate && task.originalDueDate !== task.dueDate ? `
                    <span><strong style="color: var(--amber);">Orig Due:</strong> ${task.originalDueDate}</span>
                  ` : ''}
                  ${task.completedAt ? `
                    <span><strong style="color: var(--secondary);">Completed:</strong> ${new Date(task.completedAt).toLocaleString()}</span>
                  ` : `<span style="color: var(--outline);"><strong style="color: var(--on-surface);">Status:</strong> Open</span>`}
                  <span><strong style="color: var(--on-surface);">Created:</strong> ${new Date(task.createdAt).toLocaleDateString()}</span>
                </div>

                ${task.carryForwardDates && task.carryForwardDates.length > 0 ? `
                  <div style="margin-top: 6px; font-size: 11px; color: var(--amber);">
                    <span>Rolled over past: ${task.carryForwardDates.join(', ')}</span>
                  </div>
                ` : ''}

                ${task.attachments && task.attachments.length > 0 ? `
                  <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
                    ${task.attachments.map(att => `
                      <span class="option-pill" style="font-size: 11px; background: var(--surface-low); color: var(--primary);">
                        <span class="material-symbols-outlined" style="font-size: 13px;">attach_file</span>
                        <span>${escapeHtml(att.name)}</span>
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            </div>

            <div class="task-actions" style="margin-top: 2px;">
              <button class="icon-btn" data-action="delete" title="Delete record">
                <span class="material-symbols-outlined" style="font-size: 18px; color: var(--outline);">delete</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  wireHistoryEvents(container);
}

function wireHistoryEvents(container) {
  // Tabs
  container.querySelectorAll('#historyFilterTabs .capture-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.dataset.filter;
      renderHistory(container);
    });
  });

  // Search input
  const sInput = container.querySelector('#historySearchInput');
  if (sInput) {
    sInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderHistory(container);
    });
  }

  // Row actions
  container.addEventListener('click', (e) => {
    const row = e.target.closest('.task-item');
    if (!row) return;
    const taskId = row.dataset.taskId;

    const delBtn = e.target.closest('[data-action="delete"]');
    if (delBtn) {
      store.deleteTask(taskId);
      renderHistory(container);
      return;
    }

    const toggleBtn = e.target.closest('[data-action="toggle"]');
    if (toggleBtn) {
      store.toggleTask(taskId);
      renderHistory(container);
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
