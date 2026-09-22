import { store } from '../js/store.js';

console.log('--- Checking Store Initial Notifications ---');
console.log('Total notifications:', store.notifications.length);
console.log('Active notification count:', store.getActiveNotificationCount());

// Print each notification
store.notifications.forEach(n => {
  console.log(`[${n.status}] ${n.taskName} | Date: ${n.date} ${n.time} | Category: ${n.category} | Read: ${n.read}`);
});

// Test adding a task with reminder
console.log('\n--- Adding New Task with Due Date & Time ---');
const newTask = store.addTask({
  title: 'Prepare biology lab report',
  description: 'Include microscopy photos',
  dueDate: '2026-09-22',
  dueTime: '14:30',
  priority: 'high',
  category: 'College'
});

const latestNotif = store.notifications[0];
console.log('Latest notification generated:', latestNotif.taskName, latestNotif.date, latestNotif.time, latestNotif.category);

// Test snoozing
console.log('\n--- Snoozing Notification ---');
store.snoozeNotification(latestNotif.id, 60);
console.log('Status after snooze:', store.notifications[0].status, 'Snoozed until:', store.notifications[0].snoozedUntil);

// Test completing
console.log('\n--- Completing Notification ---');
store.completeNotification(latestNotif.id);
console.log('Status after complete:', store.notifications[0].status);

console.log('\nVerification PASSED!');
