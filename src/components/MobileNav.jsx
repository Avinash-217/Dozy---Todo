import React from 'react';

export default function MobileNav({ currentView, onNavigate, onOpenModal }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-nav-items">
        <button className={`mobile-nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => onNavigate('dashboard')}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>home</span>
          <span>Home</span>
        </button>

        <button className={`mobile-nav-item ${currentView === 'calendar' ? 'active' : ''}`} onClick={() => onNavigate('calendar')}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>calendar_month</span>
          <span>Calendar</span>
        </button>

        <div className="mobile-fab-wrap">
          <button className="mobile-fab" id="mobileFab" aria-label="Create New Task or Note" onClick={() => onOpenModal('Task')}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
          </button>
        </div>

        <button className={`mobile-nav-item ${currentView === 'history' ? 'active' : ''}`} onClick={() => onNavigate('history')}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>history</span>
          <span>History</span>
        </button>

        <button className={`mobile-nav-item ${currentView === 'analytics' ? 'active' : ''}`} onClick={() => onNavigate('analytics')}>
          <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>insights</span>
          <span>Summary</span>
        </button>
      </div>
    </nav>
  );
}
