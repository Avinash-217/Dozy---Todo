import React, { useState } from 'react';
import { store } from '../../js/store';
import { useStore } from '../hooks/useStore';

export default function Notes({ onNavigate, onOpenModal }) {
  const { notes } = useStore();
  const [activeNoteType, setActiveNoteType] = useState('all'); // 'all', 'idea', 'note', 'thought'
  const [searchQuery, setSearchQuery] = useState('');

  let filteredNotes = notes;

  if (activeNoteType !== 'all') {
    filteredNotes = filteredNotes.filter(n => n.type === activeNoteType);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredNotes = filteredNotes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.category && n.category.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  const handleDelete = (noteId) => {
    store.deleteNote(noteId);
  };

  return (
    <div className="view-container active" id="notesView">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 className="font-headline-lg">Thoughts &amp; Notes Hub</h1>
          <p className="font-body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
            Unclutter your mind. Capture spontaneous observations, reflections, and structured notes.
          </p>
        </div>
        <button onClick={() => onOpenModal('Note')} className="btn-primary">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
          <span>New Note</span>
        </button>
      </div>

      {/* Filters & Search Card */}
      <div className="card" style={{ padding: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
          <div className="capture-tabs" style={{ marginBottom: 0 }}>
            <button className={`capture-tab-btn ${activeNoteType === 'all' ? 'active' : ''}`} onClick={() => setActiveNoteType('all')}>
              All ({notes.length})
            </button>
            <button className={`capture-tab-btn ${activeNoteType === 'note' ? 'active' : ''}`} onClick={() => setActiveNoteType('note')}>
              Notes ({notes.filter(n => n.type === 'note').length})
            </button>
            <button className={`capture-tab-btn ${activeNoteType === 'thought' ? 'active' : ''}`} onClick={() => setActiveNoteType('thought')}>
              Thoughts ({notes.filter(n => n.type === 'thought').length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '260px', maxWidth: '100%' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '36px' }} 
              placeholder="Search ideas & notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '18px' }}>search</span>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="notes-grid">
        {filteredNotes.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-2xl)', color: 'var(--outline)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.4 }}>lightbulb</span>
            <p style={{ marginTop: '10px', fontSize: '14px' }}>No ideas or notes found in this category.</p>
          </div>
        ) : (
          filteredNotes.map(note => (
            <div key={note.id} className="note-card">
              <div>
                <div className="note-header">
                  <span className="note-tag" style={{ background: note.type === 'idea' ? 'var(--amber-container)' : (note.type === 'thought' ? 'var(--primary-fixed)' : ''), color: note.type === 'idea' ? 'var(--amber)' : (note.type === 'thought' ? 'var(--primary)' : '') }}>
                    <span className={`material-symbols-outlined ${note.type !== 'note' ? 'filled' : ''}`} style={{ fontSize: '14px' }}>
                      {note.type === 'idea' ? 'lightbulb' : (note.type === 'thought' ? 'psychology' : 'edit_note')}
                    </span>
                    <span>{note.type.toUpperCase()}</span>
                  </span>
                  <button className="icon-btn" onClick={() => handleDelete(note.id)} style={{ width: '28px', height: '28px' }} title="Delete note">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--outline)' }}>delete</span>
                  </button>
                </div>

                <h3 className="font-headline-sm" style={{ marginTop: '10px', fontSize: '15px' }}>{note.title}</h3>
                <p className="note-content" style={{ marginTop: '6px' }}>{note.content || 'No description provided.'}</p>

                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {note.tags.map(t => (
                      <span key={t} style={{ fontSize: '10px', color: 'var(--outline)', background: 'var(--surface-container)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                )}

                {note.attachments && note.attachments.length > 0 && (
                  <div style={{ marginTop: '10px', padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--surface-low)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--primary)', fontWeight: 500 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>attach_file</span>
                    <span>{note.attachments.length} attachment(s)</span>
                  </div>
                )}
              </div>

              <div className="note-footer">
                <span>{note.category || 'General'}</span>
                <span>{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
