import {
  Users,
  ClipboardCheck,
  BookOpen,
  Wallet,
  Database,
  GraduationCap,
  X,
} from 'lucide-react';
import type { MenuItem } from '@/types';

interface SidebarProps {
  activeMenu: MenuItem;
  onMenuChange: (menu: MenuItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { id: MenuItem; label: string; icon: React.ElementType }[] = [
  { id: 'siswa', label: 'Daftar Siswa', icon: Users },
  { id: 'absensi', label: 'Absensi', icon: ClipboardCheck },
  { id: 'nilai', label: 'Nilai', icon: BookOpen },
  { id: 'tabungan', label: 'Tabungan', icon: Wallet },
  { id: 'backup', label: 'Backup Data', icon: Database },
];

export function Sidebar({ activeMenu, onMenuChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200">
        <SidebarContent activeMenu={activeMenu} onMenuChange={onMenuChange} />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-col bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-lg font-bold text-gray-800">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent activeMenu={activeMenu} onMenuChange={(menu) => { onMenuChange(menu); onClose(); }} />
      </aside>
    </>
  );
}

function SidebarContent({
  activeMenu,
  onMenuChange,
}: {
  activeMenu: MenuItem;
  onMenuChange: (menu: MenuItem) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">SMK Yanindo</h1>
            <p className="text-xs text-gray-500">Sistem Manajemen</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onMenuChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm font-medium">SMK Yanindo</p>
          <p className="text-xs opacity-80 mt-1">Sistem Terintegrasi</p>
        </div>
      </div>
    </div>
  );
}
