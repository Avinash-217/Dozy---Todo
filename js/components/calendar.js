import { store } from '../store.js';
import { getTodayString } from '../carry-forward.js';

let selectedDate = getTodayString();
let currentViewDate = new Date();

export function renderCalendar(container) {
  const currentYear = currentViewDate.getFullYear();
  const currentMonth = currentViewDate.getMonth();
  const monthName = currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Filter tasks for the selected date
  const tasksForSelectedDate = store.tasks.filter(t => t.dueDate === selectedDate);
  const carriedCount = tasksForSelectedDate.filter(t => t.carriedForward).length;

  container.innerHTML = `
    <!-- Top Mindful Focus Banner -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: var(--surface-low); padding: var(--space-xs) var(--space-md); border-radius: var(--radius-full); margin-bottom: var(--space-lg); box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="material-symbols-outlined" style="color: var(--primary); font-size: 18px;">nature</span>
        <p class="font-label-sm" style="color: var(--on-surface-variant);">
          Mindful Focus: <span style="color: var(--primary); font-weight: 700;">${store.tasks.length} total milestones</span>
        </p>
      </div>
      <span class="font-label-sm" style="color: var(--secondary); background: var(--secondary-container); padding: 2px 10px; border-radius: var(--radius-full); font-weight: 600; display: inline-flex; align-items: center; gap: 6px;">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--secondary); display: inline-block;"></span>
        Active Calendar
      </span>
    </div>

    <!-- Calendar Grid Card & Detail Bento -->
    <div class="bento-grid">
      <div class="col-7 card">
        <div class="calendar-header">
          <div class="card-title-group">
            <div class="card-icon-badge">
              <span class="material-symbols-outlined" style="font-size: 20px;">calendar_month</span>
            </div>
            <div>
              <h2 class="font-headline-md" style="color: var(--primary);">${monthName}</h2>
              <p class="font-body-sm" style="color: var(--outline);">Milestone & Habit Flow</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="calPrevMonth" class="icon-btn" style="background: var(--surface-low);" title="Previous Month">
              <span class="material-symbols-outlined" style="font-size: 20px;">chevron_left</span>
            </button>
            <button id="calTodayBtn" class="option-pill" style="padding: 6px 12px; font-weight: 600;">Today</button>
            <button id="calNextMonth" class="icon-btn" style="background: var(--surface-low);" title="Next Month">
              <span class="material-symbols-outlined" style="font-size: 20px;">chevron_right</span>
            </button>
          </div>
        </div>

        <div class="calendar-weekdays">
          <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div class="calendar-grid" id="calendarGrid">
          ${renderCalendarDays(currentYear, currentMonth)}
        </div>
      </div>

      <!-- Day Details Column -->
      <div class="col-5 card">
        <div class="card-header">
          <div>
            <span class="font-label-sm" style="color: var(--primary); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700;">Scheduled Milestones</span>
            <h3 class="font-headline-sm" style="margin-top: 2px;">${formatDisplayDate(selectedDate)}</h3>
          </div>
          <button id="addDayTaskBtn" class="btn-primary" style="padding: 6px 14px; font-size: 12px;">
            <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
            <span>Add</span>
          </button>
        </div>

        ${carriedCount > 0 ? `
          <div style="padding: 8px 12px; border-radius: var(--radius-sm); background: var(--amber-container); color: var(--amber); font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 6px; margin-bottom: var(--space-sm);">
            <span class="material-symbols-outlined" style="font-size: 16px;">forward</span>
            <span>${carriedCount} task(s) on this day were carried forward</span>
          </div>
        ` : ''}

        <div class="task-list" style="margin-top: var(--space-xs);">
          ${tasksForSelectedDate.length === 0 ? `
            <div style="text-align: center; padding: var(--space-xl); color: var(--outline);">
              <span class="material-symbols-outlined" style="font-size: 32px; opacity: 0.4;">event_available</span>
              <p style="margin-top: 8px; font-size: 13px;">No tasks for this date. Enjoy the open space!</p>
            </div>
          ` : tasksForSelectedDate.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
              <div class="task-left">
                <div class="task-checkbox" data-action="toggle">
                  <span class="material-symbols-outlined" style="font-size: 16px; font-weight: 700;">check</span>
                </div>
                <div class="task-details">
                  <span class="task-title">${escapeHtml(task.title)}</span>
                  <div class="task-meta">
                    <span>${task.dueTime || 'Anytime'} • ${escapeHtml(task.category || 'General')}</span>
                    ${task.carriedForward ? `
                      <span class="carried-forward-badge">
                        <span class="material-symbols-outlined" style="font-size: 11px;">forward</span>
                        <span>Carried Over</span>
                      </span>` : ''}
                  </div>
                </div>
              </div>
              <div class="task-actions">
                <button class="icon-btn" data-action="delete" style="width: 30px; height: 30px;">
                  <span class="material-symbols-outlined" style="font-size: 16px; color: var(--outline);">delete</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  wireCalendarEvents(container);
}

function renderCalendarDays(year, month) {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const todayStr = getTodayString();

  let html = '';

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    html += `<div class="cal-day other-month"><span class="font-body-sm">${day}</span></div>`;
  }

  // Active month days
  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateKey = `${year}-${mStr}-${dStr}`;

    const isToday = dateKey === todayStr;
    const isSelected = dateKey === selectedDate;
    const dayTasks = store.tasks.filter(t => t.dueDate === dateKey);

    const hasTasks = dayTasks.length > 0;
    const hasOverdue = dayTasks.some(t => !t.completed && dateKey < todayStr);

    html += `
      <div class="cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-date="${dateKey}">
        <span class="day-number font-body-sm">${day}</span>
        <div class="cal-day-dots">
          ${hasTasks ? `<span class="dot-task"></span>` : ''}
          ${hasOverdue ? `<span class="dot-overdue"></span>` : ''}
        </div>
      </div>
    `;
  }

  return html;
}

function wireCalendarEvents(container) {
  container.querySelector('#calPrevMonth').addEventListener('click', () => {
    currentViewDate.setMonth(currentViewDate.getMonth() - 1);
    renderCalendar(container);
  });

  container.querySelector('#calNextMonth').addEventListener('click', () => {
    currentViewDate.setMonth(currentViewDate.getMonth() + 1);
    renderCalendar(container);
  });

  container.querySelector('#calTodayBtn').addEventListener('click', () => {
    currentViewDate = new Date();
    selectedDate = getTodayString();
    renderCalendar(container);
  });

  const grid = container.querySelector('#calendarGrid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const dayEl = e.target.closest('[data-date]');
      if (dayEl) {
        selectedDate = dayEl.dataset.date;
        renderCalendar(container);
      }
    });
  }

  const addBtn = container.querySelector('#addDayTaskBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.openAddModal('Task', { dueDate: selectedDate });
    });
  }

  // Task actions in the day detail view
  container.addEventListener('click', (e) => {
    const taskRow = e.target.closest('.task-item');
    if (!taskRow) return;
    const taskId = taskRow.dataset.taskId;

    const delBtn = e.target.closest('[data-action="delete"]');
    if (delBtn) {
      store.deleteTask(taskId);
      renderCalendar(container);
      return;
    }

    const toggleBtn = e.target.closest('[data-action="toggle"]');
    if (toggleBtn || e.target === taskRow) {
      store.toggleTask(taskId);
      renderCalendar(container);
    }
  });
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
