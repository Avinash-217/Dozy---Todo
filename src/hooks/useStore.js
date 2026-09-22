import { useState, useEffect } from 'react';
import { store } from '../../js/store.js';

export function useStore() {
  const [state, setState] = useState(() => ({
    tasks: store.tasks,
    notes: store.notes,
    reminders: store.reminders,
    notifications: store.notifications
  }));

  useEffect(() => {
    const unsubscribe = store.subscribe((currentStore) => {
      setState({
        tasks: currentStore.tasks,
        notes: currentStore.notes,
        reminders: currentStore.reminders,
        notifications: currentStore.notifications
      });
    });
    return unsubscribe;
  }, []);

  return state;
}
