import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Globe,
  ExternalLink,
  X,
  Copy,
  Check,
  Smartphone,
  Monitor,
  RefreshCw,
  Sparkles,
  Code2,
  Layers,
  ArrowRight,
  Info,
  Terminal,
} from 'lucide-react';

export default function RepoWebsiteModal() {
  const { repoWebsiteModal, closeRepoWebsite, showToast, language } = useApp();
  const { isOpen, repo, filePath } = repoWebsiteModal;

  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [selectedSource, setSelectedSource] = useState('pages');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);

  const owner = repo?.owner?.login || repo?.full_name?.split('/')[0] || '';
  const repoName = repo?.name || repo?.full_name?.split('/')[1] || '';
  const defaultBranch = repo?.default_branch || 'main';
  const targetFile = filePath || 'index.html';

  // Compute all available website URLs for this repo
  const sources = [
    {
      id: 'pages',
      title: 'GitHub Pages (Сайт репозитория)',
      badge: 'Рекомендуется',
      url: `https://${owner}.github.io/${repoName}/`,
      desc: 'Официальный сайт/документация, развернутая GitHub из файлов репозитория.',
      isPrimary: true,
    },
    {
      id: 'githack',
      title: `Live HTML: ${targetFile} (Raw GitHack)`,
      badge: 'Прямо из файлов',
      url: `https://raw.githack.com/${owner}/${repoName}/${defaultBranch}/${targetFile}`,
      desc: 'Прямой запуск HTML-страницы из репозитория с подключением всех CSS/JS стилей и изображений.',
      isPrimary: true,
    },
    {
      id: 'htmlpreview',
      title: 'HTML Previewer',
      badge: 'Инспектор',
      url: `https://htmlpreview.github.io/?https://github.com/${owner}/${repoName}/blob/${defaultBranch}/${targetFile}`,
      desc: 'Быстрый предпросмотр веб-файлов из репозитория через htmlpreview.github.io.',
      isPrimary: false,
    },
    ...(repo?.homepage && repo.homepage.trim()
      ? [
          {
            id: 'homepage',
            title: 'Официальный сайт / Homepage',
            badge: 'Homepage',
            url: repo.homepage.startsWith('http') ? repo.homepage.trim() : `https://${repo.homepage.trim()}`,
            desc: 'Внешний сайт проекта, указанный автором в репозитории.',
            isPrimary: true,
          },
        ]
      : []),
    {
      id: 'githubdev',
      title: 'Web IDE & Live Runner (GitHub.dev)',
      badge: 'Web Editor',
      url: `https://github.dev/${owner}/${repoName}`,
      desc: 'Полноценный онлайн-редактор кода в браузере для запуска и просмотра проекта.',
      isPrimary: false,
    },
    {
      id: 'stackblitz',
      title: 'StackBlitz Sandbox',
      badge: 'Sandbox',
      url: `https://stackblitz.com/github/${owner}/${repoName}`,
      desc: 'Мгновенный запуск всего веб-приложения в изолированной песочнице Node.js/Vite.',
      isPrimary: false,
    },
  ];

  const currentSourceObj = sources.find((s) => s.id === selectedSource) || sources[0];
  const activeUrl = currentSourceObj?.url || '';

  useEffect(() => {
    if (isOpen) {
      if (filePath) {
        setSelectedSource('githack');
      } else if (repo?.has_pages) {
        setSelectedSource('pages');
      } else if (repo?.homepage) {
        setSelectedSource('homepage');
      } else {
        setSelectedSource('pages');
      }
      setIframeLoading(true);
      setIframeKey((k) => k + 1);
    }
  }, [isOpen, repo, filePath]);

  if (!isOpen || !repo) return null;

  const t = {
    ru: {
      modalTitle: 'Сайт & Демо из репозитория',
      modalSubtitle: 'Запуск и просмотр сайта, веб-страниц и документации проекта',
      openNewTab: 'Открыть в новой вкладке',
      copyUrl: 'Скопировать ссылку',
      copied: 'Ссылка скопирована',
      deviceDesktop: 'Десктоп',
      deviceMobile: 'Смартфон',
      refresh: 'Перезагрузить',
      sourcesLabel: 'Источник сайта:',
      frameBlockedNotice: 'Если сайт защищён политикой встраивания X-Frame-Options, нажмите кнопку перехода:',
      directOpen: 'Перейти на сайт ↗',
      allSources: 'Все ссылки на сайт и веб-версии этого репозитория:',
    },
    en: {
      modalTitle: 'Repository Website & Live Demo',
      modalSubtitle: 'Launch and preview hosted website, web pages and documentation',
      openNewTab: 'Open in new tab',
      copyUrl: 'Copy Link',
      copied: 'Link copied',
      deviceDesktop: 'Desktop',
      deviceMobile: 'Mobile',
      refresh: 'Reload',
      sourcesLabel: 'Website source:',
      frameBlockedNotice: 'If the website blocks embedding via X-Frame-Options, open it directly:',
      directOpen: 'Open Website ↗',
      allSources: 'All website and live demo links for this repository:',
    },
  }[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    showToast(t.copied, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSourceChange = (srcId) => {
    setSelectedSource(srcId);
    setIframeLoading(true);
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-6xl h-[92vh] bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border bg-canvas-subtle flex flex-wrap items-center justify-between gap-3">
          
          {/* Left info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow">
              <Globe className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-fg truncate">
                  {repo.full_name || `${owner}/${repoName}`}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline-block">
                  Live Site
                </span>
              </div>
              <p className="text-[11px] text-muted truncate">{currentSourceObj?.title}</p>
            </div>
          </div>

          {/* Device Switcher & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Desktop / Mobile view toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-canvas border border-border text-xs">
              <button
                onClick={() => setDeviceMode('desktop')}
                title={t.deviceDesktop}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-fg'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                title={t.deviceMobile}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-muted hover:text-fg'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                setIframeLoading(true);
                setIframeKey((k) => k + 1);
              }}
              title={t.refresh}
              className="p-1.5 rounded-lg bg-canvas hover:bg-canvas-muted text-muted hover:text-fg border border-border transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${iframeLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              title={t.copyUrl}
              className="p-1.5 rounded-lg bg-canvas hover:bg-canvas-muted text-muted hover:text-fg border border-border transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Open in New Tab Direct Button */}
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
            >
              <span>{t.openNewTab}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Close Button */}
            <button
              onClick={closeRepoWebsite}
              className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-transparent hover:border-border transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Source Selector Bar */}
        <div className="p-2.5 px-4 bg-canvas border-b border-border flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-muted font-semibold shrink-0 text-[11px] hidden md:inline">
            {t.sourcesLabel}
          </span>
          {sources.map((src) => {
            const isSelected = selectedSource === src.id;
            return (
              <button
                key={src.id}
                onClick={() => handleSourceChange(src.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border'
                }`}
              >
                <Globe className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-muted'}`} />
                <span>{src.title}</span>
              </button>
            );
          })}
        </div>

        {/* Live Preview Screen */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden relative">
          
          {/* Active URL bar */}
          <div className="w-full max-w-4xl mb-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate">{activeUrl}</span>
            </div>
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline shrink-0 ml-2 font-sans font-semibold flex items-center gap-1"
            >
              <span>{t.directOpen}</span>
            </a>
          </div>

          {/* Frame Container with device width constraints */}
          <div
            className={`h-full bg-white rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative transition-all duration-300 ${
              deviceMode === 'mobile' ? 'w-[380px] max-w-full' : 'w-full'
            }`}
          >
            {iframeLoading && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400 space-y-3 z-10">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <p className="text-xs">Загрузка сайта из репозитория...</p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={activeUrl}
              title="Repository Website"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
              onLoad={() => setIframeLoading(false)}
            />
          </div>
        </div>

        {/* Bottom Quick Links Grid */}
        <div className="p-3 bg-canvas-subtle border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-muted">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-[11px]">{t.frameBlockedNotice}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`https://${owner}.github.io/${repoName}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-canvas-muted text-emerald-400 border border-border text-[11px] font-semibold flex items-center gap-1"
            >
              <span>GitHub Pages</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={`https://raw.githack.com/${owner}/${repoName}/${defaultBranch}/index.html`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-canvas-muted text-teal-400 border border-border text-[11px] font-semibold flex items-center gap-1"
            >
              <span>Raw GitHack HTML</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <a
              href={`https://github.dev/${owner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-canvas hover:bg-canvas-muted text-indigo-400 border border-border text-[11px] font-semibold flex items-center gap-1"
            >
              <span>GitHub.dev</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
