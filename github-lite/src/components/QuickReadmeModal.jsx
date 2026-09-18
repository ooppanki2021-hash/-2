import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getReadme } from '../services/githubApi';
import { renderMarkdown } from '../utils/formatters';
import { BookOpen, X, ExternalLink, ArrowRight, RefreshCw, Copy, Check, Globe, Play } from 'lucide-react';

export default function QuickReadmeModal() {
  const { quickReadmeModal, closeQuickReadme, openRepo, openRepoWebsite, showToast, language, token } = useApp();
  const { isOpen, repo } = quickReadmeModal;

  const [readme, setReadme] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const owner = repo?.owner?.login || repo?.full_name?.split('/')[0] || '';
  const repoName = repo?.name || repo?.full_name?.split('/')[1] || '';

  useEffect(() => {
    if (isOpen && owner && repoName) {
      setLoading(true);
      getReadme(owner, repoName, token)
        .then((text) => setReadme(text))
        .catch(() => setReadme(''))
        .finally(() => setLoading(false));
    } else {
      setReadme('');
    }
  }, [isOpen, owner, repoName, token]);

  if (!isOpen || !repo) return null;

  const t = {
    ru: {
      quickReadme: 'Быстрый просмотр README',
      openFull: 'Открыть проект полностью',
      openGithub: 'На GitHub',
      openWebsite: 'Сайт проекта',
      siteInRepo: '🚀 Запустить сайт из репозитория',
      copied: 'Markdown скопирован',
      copyMd: 'Копировать README',
      noReadme: 'README файл отсутствует или пуст.',
    },
    en: {
      quickReadme: 'Quick README Preview',
      openFull: 'Open Full Project',
      openGithub: 'On GitHub',
      openWebsite: 'Website / Demo',
      siteInRepo: '🚀 Launch In-Repo Website',
      copied: 'Markdown copied',
      copyMd: 'Copy README',
      noReadme: 'README is missing or empty.',
    },
  }[language];

  const handleCopy = () => {
    navigator.clipboard.writeText(readme);
    setCopied(true);
    showToast(t.copied, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const getWebsiteUrl = () => {
    if (repo?.homepage && repo.homepage.trim()) {
      return repo.homepage.startsWith('http') ? repo.homepage.trim() : `https://${repo.homepage.trim()}`;
    }
    if (repo?.has_pages) {
      return `https://${owner}.github.io/${repoName}/`;
    }
    return `https://${owner}.github.io/${repoName}/`;
  };

  const websiteUrl = getWebsiteUrl();
  const renderedHtml = renderMarkdown(readme, `${owner}/${repoName}`, repo.default_branch || 'main');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-canvas-subtle">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={repo.owner?.avatar_url || `https://github.com/${owner}.png`}
              alt=""
              className="w-8 h-8 rounded-lg border border-border bg-slate-900 shrink-0"
            />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-fg truncate">
                {repo.full_name || `${owner}/${repoName}`}
              </h2>
              <p className="text-[11px] text-muted">{t.quickReadme}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {readme && (
              <button
                onClick={handleCopy}
                title={t.copyMd}
                className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-border transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={closeQuickReadme}
              className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-transparent hover:border-border transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Website / Deployments Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-950/30 to-slate-900/40 border border-emerald-800/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-300 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
              </span>
              <div className="min-w-0">
                <span className="font-bold text-fg block">Сайт репозитория:</span>
                <span className="font-mono text-muted text-[11px] truncate block max-w-sm">{websiteUrl}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  closeQuickReadme();
                  openRepoWebsite(repo);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1.5 text-xs shadow cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Запустить сайт</span>
              </button>

              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-canvas hover:bg-canvas-muted text-muted hover:text-fg border border-border rounded-lg"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-5/6" />
              <div className="h-40 bg-slate-800 rounded w-full" />
            </div>
          ) : readme ? (
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <div className="text-center py-16 text-muted">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>{t.noReadme}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-canvas-subtle flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <a
              href={repo.html_url || `https://github.com/${owner}/${repoName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted hover:text-fg font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t.openGithub}</span>
            </a>

            <button
              onClick={() => {
                closeQuickReadme();
                openRepoWebsite(repo);
              }}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.siteInRepo}</span>
            </button>
          </div>

          <button
            onClick={() => {
              closeQuickReadme();
              openRepo(owner, repoName);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all cursor-pointer"
          >
            <span>{t.openFull}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
