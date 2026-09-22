import React, { useState, useEffect, useRef } from 'react';
import { store } from '../../js/store';
import { getTodayString, formatFileSize } from '../utils/date';

export default function Modal({ isOpen, onClose, type = 'Task', editItem = null }) {
  const [activeType, setActiveType] = useState(type);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(getTodayString());
  const [dueTime, setDueTime] = useState('10:00');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [attachments, setAttachments] = useState([]);
  
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setActiveType(type || 'Task');
      setTitle(editItem?.title || '');
      setDescription(editItem?.description || editItem?.desc || editItem?.content || '');
      setDueDate(editItem?.dueDate || getTodayString());
      setDueTime(editItem?.dueTime || '10:00');
      setPriority(editItem?.priority || 'low');
      setCategory(editItem?.category || '');
      setTags(editItem?.tags ? editItem.tags.join(' ') : '');
      setAttachments(editItem?.attachments ? [...editItem.attachments] : []);
    }
  }, [isOpen, type, editItem]);

  if (!isOpen) return null;

  const handleFiles = (files) => {
    if (!files) return;
    const newAttachments = [];
    for (const f of files) {
      if (!attachments.some(a => a.name === f.name && a.size === f.size)) {
        newAttachments.push({
          id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: f.name,
          size: f.size,
          type: f.type || 'application/octet-stream',
          isFolder: !!f.webkitRelativePath
        });
      }
    }
    setAttachments([...attachments, ...newAttachments]);
  };

  const removeAttachment = (idx) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const appendTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags(tags ? `${tags} ${tag}` : tag);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      if (window.showToast) window.showToast('Please provide a title', 'error');
      return;
    }

    const cat = category.trim() || 'General';
    const tagsArray = tags.trim() ? tags.trim().split(/[\s,]+/).filter(Boolean) : [];

    if (activeType === 'Task') {
      store.addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate,
        dueTime,
        priority,
        category: cat,
        tags: tagsArray,
        attachments
      });
      if (window.showToast) window.showToast(`Task "${title.trim()}" created!`);
    } else if (activeType === 'Note' || activeType === 'Thought') {
      store.addNote({
        title: title.trim(),
        content: description.trim(),
        type: activeType.toLowerCase(),
        category: cat,
        tags: tagsArray,
        attachments
      });
      if (window.showToast) window.showToast(`${activeType} captured!`);
    } else if (activeType === 'Reminder') {
      store.addReminder({
        title: title.trim(),
        dateTime: `${dueDate}T${dueTime}`,
        category: cat
      });
      if (window.showToast) window.showToast(`Reminder set for ${dueDate} at ${dueTime}!`);
    }

    onClose();
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal-sheet">
        <div className="modal-sheet-grabber"></div>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>add_circle</span>
            <h2 className="font-headline-sm" style={{ fontSize: '18px' }}>Create New {activeType}</h2>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Type Selector Pills */}
        <div className="capture-tabs" style={{ width: '100%', display: 'flex', alignItems: 'center', minHeight: '40px', boxSizing: 'border-box', marginBottom: '8px', padding: '4px', background: 'var(--surface-low)', borderRadius: 'var(--radius-full)' }}>
          {['Task', 'Note', 'Reminder'].map(t => (
            <button key={t} type="button" className={`capture-tab-btn ${activeType === t ? 'active' : ''}`} onClick={() => setActiveType(t)} style={{ flex: 1, textAlign: 'center' }}>{t}</button>
          ))}
        </div>

        {/* Title Field */}
        <div className="form-group">
          <label className="form-label">Title <span style={{ color: 'var(--error)' }}>*</span></label>
          <input type="text" className="form-control" placeholder="e.g. Finish client proposal..." value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label className="form-label">Description &amp; Context</label>
          <textarea className="form-control" rows="3" style={{ resize: 'none' }} placeholder="Add mindful notes, links, or next steps..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
        </div>

        {(activeType === 'Task' || activeType === 'Reminder') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" className="form-control" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input type="time" className="form-control" value={dueTime} onChange={(e) => setDueTime(e.target.value)} />
            </div>
          </div>
        )}

        {activeType === 'Task' && (
          <div className="form-group">
            <label className="form-label">Priority</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button type="button" className={`option-pill ${priority === 'low' ? 'active' : ''}`} onClick={() => setPriority('low')} style={{ justifyContent: 'center', padding: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>eco</span>
                <span>Low</span>
              </button>
              <button type="button" className={`option-pill ${priority === 'medium' ? 'active' : ''}`} onClick={() => setPriority('medium')} style={{ justifyContent: 'center', padding: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--amber)' }}>flag</span>
                <span>Medium</span>
              </button>
              <button type="button" className={`option-pill ${priority === 'high' ? 'active' : ''}`} onClick={() => setPriority('high')} style={{ justifyContent: 'center', padding: '8px', background: priority === 'high' ? 'var(--error-container)' : '', color: priority === 'high' ? 'var(--error)' : '' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--error)' }}>priority_high</span>
                <span>High</span>
              </button>
            </div>
          </div>
        )}

        {/* Category & Tags */}
        <div className="form-group">
          <label className="form-label">Category &amp; Tags</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Category (e.g. Work, Health)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <input type="text" className="form-control" style={{ flex: 1 }} placeholder="Tags (e.g. #dbms, #study)" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {['#college', '#dbms', '#health', '#personal', '#reading'].map(tag => (
              <button key={tag} type="button" className="option-pill" onClick={() => appendTag(tag)} style={{ fontSize: '11px' }}>{tag}</button>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="form-group">
          <label className="form-label">Attachments &amp; Folders</label>
          <div 
            className="dropzone" 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('dragover');
              handleFiles(e.dataTransfer.files);
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary)' }}>cloud_upload</span>
            <p className="font-label-sm" style={{ color: 'var(--on-surface)', marginTop: '4px' }}>Click to upload files, or drag &amp; drop</p>
            <p className="font-body-sm" style={{ color: 'var(--outline)', fontSize: '11px' }}>PDF, Images, Docs up to 25MB • Folder selection supported</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
              <button type="button" className="option-pill" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} style={{ fontSize: '11px' }}>Select Files</button>
              <button type="button" className="option-pill" onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }} style={{ fontSize: '11px' }}>Select Folder</button>
            </div>
            <input type="file" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
            <input type="file" webkitdirectory="" directory="" style={{ display: 'none' }} ref={folderInputRef} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
          </div>

          <div className="attachments-preview">
            {attachments.map((att, idx) => (
              <div key={att.id || idx} className="attachment-chip">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>{att.isFolder ? 'folder' : 'attach_file'}</span>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{att.name}</span>
                  <span style={{ color: 'var(--outline)', fontSize: '10px' }}>({formatFileSize(att.size || 0)})</span>
                </div>
                <button type="button" className="icon-btn" onClick={() => removeAttachment(idx)} style={{ width: '24px', height: '24px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--error)' }}>close</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', borderTop: '1px solid var(--surface-low)', paddingTop: 'var(--space-md)' }}>
          <button type="button" className="option-pill" onClick={onClose} style={{ padding: '8px 18px', fontWeight: 600 }}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleSubmit} style={{ padding: '8px 24px' }}>Create {activeType}</button>
        </div>
      </div>
    </div>
  );
}
