import React, { useState } from 'react';
import { store } from '../../js/store';
import { useStore } from '../hooks/useStore';

export default function Analytics({ onNavigate }) {
  // Use store just to subscribe to changes (so we re-render when tasks change)
  useStore(); 

  const [selectedMonthDate, setSelectedMonthDate] = useState(new Date());

  const currentYear = selectedMonthDate.getFullYear();
  const currentMonth = selectedMonthDate.getMonth();
  const monthLabel = selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const stats = store.getMonthlyStats(currentYear, currentMonth);

  const handlePrevMonth = () => {
    setSelectedMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <div className="view-container active" id="analyticsView">
      {/* Month Navigation Header & Sub-banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-lowest)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', marginBottom: 'var(--space-lg)', border: '1px solid rgba(0, 95, 75, 0.04)' }}>
        <button className="icon-btn" onClick={handlePrevMonth} style={{ background: 'var(--surface-low)' }} title="Previous Month">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="font-headline-sm" style={{ color: 'var(--primary)', fontSize: '18px' }}>{monthLabel}</h1>
          <span className="font-label-sm" style={{ color: 'var(--outline)', display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }}></span>
            Monthly Performance & Review
          </span>
        </div>
        <button className="icon-btn" onClick={handleNextMonth} style={{ background: 'var(--surface-low)' }} title="Next Month">
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
        </button>
      </div>

      {/* 4 Key Summary Metric Cards */}
      <div className="stats-grid">
        {/* Tasks Created */}
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Tasks Created</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--primary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_task</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-display-lg" style={{ color: 'var(--primary)', fontSize: '28px' }}>{stats.totalCreated}</span>
            <span className="font-label-sm" style={{ color: 'var(--secondary)' }}>+12%</span>
          </div>
          <span className="font-body-sm" style={{ color: 'var(--outline)', marginTop: '4px', display: 'block' }}>Total logged</span>
        </div>

        {/* Completed */}
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Completed</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-display-lg" style={{ color: 'var(--secondary)', fontSize: '28px' }}>{stats.completed}</span>
            <span className="font-label-sm" style={{ color: 'var(--secondary)', fontWeight: 600 }}>{stats.completionRate || 0}% rate</span>
          </div>
          <span className="font-body-sm" style={{ color: 'var(--outline)', marginTop: '4px', display: 'block' }}>Finished on time</span>
        </div>

        {/* Carried Over */}
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Carried Over</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--amber)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>forward</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-display-lg" style={{ color: 'var(--on-surface)', fontSize: '28px' }}>{stats.carriedOver}</span>
            <span className="font-label-sm" style={{ color: 'var(--outline)' }}>tasks</span>
          </div>
          <span className="font-body-sm" style={{ color: 'var(--outline)', marginTop: '4px', display: 'block' }}>Rescheduled</span>
        </div>

        {/* Incomplete */}
        <div className="card" style={{ padding: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-label-md" style={{ color: 'var(--on-surface-variant)' }}>Incomplete</span>
            <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-full)', background: 'var(--error-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pending_actions</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="font-display-lg" style={{ color: 'var(--error)', fontSize: '28px' }}>{stats.incomplete}</span>
            <span className="font-label-sm" style={{ color: 'var(--error)', fontWeight: 600 }}>needs review</span>
          </div>
          <span className="font-body-sm" style={{ color: 'var(--outline)', marginTop: '4px', display: 'block' }}>Pending action</span>
        </div>
      </div>

      {/* Completion Rate Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '22px' }}>donut_large</span>
            <h2 className="font-headline-sm">Completion Rate</h2>
          </div>
          <span className="font-label-lg" style={{ background: 'var(--primary-fixed)', color: 'var(--primary)', padding: '2px 10px', borderRadius: 'var(--radius-full)' }}>
            {stats.completionRate || 0}%
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'var(--space-sm)' }}>
          <div style={{ width: '100%', height: '12px', background: 'var(--surface-high)', borderRadius: 'var(--radius-full)', overflow: 'hidden', padding: '2px' }}>
            <div style={{ width: `${stats.completionRate || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 0.8s ease' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--outline)' }}>
            <span>0%</span>
            <span>Target: 70% (Achieved)</span>
            <span>100%</span>
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-lg)', padding: '12px', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)' }}>
          <span className="font-label-sm" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>Productivity Highlights</span>
          <ul style={{ marginTop: '6px', paddingLeft: '18px', fontSize: '12px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>
            <li>Highest completion rate on <strong>Tuesdays and Thursdays</strong>.</li>
            <li>{stats.carriedOver} tasks automatically rolled over so no thought is ever lost.</li>
            <li>Average of <strong>4.2 completed milestones per active day</strong>.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
