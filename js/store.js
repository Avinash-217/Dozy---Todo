import { getTodayString, processCarryForward } from './carry-forward.js';

const STORAGE_KEYS = {
  TASKS: 'dozy_tasks_v1',
  NOTES: 'dozy_notes_v1',
  REMINDERS: 'dozy_reminders_v1',
  NOTIFICATIONS: 'dozy_notifications_v1',
  USER: 'dozy_user_v1'
};

const initialTasks = [
  {
    id: 't-1',
    title: 'Complete DBMS assignment',
    description: 'Finalize SQL schemas and normalization exercises for module 4.',
    dueDate: getTodayString(),
    dueTime: '09:00',
    priority: 'high',
    category: 'College',
    tags: ['#college', '#dbms'],
    completed: true,
    completedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    carriedForward: false,
    carryForwardCount: 0,
    carryForwardDates: [],
    starred: true,
    attachments: [
      { id: 'att-1', name: 'assignment_brief.pdf', size: 1250000, type: 'application/pdf' }
    ]
  },
  {
    id: 't-2',
    title: 'Study for MED 1',
    description: 'Review chapters 3 to 6 on clinical diagnostics and anatomy.',
    dueDate: getTodayString(),
    dueTime: '11:00',
    priority: 'high',
    category: 'Exam prep',
    tags: ['#college', '#exam'],
    completed: false,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    carriedForward: true,
    carryForwardCount: 1,
    originalDueDate: '2026-09-19',
    carryForwardDates: ['2026-09-19'],
    starred: false,
    attachments: []
  },
  {
    id: 't-3',
    title: 'Go to gym',
    description: 'Leg day and 20 min cardio interval.',
    dueDate: getTodayString(),
    dueTime: '18:00',
    priority: 'medium',
    category: 'Health',
    tags: ['#health', '#fitness'],
    completed: false,
    createdAt: new Date().toISOString(),
    carriedForward: false,
    carryForwardCount: 0,
    carryForwardDates: [],
    starred: false,
    attachments: []
  },
  {
    id: 't-4',
    title: 'Plan next week',
    description: 'Outline key milestones and coordinate team sprint backlog.',
    dueDate: getTodayString(),
    dueTime: '20:00',
    priority: 'low',
    category: 'Organization',
    tags: ['#planning', '#work'],
    completed: false,
    createdAt: new Date().toISOString(),
    carriedForward: false,
    carryForwardCount: 0,
    carryForwardDates: [],
    starred: true,
    attachments: []
  },
  {
    id: 't-5',
    title: 'Read a book',
    description: 'Read 2 chapters of "Deep Work" by Cal Newport.',
    dueDate: getTodayString(),
    dueTime: '22:00',
    priority: 'low',
    category: 'Personal',
    tags: ['#reading', '#mindset'],
    completed: true,
    completedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 18 * 3600000).toISOString(),
    carriedForward: false,
    carryForwardCount: 0,
    carryForwardDates: [],
    starred: false,
    attachments: []
  }
];

const initialNotes = [
  {
    id: 'n-1',
    type: 'note',
    title: 'Personal file workspace design',
    content: 'A lightweight modular dashboard connecting daily action items with local file/folder attachments for fast context switching.',
    category: 'Design & Code',
    tags: ['#app', '#productivity', '#notes'],
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    attachments: [
      { id: 'att-n1', name: 'architecture_sketch.png', size: 450000, type: 'image/png' }
    ]
  },
  {
    id: 'n-2',
    type: 'note',
    title: 'Things to buy for hostel room',
    content: 'Bedding set, adjustable study lamp, surge protector extension cord, water bottle, desk organizer.',
    category: 'Personal',
    tags: ['#shopping', '#room'],
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
    attachments: []
  },
  {
    id: 'n-3',
    type: 'thought',
    title: 'Thoughts on deliberate productivity',
    content: 'Small, consistent daily commitments always beat irregular bursts of frantic cramming. Rest is not the absence of work; it is the prerequisite.',
    category: 'Mindset',
    tags: ['#reflections', '#calm'],
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
    attachments: []
  }
];

const initialReminders = [
  {
    id: 'r-1',
    title: 'Buy laptop accessories',
    dateTime: `${getTodayString()}T16:00`,
    repeat: 'none',
    completed: false,
    category: 'Shopping'
  },
  {
    id: 'r-2',
    title: 'Call home',
    dateTime: `${getTodayString()}T20:00`,
    repeat: 'daily',
    completed: false,
    category: 'Family'
  },
  {
    id: 'r-3',
    title: 'Renew domain registration',
    dateTime: `${getTodayString()}T10:00`,
    repeat: 'none',
    completed: false,
    category: 'Urgent'
  }
];

