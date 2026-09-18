import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import TrendingView from './components/TrendingView';
import SearchView from './components/SearchView';
import RepoDetailView from './components/RepoDetailView';
import UserProfileView from './components/UserProfileView';
import BookmarksView from './components/BookmarksView';
import CompareView from './components/CompareView';
import SettingsModal from './components/SettingsModal';
import LoginModal from './components/LoginModal';
import QuickReadmeModal from './components/QuickReadmeModal';
import IssueDetailModal from './components/IssueDetailModal';
import RepoWebsiteModal from './components/RepoWebsiteModal';
import Toast from './components/Toast';
import { GithubIcon } from './components/Icons';

function AppContent() {
  const { currentView, language, navigateTo } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'trending':
        return <TrendingView />;
      case 'search':
        return <SearchView />;
      case 'repo':
        return <RepoDetailView />;
      case 'user':
        return <UserProfileView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'compare':
        return <CompareView />;
      default:
        return <TrendingView />;
    }
  };

  const t = {
    ru: {
      footerTitle: 'GitHub Lite',
      footerDesc: 'Легковесный клиент для поиска, изучения открытых проектов и чтения документации без лишней сложности git-процессов.',
      navTrending: 'В тренде',
      navSearch: 'Поиск проектов',
      navSaved: 'Мои закладки',
      navCompare: 'Сравнение',
      note: 'Работает на базе официального GitHub REST API',
    },
    en: {
      footerTitle: 'GitHub Lite',
      footerDesc: 'Lightweight client for discovering open-source projects, reading documentation, and saving favorites without complex git workflows.',
      navTrending: 'Trending',
      navSearch: 'Search Projects',
      navSaved: 'Saved Bookmarks',
      navCompare: 'Comparison',
      note: 'Powered by official GitHub REST API',
    },
  }[language];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg">
      {/* Sticky Top Header */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-canvas-subtle mt-12 py-8 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GithubIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-fg">{t.footerTitle}</span>
              <span className="text-[11px] text-muted ml-2">{t.note}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('trending')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              {t.navTrending}
            </button>
            <button
              onClick={() => navigateTo('search')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              {t.navSearch}
            </button>
            <button
              onClick={() => navigateTo('bookmarks')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              {t.navSaved}
            </button>
            <button
              onClick={() => navigateTo('compare')}
              className="hover:text-fg transition-colors cursor-pointer"
            >
              {t.navCompare}
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals & Notifications */}
      <LoginModal />
      <SettingsModal />
      <QuickReadmeModal />
      <IssueDetailModal />
      <RepoWebsiteModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
