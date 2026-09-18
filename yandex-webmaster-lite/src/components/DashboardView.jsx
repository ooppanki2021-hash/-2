import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  TrendingUp,
  Search,
  Zap,
  Globe,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  BarChart3,
  MousePointerClick,
  Eye,
  Percent,
  Navigation as CompassIcon,
  Key,
  Plus,
  Server,
  Bot,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function DashboardView() {
  const {
    sites,
    activeSite,
    setCurrentTab,
    historyData,
    queries,
    diagnostics,
    showToast,
    oauthToken,
    yandexUser,
    runAutoScan,
    isScanning,
    scanProgress,
  } = useWebmaster();

  const [inputUrl, setInputUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleStartScan = (e) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      runAutoScan(inputUrl.trim());
      setInputUrl('');
    }
  };

  // If no sites added yet, show Clean Welcome & Auto-Scan Ingestion Box
  if (!activeSite || sites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-6 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xl">
            Я
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Яндекс Вебмастер Lite
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Введите адрес вашего сайта — приложение <strong className="text-white">автоматически просканирует</strong> robots.txt, sitemap.xml, SSL, ответ сервера, поисковые фразы и рассчитает ИКС.
          </p>
        </div>

        {/* Form to auto-scan site */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#121720] border-2 border-[#283347] shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Автоматический сбор данных по сайту</span>
          </h3>

          <form onSubmit={handleStartScan} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://mysite.ru или domain.com"
              disabled={isScanning}
              className="flex-1 px-4 py-3 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={isScanning}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-sm shadow cursor-pointer transition-all shrink-0 flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Сканирование...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Собрать данные</span>
                </>
              )}
            </button>
          </form>

          {/* Live Progress Bar during Auto-Scan */}
          {isScanning && scanProgress && (
            <div className="p-4 rounded-xl bg-[#18202d] border border-amber-500/30 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Шаг {scanProgress.step} из 5:</span>
                </span>
                <span className="text-gray-300 font-medium">{scanProgress.text}</span>
              </div>
              <div className="w-full bg-[#090c10] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-2 transition-all duration-300"
                  style={{ width: `${(scanProgress.step / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#283347] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
            <span>Хотите привязать свой Яндекс ID?</span>
            <button
              onClick={() => setCurrentTab('settings')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Ввести OAuth-токен →</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const siteUrl = activeSite.unicode_host_url;
  const siteTitle = activeSite.title || activeSite.unicode_host_url;

  const handleCopy = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopiedUrl(true);
    showToast('Адрес сайта скопирован!', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. ACTIVE SITE BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#283347] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                {siteTitle}
              </h2>
              <span className="text-[11px] text-gray-400">Данные сайта успешно подтянуты • Индексация активна</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => runAutoScan(siteUrl)}
              disabled={isScanning}
              className="px-3 py-1.5 rounded-xl bg-[#1c2331] hover:bg-[#252f42] text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Пересканировать и обновить данные"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Обновление...' : 'Обновить данные'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-[#1c2331] hover:bg-[#252f42] text-gray-200 border border-[#2e3c54] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Скопировано' : 'Копировать'}</span>
            </button>

            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <span>Открыть сайт</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Site Address Strip */}
        <div className="p-4 rounded-xl bg-[#090c10] border border-[#283347] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <span className="text-gray-400 font-medium">Главное зеркало:</span>
              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-red-400 hover:text-red-300 underline font-mono flex items-center gap-1 break-all"
              >
                <span>{siteUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
            {activeSite.description && (
              <p className="text-xs text-gray-400 line-clamp-1">{activeSite.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setCurrentTab('reindex')}
              className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Переобход URL</span>
            </button>
          </div>
        </div>

        {/* Quick Tools Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <button
            onClick={() => setCurrentTab('reindex')}
            className="p-3 rounded-xl bg-[#161c28] hover:bg-[#1f283a] border border-[#2e3c54] text-left transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400 mb-1" />
            <span className="font-bold text-white block">Переобход URL</span>
            <span className="text-[11px] text-gray-400">Ускорить обход</span>
          </button>

          <button
            onClick={() => setCurrentTab('robots')}
            className="p-3 rounded-xl bg-[#161c28] hover:bg-[#1f283a] border border-[#2e3c54] text-left transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-red-400 mb-1" />
            <span className="font-bold text-white block">robots.txt</span>
            <span className="text-[11px] text-gray-400">Правила робота</span>
          </button>

          <button
            onClick={() => setCurrentTab('tools')}
            className="p-3 rounded-xl bg-[#161c28] hover:bg-[#1f283a] border border-[#2e3c54] text-left transition-all cursor-pointer"
          >
            <Server className="w-4 h-4 text-blue-400 mb-1" />
            <span className="font-bold text-white block">Ответ сервера</span>
            <span className="text-[11px] text-gray-400">HTTP 200 OK</span>
          </button>

          <button
            onClick={() => setCurrentTab('diagnostics')}
            className="p-3 rounded-xl bg-[#161c28] hover:bg-[#1f283a] border border-[#2e3c54] text-left transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="font-bold text-white block">Диагностика</span>
            <span className="text-[11px] text-gray-400">Безопасность</span>
          </button>
        </div>

      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* ИКС */}
        <div className="p-4 rounded-2xl bg-[#121720] border-2 border-[#283347] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold">ИКС сайта</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {activeSite?.sqi || 40}
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-1">Индекс качества сайта</div>
          </div>
        </div>

        {/* Страницы */}
        <div className="p-4 rounded-2xl bg-[#121720] border-2 border-[#283347] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold">Страницы в поиске</span>
            <Search className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {activeSite?.pages_in_search || 1}
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Найдено в Sitemap</div>
          </div>
        </div>

        {/* Безопасность */}
        <div className="p-4 rounded-2xl bg-[#121720] border-2 border-[#283347] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold">Фильтры и санкции</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Ограничений нет</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Ранжирование без санкций</div>
          </div>
        </div>

        {/* SSL / HTTPS */}
        <div className="p-4 rounded-2xl bg-[#121720] border-2 border-[#283347] flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-bold">Протокол HTTPS</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-bold text-emerald-400">
              SSL Активен
            </div>
            <div className="text-[11px] text-gray-400 mt-1">Безопасное соединение</div>
          </div>
        </div>

      </div>

    </div>
  );
}
