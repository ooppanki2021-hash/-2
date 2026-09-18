import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getRepository } from '../services/githubApi';
import { getLangColor } from '../utils/githubColors';
import { formatNumber, formatSize, formatDate, formatRelativeTime } from '../utils/formatters';
import {
  GitCompare,
  Star,
  GitFork,
  MessageSquare,
  Scale,
  Calendar,
  Layers,
  ExternalLink,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Eye,
} from 'lucide-react';

const PRESETS = [
  { name: 'React vs Vue', repo1: 'facebook/react', repo2: 'vuejs/core' },
  { name: 'Vite vs Webpack', repo1: 'vitejs/vite', repo2: 'webpack/webpack' },
  { name: 'FastAPI vs Flask', repo1: 'fastapi/fastapi', repo2: 'pallets/flask' },
  { name: 'Ollama vs Llama.cpp', repo1: 'ollama/ollama', repo2: 'ggerganov/llama.cpp' },
  { name: 'Next.js vs Remix', repo1: 'vercel/next.js', repo2: 'remix-run/remix' },
];

export default function CompareView() {
  const { viewParams, openRepo, language, token } = useApp();

  const [input1, setInput1] = useState(viewParams.repo1 || 'facebook/react');
  const [input2, setInput2] = useState(viewParams.repo2 || 'vuejs/core');
  
  const [repo1, setRepo1] = useState(null);
  const [repo2, setRepo2] = useState(null);
  const [loading, setLoading] = useState(false);

  const t = {
    ru: {
      title: 'Сравнение репозиториев',
      subtitle: 'Сравнивайте популярность, активность, размеры и лицензии любых двух открытых проектов.',
      compareBtn: 'Сравнить',
      presets: 'Быстрые примеры:',
      stars: 'Звёзды (Stargazers)',
      forks: 'Форки (Forks)',
      issues: 'Открытые вопросы (Issues)',
      size: 'Размер проекта',
      language: 'Основной язык',
      license: 'Лицензия',
      created: 'Дата создания',
      updated: 'Последняя активность',
      viewRepo: 'Открыть репозиторий',
      repo1Placeholder: 'owner/repo (напр. facebook/react)',
      repo2Placeholder: 'owner/repo (напр. vuejs/core)',
      leader: 'Лидер',
    },
    en: {
      title: 'Compare Repositories',
      subtitle: 'Compare stars, forks, repo size, and activity between any two open-source repositories.',
      compareBtn: 'Compare',
      presets: 'Quick presets:',
      stars: 'Stars (Stargazers)',
      forks: 'Forks',
      issues: 'Open Issues',
      size: 'Repository Size',
      language: 'Primary Language',
      license: 'License',
      created: 'Created Date',
      updated: 'Last Activity',
      viewRepo: 'View Repository',
      repo1Placeholder: 'owner/repo (e.g. facebook/react)',
      repo2Placeholder: 'owner/repo (e.g. vuejs/core)',
      leader: 'Leader',
    },
  }[language];

  const fetchComparison = async (name1, name2) => {
    setLoading(true);
    try {
      const [p1, r1] = name1.split('/');
      const [p2, r2] = name2.split('/');

      if (!p1 || !r1 || !p2 || !r2) {
        setLoading(false);
        return;
      }

      const [d1, d2] = await Promise.all([
        getRepository(p1, r1, token),
        getRepository(p2, r2, token),
      ]);

      setRepo1(d1);
      setRepo2(d2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComparison(input1, input2);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchComparison(input1, input2);
  };

  const selectPreset = (preset) => {
    setInput1(preset.repo1);
    setInput2(preset.repo2);
    fetchComparison(preset.repo1, preset.repo2);
  };

  // Helper for comparative progress bars
  const renderCompareBar = (val1, val2, formatFn = formatNumber) => {
    const total = (val1 || 0) + (val2 || 0);
    const p1 = total > 0 ? ((val1 || 0) / total) * 100 : 50;
    const p2 = total > 0 ? ((val2 || 0) / total) * 100 : 50;

    return (
      <div className="space-y-1.5 w-full">
        <div className="flex justify-between text-xs font-semibold">
          <span className={val1 > val2 ? 'text-indigo-400' : 'text-muted'}>
            {formatFn(val1)} {val1 > val2 && `(${t.leader})`}
          </span>
          <span className={val2 > val1 ? 'text-purple-400' : 'text-muted'}>
            {val2 > val1 && `(${t.leader}) `} {formatFn(val2)}
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-indigo-500 transition-all duration-500"
            style={{ width: `${p1}%` }}
          />
          <div
            className="bg-purple-500 transition-all duration-500"
            style={{ width: `${p2}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg flex items-center gap-2.5">
          <GitCompare className="w-7 h-7 text-indigo-400" />
          <span>{t.title}</span>
        </h1>
        <p className="text-sm text-muted mt-1">{t.subtitle}</p>
      </div>

      {/* Input Form & Presets */}
      <div className="bg-canvas-subtle p-5 rounded-2xl border border-border space-y-4 shadow-sm">
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
          <div className="md:col-span-2">
            <input
              type="text"
              value={input1}
              onChange={(e) => setInput1(e.target.value)}
              placeholder={t.repo1Placeholder}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-canvas border border-border text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="text-center font-bold text-muted text-xs uppercase tracking-wider">
            VS
          </div>

          <div className="md:col-span-2">
            <input
              type="text"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              placeholder={t.repo2Placeholder}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-canvas border border-border text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>

          <div className="md:col-span-5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all shadow cursor-pointer flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{t.compareBtn}</span>
            </button>
          </div>
        </form>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-border/70 text-xs">
          <span className="text-muted font-medium">{t.presets}</span>
          {PRESETS.map((pr) => (
            <button
              key={pr.name}
              onClick={() => selectPreset(pr)}
              className="px-2.5 py-1 rounded-md bg-canvas hover:bg-canvas-muted text-muted hover:text-indigo-400 border border-border transition-colors cursor-pointer"
            >
              {pr.name}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Matrix */}
      {loading ? (
        <div className="p-8 rounded-2xl bg-canvas-subtle border border-border animate-pulse space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="h-20 bg-slate-800 rounded-xl" />
            <div className="h-20 bg-slate-800 rounded-xl" />
          </div>
          <div className="h-40 bg-slate-800 rounded-xl" />
        </div>
      ) : repo1 && repo2 ? (
        <div className="space-y-6">
          
          {/* Top Repository Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Repo 1 Header Card */}
            <div className="p-6 rounded-2xl bg-canvas-subtle border-2 border-indigo-500/40 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={repo1.owner?.avatar_url || `https://github.com/${repo1.full_name?.split('/')[0]}.png`}
                  alt=""
                  className="w-12 h-12 rounded-xl border border-border bg-slate-900"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-lg text-fg truncate">{repo1.full_name}</h3>
                  <p className="text-xs text-muted line-clamp-1">{repo1.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const [o, r] = repo1.full_name.split('/');
                  openRepo(o, r);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <span>{t.viewRepo}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Repo 2 Header Card */}
            <div className="p-6 rounded-2xl bg-canvas-subtle border-2 border-purple-500/40 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={repo2.owner?.avatar_url || `https://github.com/${repo2.full_name?.split('/')[0]}.png`}
                  alt=""
                  className="w-12 h-12 rounded-xl border border-border bg-slate-900"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-lg text-fg truncate">{repo2.full_name}</h3>
                  <p className="text-xs text-muted line-clamp-1">{repo2.description}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const [o, r] = repo2.full_name.split('/');
                  openRepo(o, r);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/30 text-xs font-bold transition-all cursor-pointer"
              >
                <span>{t.viewRepo}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Side by side metric bars */}
          <div className="p-6 sm:p-8 rounded-2xl bg-canvas-subtle border border-border space-y-6 shadow-sm">
            
            {/* Stars Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-fg">
                <Star className="w-4 h-4 text-amber-400" />
                <span>{t.stars}</span>
              </div>
              {renderCompareBar(repo1.stargazers_count, repo2.stargazers_count)}
            </div>

            {/* Forks Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-fg">
                <GitFork className="w-4 h-4 text-indigo-400" />
                <span>{t.forks}</span>
              </div>
              {renderCompareBar(repo1.forks_count, repo2.forks_count)}
            </div>

            {/* Open Issues Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-fg">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>{t.issues}</span>
              </div>
              {renderCompareBar(repo1.open_issues_count, repo2.open_issues_count)}
            </div>

            {/* Repo Size Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-fg">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>{t.size}</span>
              </div>
              {renderCompareBar(repo1.size, repo2.size, (s) => formatSize(s))}
            </div>

            {/* Detail Comparison Table */}
            <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              {/* Language */}
              <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                <span className="text-muted block font-medium">{t.language}</span>
                <div className="flex justify-between font-bold pt-1">
                  <span style={{ color: getLangColor(repo1.language) }}>{repo1.language || 'N/A'}</span>
                  <span style={{ color: getLangColor(repo2.language) }}>{repo2.language || 'N/A'}</span>
                </div>
              </div>

              {/* License */}
              <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                <span className="text-muted block font-medium">{t.license}</span>
                <div className="flex justify-between font-bold pt-1">
                  <span className="truncate pr-1">{repo1.license?.name || 'Open Source'}</span>
                  <span className="truncate pl-1">{repo2.license?.name || 'Open Source'}</span>
                </div>
              </div>

              {/* Created Date */}
              <div className="p-3 bg-canvas rounded-xl border border-border space-y-1">
                <span className="text-muted block font-medium">{t.created}</span>
                <div className="flex justify-between font-bold pt-1">
                  <span>{formatDate(repo1.created_at, language)}</span>
                  <span>{formatDate(repo2.created_at, language)}</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
