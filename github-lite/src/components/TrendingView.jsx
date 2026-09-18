import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getTrendingRepos } from '../services/githubApi';
import { MOCK_TOPICS } from '../services/mockData';
import { getLangColor } from '../utils/githubColors';
import { formatNumber, formatRelativeTime } from '../utils/formatters';
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Copy,
  Check,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Tag,
  Smartphone,
  Download,
  Globe,
  Play,
} from 'lucide-react';

export default function TrendingView() {
  const {
    openRepo,
    openUser,
    toggleBookmark,
    isBookmarked,
    openQuickReadme,
    openRepoWebsite,
    showToast,
    language,
    token,
  } = useApp();

  const [topic, setTopic] = useState('all');
  const [timeRange, setTimeRange] = useState('weekly');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const t = {
    ru: {
      heroTitle: 'Простой & быстрый GitHub',
      heroSubtitle: 'Исследуйте лучшие открытые проекты, запускайте сайты из репозиториев, читайте документацию и сохраняйте в закладки.',
      trendingTitle: 'Популярные репозитории',
      timeDaily: 'За сутки',
      timeWeekly: 'За неделю',
      timeMonthly: 'За месяц',
      timeAll: 'Все время',
      quickReadme: 'Быстрый README',
      viewDetails: 'Открыть проект',
      starred: 'В закладках',
      star: 'В закладки',
      copied: 'Ссылка скопирована',
      copyLink: 'Скопировать ссылку',
      openGithub: 'На GitHub.com',
      openWebsite: '🌐 Сайт из репозитория',
      empty: 'Репозитории не найдены по выбранным фильтрам.',
      refresh: 'Обновить',
      topicsTitle: 'Темы и языки:',
      downloadApkBanner: '📱 Скачать Android APK',
    },
    en: {
      heroTitle: 'Simple & Fast GitHub',
      heroSubtitle: 'Explore trending open-source projects, launch in-repo websites, read documentation, and bookmark favorites.',
      trendingTitle: 'Trending Repositories',
      timeDaily: 'Today',
      timeWeekly: 'This Week',
      timeMonthly: 'This Month',
      timeAll: 'All Time',
      quickReadme: 'Quick README',
      viewDetails: 'Open Project',
      starred: 'Saved',
      star: 'Save',
      copied: 'Link copied',
      copyLink: 'Copy link',
      openGithub: 'On GitHub.com',
      openWebsite: '🌐 In-Repo Website',
      empty: 'No repositories found for this filter.',
      refresh: 'Refresh',
      topicsTitle: 'Topics & Languages:',
      downloadApkBanner: '📱 Download Android APK',
    },
  }[language];

  const fetchTrendingData = async () => {
    setLoading(true);
    try {
      const data = await getTrendingRepos(topic, timeRange, token);
      setRepos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingData();
  }, [topic, timeRange]);

  const handleCopy = (repo) => {
    navigator.clipboard.writeText(repo.html_url || `https://github.com/${repo.full_name}`);
    setCopiedId(repo.id);
    showToast(t.copied, 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getWebsiteUrl = (repo) => {
    if (repo?.homepage && repo.homepage.trim()) {
      return repo.homepage.startsWith('http') ? repo.homepage.trim() : `https://${repo.homepage.trim()}`;
    }
    if (repo?.has_pages) {
      const [owner, name] = (repo.full_name || '').split('/');
      if (owner && name) return `https://${owner}.github.io/${name}`;
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-900/40 p-6 sm:p-8 backdrop-blur">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>GitHub Lite Experience</span>
            </div>

            <a
              href="./github-lite.apk"
              download="github-lite.apk"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.downloadApkBanner}</span>
            </a>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-fg tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-sm sm:text-base text-muted leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Topics & Filters Bar */}
      <div className="space-y-4">
        {/* Topics horizontal scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-muted shrink-0 hidden sm:inline">
            {t.topicsTitle}
          </span>
          {MOCK_TOPICS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTopic(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                topic === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]'
                  : 'bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border'
              }`}
            >
              <span>{language === 'ru' ? item.labelRu : item.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Time range selector & Refresh header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-fg">{t.trendingTitle}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-0.5 rounded-lg bg-canvas-subtle border border-border text-xs font-medium">
              {[
                { id: 'daily', label: t.timeDaily },
                { id: 'weekly', label: t.timeWeekly },
                { id: 'monthly', label: t.timeMonthly },
                { id: 'all', label: t.timeAll },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setTimeRange(r.id)}
                  className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                    timeRange === r.id
                      ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                      : 'text-muted hover:text-fg'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchTrendingData}
              title={t.refresh}
              className="p-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Repositories List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-canvas-subtle border border-border animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-800 rounded w-full" />
              <div className="flex gap-4 pt-2">
                <div className="h-4 bg-slate-800 rounded w-16" />
                <div className="h-4 bg-slate-800 rounded w-16" />
                <div className="h-4 bg-slate-800 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : repos.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-canvas-subtle rounded-xl border border-border">
          <FolderGit2 className="w-12 h-12 text-muted mx-auto" />
          <p className="text-base text-muted">{t.empty}</p>
          <button
            onClick={() => {
              setTopic('all');
              setTimeRange('all');
            }}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
          >
            {t.refresh}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo) => {
            const isSaved = isBookmarked(repo);
            const ownerLogin = repo.owner?.login || repo.full_name?.split('/')[0] || '';
            const repoName = repo.name || repo.full_name?.split('/')[1] || '';
            const websiteUrl = getWebsiteUrl(repo);

            return (
              <div
                key={repo.id || repo.full_name}
                className="group relative flex flex-col justify-between p-5 rounded-xl bg-canvas-subtle hover:bg-canvas-muted/70 border border-border hover:border-indigo-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Repo Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={repo.owner?.avatar_url || `https://github.com/${ownerLogin}.png`}
                        alt={ownerLogin}
                        className="w-10 h-10 rounded-lg border border-border bg-slate-900 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openUser(ownerLogin)}
                      />
                      <div className="min-w-0">
                        <span
                          onClick={() => openUser(ownerLogin)}
                          className="text-xs text-muted hover:text-indigo-400 cursor-pointer block truncate"
                        >
                          {ownerLogin}
                        </span>
                        <button
                          onClick={() => openRepo(ownerLogin, repoName)}
                          className="font-bold text-base text-fg hover:text-indigo-400 truncate block text-left transition-colors cursor-pointer"
                        >
                          {repoName}
                        </button>
                      </div>
                    </div>

                    {/* Bookmark action */}
                    <button
                      onClick={() => toggleBookmark(repo)}
                      title={isSaved ? t.starred : t.star}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          : 'bg-canvas border-border text-muted hover:text-amber-400 hover:border-amber-500/30'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-muted mt-3 line-clamp-2 leading-relaxed">
                    {repo.description || 'Нет описания проекта.'}
                  </p>

                  {/* Live Website / Homepage / Repo Site Chip */}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => openRepoWebsite(repo)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                      title={t.openWebsite}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{t.openWebsite}</span>
                      <Play className="w-2.5 h-2.5 fill-emerald-400" />
                    </button>

                    {websiteUrl && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-emerald-300 font-mono"
                        title="Прямая ссылка"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[160px]">{websiteUrl.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                  </div>

                  {/* Topics Pills */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {repo.topics.slice(0, 4).map((top) => (
                        <span
                          key={top}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {top}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Language, Stats & Actions */}
                <div className="pt-4 mt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
                  
                  {/* Left: Language & Stats */}
                  <div className="flex items-center gap-3 text-muted">
                    {repo.language && (
                      <div className="flex items-center gap-1.5 font-medium text-fg">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getLangColor(repo.language) }}
                        />
                        <span>{repo.language}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 hover:text-fg transition-colors" title="Stars">
                      <Star className="w-3.5 h-3.5 text-amber-400/80" />
                      <span>{formatNumber(repo.stargazers_count)}</span>
                    </div>

                    {repo.forks_count > 0 && (
                      <div className="flex items-center gap-1 hover:text-fg transition-colors" title="Forks">
                        <GitFork className="w-3.5 h-3.5" />
                        <span>{formatNumber(repo.forks_count)}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* Website Modal Trigger */}
                    <button
                      onClick={() => openRepoWebsite(repo)}
                      title={t.openWebsite}
                      className="p-1.5 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40 transition-colors cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    {/* Quick README preview */}
                    <button
                      onClick={() => openQuickReadme(repo)}
                      title={t.quickReadme}
                      className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-canvas border border-border/80 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy Link */}
                    <button
                      onClick={() => handleCopy(repo)}
                      title={t.copyLink}
                      className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-canvas border border-border/80 transition-colors cursor-pointer"
                    >
                      {copiedId === repo.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Open on GitHub */}
                    <a
                      href={repo.html_url || `https://github.com/${repo.full_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={t.openGithub}
                      className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-canvas border border-border/80 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Open details */}
                    <button
                      onClick={() => openRepo(ownerLogin, repoName)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 font-medium transition-all cursor-pointer text-xs"
                    >
                      <span>{t.viewDetails}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
