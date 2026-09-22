import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../hooks/useStore';
import { store } from '../../js/store';

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

export default function Header({ onNavigate, onOpenModal }) {
  const { notifications } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const dropdownRef = useRef(null);
  
  const activeCount = notifications.filter(n => !n.read && (n.status === 'active' || n.status === 'snoozed')).length;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  let filteredNotifications = notifications || [];
  if (filter === 'active') {
    filteredNotifications = filteredNotifications.filter(n => n.status === 'active' || n.status === 'snoozed');
  } else if (filter === 'completed') {
    filteredNotifications = filteredNotifications.filter(n => n.status === 'completed');
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      onNavigate('history');
    }
  };

  return (
    <header className="top-header">
      <div className="top-header-mobile-brand">
        <img src="assets/logo.png" alt="Dozy" style={{ height: '32px', width: 'auto' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
          <span style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '16px', color: 'var(--primary)' }}>Dozy</span>
        </div>
      </div>

      <div className="header-search">
        <span className="material-symbols-outlined search-icon">search</span>
        <input type="text" id="globalSearchInput" placeholder="Search tasks, notes, ideas..." aria-label="Search Workspace" onKeyDown={handleSearch} />
      </div>

      <div className="header-actions">
        <button id="headerQuickAddBtn" className="btn-primary" style={{ display: 'inline-flex' }} onClick={() => onOpenModal('Task')}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          <span>New Task</span>
        </button>

        <div className="notification-wrapper" ref={dropdownRef}>
          <button 
            id="notificationBellBtn" 
            className="icon-btn" 
            aria-label="Reminder Notifications" 
            title="View Reminder Notifications History"
            onClick={toggleDropdown}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>notifications</span>
            <span id="headerNotifBadge" className="header-badge-count" style={{ display: activeCount > 0 ? 'flex' : 'none' }}>
              {activeCount > 99 ? '99+' : activeCount}
            </span>
          </button>

          <div id="notificationDropdown" className={`notification-dropdown ${dropdownOpen ? 'active' : ''}`}>
            <div id="notificationDropdownBody">
              
              <div className="notif-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>notifications_active</span>
                  <span className="font-headline-sm" style={{ fontSize: '15px', fontWeight: 700 }}>Reminder Notifications</span>
                  {activeCount > 0 && <span className="notif-badge-pill">{activeCount} active</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button type="button" className="notif-text-btn" disabled={notifications.length === 0} onClick={() => store.markAllNotificationsRead()}>
                    Mark all read
                  </button>
                  <button type="button" className="icon-btn notif-close-mobile-btn" style={{ width: '28px', height: '28px' }} title="Close Notifications" onClick={() => setDropdownOpen(false)}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  </button>
                </div>
              </div>

              <div className="notif-filter-tabs">
                <button className={`notif-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                  All ({notifications.length})
                </button>
                <button className={`notif-tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                  Active ({notifications.filter(n => n.status === 'active' || n.status === 'snoozed').length})
                </button>
                <button className={`notif-tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
                  Done ({notifications.filter(n => n.status === 'completed').length})
                </button>
              </div>

              <div className="notif-list-scroll">
                {filteredNotifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <span className="material-symbols-outlined" style={{ fontSize: '36px', opacity: 0.35 }}>notifications_off</span>
                    <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500 }}>No notifications found</p>
                    <p style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '2px' }}>Your reminders and task alerts will show here.</p>
                  </div>
                ) : filteredNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notif-item ${notif.read ? 'read' : 'unread'} ${notif.status}`}
                    onClick={() => store.markNotificationRead(notif.id)}
                  >
                    <div className="notif-item-left">
                      <div className={`notif-icon-wrap ${notif.status}`}>
                        <span className="material-symbols-outlined filled" style={{ fontSize: '16px' }}>
                          {notif.status === 'completed' ? 'check_circle' : (notif.status === 'snoozed' ? 'snooze' : 'schedule')}
                        </span>
                      </div>
                      <div className="notif-content">
                        <div className="notif-title-row">
                          <span className="notif-task-name">{notif.taskName || notif.title}</span>
                          {!notif.read && <span className="notif-unread-dot"></span>}
                        </div>
                        <div className="notif-meta">
                          <span className="notif-date-time">
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>event</span>
                            {formatNotifDate(notif.date, notif.time)}
                          </span>
                          <span className="notif-category-chip">{notif.category || 'Reminder'}</span>
                          {notif.status === 'snoozed' && notif.snoozedUntil && (
                            <span className="notif-snoozed-label">Snoozed until {notif.snoozedUntil}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="notif-actions">
                      {notif.status !== 'completed' && (
                        <>
                          <button 
                            className="notif-action-btn complete" 
                            title="Mark Done" 
                            onClick={(e) => { e.stopPropagation(); store.completeNotification(notif.id); if (window.showToast) window.showToast('Reminder marked as completed'); }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check</span>
                            <span>Done</span>
                          </button>
                          <button 
                            className="notif-action-btn snooze" 
                            title="Snooze 1 hour"
                            onClick={(e) => { e.stopPropagation(); store.snoozeNotification(notif.id, 60); if (window.showToast) window.showToast('Reminder snoozed for 1 hour'); }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>snooze</span>
                            <span>1h</span>
                          </button>
                        </>
                      )}
                      <button 
                        className="notif-action-btn dismiss" 
                        title="Dismiss"
                        onClick={(e) => { e.stopPropagation(); store.dismissNotification(notif.id); }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>close</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="notif-footer">
                <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                  Tracking {notifications.length} reminder alert(s)
                </span>
                <button 
                  type="button" 
                  className="notif-text-btn" 
                  style={{ color: 'var(--error)' }} 
                  disabled={notifications.length === 0}
                  onClick={() => { if (window.confirm('Clear all reminder notification history?')) store.clearAllNotifications(); }}
                >
                  Clear History
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
