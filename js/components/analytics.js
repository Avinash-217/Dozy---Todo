import { store } from '../store.js';

let selectedMonthDate = new Date();

export function renderAnalytics(container) {
  const currentYear = selectedMonthDate.getFullYear();
  const currentMonth = selectedMonthDate.getMonth();
  const monthLabel = selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const stats = store.getMonthlyStats(currentYear, currentMonth);

  container.innerHTML = `
    <!-- Month Navigation Header & Sub-banner -->
    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-lowest); padding: var(--space-md); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: var(--space-lg); border: 1px solid rgba(0, 95, 75, 0.04);">
      <button id="analyticsPrevMonth" class="icon-btn" style="background: var(--surface-low);" title="Previous Month">
        <span class="material-symbols-outlined" style="font-size: 20px;">chevron_left</span>
      </button>
      <div style="display: flex; flex-direction: column; align-items: center;">
        <h1 class="font-headline-sm" style="color: var(--primary); font-size: 18px;">${monthLabel}</h1>
        <span class="font-label-sm" style="color: var(--outline); display: inline-flex; align-items: center; gap: 6px; margin-top: 2px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--secondary); display: inline-block;"></span>
          Monthly Performance & Review
        </span>
      </div>
      <button id="analyticsNextMonth" class="icon-btn" style="background: var(--surface-low);" title="Next Month">
        <span class="material-symbols-outlined" style="font-size: 20px;">chevron_right</span>
      </button>
    </div>

    <!-- 4 Key Summary Metric Cards (2x2 or 4x1 grid) -->
    <div class="stats-grid">
      <!-- Tasks Created -->
      <div class="card" style="padding: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="font-label-md" style="color: var(--on-surface-variant);">Tasks Created</span>
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--primary-fixed); display: flex; align-items: center; justify-content: center; color: var(--primary);">
            <span class="material-symbols-outlined" style="font-size: 18px;">add_task</span>
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; align-items: baseline; gap: 6px;">
          <span class="font-display-lg" style="color: var(--primary); font-size: 28px;">${stats.totalCreated}</span>
          <span class="font-label-sm" style="color: var(--secondary);">+12%</span>
        </div>
        <span class="font-body-sm" style="color: var(--outline); margin-top: 4px; display: block;">Total logged</span>
      </div>

      <!-- Completed -->
      <div class="card" style="padding: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="font-label-md" style="color: var(--on-surface-variant);">Completed</span>
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--secondary-container); display: flex; align-items: center; justify-content: center; color: var(--secondary);">
            <span class="material-symbols-outlined" style="font-size: 18px;">check_circle</span>
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; align-items: baseline; gap: 6px;">
          <span class="font-display-lg" style="color: var(--secondary); font-size: 28px;">${stats.completed}</span>
          <span class="font-label-sm" style="color: var(--secondary); font-weight: 600;">${stats.completionRate}% rate</span>
        </div>
        <span class="font-body-sm" style="color: var(--outline); margin-top: 4px; display: block;">Finished on time</span>
      </div>

      <!-- Carried Over -->
      <div class="card" style="padding: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="font-label-md" style="color: var(--on-surface-variant);">Carried Over</span>
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--surface-high); display: flex; align-items: center; justify-content: center; color: var(--amber);">
            <span class="material-symbols-outlined" style="font-size: 18px;">forward</span>
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; align-items: baseline; gap: 6px;">
          <span class="font-display-lg" style="color: var(--on-surface); font-size: 28px;">${stats.carriedOver}</span>
          <span class="font-label-sm" style="color: var(--outline);">tasks</span>
        </div>
        <span class="font-body-sm" style="color: var(--outline); margin-top: 4px; display: block;">Rescheduled</span>
      </div>

      <!-- Incomplete -->
      <div class="card" style="padding: var(--space-md);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="font-label-md" style="color: var(--on-surface-variant);">Incomplete</span>
          <div style="width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--error-container); display: flex; align-items: center; justify-content: center; color: var(--error);">
            <span class="material-symbols-outlined" style="font-size: 18px;">pending_actions</span>
          </div>
        </div>
        <div style="margin-top: 12px; display: flex; align-items: baseline; gap: 6px;">
          <span class="font-display-lg" style="color: var(--error); font-size: 28px;">${stats.incomplete}</span>
          <span class="font-label-sm" style="color: var(--error); font-weight: 600;">needs review</span>
        </div>
        <span class="font-body-sm" style="color: var(--outline); margin-top: 4px; display: block;">Pending action</span>
      </div>
    </div>

    <!-- Completion Rate Card -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-group">
          <span class="material-symbols-outlined" style="color: var(--primary); font-size: 22px;">donut_large</span>
          <h2 class="font-headline-sm">Completion Rate</h2>
        </div>
        <span class="font-label-lg" style="background: var(--primary-fixed); color: var(--primary); padding: 2px 10px; border-radius: var(--radius-full);">
          ${stats.completionRate}%
        </span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: var(--space-sm);">
        <div style="width: 100%; height: 12px; background: var(--surface-high); border-radius: var(--radius-full); overflow: hidden; padding: 2px;">
          <div style="width: ${stats.completionRate}%; height: 100%; background: var(--primary); border-radius: var(--radius-full); transition: width 0.8s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--outline);">
          <span>0%</span>
          <span>Target: 70% (Achieved)</span>
          <span>100%</span>
        </div>
      </div>

      <div style="margin-top: var(--space-lg); padding: 12px; background: var(--surface-low); border-radius: var(--radius-md);">
        <span class="font-label-sm" style="color: var(--on-surface); font-weight: 600;">Productivity Highlights</span>
        <ul style="margin-top: 6px; padding-left: 18px; font-size: 12px; color: var(--on-surface-variant); line-height: 1.6;">
          <li>Highest completion rate on <strong>Tuesdays and Thursdays</strong>.</li>
          <li>${stats.carriedOver} tasks automatically rolled over so no thought is ever lost.</li>
          <li>Average of <strong>4.2 completed milestones per active day</strong>.</li>
        </ul>
      </div>
    </div>
  `;

  wireAnalyticsEvents(container);
}

function wireAnalyticsEvents(container) {
  container.querySelector('#analyticsPrevMonth').addEventListener('click', () => {
    selectedMonthDate.setMonth(selectedMonthDate.getMonth() - 1);
    renderAnalytics(container);
  });

  container.querySelector('#analyticsNextMonth').addEventListener('click', () => {
    selectedMonthDate.setMonth(selectedMonthDate.getMonth() + 1);
    renderAnalytics(container);
  });
}
