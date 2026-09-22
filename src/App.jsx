import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MobileNav from './components/MobileNav';
import ToastContainer from './components/ToastContainer';
import Modal from './components/Modal';

// Views
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import History from './components/History';
import Notes from './components/Notes';
import Analytics from './components/Analytics';

import { useStore } from './hooks/useStore';
import { store } from '../js/store';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('Task'); // 'Task', 'Note', etc.
  const [editItem, setEditItem] = useState(null);
  const [toasts, setToasts] = useState([]);
  
  const state = useStore();

  // Global toast function that we attach to window for compatibility with existing code during transition
  useEffect(() => {
    window.showToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3200);
    };
    
    // Check carry forward on mount
    const carriedCount = store.runCarryForward();
    if (carriedCount > 0) {
      setTimeout(() => {
        window.showToast(`✨ Mindful Rollover: ${carriedCount} unfinished task(s) carried forward to today!`);
      }, 800);
    }
  }, []);

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenModal = (type = 'Task', item = null) => {
    setModalType(type);
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditItem(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} onOpenModal={handleOpenModal} />;
      case 'calendar': return <Calendar onNavigate={handleNavigate} onOpenModal={handleOpenModal} />;
      case 'history': return <History onNavigate={handleNavigate} onOpenModal={handleOpenModal} />;
      case 'notes': return <Notes onNavigate={handleNavigate} onOpenModal={handleOpenModal} />;
      case 'analytics': return <Analytics onNavigate={handleNavigate} />;
      default: return <Dashboard onNavigate={handleNavigate} onOpenModal={handleOpenModal} />;
    }
  };

  return (
    <>
      <div className="app-container">
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
        
        <div className="main-wrapper">
          <Header 
            onNavigate={handleNavigate} 
            onOpenModal={handleOpenModal} 
          />
          
          <main className="page-container" id="mainContentArea">
            {renderView()}
          </main>
        </div>

        <MobileNav 
          currentView={currentView} 
          onNavigate={handleNavigate}
          onOpenModal={handleOpenModal}
        />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        type={modalType}
        editItem={editItem}
      />
      
      <ToastContainer toasts={toasts} />
    </>
  );
}
