import { store } from '../store.js';
import { getTodayString } from '../carry-forward.js';

export function renderDashboard(container) {
  const todayTasks = store.getTodayTasks();
  const completedToday = todayTasks.filter(t => t.completed).length;
  const overdueTasks = store.getOverdueTasks();
  const monthlyStats = store.getMonthlyStats();
  const streakDays = 7;

  const completionPercent = todayTasks.length > 0 
    ? Math.round((completedToday / todayTasks.length) * 100) 
    : 0;

  // Radial calculation (circ = 2 * PI * 40 = 251.2)
  const strokeDashoffset = 251.2 - (251.2 * (monthlyStats.completionRate / 100));

  const recentNotes = store.notes.slice(0, 3);
  const upcomingReminders = store.reminders.slice(0, 3);

  container.innerHTML = `
    <!-- Top Greeting Bar -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-lg);">
      <div>
        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: var(--radius-full); background: var(--surface-high); margin-bottom: 8px;">
          <span class="material-symbols-outlined" style="font-size: 14px; color: var(--primary);">calendar_today</span>
          <span class="font-label-sm" style="color: var(--outline);">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        <h1 class="font-headline-lg" style="margin-top: 2px;">Good Morning, Avinash <span style="display: inline-block; animation: wave 1.5s infinite;">👋</span></h1>
        <p class="font-body-md" style="color: var(--on-surface-variant); margin-top: 4px;">Let's make today productive and calm!</p>
      </div>
    </div>

    <!-- Quick Stats Ribbon -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: var(--surface-low); color: var(--primary);">
          <span class="material-symbols-outlined" style="font-size: 20px;">fact_check</span>
        </div>
        <span class="stat-val">${todayTasks.length}</span>
        <span class="stat-label">Tasks</span>
        <span class="stat-sub" style="color: var(--secondary);">${completedToday} done</span>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: var(--error-container); color: var(--error);">
          <span class="material-symbols-outlined" style="font-size: 20px;">error</span>
        </div>
        <span class="stat-val" style="color: var(--error);">${overdueTasks.length}</span>
        <span class="stat-label">Overdue</span>
        <span class="stat-sub" style="color: var(--error);">${overdueTasks.length > 0 ? 'Action needed' : 'All clear'}</span>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: var(--primary-fixed); color: var(--primary);">
          <span class="material-symbols-outlined" style="font-size: 20px;">bar_chart</span>
        </div>
        <span class="stat-val">${monthlyStats.completed}</span>
        <span class="stat-label">Monthly</span>
        <span class="stat-sub" style="color: var(--outline);">of ${monthlyStats.totalCreated} total</span>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(255, 218, 214, 0.6); color: var(--on-error-container);">
          <span class="material-symbols-outlined filled" style="font-size: 20px; color: var(--fire);">local_fire_department</span>
        </div>
        <span class="stat-val">${streakDays}</span>
        <span class="stat-label">Streak</span>
        <span class="stat-sub" style="color: var(--secondary);">Days on fire</span>
      </div>
    </div>

    <!-- Quick Capture Card -->
    <div class="quick-capture-card">
      <div class="card-header" style="margin-bottom: var(--space-xs);">
        <div class="card-title-group">
          <div class="card-icon-badge">
            <span class="material-symbols-outlined" style="font-size: 18px;">edit_note</span>
          </div>
          <span class="font-headline-sm" style="font-weight: 700;">Quick Capture</span>
        </div>
        <span class="font-label-sm" style="color: var(--outline);">Press Enter to add</span>
      </div>

      <div class="capture-tabs" id="quickCaptureTabs">
        <button class="capture-tab-btn active" data-mode="Task">Task</button>
        <button class="capture-tab-btn" data-mode="Note">Note</button>
        <button class="capture-tab-btn" data-mode="Reminder">Reminder</button>
      </div>

      <div class="capture-input-box">
        <input type="text" id="quickCaptureInput" class="capture-input" placeholder="What do you want to accomplish today?" />
        <button id="quickCaptureAddBtn" class="capture-add-btn">
          <span>Add</span>
          <span class="material-symbols-outlined" style="font-size: 16px;">arrow_upward</span>
        </button>
      </div>

      <div class="capture-options" id="quickCaptureOptions">
        <!-- 1. Due Date -->
        <div class="option-pill-wrapper" id="optDueDateWrapper">
          <button type="button" class="option-pill" id="optDueDate" title="Set Due Date">
            <span class="material-symbols-outlined" style="font-size: 14px;">calendar_today</span>
            <span id="optDueDateText">Today</span>
          </button>
          <div class="qc-popover" id="qcDatePopover">
            <button type="button" class="qc-popover-item" data-date-action="today">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">today</span>
              <span>Today</span>
            </button>
            <button type="button" class="qc-popover-item" data-date-action="tomorrow">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--secondary);">wb_twilight</span>
              <span>Tomorrow</span>
            </button>
            <button type="button" class="qc-popover-item" data-date-action="next_week">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #6366f1;">date_range</span>
              <span>In a week</span>
            </button>
            <div class="qc-popover-divider"></div>
            <div class="qc-custom-date-row" title="Pick custom date">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--outline);">calendar_month</span>
              <input type="date" id="qcCustomDateInput" />
            </div>
          </div>
        </div>

        <!-- 2. Priority -->
        <div class="option-pill-wrapper" id="optPriorityWrapper">
          <button type="button" class="option-pill" id="optPriority" title="Set Priority">
            <span class="material-symbols-outlined" id="optPriorityIcon" style="font-size: 14px;">flag</span>
            <span id="optPriorityText">Priority</span>
          </button>
          <div class="qc-popover" id="qcPriorityPopover">
            <button type="button" class="qc-popover-item" data-priority-val="low">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--outline);">flag</span>
              <span>Low / Normal</span>
            </button>
            <button type="button" class="qc-popover-item" data-priority-val="medium">
              <span class="material-symbols-outlined" style="font-size: 16px; color: #f59e0b;">flag</span>
              <span style="color: #b45309; font-weight: 500;">Medium</span>
            </button>
            <button type="button" class="qc-popover-item" data-priority-val="high">
              <span class="material-symbols-outlined filled" style="font-size: 16px; color: #ef4444;">flag</span>
              <span style="color: #ef4444; font-weight: 600;">High Priority</span>
            </button>
          </div>
        </div>

        <!-- 3. Tags -->
        <div class="option-pill-wrapper" id="optTagsWrapper">
          <button type="button" class="option-pill" id="optTags" title="Add Tags">
            <span class="material-symbols-outlined" style="font-size: 14px;">sell</span>
            <span id="optTagsText">Tags</span>
          </button>
          <div class="qc-popover qc-tags-popover" id="qcTagsPopover">
            <div class="qc-tags-header">Select or Add Tags</div>
            <div class="qc-tags-presets" id="qcTagsPresets">
              <button type="button" class="qc-tag-btn" data-tag="#work">#work</button>
              <button type="button" class="qc-tag-btn" data-tag="#personal">#personal</button>
              <button type="button" class="qc-tag-btn" data-tag="#college">#college</button>
              <button type="button" class="qc-tag-btn" data-tag="#health">#health</button>
              <button type="button" class="qc-tag-btn" data-tag="#study">#study</button>
              <button type="button" class="qc-tag-btn" data-tag="#finance">#finance</button>
            </div>
            <div class="qc-tag-input-row">
              <input type="text" id="qcCustomTagInput" placeholder="Add #custom..." maxlength="25" />
              <button type="button" id="qcAddTagBtn" class="qc-tag-add-btn" title="Add tag">
                <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 4. Attach -->
        <div class="option-pill-wrapper" id="optAttachWrapper">
          <button type="button" class="option-pill" id="optAttach" title="Attach Files or Folder">
            <span class="material-symbols-outlined" style="font-size: 14px;">attach_file</span>
            <span id="optAttachText">Attach</span>
          </button>
          <div class="qc-popover" id="qcAttachPopover">
            <button type="button" class="qc-popover-item" id="qcSelectFilesBtn">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">upload_file</span>
              <span>Upload Files...</span>
            </button>
            <button type="button" class="qc-popover-item" id="qcSelectFolderBtn">
              <span class="material-symbols-outlined" style="font-size: 16px; color: var(--secondary);">folder_open</span>
              <span>Upload Folder...</span>
            </button>
          </div>
          <input type="file" id="qcFileInput" multiple style="display: none;" />
          <input type="file" id="qcFolderInput" webkitdirectory directory style="display: none;" />
        </div>
      </div>

      <!-- Attachment preview chips -->
      <div class="qc-chips-row" id="qcAttachmentChips" style="display: none;"></div>
    </div>

    <!-- Tasks & Monthly Bento Row -->
    <div class="bento-grid">
      <!-- Today's Tasks Column -->
      <div class="col-7 card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon-badge">
              <span class="material-symbols-outlined" style="font-size: 18px;">schedule</span>
            </div>
            <div>
              <h2 class="font-headline-sm" style="font-weight: 700;">Today's Tasks</h2>
              <p class="font-label-sm" style="color: var(--outline); margin-top: 2px;">${completedToday} of ${todayTasks.length} completed</p>
            </div>
          </div>
          <button class="btn-primary" id="openAddModalBtn" style="padding: 6px 14px; font-size: 12px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
            <span>New Task</span>
          </button>
        </div>

        <div class="task-list" id="dashboardTaskList">
          ${todayTasks.length === 0 
            ? `<div style="text-align: center; padding: var(--space-xl); color: var(--outline);">
                <span class="material-symbols-outlined" style="font-size: 36px; opacity: 0.5;">task_alt</span>
                <p style="margin-top: 8px;">No tasks scheduled for today. Take a mindful breath!</p>
               </div>`
            : todayTasks.map(task => `
              <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-left">
                  <div class="task-checkbox" data-action="toggle">
                    <span class="material-symbols-outlined" style="font-size: 16px; font-weight: 700;">check</span>
                  </div>
                  <div class="task-details">
                    <span class="task-title">${escapeHtml(task.title)}</span>
                    <div class="task-meta">
                      <span>${task.dueTime ? formatTime(task.dueTime) + ' • ' : ''}${escapeHtml(task.category || 'General')}</span>
                      ${task.carriedForward ? `
                        <span class="carried-forward-badge" title="Carried forward ${task.carryForwardCount} times">
                          <span class="material-symbols-outlined" style="font-size: 12px;">forward</span>
                          <span>Carried Over (${task.carryForwardCount}x)</span>
                        </span>` : ''}
                      ${task.priority === 'high' ? `<span class="priority-flag high"><span class="material-symbols-outlined filled" style="font-size: 13px;">flag</span>High</span>` : task.priority === 'medium' ? `<span class="priority-flag medium" style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 2px;"><span class="material-symbols-outlined" style="font-size: 13px;">flag</span>Med</span>` : ''}
                      ${task.tags && task.tags.length > 0 ? task.tags.map(tag => `<span style="font-size: 10px; padding: 1px 6px; border-radius: var(--radius-full); background: var(--surface-container); color: var(--on-surface-variant);">${escapeHtml(tag)}</span>`).join('') : ''}
                      ${task.attachments && task.attachments.length > 0 ? `
                        <span style="display: inline-flex; align-items: center; gap: 2px; color: var(--primary);" title="${task.attachments.length} attachment(s)">
                          <span class="material-symbols-outlined" style="font-size: 13px;">attach_file</span>
                          <span>${task.attachments.length}</span>
                        </span>` : ''}
                    </div>
                  </div>
                </div>
                <div class="task-actions">
                  <button class="icon-btn" data-action="star" style="width: 32px; height: 32px;" title="Star task">
                    <span class="material-symbols-outlined ${task.starred ? 'filled' : ''}" style="font-size: 18px; color: ${task.starred ? 'var(--amber)' : 'var(--outline)'};">star</span>
                  </button>
                  <button class="icon-btn" data-action="delete" style="width: 32px; height: 32px;" title="Delete task">
                    <span class="material-symbols-outlined" style="font-size: 18px; color: var(--outline);">delete</span>
                  </button>
                </div>
              </div>
            `).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-md); padding-top: var(--space-xs); border-top: 1px solid var(--surface-low);">
          <a href="#" id="viewAllTasksLink" class="font-label-sm" style="color: var(--primary); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
            <span>View Task History</span>
            <span class="material-symbols-outlined" style="font-size: 14px;">arrow_forward</span>
          </a>
          <span class="font-label-sm" style="color: var(--outline);">${completionPercent}% done today</span>
        </div>
      </div>

      <!-- Monthly Progress Card -->
      <div class="col-5 card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="card-header">
            <div class="card-title-group">
              <div class="card-icon-badge">
                <span class="material-symbols-outlined" style="font-size: 18px;">pie_chart</span>
              </div>
              <h2 class="font-headline-sm" style="font-weight: 700;">This Month's Progress</h2>
            </div>
            <span class="font-label-sm" style="background: var(--secondary-container); color: var(--on-secondary-container); padding: 2px 8px; border-radius: var(--radius-full); font-weight: 600;">
              +12% vs last month
            </span>
          </div>

          <div class="progress-widget-body">
            <!-- Radial Indicator -->
            <div class="radial-circle-container">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--surface-high)" stroke-width="9"></circle>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary)" stroke-width="9" stroke-linecap="round"
                  stroke-dasharray="251.2" stroke-dashoffset="${strokeDashoffset}" style="transition: stroke-dashoffset 0.8s ease;"></circle>
              </svg>
              <div class="radial-center-text">
                <span class="font-display-lg" style="font-size: 22px; line-height: 1;">${monthlyStats.completionRate}%</span>
                <span class="font-label-sm" style="color: var(--outline); font-size: 10px; margin-top: 2px;">${monthlyStats.completed}/${monthlyStats.totalCreated} done</span>
              </div>
            </div>

            <!-- Weekly Consistency Bar Chart -->
            <div class="bar-chart-container">
              <span class="font-label-sm" style="color: var(--outline);">Weekly Completed Tasks</span>
              <div class="bar-cols">
                ${['W1', 'W2', 'W3', 'W4'].map((week, idx) => {
                  const count = monthlyStats.weeklyCompleted[idx] || 0;
                  const maxCount = Math.max(...monthlyStats.weeklyCompleted, 6);
                  const heightPercent = Math.max(15, Math.round((count / maxCount) * 100));
                  const isCurrent = idx === 2; // W3
                  return `
                    <div class="bar-col">
                      <div class="bar-fill ${isCurrent ? 'active' : ''}" style="height: ${heightPercent}%;" title="${count} tasks"></div>
                      <span class="bar-label">${week}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notes & Reminders Bento Row -->
    <div class="bento-grid">
      <!-- Recent Notes -->
      <div class="col-6 card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon-badge">
              <span class="material-symbols-outlined" style="font-size: 18px;">description</span>
            </div>
            <h2 class="font-headline-sm" style="font-weight: 700;">Recent Notes</h2>
          </div>
          <a href="#" id="viewAllNotesLink" class="font-label-sm" style="color: var(--primary); text-decoration: none; font-weight: 600;">View all</a>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; min-width: 0;">
          ${recentNotes.map(n => `
            <div class="note-item-preview" data-note-id="${n.id}" style="padding: 10px 12px; border-radius: var(--radius-md); background: var(--surface-low); display: flex; align-items: flex-start; gap: 12px; cursor: pointer; transition: all 0.15s ease; min-width: 0;">
              <span class="material-symbols-outlined filled" style="font-size: 20px; color: ${n.type === 'idea' ? 'var(--amber)' : 'var(--primary)'}; margin-top: 2px; flex-shrink: 0;">
                ${n.type === 'idea' ? 'lightbulb' : (n.type === 'thought' ? 'psychology' : 'article')}
              </span>
              <div style="flex: 1; min-width: 0;">
                <span class="font-label-lg" style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(n.title)}</span>
                <p class="font-body-sm" style="color: var(--outline); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(n.content)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Upcoming Reminders -->
      <div class="col-6 card">
        <div class="card-header">
          <div class="card-title-group">
            <div class="card-icon-badge">
              <span class="material-symbols-outlined" style="font-size: 18px;">notifications_active</span>
            </div>
            <h2 class="font-headline-sm" style="font-weight: 700;">Upcoming Reminders</h2>
          </div>
          <button id="addReminderBtn" class="font-label-sm" style="color: var(--primary); background: none; border: none; font-weight: 600; cursor: pointer;">+ Add</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; min-width: 0;">
          ${upcomingReminders.map(r => `
            <div style="padding: 10px 12px; border-radius: var(--radius-md); background: var(--surface-low); display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0;">
              <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
                <button class="icon-btn" data-reminder-toggle="${r.id}" style="width: 28px; height: 28px; flex-shrink: 0;">
                  <span class="material-symbols-outlined" style="font-size: 18px; color: ${r.completed ? 'var(--secondary)' : 'var(--outline)'};">
                    ${r.completed ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
                <div style="display: flex; flex-direction: column; min-width: 0; flex: 1;">
                  <span class="font-label-lg ${r.completed ? 'completed' : ''}" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; ${r.completed ? 'text-decoration: line-through; color: var(--outline);' : ''}">${escapeHtml(r.title)}</span>
                  <span class="font-body-sm" style="color: var(--outline); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r.dateTime ? r.dateTime.replace('T', ', ') : ''} • ${escapeHtml(r.category || 'General')}</span>
                </div>
              </div>
              <span class="font-label-sm" style="background: var(--surface-high); color: var(--on-surface-variant); padding: 2px 8px; border-radius: var(--radius-full); flex-shrink: 0;">
                ${r.category || 'General'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers
  wireDashboardEvents(container);
}

function wireDashboardEvents(container) {
  // Quick Capture Tabs
  let activeMode = 'Task';
  const tabs = container.querySelectorAll('.capture-tab-btn');
  const input = container.querySelector('#quickCaptureInput');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeMode = tab.dataset.mode;
      if (input) {
        input.placeholder = `What ${activeMode.toLowerCase()} do you want to capture?`;
        input.focus();
      }
    });
  });

  // Quick Capture State for Options
  const qcState = {
    dueDate: getTodayString(),
    priority: 'low',
    tags: [],
    attachments: []
  };

  function closeAllQCPopovers() {
    container.querySelectorAll('.qc-popover').forEach(p => {
      p.classList.remove('active');
      p.style.left = '';
      p.style.right = '';
    });
  }

  function toggleQCPopover(popoverId, triggerBtn) {
    const popover = container.querySelector(popoverId);
    if (!popover) return;
    const isCurrentlyActive = popover.classList.contains('active');
    closeAllQCPopovers();
    if (!isCurrentlyActive) {
      if (triggerBtn) {
        const rect = triggerBtn.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // If screen space below is restricted (< 220px), pop UPWARD
        if (spaceBelow < 220) {
          popover.classList.remove('drop-down');
        } else {
          popover.classList.add('drop-down');
        }
      }
      popover.classList.add('active');

      // Adjust horizontal alignment so it never clips off-screen:
      if (triggerBtn) {
        popover.style.left = '0';
        popover.style.right = 'auto';
        let popRect = popover.getBoundingClientRect();
        if (popRect.right > window.innerWidth - 8) {
          popover.style.left = 'auto';
          popover.style.right = '0';
          popRect = popover.getBoundingClientRect();
        }
        if (popRect.left < 8) {
          popover.style.left = '0';
          popover.style.right = 'auto';
        }
      }
    }
  }

  // Prevent clicks inside any popover from propagating
  container.querySelectorAll('.qc-popover').forEach(p => {
    p.addEventListener('click', (e) => e.stopPropagation());
  });

  // Close popovers on outside click
  const onOutsideClick = (e) => {
    if (!e.target.closest('#quickCaptureOptions')) {
      closeAllQCPopovers();
    }
  };
  document.addEventListener('click', onOutsideClick);

  // 1. Due Date Logic
  const btnDueDate = container.querySelector('#optDueDate');
  const txtDueDate = container.querySelector('#optDueDateText');
  const datePopover = container.querySelector('#qcDatePopover');
  const customDateInput = container.querySelector('#qcCustomDateInput');

  function updateDueDateUI() {
    if (!txtDueDate || !btnDueDate) return;
    const label = formatDisplayDate(qcState.dueDate);
    txtDueDate.textContent = label;
    if (qcState.dueDate !== getTodayString()) {
      btnDueDate.classList.add('active');
    } else {
      btnDueDate.classList.remove('active');
    }
  }

  if (btnDueDate) {
    btnDueDate.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleQCPopover('#qcDatePopover', btnDueDate);
    });
  }

  if (datePopover) {
    datePopover.querySelectorAll('[data-date-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.dateAction;
        if (action === 'today') qcState.dueDate = getTodayString();
        else if (action === 'tomorrow') qcState.dueDate = getTomorrowString();
        else if (action === 'next_week') qcState.dueDate = getNextWeekString();
        updateDueDateUI();
        closeAllQCPopovers();
      });
    });
  }

  if (customDateInput) {
    customDateInput.value = qcState.dueDate;
    customDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        qcState.dueDate = e.target.value;
        updateDueDateUI();
        closeAllQCPopovers();
      }
    });
  }

  // 2. Priority Logic
  const btnPriority = container.querySelector('#optPriority');
  const txtPriority = container.querySelector('#optPriorityText');
  const iconPriority = container.querySelector('#optPriorityIcon');
  const priorityPopover = container.querySelector('#qcPriorityPopover');

  function updatePriorityUI() {
    if (!btnPriority || !txtPriority || !iconPriority) return;
    btnPriority.classList.remove('priority-medium', 'priority-high', 'active');

    if (qcState.priority === 'high') {
      txtPriority.textContent = 'High';
      iconPriority.textContent = 'flag';
      iconPriority.classList.add('filled');
      btnPriority.classList.add('priority-high', 'active');
    } else if (qcState.priority === 'medium') {
      txtPriority.textContent = 'Medium';
      iconPriority.textContent = 'flag';
      iconPriority.classList.remove('filled');
      btnPriority.classList.add('priority-medium', 'active');
    } else {
      txtPriority.textContent = 'Priority';
      iconPriority.textContent = 'flag';
      iconPriority.classList.remove('filled');
    }
  }

  if (btnPriority) {
    btnPriority.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleQCPopover('#qcPriorityPopover', btnPriority);
    });
  }

  if (priorityPopover) {
    priorityPopover.querySelectorAll('[data-priority-val]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        qcState.priority = btn.dataset.priorityVal;
        updatePriorityUI();
        closeAllQCPopovers();
      });
    });
  }

  // 3. Tags Logic
  const btnTags = container.querySelector('#optTags');
  const txtTags = container.querySelector('#optTagsText');
  const tagsPopover = container.querySelector('#qcTagsPopover');
  const customTagInput = container.querySelector('#qcCustomTagInput');
  const addTagBtn = container.querySelector('#qcAddTagBtn');

  function updateTagsUI() {
    if (!btnTags || !txtTags) return;
    if (qcState.tags.length === 0) {
      txtTags.textContent = 'Tags';
      btnTags.classList.remove('active');
    } else if (qcState.tags.length === 1) {
      txtTags.textContent = qcState.tags[0];
      btnTags.classList.add('active');
    } else {
      txtTags.textContent = `${qcState.tags.length} Tags`;
      btnTags.classList.add('active');
    }

    if (tagsPopover) {
      tagsPopover.querySelectorAll('.qc-tag-btn').forEach(b => {
        if (qcState.tags.includes(b.dataset.tag)) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }
  }

  if (btnTags) {
    btnTags.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleQCPopover('#qcTagsPopover', btnTags);
    });
  }

  if (tagsPopover) {
    tagsPopover.querySelectorAll('.qc-tag-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = b.dataset.tag;
        const idx = qcState.tags.indexOf(tag);
        if (idx > -1) {
          qcState.tags.splice(idx, 1);
        } else {
          qcState.tags.push(tag);
        }
        updateTagsUI();
      });
    });
  }

  function handleAddCustomTag() {
    if (!customTagInput) return;
    let val = customTagInput.value.trim();
    if (!val) return;
    if (!val.startsWith('#')) val = '#' + val;
    val = val.replace(/\s+/g, '-');
    if (!qcState.tags.includes(val)) {
      qcState.tags.push(val);
      updateTagsUI();
    }
    customTagInput.value = '';
  }

  if (addTagBtn) {
    addTagBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAddCustomTag();
    });
  }
  if (customTagInput) {
    customTagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleAddCustomTag();
      }
    });
  }

  // 4. Attach Logic
  const btnAttach = container.querySelector('#optAttach');
  const txtAttach = container.querySelector('#optAttachText');
  const fileInput = container.querySelector('#qcFileInput');
  const folderInput = container.querySelector('#qcFolderInput');
  const attachPopover = container.querySelector('#qcAttachPopover');
  const selectFilesBtn = container.querySelector('#qcSelectFilesBtn');
  const selectFolderBtn = container.querySelector('#qcSelectFolderBtn');
  const chipsContainer = container.querySelector('#qcAttachmentChips');

  function renderAttachmentChipsUI() {
    if (!chipsContainer || !txtAttach || !btnAttach) return;
    if (qcState.attachments.length === 0) {
      chipsContainer.innerHTML = '';
      chipsContainer.style.display = 'none';
      txtAttach.textContent = 'Attach';
      btnAttach.classList.remove('active');
      return;
    }

    chipsContainer.style.display = 'flex';
    txtAttach.textContent = `Attach (${qcState.attachments.length})`;
    btnAttach.classList.add('active');

    chipsContainer.innerHTML = qcState.attachments.map((file, idx) => `
      <div class="qc-attachment-chip">
        <span class="material-symbols-outlined" style="font-size: 13px; color: var(--primary);">
          ${file.type && file.type.startsWith('image/') ? 'image' : 'description'}
        </span>
        <span class="chip-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
        <span class="chip-size" style="opacity: 0.65; font-size: 10px;">(${formatFileSize(file.size)})</span>
        <button type="button" class="chip-remove" data-remove-att="${idx}" title="Remove attachment">
          <span class="material-symbols-outlined" style="font-size: 13px;">close</span>
        </button>
      </div>
    `).join('');
  }

  if (btnAttach) {
    btnAttach.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleQCPopover('#qcAttachPopover', btnAttach);
    });
  }

  if (selectFilesBtn && fileInput) {
    selectFilesBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllQCPopovers();
      fileInput.click();
    });
  }

  if (selectFolderBtn && folderInput) {
    selectFolderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeAllQCPopovers();
      folderInput.click();
    });
  }

  function handleFilesSelected(files) {
    if (!files) return;
    for (const file of files) {
      if (!qcState.attachments.some(a => a.name === file.name && a.size === file.size)) {
        qcState.attachments.push({
          id: 'att-qc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream'
        });
      }
    }
    renderAttachmentChipsUI();
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFilesSelected(e.target.files);
      fileInput.value = '';
    });
  }

  if (folderInput) {
    folderInput.addEventListener('change', (e) => {
      handleFilesSelected(e.target.files);
      folderInput.value = '';
    });
  }

  if (chipsContainer) {
    chipsContainer.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove-att]');
      if (removeBtn) {
        const idx = parseInt(removeBtn.dataset.removeAtt, 10);
        qcState.attachments.splice(idx, 1);
        renderAttachmentChipsUI();
      }
    });
  }

  // Quick Capture Submit
  function submitQuickCapture() {
    if (!input) return;
    const value = input.value.trim();
    if (!value) return;

    const primaryCat = qcState.tags[0] ? qcState.tags[0].replace(/^#/, '') : 'Inbox';

    if (activeMode === 'Task') {
      store.addTask({
        title: value,
        dueDate: qcState.dueDate || getTodayString(),
        priority: qcState.priority || 'low',
        category: primaryCat,
        tags: [...qcState.tags],
        attachments: [...qcState.attachments]
      });
      showToast(`Task added: "${value}"`);
    } else if (activeMode === 'Note') {
      store.addNote({
        title: value,
        type: 'note',
        content: '',
        category: primaryCat,
        tags: [...qcState.tags],
        attachments: [...qcState.attachments]
      });
      showToast(`Note captured: "${value}"`);
    } else if (activeMode === 'Reminder') {
      store.addReminder({
        title: value,
        dateTime: `${qcState.dueDate || getTodayString()}T12:00`,
        category: primaryCat
      });
      showToast(`Reminder created: "${value}"`);
    }

    input.value = '';
    qcState.dueDate = getTodayString();
    qcState.priority = 'low';
    qcState.tags = [];
    qcState.attachments = [];
    updateDueDateUI();
    updatePriorityUI();
    updateTagsUI();
    renderAttachmentChipsUI();
    closeAllQCPopovers();
  }

  const addBtn = container.querySelector('#quickCaptureAddBtn');
  if (addBtn) addBtn.addEventListener('click', submitQuickCapture);
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitQuickCapture();
    });
  }

  // Task list row interactions
  const taskList = container.querySelector('#dashboardTaskList');
  if (taskList) {
    taskList.addEventListener('click', (e) => {
      const taskRow = e.target.closest('.task-item');
      if (!taskRow) return;
      const taskId = taskRow.dataset.taskId;

      const starBtn = e.target.closest('[data-action="star"]');
      if (starBtn) {
        store.toggleStarred(taskId);
        return;
      }

      const delBtn = e.target.closest('[data-action="delete"]');
      if (delBtn) {
        store.deleteTask(taskId);
        showToast('Task removed');
        return;
      }

      // Toggle complete
      store.toggleTask(taskId);
    });
  }

  // Reminder toggles
  container.querySelectorAll('[data-reminder-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const rId = btn.dataset.reminderToggle;
      store.toggleReminder(rId);
    });
  });

  // View All Links
  const viewTasksLink = container.querySelector('#viewAllTasksLink');
  if (viewTasksLink) {
    viewTasksLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateView('history');
    });
  }

  const viewNotesLink = container.querySelector('#viewAllNotesLink');
  if (viewNotesLink) {
    viewNotesLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateView('notes');
    });
  }

  // Quick Open Modal
  const openModalBtn = container.querySelector('#openAddModalBtn');
  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      window.openAddModal('Task');
    });
  }

  const addReminderBtn = container.querySelector('#addReminderBtn');
  if (addReminderBtn) {
    addReminderBtn.addEventListener('click', () => {
      window.openAddModal('Reminder');
    });
  }
}

function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const displayH = hr % 12 || 12;
  return `${String(displayH).padStart(2, '0')}:${m} ${ampm}`;
}

function getTomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getNextWeekString() {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return 'Today';
  const today = getTodayString();
  if (dateStr === today) return 'Today';
  const tomorrow = getTomorrowString();
  if (dateStr === tomorrow) return 'Tomorrow';
  const [y, m, d] = dateStr.split('-');
  const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

function showToast(msg) {
  if (window.showToast) window.showToast(msg);
}
