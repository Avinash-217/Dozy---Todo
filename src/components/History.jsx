import React, { useState } from 'react';
import { store } from '../../js/store';
import { useStore } from '../hooks/useStore';

export default function History({ onNavigate, onOpenModal }) {
  const { tasks } = useStore();
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'completed', 'carried', 'high'
  const [searchQuery, setSearchQuery] = useState('');

  let filteredTasks = tasks;

  if (activeFilter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  } else if (activeFilter === 'carried') {
    filteredTasks = filteredTasks.filter(t => t.carriedForward);
  } else if (activeFilter === 'high') {
    filteredTasks = filteredTasks.filter(t => t.priority === 'high');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.category && t.category.toLowerCase().includes(q))
    );
  }

  const handleTaskToggle = (taskId) => {
    store.toggleTask(taskId);
  };

  const handleTaskDelete = (taskId) => {
    store.deleteTask(taskId);
  };

  return (
    <div className="view-container active" id="historyView">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="font-headline-lg">Task History &amp; Carry-Over Audit</h1>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Complete historical timeline of completed tasks, rollover records, and audit milestones.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar Card */}
      <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div className="capture-tabs" style={{ marginBottom: 0 }}>
            <button className={`capture-tab-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
              All Tasks ({tasks.length})
            </button>
            <button className={`capture-tab-btn ${activeFilter === 'completed' ? 'active' : ''}`} onClick={() => setActiveFilter('completed')}>
              Completed ({tasks.filter(t => t.completed).length})
            </button>
            <button className={`capture-tab-btn ${activeFilter === 'carried' ? 'active' : ''}`} onClick={() => setActiveFilter('carried')}>
              Carried Forward ({tasks.filter(t => t.carriedForward).length})
            </button>
            <button className={`capture-tab-btn ${activeFilter === 'high' ? 'active' : ''}`} onClick={() => setActiveFilter('high')}>
              High Priority ({tasks.filter(t => t.priority === 'high').length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '36px' }} 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '18px' }}>search</span>
          </div>
        </div>
      </div>

      {/* History Cards / Table */}
      <div className="card">
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--outline)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.4 }}>history_toggle_off</span>
              <p style={{ marginTop: '10px', fontSize: '14px' }}>No tasks match the selected history filter.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} className="task-item" style={{ padding: '14px 12px', border: '1px solid var(--surface-container)', alignItems: 'flex-start' }}>
                <div className="task-left" style={{ alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div className="task-checkbox" onClick={() => handleTaskToggle(task.id)} style={{ marginTop: '2px', flexShrink: 0, background: task.completed ? 'var(--secondary)' : '', borderColor: task.completed ? 'var(--secondary)' : '', color: task.completed ? 'white' : '' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 700 }}>check</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="task-title" style={{ fontSize: '15px', fontWeight: 600, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.35, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--outline)' : 'inherit' }}>{task.title}</span>
                      {task.carriedForward && (
                        <span className="carried-forward-badge">
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>forward</span>
                          <span>Carried {task.carryForwardCount}x</span>
                        </span>
                      )}
                      <span className={`priority-flag ${task.priority}`} style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', flexShrink: 0 }}>
                        <span className="material-symbols-outlined filled" style={{ fontSize: '13px' }}>flag</span>{task.priority}
                      </span>
                    </div>

                    {task.description && (
                      <p className="font-body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>{task.description}</p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--outline)', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span><strong style={{ color: 'var(--on-surface)' }}>Category:</strong> {task.category || 'General'}</span>
                      <span><strong style={{ color: 'var(--on-surface)' }}>Due Date:</strong> {task.dueDate || 'None'}</span>
                      {task.originalDueDate && task.originalDueDate !== task.dueDate && (
                        <span><strong style={{ color: 'var(--amber)' }}>Orig Due:</strong> {task.originalDueDate}</span>
                      )}
                      {task.completedAt ? (
                        <span><strong style={{ color: 'var(--secondary)' }}>Completed:</strong> {new Date(task.completedAt).toLocaleString()}</span>
                      ) : (
                        <span style={{ color: 'var(--outline)' }}><strong style={{ color: 'var(--on-surface)' }}>Status:</strong> Open</span>
                      )}
                      <span><strong style={{ color: 'var(--on-surface)' }}>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>

                    {task.carryForwardDates && task.carryForwardDates.length > 0 && (
                      <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--amber)' }}>
                        <span>Rolled over past: {task.carryForwardDates.join(', ')}</span>
                      </div>
                    )}

                    {task.attachments && task.attachments.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {task.attachments.map(att => (
                          <span key={att.id || att.name} className="option-pill" style={{ fontSize: '11px', background: 'var(--surface-low)', color: 'var(--primary)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>attach_file</span>
                            <span>{att.name}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="task-actions" style={{ marginTop: '2px' }}>
                  <button className="icon-btn" onClick={() => handleTaskDelete(task.id)} title="Delete record">
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--outline)' }}>delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
