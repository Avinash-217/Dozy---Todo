/**
 * Automatic Task Carry-Forward Engine for Dozy
 * Automatically rolls over unfinished tasks past their due date to today.
 */

export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function processCarryForward(tasks) {
  const today = getTodayString();
  let carriedCount = 0;
  let modified = false;

  const updatedTasks = tasks.map(task => {
    // If task is incomplete and its due date is earlier than today
    if (!task.completed && task.dueDate && task.dueDate < today) {
      carriedCount++;
      modified = true;

      const previousDates = Array.isArray(task.carryForwardDates) ? [...task.carryForwardDates] : [];
      if (!previousDates.includes(task.dueDate)) {
        previousDates.push(task.dueDate);
      }

      return {
        ...task,
        carriedForward: true,
        carryForwardCount: (task.carryForwardCount || 0) + 1,
        carryForwardDates: previousDates,
        originalDueDate: task.originalDueDate || task.dueDate,
        dueDate: today, // Move to today's active list
        lastCarriedAt: new Date().toISOString()
      };
    }
    return task;
  });

  return {
    tasks: updatedTasks,
    carriedCount,
    modified
  };
}
