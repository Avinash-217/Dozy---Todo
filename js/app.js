import { store } from './store.js';
import { renderDashboard } from './components/dashboard.js';
import { renderCalendar } from './components/calendar.js';
import { renderHistory } from './components/history.js';
import { renderNotes } from './components/notes.js';
import { renderAnalytics } from './components/analytics.js';
import { initModal } from './components/modal.js';
import { initNotificationDropdown, updateNotificationBadge, renderNotificationsList } from './components/notifications.js';

let currentView = 'dashboard';

// Global Toast System
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size: 18px; color: ${type === 'error' ? 'var(--error)' : 'var(--secondary)'};">
      ${type === 'error' ? 'error' : 'check_circle'}
    </span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
};

// Global View Switcher
window.navigateView = function(viewName) {
  currentView = viewName;

  // Update navigation highlights
  document.querySelectorAll('.nav-link, .mobile-nav-item').forEach(link => {
    if (link.dataset.view === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const pageContainer = document.getElementById('mainContentArea');
  if (!pageContainer) return;

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  switch (viewName) {
    case 'dashboard':
      renderDashboard(pageContainer);
      break;
    case 'calendar':
      renderCalendar(pageContainer);
      break;
    case 'history':
      renderHistory(pageContainer);
      break;
    case 'notes':
      renderNotes(pageContainer);
      break;
    case 'analytics':
      renderAnalytics(pageContainer);
      break;
    default:
      renderDashboard(pageContainer);
  }

  updateSidebarBadges();
};

function updateSidebarBadges() {
  const overdueCount = store.getOverdueTasks().length;
  const overdueBadge = document.getElementById('sidebarOverdueBadge');
  if (overdueBadge) {
    if (overdueCount > 0) {
      overdueBadge.textContent = overdueCount;
      overdueBadge.style.display = 'inline-block';
    } else {
      overdueBadge.style.display = 'none';
    }
  }

  const carriedCount = store.getCarriedForwardTasks().length;
  const historyBadge = document.getElementById('sidebarHistoryBadge');
  if (historyBadge) {
    historyBadge.textContent = carriedCount > 0 ? `${carriedCount} roll` : store.tasks.filter(t => t.completed).length;
  }
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initModal();

  // Navigation Links click events
  document.querySelectorAll('[data-view]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const view = elem.dataset.view;
      if (view) window.navigateView(view);
    });
  });

  // Floating Action Button on mobile
  const fab = document.getElementById('mobileFab');
  if (fab) {
    fab.addEventListener('click', () => {
      window.openAddModal('Task');
    });
  }

  // Header quick add button on desktop
  const headerAddBtn = document.getElementById('headerQuickAddBtn');
  if (headerAddBtn) {
    headerAddBtn.addEventListener('click', () => {
      window.openAddModal('Task');
    });
  }

  // Search input in header
  const headerSearch = document.getElementById('globalSearchInput');
  if (headerSearch) {
    headerSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && headerSearch.value.trim()) {
        window.navigateView('history');
      }
    });
  }

  // Initialize Reminder Notification History Tracking Dropdown
  initNotificationDropdown();

  // Run initial Carry-Forward Check & notify user
  const carriedCount = store.runCarryForward();
  if (carriedCount > 0) {
    setTimeout(() => {
      window.showToast(`✨ Mindful Rollover: ${carriedCount} unfinished task(s) carried forward to today!`);
    }, 800);
  }

  // Subscribe store changes to refresh current view & notification badge
  store.subscribe(() => {
    window.navigateView(currentView);
    updateNotificationBadge();
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown && dropdown.classList.contains('active')) {
      renderNotificationsList();
    }
  });

  // Render initial view & update badge
  window.navigateView('dashboard');
  updateNotificationBadge();
});
