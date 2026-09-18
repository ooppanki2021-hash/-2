import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GithubIcon } from './Icons';
import {
  X,
  Key,
  User,
  ShieldCheck,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export default function LoginModal() {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    loginWithToken,
    loginByUsername,
    language,
    currentUser,
    token,
    logout,
  } = useApp();

  const [tab, setTab] = useState('token'); // 'token' | 'username'
  const [inputToken, setInputToken] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const t = {
    ru: {
      title: 'Вход в аккаунт GitHub',
      subtitle: 'Подключите свой аккаунт для синхронизации звёзд и лимита 5000 запросов/час',
      tabToken: '🔑 Через токен (Полный доступ)',
      tabUsername: '👤 По логину (Быстрый просмотр)',
      tokenLabel: 'GitHub Personal Access Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      createTokenBtn: 'Создать токен на GitHub (1 клик)',
      tokenBenefitsTitle: 'Что даёт вход через токен:',
      benefit1: '⚡ 5000 запросов в час вместо 60',
      benefit2: '⭐ Синхронизация ваших реальных звёзд на GitHub',
      benefit3: '🔒 100% безопасно: токен сохраняется только на вашем телефоне/браузере',
      submitToken: 'Проверить и войти',
      usernameLabel: 'Ваш логин на GitHub',
      usernamePlaceholder: 'например: torvalds, octocat, gaearon',
      submitUsername: 'Подключить профиль',
      close: 'Закрыть',
      alreadyLoggedIn: 'Вы уже вошли как',
      logout: 'Выйти из аккаунта',
    },
    en: {
      title: 'Sign in to GitHub',
      subtitle: 'Connect your account to sync stars and unlock 5,000 requests/hour limit',
      tabToken: '🔑 Via Token (Full Access)',
      tabUsername: '👤 By Username (Quick View)',
      tokenLabel: 'GitHub Personal Access Token',
      tokenPlaceholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      createTokenBtn: 'Create token on GitHub (1-click)',
      tokenBenefitsTitle: 'Token benefits:',
      benefit1: '⚡ 5,000 API requests/hour instead of 60',
      benefit2: '⭐ Sync your real GitHub stars and favorites',
      benefit3: '🔒 100% Secure: Token stays locally in your browser storage',
      submitToken: 'Verify & Sign In',
      usernameLabel: 'Your GitHub Username',
      usernamePlaceholder: 'e.g. torvalds, octocat, gaearon',
      submitUsername: 'Connect Profile',
      close: 'Close',
      alreadyLoggedIn: 'You are signed in as',
      logout: 'Sign Out',
    },
  }[language];

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!inputToken.trim()) return;
    setLoading(true);
    await loginWithToken(inputToken.trim());
    setLoading(false);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!inputUsername.trim()) return;
    setLoading(true);
    await loginByUsername(inputUsername.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-border bg-canvas-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 flex items-center justify-center text-white shadow">
              <GithubIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-fg">{t.title}</h2>
              <p className="text-xs text-muted">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In */}
        {currentUser ? (
          <div className="p-6 space-y-5 text-center">
            <img
              src={currentUser.avatar_url || `https://github.com/${currentUser.login}.png`}
              alt=""
              className="w-20 h-20 rounded-2xl border-2 border-indigo-500 mx-auto shadow-lg"
            />
            <div>
              <p className="text-xs text-muted">{t.alreadyLoggedIn}</p>
              <h3 className="text-xl font-bold text-fg">{currentUser.name || currentUser.login}</h3>
              <p className="text-sm font-mono text-indigo-400">@{currentUser.login}</p>
            </div>

            <div className="p-3 bg-canvas-subtle rounded-xl border border-border text-xs text-muted flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>{token ? 'Полный доступ (5000 req/hr)' : 'Просмотр профиля'}</span>
            </div>

            <button
              onClick={() => {
                logout();
                setIsLoginModalOpen(false);
              }}
              className="px-6 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              {t.logout}
            </button>
          </div>
        ) : (
          /* Login Form */
          <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
            
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-canvas-subtle rounded-xl border border-border">
              <button
                onClick={() => setTab('token')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === 'token'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {t.tabToken}
              </button>

              <button
                onClick={() => setTab('username')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tab === 'username'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {t.tabUsername}
              </button>
            </div>

            {/* Tab 1: Token Login */}
            {tab === 'token' ? (
              <form onSubmit={handleTokenSubmit} className="space-y-4">
                
                {/* 1-click token creator link */}
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user,user:email&description=GitHubLiteApp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/30 border border-indigo-500/40 text-indigo-300 hover:text-white transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{t.createTokenBtn}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Token Input */}
                <div className="space-y-1.5">
                  <label className="font-bold text-fg block text-xs">{t.tokenLabel}</label>
                  <input
                    type="password"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    placeholder={t.tokenPlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-subtle border border-border text-fg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                {/* Benefits List */}
                <div className="p-3.5 rounded-xl bg-canvas-subtle border border-border space-y-2 text-xs text-muted">
                  <span className="font-bold text-fg block">{t.tokenBenefitsTitle}</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t.benefit1}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{t.benefit2}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>{t.benefit3}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !inputToken.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Проверка...' : t.submitToken}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              /* Tab 2: Username Quick Login */
              <form onSubmit={handleUsernameSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-fg block text-xs">{t.usernameLabel}</label>
                  <input
                    type="text"
                    value={inputUsername}
                    onChange={(e) => setInputUsername(e.target.value)}
                    placeholder={t.usernamePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-canvas-subtle border border-border text-fg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  Позволяет быстро загрузить ваш профиль, список ваших публичных проектов и звёзд без ввода секретных ключей.
                </p>

                <button
                  type="submit"
                  disabled={loading || !inputUsername.trim()}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Загрузка...' : t.submitUsername}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
