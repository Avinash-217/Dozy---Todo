import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { store } from '../js/store.js';

// Expose store for debugging
window.store = store;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