const initialNotifications = [
  {
    id: 'notif-1',
    reminderId: 'r-3',
    taskName: 'Renew domain registration',
    title: 'Renew domain registration',
    date: getTodayString(),
    time: '10:00',
    category: 'Urgent',
    status: 'active',
    read: false,
    timestamp: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 'notif-2',
    taskId: 't-2',
    taskName: 'Study for MED 1',
    title: 'Study for MED 1 (Carried Forward)',
    date: getTodayString(),
    time: '11:00',
    category: 'Exam prep',
    status: 'active',
    read: false,
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'notif-3',
    reminderId: 'r-1',
    taskName: 'Buy laptop accessories',
    title: 'Buy laptop accessories',
    date: getTodayString(),
    time: '16:00',
    category: 'Shopping',
    status: 'active',
    read: false,
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'notif-4',
    reminderId: 'r-2',
    taskName: 'Call home',
    title: 'Call home (Daily reminder)',
    date: getTodayString(),
    time: '20:00',
    category: 'Family',
    status: 'active',
    read: true,
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
  },
  {
    id: 'notif-5',
    taskId: 't-1',
    taskName: 'Complete DBMS assignment',
    title: 'Complete DBMS assignment',
    date: getTodayString(),
    time: '09:00',
    category: 'College',
    status: 'completed',
    read: true,
    timestamp: new Date(Date.now() - 10 * 3600000).toISOString()
  }
];

class Store {
  constructor() {
    this.listeners = [];
    this.loadState();
    this.runCarryForward();
  }

