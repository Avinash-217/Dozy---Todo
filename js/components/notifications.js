import { store } from '../store.js';

let activeNotifFilter = 'all'; // 'all', 'active', 'completed'

export function initNotificationDropdown() {
  const bellBtn = document.getElementById('notificationBellBtn');
  const dropdown = document.getElementById('notificationDropdown');
  if (!bellBtn || !dropdown) return;

  // Toggle on bell click
  bellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('active');
    if (isOpen) {
      closeNotificationDropdown();
    } else {
      openNotificationDropdown();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !bellBtn.contains(e.target)) {
      closeNotificationDropdown();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dropdown.classList.contains('active')) {
      closeNotificationDropdown();
    }
  });

  updateNotificationBadge();
}

export function openNotificationDropdown() {
  const dropdown = document.getElementById('notificationDropdown');
  if (!dropdown) return;
  dropdown.classList.add('active');
  renderNotificationsList();
}

export function closeNotificationDropdown() {
  const dropdown = document.getElementById('notificationDropdown');
  if (!dropdown) return;
  dropdown.classList.remove('active');
}

export function updateNotificationBadge() {
  const count = store.getActiveNotificationCount ? store.getActiveNotificationCount() : 0;
  const badge = document.getElementById('headerNotifBadge');
  if (badge) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

export function renderNotificationsList() {
  const container = document.getElementById('notificationDropdownBody');
  if (!container) return;

  let notifications = store.notifications || [];

  if (activeNotifFilter === 'active') {
    notifications = notifications.filter(n => n.status === 'active' || n.status === 'snoozed');
  } else if (activeNotifFilter === 'completed') {
    notifications = notifications.filter(n => n.status === 'completed');
  }

  const activeCount = store.getActiveNotificationCount ? store.getActiveNotificationCount() : 0;

  container.innerHTML = `
    <!-- Dropdown Header -->
    <div class="notif-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="material-symbols-outlined" style="color: var(--primary); font-size: 20px;">notifications_active</span>
        <span class="font-headline-sm" style="font-size: 15px; font-weight: 700;">Reminder Notifications</span>
        ${activeCount > 0 ? `<span class="notif-badge-pill">${activeCount} active</span>` : ''}
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <button type="button" id="markAllReadBtn" class="notif-text-btn" ${notifications.length === 0 ? 'disabled' : ''}>
          Mark all read
        </button>
        <button type="button" id="closeNotifDropdownBtn" class="icon-btn notif-close-mobile-btn" style="width: 28px; height: 28px;" title="Close Notifications">
          <span class="material-symbols-outlined" style="font-size: 18px;">close</span>
        </button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="notif-filter-tabs">
      <button class="notif-tab ${activeNotifFilter === 'all' ? 'active' : ''}" data-filter="all">
        All (${(store.notifications || []).length})
      </button>
      <button class="notif-tab ${activeNotifFilter === 'active' ? 'active' : ''}" data-filter="active">
        Active (${(store.notifications || []).filter(n => n.status === 'active' || n.status === 'snoozed').length})
      </button>
      <button class="notif-tab ${activeNotifFilter === 'completed' ? 'active' : ''}" data-filter="completed">
        Done (${(store.notifications || []).filter(n => n.status === 'completed').length})
      </button>
    </div>

    <!-- Notification List -->
    <div class="notif-list-scroll">
      ${notifications.length === 0 ? `
        <div class="notif-empty-state">
          <span class="material-symbols-outlined" style="font-size: 36px; opacity: 0.35;">notifications_off</span>
          <p style="margin-top: 8px; font-size: 13px; font-weight: 500;">No notifications found</p>
          <p style="font-size: 11px; color: var(--outline); margin-top: 2px;">Your reminders and task alerts will show here.</p>
        </div>
      ` : notifications.map(notif => `
        <div class="notif-item ${notif.read ? 'read' : 'unread'} ${notif.status}" data-notif-id="${notif.id}">
          <div class="notif-item-left">
            <div class="notif-icon-wrap ${notif.status}">
              <span class="material-symbols-outlined filled" style="font-size: 16px;">
                ${notif.status === 'completed' ? 'check_circle' : (notif.status === 'snoozed' ? 'snooze' : 'schedule')}
              </span>
            </div>
            <div class="notif-content">
              <div class="notif-title-row">
                <span class="notif-task-name">${escapeHtml(notif.taskName || notif.title)}</span>
                ${!notif.read ? `<span class="notif-unread-dot"></span>` : ''}
              </div>
              <div class="notif-meta">
                <span class="notif-date-time">
                  <span class="material-symbols-outlined" style="font-size: 12px;">event</span>
                  ${formatNotifDate(notif.date, notif.time)}
                </span>
                <span class="notif-category-chip">${escapeHtml(notif.category || 'Reminder')}</span>
                ${notif.status === 'snoozed' && notif.snoozedUntil ? `
                  <span class="notif-snoozed-label">Snoozed until ${notif.snoozedUntil}</span>
                ` : ''}
              </div>
            </div>
          </div>

          <div class="notif-actions">
            ${notif.status !== 'completed' ? `
              <button class="notif-action-btn complete" data-action="complete" title="Mark Done">
                <span class="material-symbols-outlined" style="font-size: 15px;">check</span>
                <span>Done</span>
              </button>
              <button class="notif-action-btn snooze" data-action="snooze" title="Snooze 1 hour">
                <span class="material-symbols-outlined" style="font-size: 14px;">snooze</span>
                <span>1h</span>
              </button>
            ` : ''}
            <button class="notif-action-btn dismiss" data-action="dismiss" title="Dismiss">
              <span class="material-symbols-outlined" style="font-size: 15px;">close</span>
            </button>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Dropdown Footer -->
    <div class="notif-footer">
      <span style="font-size: 11px; color: var(--outline);">
        Tracking ${(store.notifications || []).length} reminder alert(s)
      </span>
      <button type="button" id="clearNotifsBtn" class="notif-text-btn" style="color: var(--error);" ${(store.notifications || []).length === 0 ? 'disabled' : ''}>
        Clear History
      </button>
    </div>
  `;

  wireNotificationEvents(container);
}

function wireNotificationEvents(container) {
  // Tabs
  container.querySelectorAll('.notif-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      activeNotifFilter = tab.dataset.filter;
      renderNotificationsList();
    });
  });

  // Mark all read
  const markReadBtn = container.querySelector('#markAllReadBtn');
  if (markReadBtn) {
    markReadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      store.markAllNotificationsRead();
      renderNotificationsList();
      updateNotificationBadge();
    });
  }

  // Clear all
  const clearBtn = container.querySelector('#clearNotifsBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Clear all reminder notification history?')) {
        store.clearAllNotifications();
        renderNotificationsList();
        updateNotificationBadge();
      }
    });
  }

  // Close button on mobile
  const closeBtn = container.querySelector('#closeNotifDropdownBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeNotificationDropdown();
    });
  }

  // Item actions (complete, snooze, dismiss)
  container.querySelectorAll('.notif-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const notifId = item.dataset.notifId;
      const action = e.target.closest('[data-action]')?.dataset.action;

      if (action === 'complete') {
        store.completeNotification(notifId);
        renderNotificationsList();
        updateNotificationBadge();
        if (window.showToast) window.showToast('Reminder marked as completed');
      } else if (action === 'snooze') {
        store.snoozeNotification(notifId, 60);
        renderNotificationsList();
        updateNotificationBadge();
        if (window.showToast) window.showToast('Reminder snoozed for 1 hour');
      } else if (action === 'dismiss') {
        store.dismissNotification(notifId);
        renderNotificationsList();
        updateNotificationBadge();
      } else {
        // Just mark as read on click
        store.markNotificationRead(notifId);
        renderNotificationsList();
        updateNotificationBadge();
      }
    });
  });
}

function formatNotifDate(dateStr, timeStr) {
  if (!dateStr) return 'No date';
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  let formattedTime = '';
  if (timeStr) {
    const [h, m] = timeStr.split(':');
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? 'PM' : 'AM';
    const displayH = hr % 12 || 12;
    formattedTime = ` at ${String(displayH).padStart(2, '0')}:${m} ${ampm}`;
  }
  return `${monthDay}${formattedTime}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
