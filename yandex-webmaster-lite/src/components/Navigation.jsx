import React from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  LayoutDashboard,
  Search,
  FileText,
  Zap,
  Map,
  Bot,
  ShieldCheck,
  Wrench,
  Key,
} from 'lucide-react';

export default function Navigation() {
  const { currentTab, setCurrentTab } = useWebmaster();

  const navItems = [
    { id: 'dashboard', label: 'Сводка & Главная', icon: LayoutDashboard },
    { id: 'queries', label: 'Поисковые запросы', icon: Search },
    { id: 'indexing', label: 'Индексирование', icon: FileText },
    { id: 'reindex', label: '⚡ Переобход страниц', icon: Zap },
    { id: 'sitemap', label: 'Файлы Sitemap', icon: Map },
    { id: 'robots', label: 'Проверка robots.txt', icon: Bot },
    { id: 'diagnostics', label: 'Диагностика', icon: ShieldCheck },
    { id: 'tools', label: 'Инструменты SEO', icon: Wrench },
    { id: 'settings', label: '🔑 Яндекс ID & Токен', icon: Key },
  ];

  return (
    <nav className="bg-canvas-subtle border-b border-border sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-sm'
                    : 'text-muted hover:text-fg hover:bg-canvas border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
