import { store } from '../store.js';

let activeNoteType = 'all'; // 'all', 'idea', 'note', 'thought'
let noteSearchQuery = '';

export function renderNotes(container) {
  let filteredNotes = store.notes;

  if (activeNoteType !== 'all') {
    filteredNotes = filteredNotes.filter(n => n.type === activeNoteType);
  }

  if (noteSearchQuery.trim()) {
    const q = noteSearchQuery.toLowerCase();
    filteredNotes = filteredNotes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.category && n.category.toLowerCase().includes(q)) ||
      (n.tags && n.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-lg); flex-wrap: wrap; gap: var(--space-md);">
      <div>
        <h1 class="font-headline-lg">Thoughts &amp; Notes Hub</h1>
        <p class="font-body-md" style="color: var(--on-surface-variant); margin-top: 4px;">
          Unclutter your mind. Capture spontaneous observations, reflections, and structured notes.
        </p>
      </div>
      <button id="newIdeaBtn" class="btn-primary">
        <span class="material-symbols-outlined" style="font-size: 18px;">edit_note</span>
        <span>New Note</span>
      </button>
    </div>

    <!-- Filters & Search Card -->
    <div class="card" style="padding: var(--space-md); margin-bottom: var(--space-lg);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
        <div class="capture-tabs" id="notesTypeTabs" style="margin-bottom: 0;">
          <button class="capture-tab-btn ${activeNoteType === 'all' ? 'active' : ''}" data-type="all">All (${store.notes.length})</button>
          <button class="capture-tab-btn ${activeNoteType === 'note' ? 'active' : ''}" data-type="note">Notes (${store.notes.filter(n => n.type === 'note').length})</button>
          <button class="capture-tab-btn ${activeNoteType === 'thought' ? 'active' : ''}" data-type="thought">Thoughts (${store.notes.filter(n => n.type === 'thought').length})</button>
        </div>

        <div style="position: relative; width: 260px; max-width: 100%;">
          <input type="text" id="notesSearchInput" class="form-control" style="padding-left: 36px;" placeholder="Search ideas & notes..." value="${escapeHtml(noteSearchQuery)}" />
          <span class="material-symbols-outlined" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--outline); font-size: 18px;">search</span>
        </div>
      </div>
    </div>

    <!-- Notes Grid -->
    <div class="notes-grid">
      ${filteredNotes.length === 0 ? `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--space-2xl); color: var(--outline);">
          <span class="material-symbols-outlined" style="font-size: 40px; opacity: 0.4;">lightbulb</span>
          <p style="margin-top: 10px; font-size: 14px;">No ideas or notes found in this category.</p>
        </div>
      ` : filteredNotes.map(note => `
        <div class="note-card" data-note-id="${note.id}">
          <div>
            <div class="note-header">
              <span class="note-tag" style="${note.type === 'idea' ? 'background: var(--amber-container); color: var(--amber);' : (note.type === 'thought' ? 'background: var(--primary-fixed); color: var(--primary);' : '')}">
                <span class="material-symbols-outlined filled" style="font-size: 14px;">
                  ${note.type === 'idea' ? 'lightbulb' : (note.type === 'thought' ? 'psychology' : 'edit_note')}
                </span>
                <span>${note.type.toUpperCase()}</span>
              </span>
              <button class="icon-btn" data-action="delete" style="width: 28px; height: 28px;" title="Delete note">
                <span class="material-symbols-outlined" style="font-size: 16px; color: var(--outline);">delete</span>
              </button>
            </div>

            <h3 class="font-headline-sm" style="margin-top: 10px; font-size: 15px;">${escapeHtml(note.title)}</h3>
            <p class="note-content" style="margin-top: 6px;">${escapeHtml(note.content || 'No description provided.')}</p>

            ${note.tags && note.tags.length > 0 ? `
              <div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 10px;">
                ${note.tags.map(t => `<span style="font-size: 10px; color: var(--outline); background: var(--surface-container); padding: 2px 6px; border-radius: var(--radius-sm); font-weight: 500;">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}

            ${note.attachments && note.attachments.length > 0 ? `
              <div style="margin-top: 10px; padding: 6px 10px; border-radius: var(--radius-sm); background: var(--surface-low); display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--primary); font-weight: 500;">
                <span class="material-symbols-outlined" style="font-size: 15px;">attach_file</span>
                <span>${note.attachments.length} attachment(s)</span>
              </div>
            ` : ''}
          </div>

          <div class="note-footer">
            <span>${escapeHtml(note.category || 'General')}</span>
            <span>${new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  wireNotesEvents(container);
}

function wireNotesEvents(container) {
  // Filter tabs
  container.querySelectorAll('#notesTypeTabs .capture-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeNoteType = btn.dataset.type;
      renderNotes(container);
    });
  });

  // Search
  const sInput = container.querySelector('#notesSearchInput');
  if (sInput) {
    sInput.addEventListener('input', (e) => {
      noteSearchQuery = e.target.value;
      renderNotes(container);
    });
  }

  // Create Idea button
  const newBtn = container.querySelector('#newIdeaBtn');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      window.openAddModal('Note');
    });
  }

  // Delete
  container.addEventListener('click', (e) => {
    const card = e.target.closest('.note-card');
    if (!card) return;
    const noteId = card.dataset.noteId;

    const delBtn = e.target.closest('[data-action="delete"]');
    if (delBtn) {
      store.deleteNote(noteId);
      renderNotes(container);
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}
