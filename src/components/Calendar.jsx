import React, { useState } from 'react';
import { store } from '../../js/store';
import { useStore } from '../hooks/useStore';
import { getTodayString } from '../utils/date';

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Calendar({ onNavigate, onOpenModal }) {
  const { tasks } = useStore();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [currentViewDate, setCurrentViewDate] = useState(new Date());

  const currentYear = currentViewDate.getFullYear();
  const currentMonth = currentViewDate.getMonth();
  const monthName = currentViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const tasksForSelectedDate = tasks.filter(t => t.dueDate === selectedDate);
  const carriedCount = tasksForSelectedDate.filter(t => t.carriedForward).length;

  const handlePrevMonth = () => {
    setCurrentViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentViewDate(new Date());
    setSelectedDate(getTodayString());
  };

  const handleTaskToggle = (taskId) => {
    store.toggleTask(taskId);
  };

  const handleTaskDelete = (taskId) => {
    store.deleteTask(taskId);
  };

  // Generate calendar days
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  const todayStr = getTodayString();

  const calendarDays = [];

  // Prev month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    calendarDays.push(
      <div key={`prev-${day}`} className="cal-day other-month">
        <span className="font-body-sm">{day}</span>
      </div>
    );
  }

  // Active month days
  for (let day = 1; day <= daysInMonth; day++) {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const dateKey = `${currentYear}-${mStr}-${dStr}`;

    const isToday = dateKey === todayStr;
    const isSelected = dateKey === selectedDate;
    const dayTasks = tasks.filter(t => t.dueDate === dateKey);

    const hasTasks = dayTasks.length > 0;
    const hasOverdue = dayTasks.some(t => !t.completed && dateKey < todayStr);

    calendarDays.push(
      <div 
        key={dateKey} 
        className={`cal-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`} 
        onClick={() => setSelectedDate(dateKey)}
      >
        <span className="day-number font-body-sm">{day}</span>
        <div className="cal-day-dots">
          {hasTasks && <span className="dot-task"></span>}
          {hasOverdue && <span className="dot-overdue"></span>}
        </div>
      </div>
    );
  }

  return (
    <div className="view-container active" id="calendarView">
      {/* Top Mindful Focus Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-low)', padding: 'var(--space-xs) var(--space-md)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-lg)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '18px' }}>nature</span>
          <p className="font-label-sm" style={{ color: 'var(--on-surface-variant)' }}>
            Mindful Focus: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{tasks.length} total milestones</span>
          </p>
        </div>
        <span className="font-label-sm" style={{ color: 'var(--secondary)', background: 'var(--secondary-container)', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--secondary)', display: 'inline-block' }}></span>
          Active Calendar
        </span>
      </div>

      {/* Calendar Grid Card & Detail Bento */}
      <div className="bento-grid">
        <div className="col-7 card">
          <div className="calendar-header">
            <div className="card-title-group">
              <div className="card-icon-badge">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
              </div>
              <div>
                <h2 className="font-headline-md" style={{ color: 'var(--primary)' }}>{monthName}</h2>
                <p className="font-body-sm" style={{ color: 'var(--outline)' }}>Milestone & Habit Flow</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button onClick={handlePrevMonth} className="icon-btn" style={{ background: 'var(--surface-low)' }} title="Previous Month">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
              </button>
              <button onClick={handleToday} className="option-pill" style={{ padding: '6px 12px', fontWeight: 600 }}>Today</button>
              <button onClick={handleNextMonth} className="icon-btn" style={{ background: 'var(--surface-low)' }} title="Next Month">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          <div className="calendar-grid">
            {calendarDays}
          </div>
        </div>

        {/* Day Details Column */}
        <div className="col-5 card">
          <div className="card-header">
            <div>
              <span className="font-label-sm" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Scheduled Milestones</span>
              <h3 className="font-headline-sm" style={{ marginTop: '2px' }}>{formatDisplayDate(selectedDate)}</h3>
            </div>
            <button onClick={() => onOpenModal('Task', { dueDate: selectedDate })} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              <span>Add</span>
            </button>
          </div>

          {carriedCount > 0 && (
            <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--amber-container)', color: 'var(--amber)', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-sm)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>forward</span>
              <span>{carriedCount} task(s) on this day were carried forward</span>
            </div>
          )}

          <div className="task-list" style={{ marginTop: 'var(--space-xs)' }}>
            {tasksForSelectedDate.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-xl)', color: 'var(--outline)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', opacity: 0.4 }}>event_available</span>
                <p style={{ marginTop: '8px', fontSize: '13px' }}>No tasks for this date. Enjoy the open space!</p>
              </div>
            ) : (
              tasksForSelectedDate.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-left">
                    <div className="task-checkbox" onClick={() => handleTaskToggle(task.id)}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 700 }}>check</span>
                    </div>
                    <div className="task-details">
                      <span className="task-title">{task.title}</span>
                      <div className="task-meta">
                        <span>{task.dueTime || 'Anytime'} • {task.category || 'General'}</span>
                        {task.carriedForward && (
                          <span className="carried-forward-badge">
                            <span className="material-symbols-outlined" style={{ fontSize: '11px' }}>forward</span>
                            <span>Carried Over</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="task-actions">
                    <button className="icon-btn" onClick={() => handleTaskDelete(task.id)} style={{ width: '30px', height: '30px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--outline)' }}>delete</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
