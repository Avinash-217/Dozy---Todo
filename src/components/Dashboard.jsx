import React from 'react';
import { store } from '../../js/store';
import { useStore } from '../hooks/useStore';
import QuickCapture from './QuickCapture';
import { formatTime } from '../utils/date';

export default function Dashboard({ onNavigate, onOpenModal }) {
  const { tasks, notes, reminders } = useStore();

  const todayTasks = store.getTodayTasks();
  const completedToday = todayTasks.filter(t => t.completed).length;
  const overdueTasks = store.getOverdueTasks();
  const monthlyStats = store.getMonthlyStats();
  const streakDays = 7; // placeholder like in original

  const completionPercent = todayTasks.length > 0 
    ? Math.round((completedToday / todayTasks.length) * 100) 
    : 0;

  const strokeDashoffset = 251.2 - (251.2 * ((monthlyStats.completionRate || 0) / 100));

  const recentNotes = notes.slice(0, 3);
  const upcomingReminders = reminders.slice(0, 3);

  const handleTaskToggle = (taskId) => {
    store.toggleTask(taskId);
  };

  const handleTaskDelete = (taskId) => {
    store.deleteTask(taskId);
  };

  const handleTaskStar = (taskId) => {
    store.updateTask(taskId, { starred: !store.getTask(taskId)?.starred });
  };

  const handleReminderToggle = (id) => {
    store.toggleReminder(id);
  };

  return (
    <div className="view-container active" id="dashboardView">
      {/* Top Greeting Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--surface-high)', marginBottom: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--primary)' }}>calendar_today</span>
            <span className="font-label-sm" style={{ color: 'var(--outline)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="font-headline-lg" style={{ marginTop: '2px' }}>
            Good Morning, Avinash <span style={{ display: 'inline-block', animation: 'wave 1.5s infinite' }}>👋</span>
          </h1>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>Let's make today productive and calm!</p>
        </div>
      </div>

      {/* Quick Stats Ribbon */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--surface-low)', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>fact_check</span>
          </div>
          <span className="stat-val">{todayTasks.length}</span>
          <span className="stat-label">Tasks</span>
          <span className="stat-sub" style={{ color: 'var(--secondary)' }}>{completedToday} done</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--error-container)', color: 'var(--error)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>error</span>
          </div>
          <span className="stat-val" style={{ color: 'var(--error)' }}>{overdueTasks.length}</span>
          <span className="stat-label">Overdue</span>
          <span className="stat-sub" style={{ color: 'var(--error)' }}>{overdueTasks.length > 0 ? 'Action needed' : 'All clear'}</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-fixed)', color: 'var(--primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bar_chart</span>
          </div>
          <span className="stat-val">{monthlyStats.completed}</span>
          <span className="stat-label">Monthly</span>
          <span className="stat-sub" style={{ color: 'var(--outline)' }}>of {monthlyStats.totalCreated} total</span>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 218, 214, 0.6)', color: 'var(--on-error-container)' }}>
            <span className="material-symbols-outlined filled" style={{ fontSize: '20px', color: 'var(--fire)' }}>local_fire_department</span>
          </div>
          <span className="stat-val">{streakDays}</span>
          <span className="stat-label">Streak</span>
          <span className="stat-sub" style={{ color: 'var(--secondary)' }}>Days on fire</span>
        </div>
      </div>

      <QuickCapture />

      {/* Tasks & Monthly Bento Row */}
      <div className="bento-grid">
        {/* Today's Tasks Column */}
        <div className="col-7 card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
              </div>
              <div>
                <h2 className="font-headline-sm" style={{ fontWeight: 700 }}>Today's Tasks</h2>
                <p className="font-label-sm" style={{ color: 'var(--outline)', marginTop: '2px' }}>{completedToday} of {todayTasks.length} completed</p>
              </div>
            </div>
            <button className="btn-primary" onClick={() => onOpenModal('Task')} style={{ padding: '6px 14px', fontSize: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              <span>New Task</span>
            </button>
          </div>

          <div className="task-list">
            {todayTasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--outline)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', opacity: 0.5 }}>task_alt</span>
                <p style={{ marginTop: '8px' }}>No tasks scheduled for today. Take a mindful breath!</p>
              </div>
            ) : (
              todayTasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-left">
                    <div className="task-checkbox" onClick={() => handleTaskToggle(task.id)}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 700 }}>check</span>
                    </div>
                    <div className="task-details">
                      <span className="task-title">{task.title}</span>
                      <div className="task-meta">
                        <span>{task.dueTime ? formatTime(task.dueTime) + ' • ' : ''}{task.category || 'General'}</span>
                        {task.carriedForward && (
                          <span className="carried-forward-badge" title={`Carried forward ${task.carryForwardCount} times`}>
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>forward</span>
                            <span>Carried Over ({task.carryForwardCount}x)</span>
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="priority-flag high">
                            <span className="material-symbols-outlined filled" style={{ fontSize: '13px' }}>flag</span>High
                          </span>
                        )}
                        {task.priority === 'medium' && (
                          <span className="priority-flag medium" style={{ background: '#fef3c7', color: '#b45309', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>flag</span>Med
                          </span>
                        )}
                        {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                          <span key={tag} style={{ fontSize: '10px', padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)' }}>{tag}</span>
                        ))}
                        {task.attachments && task.attachments.length > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: 'var(--primary)' }} title={`${task.attachments.length} attachment(s)`}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>attach_file</span>
                            <span>{task.attachments.length}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="icon-btn" onClick={() => handleTaskStar(task.id)} style={{ width: '32px', height: '32px' }} title="Star task">
                      <span className={`material-symbols-outlined ${task.starred ? 'filled' : ''}`} style={{ fontSize: '18px', color: task.starred ? 'var(--amber)' : 'var(--outline)' }}>star</span>
                    </button>
                    <button className="icon-btn" onClick={() => handleTaskDelete(task.id)} style={{ width: '32px', height: '32px' }} title="Delete task">
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--outline)' }}>delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)', paddingTop: 'var(--space-xs)', borderTop: '1px solid var(--surface-low)' }}>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('history'); }} className="font-label-sm" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>View Task History</span>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
            </a>
            <span className="font-label-sm" style={{ color: 'var(--outline)' }}>{completionPercent}% done today</span>
          </div>
        </div>

        {/* Monthly Progress Card */}
        <div className="col-5 card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title-group">
                <div className="card-icon-badge">
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>pie_chart</span>
                </div>
                <h2 className="font-headline-sm" style={{ fontWeight: 700 }}>This Month's Progress</h2>
              </div>
              <span className="font-label-sm" style={{ background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                +12% vs last month
              </span>
            </div>

            <div className="progress-widget-body">
              <div className="radial-circle-container">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--surface-high)" strokeWidth="9"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--primary)" strokeWidth="9" strokeLinecap="round"
                    strokeDasharray="251.2" strokeDashoffset={strokeDashoffset} style={{ transition: 'stroke-dashoffset 0.8s ease' }}></circle>
                </svg>
                <div className="radial-center-text">
                  <span className="font-display-lg" style={{ fontSize: '22px', lineHeight: 1 }}>{monthlyStats.completionRate || 0}%</span>
                  <span className="font-label-sm" style={{ color: 'var(--outline)', fontSize: '10px', marginTop: '2px' }}>{monthlyStats.completed}/{monthlyStats.totalCreated} done</span>
                </div>
              </div>

              <div className="bar-chart-container">
                <span className="font-label-sm" style={{ color: 'var(--outline)' }}>Weekly Completed Tasks</span>
                <div className="bar-cols">
                  {['W1', 'W2', 'W3', 'W4'].map((week, idx) => {
                    const count = monthlyStats.weeklyCompleted ? monthlyStats.weeklyCompleted[idx] : 0;
                    const maxCount = Math.max(...(monthlyStats.weeklyCompleted || [0]), 6);
                    const heightPercent = Math.max(15, Math.round((count / maxCount) * 100));
                    const isCurrent = idx === 2; // W3
                    return (
                      <div key={week} className="bar-col">
                        <div className={`bar-fill ${isCurrent ? 'active' : ''}`} style={{ height: `${heightPercent}%` }} title={`${count} tasks`}></div>
                        <span className="bar-label">{week}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Reminders Bento Row */}
      <div className="bento-grid">
        {/* Recent Notes */}
        <div className="col-6 card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>description</span>
              </div>
              <h2 className="font-headline-sm" style={{ fontWeight: 700 }}>Recent Notes</h2>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('notes'); }} className="font-label-sm" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>View all</a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
            {recentNotes.map(n => (
              <div key={n.id} className="note-item-preview" style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-low)', display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', transition: 'all 0.15s ease', minWidth: 0 }}>
                <span className={`material-symbols-outlined ${n.type !== 'note' ? 'filled' : ''}`} style={{ fontSize: '20px', color: n.type === 'idea' ? 'var(--amber)' : 'var(--primary)', marginTop: '2px', flexShrink: 0 }}>
                  {n.type === 'idea' ? 'lightbulb' : (n.type === 'thought' ? 'psychology' : 'article')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="font-label-lg" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</span>
                  <p className="font-body-sm" style={{ color: 'var(--outline)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="col-6 card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications_active</span>
              </div>
              <h2 className="font-headline-sm" style={{ fontWeight: 700 }}>Upcoming Reminders</h2>
            </div>
            <button onClick={() => onOpenModal('Reminder')} className="font-label-sm" style={{ color: 'var(--primary)', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: 0 }}>
            {upcomingReminders.map(r => (
              <div key={r.id} style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--surface-low)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                  <button className="icon-btn" onClick={() => handleReminderToggle(r.id)} style={{ width: '28px', height: '28px', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: r.completed ? 'var(--secondary)' : 'var(--outline)' }}>
                      {r.completed ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <span className={`font-label-lg ${r.completed ? 'completed' : ''}`} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: r.completed ? 'line-through' : 'none', color: r.completed ? 'var(--outline)' : 'inherit' }}>{r.title}</span>
                    <span className="font-body-sm" style={{ color: 'var(--outline)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.dateTime ? r.dateTime.replace('T', ', ') : ''} • {r.category || 'General'}</span>
                  </div>
                </div>
                <span className="font-label-sm" style={{ background: 'var(--surface-high)', color: 'var(--on-surface-variant)', padding: '2px 8px', borderRadius: 'var(--radius-full)', flexShrink: 0 }}>
                  {r.category || 'General'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
