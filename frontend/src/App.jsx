import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ReportItem from './pages/ReportItem';
import AdminPanel from './pages/AdminPanel'; // Impor halaman admin baru

function App() {
  const currentUserId = 1; 
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-gray-800">
      {/* Navbar mengontrol perpindahan view halaman */}
      <Navbar 
        userId={currentUserId} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
      
      {/* Area Render Kondisional Konten Utama Halaman */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && <Dashboard />}
        {currentView === 'report' && <ReportItem />}
        {currentView === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default App;