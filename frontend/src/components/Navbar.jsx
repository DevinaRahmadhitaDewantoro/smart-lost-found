import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Pastikan props currentView dan setCurrentView ditangkap di sini
function Navbar({ userId, currentView, setCurrentView }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const unreadCount = notifications.filter(n => n.is_read === 0).length;

  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('dashboard')}
          className="text-xl font-bold tracking-wider cursor-pointer flex items-center gap-2"
        >
          🔍 <span>Smart Lost & Found</span>
        </div>

        {/* Menu Navigasi */}
        <div className="flex items-center gap-6 font-medium">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`transition-colors cursor-pointer py-1 ${
              currentView === 'dashboard' ? 'text-white border-b-2 border-white font-bold' : 'text-indigo-100 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          
          <button 
            onClick={() => setCurrentView('report')}
            className={`transition-colors cursor-pointer py-1 ${
              currentView === 'report' ? 'text-white border-b-2 border-white font-bold' : 'text-indigo-100 hover:text-white'
            }`}
          >
            Report Item
          </button>
          
          <button 
            onClick={() => setCurrentView('admin')}
            className={`transition-colors text-yellow-300 hover:text-yellow-200 cursor-pointer py-1 ${
              currentView === 'admin' ? 'border-b-2 border-yellow-300 font-bold' : ''
            }`}
          >
            Admin Panel
          </button>

          {/* Garis Pembatas Vertikal Mini */}
          <div className="h-5 w-px bg-indigo-400/50"></div>

          {/* Tombol Lonceng Notifikasi */}
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 rounded-full hover:bg-indigo-700 transition-colors focus:outline-none cursor-pointer"
            >
              <span className="text-xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-xs w-4 h-4 rounded-full flex items-center justify-center text-white font-bold animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu List Notifikasi */}
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-bold flex justify-between items-center">
                  <span className="text-sm text-gray-700">Notifications</span>
                  <span 
                    className="text-xs text-indigo-600 font-normal cursor-pointer hover:underline" 
                    onClick={fetchNotifications}
                  >
                    Refresh
                  </span>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      No new alerts
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`px-4 py-3 text-sm border-b border-gray-50 hover:bg-slate-50 transition-colors ${
                          notif.is_read === 0 ? 'bg-indigo-50/40 font-medium' : ''
                        }`}
                      >
                        <p className="text-gray-700 leading-snug">{notif.message}</p>
                        <span className="text-xs text-gray-400 block mt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;