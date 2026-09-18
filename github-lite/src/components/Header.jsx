import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bookmark,
  TrendingUp,
  GitCompare,
  Settings,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Globe,
  Smartphone,
  User,
  LogOut,
  FolderGit2,
  Star,
  ChevronDown,
} from 'lucide-react';
import { GithubIcon } from './Icons';

export default function Header() {
  const {
    currentView,
    navigateTo,
    openSearch,
    openUser,
    bookmarks,
    rateLimit,
    theme,
    setTheme,
    language,
    setLanguage,
    setIsSettingsOpen,
    currentUser,
    setIsLoginModalOpen,
    logout,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  // Keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      openSearch(searchQuery.trim());
    }
  };

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('dimmed');
    else if (theme === 'dimmed') setTheme('light');
    else setTheme('dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  const t = {
    ru: {
      tagline: 'Быстрый & Простой',
      searchPlaceholder: 'Поиск репозиториев, библиотек, авторов... (нажмите /)',
      trending: 'В тренде',
      search: 'Поиск',
      bookmarks: 'Закладки',
      compare: 'Сравнение',
      settings: 'Настройки',
      rateLimit: 'Лимит API',
      downloadApk: 'Скачать APK',
      signIn: 'Войти',
      myProfile: 'Мой профиль',
      myStars: 'Мои звёзды на GitHub',
      signOut: 'Выйти',
    },
    en: {
      tagline: 'Fast & Simple',
      searchPlaceholder: 'Search repositories, libraries, users... (press /)',
      trending: 'Trending',
      search: 'Search',
      bookmarks: 'Saved',
      compare: 'Compare',
      settings: 'Settings',
      rateLimit: 'API Limit',
      downloadApk: 'Download APK',
      signIn: 'Sign In',
      myProfile: 'My Profile',
      myStars: 'My GitHub Stars',
      signOut: 'Sign Out',
    },
  }[language];

  // Rate limit color
  const rateLimitPercent = rateLimit.limit > 0 ? (rateLimit.remaining / rateLimit.limit) * 100 : 100;
  let rateBadgeColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60';
  if (rateLimitPercent < 20) {
    rateBadgeColor = 'text-rose-400 bg-rose-950/60 border-rose-800/60';
  } else if (rateLimitPercent < 50) {
    rateBadgeColor = 'text-amber-400 bg-amber-950/60 border-amber-800/60';
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-canvas/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigateTo('trending')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <GithubIcon className="w-6 h-6 text-white group-hover:text-indigo-300 transition-colors" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-fg tracking-tight">GitHub</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    Lite
                  </span>
                </div>
                <p className="text-[11px] text-muted -mt-0.5 font-medium">{t.tagline}</p>
              </div>
            </button>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-10 py-1.5 text-sm rounded-lg bg-canvas-subtle border border-border text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <kbd className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-muted bg-canvas-muted rounded border border-border pointer-events-none">
                /
              </kbd>
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => navigateTo('trending')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                currentView === 'trending'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-muted hover:text-fg hover:bg-canvas-subtle'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">{t.trending}</span>
            </button>

            <button
              onClick={() => navigateTo('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                currentView === 'search'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-muted hover:text-fg hover:bg-canvas-subtle'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">{t.search}</span>
            </button>

            <button
              onClick={() => navigateTo('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all relative cursor-pointer ${
                currentView === 'bookmarks'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-muted hover:text-fg hover:bg-canvas-subtle'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">{t.bookmarks}</span>
              {bookmarks.length > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 ml-0.5">
                  {bookmarks.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigateTo('compare')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                currentView === 'compare'
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-muted hover:text-fg hover:bg-canvas-subtle'
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">{t.compare}</span>
            </button>
          </nav>

          {/* Right Action Icons: Login/Profile, APK Download, Rate Limit, Theme, Lang, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* User Login / Profile Button */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-canvas-subtle hover:bg-canvas-muted border border-border text-fg text-xs font-semibold transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.avatar_url || `https://github.com/${currentUser.login}.png`}
                    alt=""
                    className="w-6 h-6 rounded-lg border border-border"
                  />
                  <span className="hidden md:inline font-bold truncate max-w-[90px]">
                    {currentUser.login}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-canvas border border-border rounded-xl shadow-2xl py-1 z-50 text-xs animate-fade-in">
                    <div className="px-3 py-2 border-b border-border/70">
                      <div className="font-bold text-fg truncate">{currentUser.name || currentUser.login}</div>
                      <div className="text-muted text-[11px]">@{currentUser.login}</div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        openUser(currentUser.login);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-muted hover:text-fg hover:bg-canvas-subtle text-left cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.myProfile}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigateTo('bookmarks');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-muted hover:text-fg hover:bg-canvas-subtle text-left cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.myStars}</span>
                    </button>

                    <div className="border-t border-border/70 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 hover:text-white text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </button>
            )}

            {/* Download APK Button */}
            <a
              href="./github-lite.apk"
              download="github-lite.apk"
              title={t.downloadApk}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-bold transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>APK</span>
            </a>

            {/* Rate limit chip */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title={`${t.rateLimit}: ${rateLimit.remaining} / ${rateLimit.limit}`}
              className={`hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${rateBadgeColor} hover:opacity-80 transition-opacity cursor-pointer`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{rateLimit.remaining}</span>
              <span className="text-muted text-[10px]">/{rateLimit.limit}</span>
            </button>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              title={language === 'ru' ? 'Переключить на English' : 'Switch to Russian'}
              className="px-2 py-1 rounded-lg text-xs font-bold text-muted hover:text-fg hover:bg-canvas-subtle border border-border transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language.toUpperCase()}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={cycleTheme}
              title={`Тема: ${theme}`}
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-canvas-subtle border border-border transition-colors cursor-pointer"
            >
              {theme === 'dark' && <Moon className="w-4 h-4 text-indigo-400" />}
              {theme === 'dimmed' && <Sparkles className="w-4 h-4 text-purple-400" />}
              {theme === 'light' && <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {/* Settings Modal Toggle */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              title={t.settings}
              className="p-2 rounded-lg text-muted hover:text-fg hover:bg-canvas-subtle border border-border transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Search input */}
        <form onSubmit={handleSearchSubmit} className="pb-3 block md:hidden">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-muted absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-canvas-subtle border border-border text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
