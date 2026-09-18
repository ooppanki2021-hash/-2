import React from 'react';
import { WebmasterProvider, useWebmaster } from './context/WebmasterContext';
import Header from './components/Header';
import Navigation from './components/Navigation';
import DashboardView from './components/DashboardView';
import QueriesView from './components/QueriesView';
import IndexingView from './components/IndexingView';
import ReindexView from './components/ReindexView';
import SitemapsView from './components/SitemapsView';
import RobotsView from './components/RobotsView';
import DiagnosticsView from './components/DiagnosticsView';
import ToolsView from './components/ToolsView';
import SettingsView from './components/SettingsView';
import Modals from './components/Modals';

function AppContent() {
  const { currentTab, activeSite } = useWebmaster();

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'queries':
        return <QueriesView />;
      case 'indexing':
        return <IndexingView />;
      case 'reindex':
        return <ReindexView />;
      case 'sitemap':
        return <SitemapsView />;
      case 'robots':
        return <RobotsView />;
      case 'diagnostics':
        return <DiagnosticsView />;
      case 'tools':
        return <ToolsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg">
      {/* Sticky Header */}
      <Header />

      {/* Tabs Bar */}
      <Navigation />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-canvas-subtle py-6 text-xs text-muted mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-bold text-fg">Яндекс Вебмастер Lite</span>
            <span>— Мониторинг сайта, ИКС, переобход и поисковая оптимизация</span>
          </div>
          <div className="text-[11px] text-muted">
            Поисковый робот Яндекса (YandexBot) • API v4 Ready
          </div>
        </div>
      </footer>

      {/* Modals & Notifications */}
      <Modals />
    </div>
  );
}

export default function App() {
  return (
    <WebmasterProvider>
      <AppContent />
    </WebmasterProvider>
  );
}
