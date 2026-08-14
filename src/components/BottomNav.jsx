import React from 'react';
import { Home, PlusCircle, Users, ClipboardList, BookOpen, User } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onStartNewQuote }) {
  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'new_quote', label: 'Yeni Teklif', icon: PlusCircle, action: onStartNewQuote },
    { id: 'customers', label: 'Müşteriler', icon: Users },
    { id: 'notes', label: 'Notlar', icon: ClipboardList },
    { id: 'catalog', label: 'Katalog', icon: BookOpen },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 bottom-nav-shadow z-40 px-3 py-2 no-print">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'new_quote' && activeTab.startsWith('wizard_'));
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center w-16 py-1 active-tap ${
                isActive ? 'text-[#ff6b00]' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.3 : 1.8} className="mb-0.5" />
              <span className={`text-[11px] ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
