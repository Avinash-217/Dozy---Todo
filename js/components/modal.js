import { store } from '../store.js';
import { getTodayString } from '../carry-forward.js';

let activeType = 'Task';
let activePriority = 'low';
let currentAttachments = [];
let prefillData = {};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[m]);
}

export function initModal() {
  const modalOverlay = document.getElementById('addModalOverlay');
  if (!modalOverlay) return;

  window.openAddModal = function(type = 'Task', prefill = {}) {
    activeType = type;
    activePriority = prefill.priority || 'low';
    currentAttachments = prefill.attachments ? [...prefill.attachments] : [];
    prefillData = prefill;

    renderModalContent();
    modalOverlay.classList.add('active');
    setTimeout(() => {
      const input = document.getElementById('modalTitle');
      if (input) input.focus();
    }, 100);
  };

  window.closeAddModal = function() {
    modalOverlay.classList.remove('active');
  };

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      window.closeAddModal();
    }
  });
}

function renderModalContent() {
  const container = document.getElementById('addModalContent');
  if (!container) return;

  const defaultDate = prefillData.dueDate || getTodayString();

  container.innerHTML = `
    <div class="modal-sheet-grabber"></div>
    <div class="modal-header">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span class="material-symbols-outlined" style="color: var(--primary); font-size: 24px;">add_circle</span>
        <h2 class="font-headline-sm" style="font-size: 18px;">Create New ${activeType}</h2>
      </div>
      <button class="icon-btn" onclick="window.closeAddModal()" style="width: 32px; height: 32px;">
        <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
      </button>
    </div>

    <!-- Type Selector Pills -->
    <div class="capture-tabs" id="modalTypeGroup" style="width: 100%; display: flex; align-items: center; min-height: 40px; box-sizing: border-box; margin-bottom: 8px; padding: 4px; background: var(--surface-low); border-radius: var(--radius-full);">
      <button type="button" class="capture-tab-btn ${activeType === 'Task' ? 'active' : ''}" data-type="Task" style="flex: 1; text-align: center;">Task</button>
      <button type="button" class="capture-tab-btn ${activeType === 'Note' ? 'active' : ''}" data-type="Note" style="flex: 1; text-align: center;">Note</button>
      <button type="button" class="capture-tab-btn ${activeType === 'Reminder' ? 'active' : ''}" data-type="Reminder" style="flex: 1; text-align: center;">Reminder</button>
    </div>

    <!-- Title Field -->
    <div class="form-group">
      <label class="form-label" for="modalTitle">Title <span style="color: var(--error);">*</span></label>
      <input type="text" id="modalTitle" class="form-control" placeholder="e.g. Finish client proposal..." value="${escapeHtml(prefillData.title || '')}" required />
    </div>

    <!-- Description Field -->
    <div class="form-group">
      <label class="form-label" for="modalDesc">Description &amp; Context</label>
      <textarea id="modalDesc" class="form-control" rows="3" style="resize: none;" placeholder="Add mindful notes, links, or next steps...">${escapeHtml(prefillData.description || prefillData.desc || '')}</textarea>
    </div>

    ${activeType === 'Task' || activeType === 'Reminder' ? `
      <!-- Schedule Row -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
        <div class="form-group">
          <label class="form-label" for="modalDueDate">Due Date</label>
          <input type="date" id="modalDueDate" class="form-control" value="${defaultDate}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="modalDueTime">Time</label>
          <input type="time" id="modalDueTime" class="form-control" value="${prefillData.dueTime || '10:00'}" />
        </div>
      </div>
    ` : ''}

    ${activeType === 'Task' ? `
      <!-- Priority Level -->
      <div class="form-group">
        <label class="form-label">Priority</label>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;" id="modalPriorityGroup">
          <button type="button" class="option-pill ${activePriority === 'low' ? 'active' : ''}" data-p="low" style="justify-content: center; padding: 8px;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--secondary);">eco</span>
            <span>Low</span>
          </button>
          <button type="button" class="option-pill ${activePriority === 'medium' ? 'active' : ''}" data-p="medium" style="justify-content: center; padding: 8px;">
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--amber);">flag</span>
            <span>Medium</span>
          </button>
          <button type="button" class="option-pill ${activePriority === 'high' ? 'active' : ''}" data-p="high" style="justify-content: center; padding: 8px; ${activePriority === 'high' ? 'background: var(--error-container); color: var(--error);' : ''}">
            <span class="material-symbols-outlined" style="font-size: 16px; color: var(--error);">priority_high</span>
            <span>High</span>
          </button>
        </div>
      </div>
    ` : ''}

    <!-- Category & Tags -->
    <div class="form-group">
      <label class="form-label" for="modalCategory">Category &amp; Tags</label>
      <div style="display: flex; gap: 8px;">
        <input type="text" id="modalCategory" class="form-control" style="flex: 1;" placeholder="Category (e.g. Work, Health)" value="${prefillData.category || ''}" />
        <input type="text" id="modalTags" class="form-control" style="flex: 1;" placeholder="Tags (e.g. #dbms, #study)" />
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
        ${['#college', '#dbms', '#health', '#personal', '#reading'].map(tag => `
          <button type="button" class="option-pill" onclick="appendTag('${tag}')" style="font-size: 11px;">${tag}</button>
        `).join('')}
      </div>
    </div>

    <!-- File & Folder Attachments -->
    <div class="form-group">
      <label class="form-label">Attachments &amp; Folders</label>
      <div class="dropzone" id="modalDropzone">
        <span class="material-symbols-outlined" style="font-size: 28px; color: var(--primary);">cloud_upload</span>
        <p class="font-label-sm" style="color: var(--on-surface); margin-top: 4px;">Click to upload files, or drag &amp; drop</p>
        <p class="font-body-sm" style="color: var(--outline); font-size: 11px;">PDF, Images, Docs up to 25MB • Folder selection supported</p>
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 8px;">
          <button type="button" id="selectFileBtn" class="option-pill" style="font-size: 11px;">Select Files</button>
          <button type="button" id="selectFolderBtn" class="option-pill" style="font-size: 11px;">Select Folder</button>
        </div>
        <input type="file" id="modalFileInput" multiple style="display: none;" />
        <input type="file" id="modalFolderInput" webkitdirectory directory style="display: none;" />
      </div>

      <div class="attachments-preview" id="modalAttachmentsList">
        ${renderAttachmentsList()}
      </div>
    </div>

    <!-- Actions -->
    <div style="display: flex; justify-content: flex-end; gap: var(--space-sm); margin-top: var(--space-xs); border-top: 1px solid var(--surface-low); padding-top: var(--space-md);">
      <button type="button" class="option-pill" onclick="window.closeAddModal()" style="padding: 8px 18px; font-weight: 600;">Cancel</button>
      <button type="button" id="modalSubmitBtn" class="btn-primary" style="padding: 8px 24px;">Create ${activeType}</button>
    </div>
  `;

  wireModalEvents(container);
}

