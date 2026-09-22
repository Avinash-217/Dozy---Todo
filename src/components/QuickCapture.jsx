import React, { useState, useRef, useEffect } from 'react';
import { store } from '../../js/store';
import { getTodayString, getTomorrowString, getNextWeekString, formatFileSize } from '../utils/date';

export default function QuickCapture() {
  const [activeMode, setActiveMode] = useState('Task');
  const [inputValue, setInputValue] = useState('');
  
  // State for popovers
  const [activePopover, setActivePopover] = useState(null); // 'date', 'priority', 'tags', 'attach'
  
  // Quick Capture State
  const [dueDate, setDueDate] = useState(getTodayString());
  const [priority, setPriority] = useState('low');
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [customTagInput, setCustomTagInput] = useState('');

  const popoverRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePopover = (popover, e) => {
    e.stopPropagation();
    setActivePopover(activePopover === popover ? null : popover);
  };

  const handleAddCustomTag = () => {
    let val = customTagInput.trim();
    if (!val) return;
    if (!val.startsWith('#')) val = '#' + val;
    val = val.replace(/\s+/g, '-');
    if (!tags.includes(val)) {
      setTags([...tags, val]);
    }
    setCustomTagInput('');
  };

  const handleFilesSelected = (files) => {
    if (!files) return;
    const newAttachments = [];
    for (const file of files) {
      if (!attachments.some(a => a.name === file.name && a.size === file.size)) {
        newAttachments.push({
          id: 'att-qc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream'
        });
      }
    }
    if (newAttachments.length > 0) {
      setAttachments([...attachments, ...newAttachments]);
    }
  };

  const submitQuickCapture = () => {
    const value = inputValue.trim();
    if (!value) return;

    const primaryCat = tags[0] ? tags[0].replace(/^#/, '') : 'Inbox';

    if (activeMode === 'Task') {
      store.addTask({
        title: value,
        dueDate: dueDate || getTodayString(),
        priority: priority || 'low',
        category: primaryCat,
        tags: [...tags],
        attachments: [...attachments]
      });
      if (window.showToast) window.showToast(`Task added: "${value}"`);
    } else if (activeMode === 'Note') {
      store.addNote({
        title: value,
        type: 'note',
        content: '',
        category: primaryCat,
        tags: [...tags],
        attachments: [...attachments]
      });
      if (window.showToast) window.showToast(`Note captured: "${value}"`);
    } else if (activeMode === 'Reminder') {
      store.addReminder({
        title: value,
        dateTime: `${dueDate || getTodayString()}T12:00`,
        category: primaryCat
      });
      if (window.showToast) window.showToast(`Reminder created: "${value}"`);
    }

    setInputValue('');
    setDueDate(getTodayString());
    setPriority('low');
    setTags([]);
    setAttachments([]);
    setActivePopover(null);
  };

  return (
    <div className="quick-capture-card" ref={popoverRef}>
      <div className="card-header" style={{ marginBottom: 'var(--space-xs)' }}>
        <div className="card-title-group">
          <div className="card-icon-badge">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit_note</span>
          </div>
          <span className="font-headline-sm" style={{ fontWeight: 700 }}>Quick Capture</span>
        </div>
        <span className="font-label-sm" style={{ color: 'var(--outline)' }}>Press Enter to add</span>
      </div>

      <div className="capture-tabs">
        {['Task', 'Note', 'Reminder'].map(mode => (
          <button 
            key={mode}
            className={`capture-tab-btn ${activeMode === mode ? 'active' : ''}`} 
            onClick={() => setActiveMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="capture-input-box">
        <input 
          type="text" 
          className="capture-input" 
          placeholder={`What ${activeMode.toLowerCase()} do you want to capture?`} 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitQuickCapture()}
        />
        <button className="capture-add-btn" onClick={submitQuickCapture}>
          <span>Add</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span>
        </button>
      </div>

      <div className="capture-options" id="quickCaptureOptions">
        {/* Due Date */}
        <div className="option-pill-wrapper">
          <button type="button" className={`option-pill ${dueDate !== getTodayString() ? 'active' : ''}`} onClick={(e) => togglePopover('date', e)}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_today</span>
            <span>{dueDate === getTodayString() ? 'Today' : new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </button>
          {activePopover === 'date' && (
            <div className="qc-popover active drop-down">
              <button type="button" className="qc-popover-item" onClick={() => { setDueDate(getTodayString()); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>today</span>
                <span>Today</span>
              </button>
              <button type="button" className="qc-popover-item" onClick={() => { setDueDate(getTomorrowString()); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>wb_twilight</span>
                <span>Tomorrow</span>
              </button>
              <button type="button" className="qc-popover-item" onClick={() => { setDueDate(getNextWeekString()); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#6366f1' }}>date_range</span>
                <span>In a week</span>
              </button>
              <div className="qc-popover-divider"></div>
              <div className="qc-custom-date-row" title="Pick custom date">
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--outline)' }}>calendar_month</span>
                <input type="date" value={dueDate} onChange={(e) => { setDueDate(e.target.value); setActivePopover(null); }} />
              </div>
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="option-pill-wrapper">
          <button type="button" className={`option-pill ${priority !== 'low' ? `priority-${priority} active` : ''}`} onClick={(e) => togglePopover('priority', e)}>
            <span className={`material-symbols-outlined ${priority === 'high' ? 'filled' : ''}`} style={{ fontSize: '14px' }}>flag</span>
            <span>{priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Priority'}</span>
          </button>
          {activePopover === 'priority' && (
            <div className="qc-popover active drop-down">
              <button type="button" className="qc-popover-item" onClick={() => { setPriority('low'); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--outline)' }}>flag</span>
                <span>Low / Normal</span>
              </button>
              <button type="button" className="qc-popover-item" onClick={() => { setPriority('medium'); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#f59e0b' }}>flag</span>
                <span style={{ color: '#b45309', fontWeight: 500 }}>Medium</span>
              </button>
              <button type="button" className="qc-popover-item" onClick={() => { setPriority('high'); setActivePopover(null); }}>
                <span className="material-symbols-outlined filled" style={{ fontSize: '16px', color: '#ef4444' }}>flag</span>
                <span style={{ color: '#ef4444', fontWeight: 600 }}>High Priority</span>
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="option-pill-wrapper">
          <button type="button" className={`option-pill ${tags.length > 0 ? 'active' : ''}`} onClick={(e) => togglePopover('tags', e)}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sell</span>
            <span>{tags.length === 0 ? 'Tags' : tags.length === 1 ? tags[0] : `${tags.length} Tags`}</span>
          </button>
          {activePopover === 'tags' && (
            <div className="qc-popover qc-tags-popover active drop-down">
              <div className="qc-tags-header">Select or Add Tags</div>
              <div className="qc-tags-presets">
                {['#work', '#personal', '#college', '#health', '#study', '#finance'].map(tag => (
                  <button 
                    key={tag}
                    type="button" 
                    className={`qc-tag-btn ${tags.includes(tag) ? 'active' : ''}`} 
                    onClick={() => setTags(tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag])}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="qc-tag-input-row">
                <input 
                  type="text" 
                  placeholder="Add #custom..." 
                  maxLength="25" 
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                />
                <button type="button" className="qc-tag-add-btn" onClick={handleAddCustomTag}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Attachments */}
        <div className="option-pill-wrapper">
          <button type="button" className={`option-pill ${attachments.length > 0 ? 'active' : ''}`} onClick={(e) => togglePopover('attach', e)}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>attach_file</span>
            <span>{attachments.length > 0 ? `Attach (${attachments.length})` : 'Attach'}</span>
          </button>
          {activePopover === 'attach' && (
            <div className="qc-popover active drop-down">
              <button type="button" className="qc-popover-item" onClick={() => { fileInputRef.current?.click(); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--primary)' }}>upload_file</span>
                <span>Upload Files...</span>
              </button>
              <button type="button" className="qc-popover-item" onClick={() => { folderInputRef.current?.click(); setActivePopover(null); }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--secondary)' }}>folder_open</span>
                <span>Upload Folder...</span>
              </button>
            </div>
          )}
          <input type="file" multiple style={{ display: 'none' }} ref={fileInputRef} onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ''; }} />
          <input type="file" webkitdirectory="" directory="" style={{ display: 'none' }} ref={folderInputRef} onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ''; }} />
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="qc-chips-row" style={{ display: 'flex' }}>
          {attachments.map((file, idx) => (
            <div key={file.id} className="qc-attachment-chip">
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'var(--primary)' }}>
                {file.type && file.type.startsWith('image/') ? 'image' : 'description'}
              </span>
              <span className="chip-name" title={file.name}>{file.name}</span>
              <span className="chip-size" style={{ opacity: 0.65, fontSize: '10px' }}>({formatFileSize(file.size)})</span>
              <button type="button" className="chip-remove" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}>
                <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
