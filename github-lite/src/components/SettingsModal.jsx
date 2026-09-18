import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRelativeTime } from '../utils/formatters';
import {
  Settings,
  X,
  Key,
  Zap,
  Moon,
  Sun,
  Sparkles,
  Globe,
  Trash2,
  Check,
  ShieldCheck,
  Info,
  Smartphone,
  Download,
} from 'lucide-react';

export default function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    theme,
    setTheme,
    language,
    setLanguage,
    token,
    setToken,
    rateLimit,
    bookmarks,
    setBookmarks,
    showToast,
  } = useApp();

  const [inputToken, setInputToken] = useState(token);

  if (!isSettingsOpen) return null;

  const t = {
    ru: {
      title: 'Настройки приложения',
      subtitle: 'Управление темами, языком, APK и лимитами GitHub API',
      apkTitle: 'Мобильное приложение для Android (APK)',
      apkDesc: 'Готовый установочный файл .apk (149 КБ). Работает автономно на Android 5.0+.',
      downloadApk: 'Скачать github-lite.apk',
      themeTitle: 'Тема оформления',
      themeDark: 'GitHub Dark (Тёмная)',
      themeDimmed: 'Dimmed (Приглушенная)',
      themeLight: 'Light (Светлая)',
      langTitle: 'Язык интерфейса',
      rateLimitTitle: 'Лимиты GitHub API',
      rateDesc: 'GitHub предоставляет 60 бесплатных анонимных запросов в час. Для 5,000 запросов в час можно указать Personal Access Token.',
      tokenTitle: 'GitHub Personal Access Token (необязательно)',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      tokenHelp: 'Токен сохраняется только в локальном браузере и используется только для обращений к api.github.com.',
      saveToken: 'Сохранить токен',
      tokenSaved: 'Токен сохранен!',
      tokenCleared: 'Токен удален',
      storageTitle: 'Локальные данные',
      savedBookmarksCount: 'Сохранено закладок:',
      clearCache: 'Очистить кэш и закладки',
      clearConfirm: 'Вы уверены? Закладки будут удалены.',
      close: 'Закрыть',
      resetsIn: 'Сброс лимита через:',
    },
    en: {
      title: 'Application Settings',
      subtitle: 'Manage themes, language, APK, and GitHub API limits',
      apkTitle: 'Android Mobile Application (APK)',
      apkDesc: 'Ready-to-install .apk package (149 KB). Works standalone on Android 5.0+.',
      downloadApk: 'Download github-lite.apk',
      themeTitle: 'Theme Mode',
      themeDark: 'GitHub Dark',
      themeDimmed: 'Dimmed',
      themeLight: 'Light',
      langTitle: 'UI Language',
      rateLimitTitle: 'GitHub API Limits',
      rateDesc: 'GitHub provides 60 free anonymous requests/hour. To get 5,000 requests/hour, enter a Personal Access Token.',
      tokenTitle: 'GitHub Personal Access Token (optional)',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
      tokenHelp: 'The token is stored solely in your browser localStorage and only sent to api.github.com.',
      saveToken: 'Save Token',
      tokenSaved: 'Token saved!',
      tokenCleared: 'Token removed',
      storageTitle: 'Local Storage',
      savedBookmarksCount: 'Bookmarks saved:',
      clearCache: 'Clear Cache & Bookmarks',
      clearConfirm: 'Are you sure? All bookmarks will be deleted.',
      close: 'Close',
      resetsIn: 'Limit resets in:',
    },
  }[language];

  const handleSaveToken = (e) => {
    e.preventDefault();
    setToken(inputToken.trim());
    showToast(inputToken.trim() ? t.tokenSaved : t.tokenCleared, 'success');
  };

  const handleClearData = () => {
    if (window.confirm(t.clearConfirm)) {
      setBookmarks([]);
      localStorage.clear();
      showToast(language === 'ru' ? 'Данные очищены' : 'Data cleared', 'info');
    }
  };

  const ratePercent = rateLimit.limit > 0 ? (rateLimit.remaining / rateLimit.limit) * 100 : 100;
  const resetMinutes = Math.max(1, Math.round((rateLimit.reset - Date.now()) / 60000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-fg">{t.title}</h2>
              <p className="text-xs text-muted">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* APK Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-fg flex items-center gap-2 text-sm">
                <Smartphone className="w-4 h-4 text-indigo-400" />
                {t.apkTitle}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-muted">{t.apkDesc}</p>
            <a
              href="./github-lite.apk"
              download="github-lite.apk"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadApk}</span>
            </a>
          </div>

          {/* Theme Selection */}
          <div className="space-y-2.5">
            <label className="font-bold text-fg block">{t.themeTitle}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold'
                    : 'bg-canvas-subtle border-border text-muted hover:text-fg'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span className="text-xs">{t.themeDark}</span>
              </button>

              <button
                onClick={() => setTheme('dimmed')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  theme === 'dimmed'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold'
                    : 'bg-canvas-subtle border-border text-muted hover:text-fg'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs">{t.themeDimmed}</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold'
                    : 'bg-canvas-subtle border-border text-muted hover:text-fg'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span className="text-xs">{t.themeLight}</span>
              </button>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-2.5">
            <label className="font-bold text-fg block">{t.langTitle}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLanguage('ru')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  language === 'ru'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold'
                    : 'bg-canvas-subtle border-border text-muted hover:text-fg'
                }`}
              >
                <span className="text-base">🇷🇺</span>
                <span>Русский</span>
              </button>

              <button
                onClick={() => setLanguage('en')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400 font-bold'
                    : 'bg-canvas-subtle border-border text-muted hover:text-fg'
                }`}
              >
                <span className="text-base">🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>

          {/* Rate Limits Status */}
          <div className="p-4 rounded-xl bg-canvas-subtle border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-fg flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-indigo-400" />
                {t.rateLimitTitle}
              </span>
              <span className="font-mono font-bold text-indigo-400">
                {rateLimit.remaining} / {rateLimit.limit}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  ratePercent < 20 ? 'bg-rose-500' : ratePercent < 50 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${ratePercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-muted">
              <span>{t.resetsIn} ~{resetMinutes} мин.</span>
              <span>{token ? 'Token: Active (5000/hr)' : 'Anonymous (60/hr)'}</span>
            </div>

            <p className="text-[11px] text-muted leading-relaxed">{t.rateDesc}</p>
          </div>

          {/* GitHub Token Form */}
          <form onSubmit={handleSaveToken} className="space-y-2.5">
            <label className="font-bold text-fg flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              <span>{t.tokenTitle}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder={t.tokenPlaceholder}
                className="flex-1 px-3.5 py-2 rounded-xl bg-canvas-subtle border border-border text-fg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                {t.saveToken}
              </button>
            </div>
            <p className="text-[11px] text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.tokenHelp}</span>
            </p>
          </form>

          {/* Storage & Clear */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted">
              {t.savedBookmarksCount} <strong className="text-fg">{bookmarks.length}</strong>
            </span>
            <button
              onClick={handleClearData}
              className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearCache}</span>
            </button>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-canvas-subtle flex justify-end">
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-5 py-2 rounded-xl bg-canvas border border-border hover:bg-canvas-muted text-fg font-semibold text-xs transition-colors cursor-pointer"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
}