function renderAttachmentsList() {
  if (currentAttachments.length === 0) return '';
  return currentAttachments.map((att, idx) => `
    <div class="attachment-chip">
      <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">
          ${att.isFolder ? 'folder' : 'attach_file'}
        </span>
        <span style="font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${att.name}</span>
        <span style="color: var(--outline); font-size: 10px;">(${formatBytes(att.size || 0)})</span>
      </div>
      <button type="button" class="icon-btn" onclick="removeAttachment(${idx})" style="width: 24px; height: 24px;">
        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--error);">close</span>
      </button>
    </div>
  `).join('');
}

window.removeAttachment = function(idx) {
  currentAttachments.splice(idx, 1);
  const list = document.getElementById('modalAttachmentsList');
  if (list) list.innerHTML = renderAttachmentsList();
};

window.appendTag = function(tag) {
  const input = document.getElementById('modalTags');
  if (input) {
    const existing = input.value.trim();
    if (!existing.includes(tag)) {
      input.value = existing ? `${existing} ${tag}` : tag;
    }
  }
};

function wireModalEvents(container) {
  // Mode selector
  container.querySelectorAll('#modalTypeGroup .capture-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      prefillData.title = container.querySelector('#modalTitle')?.value || '';
      prefillData.description = container.querySelector('#modalDesc')?.value || '';
      prefillData.category = container.querySelector('#modalCategory')?.value || '';
      prefillData.dueDate = container.querySelector('#modalDueDate')?.value || '';
      prefillData.dueTime = container.querySelector('#modalDueTime')?.value || '';
      activeType = btn.dataset.type;
      renderModalContent();
    });
  });

  // Priority selector - toggle active class in place so typed fields are preserved
  const priorityGroup = container.querySelector('#modalPriorityGroup');
  if (priorityGroup) {
    priorityGroup.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        activePriority = btn.dataset.p;
        priorityGroup.querySelectorAll('button').forEach(b => {
          b.classList.remove('active');
          b.style.background = '';
          b.style.color = '';
        });
        btn.classList.add('active');
        if (activePriority === 'high') {
          btn.style.background = 'var(--error-container)';
          btn.style.color = 'var(--error)';
        }
      });
    });
  }

  // File Upload
  const fileInput = container.querySelector('#modalFileInput');
  const folderInput = container.querySelector('#modalFolderInput');
  const selectFileBtn = container.querySelector('#selectFileBtn');
  const selectFolderBtn = container.querySelector('#selectFolderBtn');
  const dropzone = container.querySelector('#modalDropzone');

  if (selectFileBtn && fileInput) {
    selectFileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (selectFolderBtn && folderInput) {
    selectFolderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      folderInput.click();
    });
  }

  function handleFiles(files) {
    for (const f of files) {
      currentAttachments.push({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
        isFolder: !!f.webkitRelativePath
      });
    }
    const list = container.querySelector('#modalAttachmentsList');
    if (list) list.innerHTML = renderAttachmentsList();
  }

  if (fileInput) {
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
  }
  if (folderInput) {
    folderInput.addEventListener('change', (e) => handleFiles(e.target.files));
  }

  // Drag & drop
  if (dropzone) {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });
    dropzone.addEventListener('click', () => {
      if (fileInput) fileInput.click();
    });
  }

  // Submit
  const submitBtn = container.querySelector('#modalSubmitBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const titleInput = container.querySelector('#modalTitle');
      const title = titleInput ? titleInput.value.trim() : '';
      if (!title) {
        if (titleInput) titleInput.focus();
        if (window.showToast) window.showToast('Please provide a title', 'error');
        return;
      }

      const desc = container.querySelector('#modalDesc')?.value.trim() || '';
      const cat = container.querySelector('#modalCategory')?.value.trim() || 'General';
      const tagsStr = container.querySelector('#modalTags')?.value.trim() || '';
      const tags = tagsStr ? tagsStr.split(/[\s,]+/).filter(Boolean) : [];

      if (activeType === 'Task') {
        const dueDate = container.querySelector('#modalDueDate')?.value || getTodayString();
        const dueTime = container.querySelector('#modalDueTime')?.value || '';
        store.addTask({
          title,
          description: desc,
          dueDate,
          dueTime,
          priority: activePriority,
          category: cat,
          tags,
          attachments: currentAttachments
        });
        if (window.showToast) window.showToast(`Task "${title}" created!`);
      } else if (activeType === 'Note' || activeType === 'thought') {
        store.addNote({
          title,
          content: desc,
          type: activeType.toLowerCase(),
          category: cat,
          tags,
          attachments: currentAttachments
        });
        if (window.showToast) window.showToast(`${activeType} captured!`);
      } else if (activeType === 'Reminder') {
        const dueDate = container.querySelector('#modalDueDate')?.value || getTodayString();
        const dueTime = container.querySelector('#modalDueTime')?.value || '12:00';
        store.addReminder({
          title,
          dateTime: `${dueDate}T${dueTime}`,
          category: cat
        });
        if (window.showToast) window.showToast(`Reminder set for ${dueDate} at ${dueTime}!`);
      }

      window.closeAddModal();
    });
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
