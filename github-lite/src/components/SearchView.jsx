import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { searchRepositories, searchUsers } from '../services/githubApi';
import { getLangColor } from '../utils/githubColors';
import { formatNumber, formatRelativeTime } from '../utils/formatters';
import {
  Search,
  Users,
  FolderGit2,
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowRight,
  X,
  Globe,
  Play,
} from 'lucide-react';

const SUGGESTIONS = [
  'awesome-python',
  'ai agent',
  'telegram bot',
  'deepseek',
  'react-components',
  'rust-cli',
  'fastapi',
  'nextjs',
  'vite',
  'tailwind',
];

const LANGUAGES = [
  'All',
  'JavaScript',
  'TypeScript',
  'Python',
  'Rust',
  'Go',
  'C++',
  'C#',
  'Java',
  'PHP',
  'Swift',
  'Kotlin',
  'Dart',
];

export default function SearchView() {
  const {
    viewParams,
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

  const [query, setQuery] = useState(viewParams.query || 'react');
  const [searchType, setSearchType] = useState(viewParams.type || 'repos'); // 'repos' | 'users'
  const [selectedLang, setSelectedLang] = useState('');
  const [sortBy, setSortBy] = useState('stars'); // 'stars' | 'forks' | 'updated'
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ total_count: 0, items: [] });
  const [copiedId, setCopiedId] = useState(null);

  const t = {
    ru: {
      searchTitle: 'Поиск по GitHub',
      searchSubtitle: 'Находите репозитории, открытые библиотеки и профили разработчиков за секунды.',
      tabRepos: 'Репозитории',
      tabUsers: 'Разработчики и Организации',
      placeholderRepos: 'Например: fast api, deepseek, telegram bot...',
      placeholderUsers: 'Например: torvalds, gaearon, antfu...',
      searchBtn: 'Найти',
      found: 'Найдено результатов:',
      allLangs: 'Все языки',
      sortStars: 'Больше всего звёзд',
      sortForks: 'Больше всего форков',
      sortUpdated: 'Недавно обновленные',
      quickReadme: 'Быстрый README',
      viewDetails: 'Открыть',
      openWebsite: '🌐 Сайт из репозитория',
      starred: 'В закладках',
      star: 'В закладки',
      copied: 'Ссылка скопирована',
      copyLink: 'Скопировать ссылку',
      openGithub: 'На GitHub',
      noResults: 'По вашему запросу ничего не найдено.',
      trySuggestions: 'Попробуйте один из популярных запросов:',
      prevPage: 'Назад',
      nextPage: 'Вперед',
      followers: 'подписчиков',
      publicRepos: 'репозиториев',
    },
    en: {
      searchTitle: 'GitHub Search',
      searchSubtitle: 'Find repositories, open-source libraries, and developer profiles in seconds.',
      tabRepos: 'Repositories',
      tabUsers: 'Developers & Orgs',
      placeholderRepos: 'E.g., fast api, deepseek, telegram bot...',
      placeholderUsers: 'E.g., torvalds, gaearon, antfu...',
      searchBtn: 'Search',
      found: 'Results found:',
      allLangs: 'All Languages',
      sortStars: 'Most Stars',
      sortForks: 'Most Forks',
      sortUpdated: 'Recently Updated',
      quickReadme: 'Quick README',
      viewDetails: 'Open',
      openWebsite: '🌐 In-Repo Website',
      starred: 'Saved',
      star: 'Save',
      copied: 'Link copied',
      copyLink: 'Copy link',
      openGithub: 'On GitHub',
      noResults: 'No results found for your query.',
      trySuggestions: 'Try one of the suggested queries:',
      prevPage: 'Prev',
      nextPage: 'Next',
      followers: 'followers',
      publicRepos: 'repos',
    },
  }[language];

  useEffect(() => {
    if (viewParams.query && viewParams.query !== query) {
      setQuery(viewParams.query);
      setPage(1);
    }
  }, [viewParams.query]);

  const executeSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      if (searchType === 'repos') {
        let finalQuery = query.trim();
        if (selectedLang && selectedLang !== 'All') {
          finalQuery += ` language:${selectedLang}`;
        }
        const data = await searchRepositories(finalQuery, sortBy, 'desc', page, 20, token);
        setResults(data || { total_count: 0, items: [] });
      } else {
        const data = await searchUsers(query.trim(), page, 20, token);
        setResults(data || { total_count: 0, items: [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [searchType, selectedLang, sortBy, page]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    executeSearch();
  };

  const handleCopy = (item) => {
    navigator.clipboard.writeText(item.html_url || `https://github.com/${item.full_name || item.login}`);
    setCopiedId(item.id);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header section */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-fg flex items-center gap-2.5">
          <Search className="w-7 h-7 text-indigo-400" />
          <span>{t.searchTitle}</span>
        </h1>
        <p className="text-sm text-muted">{t.searchSubtitle}</p>
      </div>

      {/* Main Search Input & Mode Tabs */}
      <div className="bg-canvas-subtle p-4 sm:p-5 rounded-2xl border border-border space-y-4 shadow-sm">
        
        {/* Switcher Tab */}
        <div className="flex items-center gap-2 p-1 bg-canvas rounded-xl border border-border w-fit">
          <button
            onClick={() => {
              setSearchType('repos');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              searchType === 'repos'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-muted hover:text-fg'
            }`}
          >
            <FolderGit2 className="w-4 h-4" />
            <span>{t.tabRepos}</span>
          </button>

          <button
            onClick={() => {
              setSearchType('users');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              searchType === 'users'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-muted hover:text-fg'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t.tabUsers}</span>
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'repos' ? t.placeholderRepos : t.placeholderUsers}
              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-canvas border border-border text-fg placeholder-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{t.searchBtn}</span>
          </button>
        </form>

        {/* Filters (for Repos) */}
        {searchType === 'repos' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/70 text-xs">
            {/* Language filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted" />
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-canvas border border-border text-fg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">{t.allLangs}</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort filter */}
            <div className="flex items-center gap-2">
              <span className="text-muted">Сортировка:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-canvas border border-border text-fg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="stars">{t.sortStars}</option>
                <option value="forks">{t.sortForks}</option>
                <option value="updated">{t.sortUpdated}</option>
              </select>
            </div>
          </div>
        )}

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-muted font-medium">{t.trySuggestions}</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s);
                setSearchType('repos');
                setPage(1);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] bg-canvas hover:bg-canvas-muted text-muted hover:text-indigo-400 border border-border transition-colors cursor-pointer"
            >
              #{s}
            </button>
          ))}
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {t.found} <strong className="text-fg">{formatNumber(results.total_count)}</strong>
        </span>
        {results.total_count > 20 && (
          <span>Страница {page}</span>
        )}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-canvas-subtle border border-border animate-pulse space-y-3"
            >
              <div className="h-4 bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
              <div className="h-10 bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : results.items.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-canvas-subtle rounded-xl border border-border">
          <Search className="w-12 h-12 text-muted mx-auto" />
          <p className="text-base text-muted">{t.noResults}</p>
        </div>
      ) : searchType === 'repos' ? (
        /* Repository Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.items.map((repo) => {
            const isSaved = isBookmarked(repo);
            const ownerLogin = repo.owner?.login || repo.full_name?.split('/')[0] || '';
            const repoName = repo.name || repo.full_name?.split('/')[1] || '';
            const websiteUrl = getWebsiteUrl(repo);

            return (
              <div
                key={repo.id || repo.full_name}
                className="group flex flex-col justify-between p-5 rounded-xl bg-canvas-subtle hover:bg-canvas-muted/70 border border-border hover:border-indigo-500/40 transition-all duration-200"
              >
                <div>
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

                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {repo.topics.slice(0, 3).map((top) => (
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

                <div className="pt-4 mt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 text-xs">
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
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>{formatNumber(repo.stargazers_count)}</span>
                    </div>
                    {repo.forks_count > 0 && (
                      <div className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        <span>{formatNumber(repo.forks_count)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Website Modal */}
                    <button
                      onClick={() => openRepoWebsite(repo)}
                      title={t.openWebsite}
                      className="p-1.5 rounded-md text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-800/40 transition-colors cursor-pointer"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => openQuickReadme(repo)}
                      title={t.quickReadme}
                      className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-canvas border border-border transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopy(repo)}
                      title={t.copyLink}
                      className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-canvas border border-border transition-colors cursor-pointer"
                    >
                      {copiedId === repo.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

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
      ) : (
        /* Users List Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.items.map((usr) => (
            <div
              key={usr.id || usr.login}
              className="p-5 rounded-xl bg-canvas-subtle hover:bg-canvas-muted/70 border border-border hover:border-indigo-500/40 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={usr.avatar_url || `https://github.com/${usr.login}.png`}
                  alt={usr.login}
                  className="w-12 h-12 rounded-full border border-border bg-slate-900 shrink-0 cursor-pointer hover:opacity-80"
                  onClick={() => openUser(usr.login)}
                />
                <div className="min-w-0">
                  <h3
                    onClick={() => openUser(usr.login)}
                    className="font-bold text-sm text-fg hover:text-indigo-400 truncate cursor-pointer transition-colors"
                  >
                    {usr.login}
                  </h3>
                  <span className="text-xs text-muted">{usr.type || 'Developer'}</span>
                </div>
              </div>

              <button
                onClick={() => openUser(usr.login)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                {t.viewDetails}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {results.total_count > 20 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-canvas-subtle border border-border text-xs font-medium text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-muted transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.prevPage}</span>
          </button>

          <span className="px-3 py-1 text-xs font-bold text-indigo-400 bg-indigo-600/10 rounded-md border border-indigo-500/20">
            {page}
          </span>

          <button
            disabled={results.items.length < 20}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-canvas-subtle border border-border text-xs font-medium text-fg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-canvas-muted transition-colors cursor-pointer"
          >
            <span>{t.nextPage}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
