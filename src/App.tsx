import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SiswaPage } from '@/pages/SiswaPage';
import { AbsensiPage } from '@/pages/AbsensiPage';
import { NilaiPage } from '@/pages/NilaiPage';
import { TabunganPage } from '@/pages/TabunganPage';
import { BackupPage } from '@/pages/BackupPage';
import { useAppState } from '@/hooks/useAppState';
import type { MenuItem } from '@/types';
import './App.css';

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuItem>('siswa');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, setState } = useAppState();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeMenu) {
      case 'siswa':
        return <SiswaPage state={state} setState={setState} />;
      case 'absensi':
        return <AbsensiPage state={state} setState={setState} />;
      case 'nilai':
        return <NilaiPage state={state} setState={setState} />;
      case 'tabungan':
        return <TabunganPage state={state} setState={setState} />;
      case 'backup':
        return <BackupPage state={state} setState={setState} />;
      default:
        return <SiswaPage state={state} setState={setState} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
