import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, DollarSign, Users, LogOut, Menu, X, Home } from 'lucide-react';
import HolidaysManager from './HolidaysManager';
import PricingManager from './PricingManager';
import TeamManager from './TeamManager';

type Tab = 'holidays' | 'pricing' | 'team';

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('holidays');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();

  const tabs = [
    { id: 'holidays' as Tab, label: 'Dovolená', icon: Calendar },
    { id: 'pricing' as Tab, label: 'Ceník', icon: DollarSign },
    { id: 'team' as Tab, label: 'Tým', icon: Users },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className="text-xl font-bold text-dark">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-dark/60 hover:text-dark"
              title="Zpět na web"
            >
              <Home className="w-5 h-5" />
            </a>
            <button
              onClick={signOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-dark/60 hover:text-red-500"
              title="Odhlásit se"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } pt-16 lg:pt-0`}
        >
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold text-white shadow-lg shadow-gold/20'
                    : 'text-dark/70 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-6 min-h-[calc(100vh-57px)]">
          {activeTab === 'holidays' && <HolidaysManager />}
          {activeTab === 'pricing' && <PricingManager />}
          {activeTab === 'team' && <TeamManager />}
        </main>
      </div>
    </div>
  );
}