  loadState() {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      this.tasks = savedTasks ? JSON.parse(savedTasks) : initialTasks;

      const savedNotes = localStorage.getItem(STORAGE_KEYS.NOTES);
      this.notes = savedNotes ? JSON.parse(savedNotes) : initialNotes;

      const savedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      this.reminders = savedReminders ? JSON.parse(savedReminders) : initialReminders;

      const savedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      this.notifications = savedNotifs ? JSON.parse(savedNotifs) : initialNotifications;
    } catch (e) {
      console.warn('Failed to load from storage, using initial state:', e);
      this.tasks = [...initialTasks];
      this.notes = [...initialNotes];
      this.reminders = [...initialReminders];
      this.notifications = [...initialNotifications];
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(this.reminders));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
    } catch (e) {
      console.error('Storage save failed:', e);
    }
    this.notify();
  }

  subscribe(fn) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  runCarryForward() {
    const result = processCarryForward(this.tasks);
    if (result.modified) {
      this.tasks = result.tasks;
      this.save();
    }
    return result.carriedCount;
  }

  // --- Task Methods ---
  addTask(taskData) {
    const newTask = {
      id: 't-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: taskData.title.trim(),
      description: taskData.description || '',
      dueDate: taskData.dueDate || getTodayString(),
      dueTime: taskData.dueTime || '',
      priority: taskData.priority || 'low',
      category: taskData.category || 'General',
      tags: taskData.tags || [],
      completed: false,
      createdAt: new Date().toISOString(),
      carriedForward: false,
      carryForwardCount: 0,
      carryForwardDates: [],
      starred: !!taskData.starred,
      attachments: taskData.attachments || []
    };
    this.tasks.unshift(newTask);
    if (newTask.dueTime || newTask.priority === 'high' || newTask.dueDate) {
      this.addNotification({
        taskId: newTask.id,
        taskName: newTask.title,
        title: newTask.title,
        date: newTask.dueDate,
        time: newTask.dueTime || '10:00',
        category: newTask.category || 'Task',
        status: 'active'
      });
    }
    this.save();
    return newTask;
  }

  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      if (task.completed) {
        // Mark related notification as completed
        const notif = this.notifications?.find(n => n.taskId === task.id);
        if (notif) notif.status = 'completed';
      }
      this.save();
    }
  }

  toggleStarred(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.starred = !task.starred;
      this.save();
    }
  }

  updateTask(id, updates) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = { ...this.tasks[index], ...updates };
      this.save();
    }
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    if (this.notifications) {
      this.notifications = this.notifications.filter(n => n.taskId !== id);
    }
    this.save();
  }

  // --- Note / Idea / Thought Methods ---
  addNote(noteData) {
    const newNote = {
      id: 'n-' + Date.now(),
      type: noteData.type || 'note',
      title: noteData.title.trim(),
      content: noteData.content || '',
      category: noteData.category || 'General',
      tags: noteData.tags || [],
      createdAt: new Date().toISOString(),
      attachments: noteData.attachments || []
    };
    this.notes.unshift(newNote);
    this.save();
    return newNote;
  }

  deleteNote(id) {
    this.notes = this.notes.filter(n => n.id !== id);
    this.save();
  }

  // --- Reminder Methods ---
  addReminder(remData) {
    const newRem = {
      id: 'r-' + Date.now(),
      title: remData.title.trim(),
      dateTime: remData.dateTime || `${getTodayString()}T09:00`,
      repeat: remData.repeat || 'none',
      completed: false,
      category: remData.category || 'General'
    };
    this.reminders.unshift(newRem);

    const [remDate, remTime] = (newRem.dateTime || '').split('T');
    this.addNotification({
      reminderId: newRem.id,
      taskName: newRem.title,
      title: newRem.title,
      date: remDate || getTodayString(),
      time: remTime || '09:00',
      category: newRem.category || 'Reminder',
      status: 'active'
    });

    this.save();
    return newRem;
  }

  toggleReminder(id) {
    const r = this.reminders.find(rem => rem.id === id);
    if (r) {
      r.completed = !r.completed;
      this.save();
    }
  }

  deleteReminder(id) {
    this.reminders = this.reminders.filter(r => r.id !== id);
    this.save();
  }

  // --- Reminder Notification Tracking ---
  addNotification(notifData) {
    const newNotif = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: notifData.title || notifData.taskName,
      taskName: notifData.taskName || notifData.title,
      taskId: notifData.taskId || null,
      reminderId: notifData.reminderId || null,
      date: notifData.date || getTodayString(),
      time: notifData.time || '10:00',
      category: notifData.category || 'Reminder',
      status: notifData.status || 'active',
      read: false,
      timestamp: new Date().toISOString(),
      snoozedUntil: notifData.snoozedUntil || null
    };
    if (!this.notifications) this.notifications = [];
    this.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
    }
  }

  markAllNotificationsRead() {
    if (this.notifications) {
      this.notifications.forEach(n => n.read = true);
      this.save();
    }
  }

  snoozeNotification(id, minutes = 60) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.status = 'snoozed';
      notif.read = true;
      const snoozeTime = new Date(Date.now() + minutes * 60000);
      const h = String(snoozeTime.getHours()).padStart(2, '0');
      const m = String(snoozeTime.getMinutes()).padStart(2, '0');
      notif.snoozedUntil = `${h}:${m}`;
      this.save();
    }
  }

  completeNotification(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) {
      notif.status = 'completed';
      notif.read = true;
      // If linked to task, toggle complete
      if (notif.taskId) {
        const t = this.tasks.find(task => task.id === notif.taskId);
        if (t && !t.completed) {
          t.completed = true;
          t.completedAt = new Date().toISOString();
        }
      }
      // If linked to reminder, mark completed
      if (notif.reminderId) {
        const r = this.reminders.find(rem => rem.id === notif.reminderId);
        if (r) r.completed = true;
      }
      this.save();
    }
  }

  dismissNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.save();
  }

  clearAllNotifications() {
    this.notifications = [];
    this.save();
  }

  getActiveNotificationCount() {
    return (this.notifications || []).filter(n => !n.read && (n.status === 'active' || n.status === 'snoozed')).length;
  }

  // --- Aggregates & Queries ---
  getTodayTasks() {
    const today = getTodayString();
    return this.tasks.filter(t => t.dueDate === today);
  }

  getOverdueTasks() {
    const today = getTodayString();
    return this.tasks.filter(t => !t.completed && t.dueDate < today);
  }

  getCompletedHistory() {
    return this.tasks.filter(t => t.completed).sort((a, b) => {
      return new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt);
    });
  }

  getCarriedForwardTasks() {
    return this.tasks.filter(t => t.carriedForward);
  }

  getMonthlyStats(year, month) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month !== undefined ? month : new Date().getMonth(); // 0-indexed

    const monthTasks = this.tasks.filter(t => {
      const d = new Date(t.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const totalCreated = monthTasks.length;
    const completed = monthTasks.filter(t => t.completed).length;
    const incomplete = totalCreated - completed;
    const carriedOver = monthTasks.filter(t => t.carriedForward).length;
    const completionRate = totalCreated > 0 ? Math.round((completed / totalCreated) * 100) : 0;

    // Weekly distribution
    const weeks = [0, 0, 0, 0];
    monthTasks.filter(t => t.completed).forEach(t => {
      const day = new Date(t.completedAt || t.createdAt).getDate();
      const weekIndex = Math.min(3, Math.floor((day - 1) / 7));
      weeks[weekIndex]++;
    });

    return {
      year: currentYear,
      month: currentMonth,
      totalCreated,
      completed,
      incomplete,
      carriedOver,
      completionRate,
      weeklyCompleted: weeks
    };
  }
}

export const store = new Store();
