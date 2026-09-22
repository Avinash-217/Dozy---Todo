import React from 'react';
import { useStore } from '../hooks/useStore';

export default function Sidebar({ currentView, onNavigate }) {
  const { tasks } = useStore();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => !t.completed && t.dueDate < todayStr).length;
  const carriedCount = tasks.filter(t => t.carriedForward).length;
  const historyCount = carriedCount > 0 ? `${carriedCount} roll` : tasks.filter(t => t.completed).length;

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      <div className="sidebar-header">
        <a href="#" className="sidebar-brand" onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
          <img src="assets/logo.png" alt="Dozy Logo" className="sidebar-logo" />
          <div className="sidebar-brand-text">
            <span className="brand-title">Dozy</span>
          </div>
        </a>
      </div>

      <div className="sidebar-nav">
        <span className="sidebar-section-title">Core Workspace</span>
        
        <a href="#" className={`nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
          <span className="material-symbols-outlined">home</span>
          <span>Home Dashboard</span>
        </a>

        <a href="#" className={`nav-link ${currentView === 'calendar' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('calendar'); }}>
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Calendar Planner</span>
        </a>

        <a href="#" className={`nav-link ${currentView === 'history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('history'); }}>
          <span className="material-symbols-outlined">history</span>
          <span>Task History &amp; Audit</span>
          <span className="nav-badge" id="sidebarHistoryBadge">{historyCount}</span>
        </a>

        <a href="#" className={`nav-link ${currentView === 'notes' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('notes'); }}>
          <span className="material-symbols-outlined">description</span>
          <span>Thoughts &amp; Notes Hub</span>
        </a>

        <a href="#" className={`nav-link ${currentView === 'analytics' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onNavigate('analytics'); }}>
          <span className="material-symbols-outlined">insights</span>
          <span>Monthly Analytics</span>
        </a>
      </div>
    </aside>
  );
}
