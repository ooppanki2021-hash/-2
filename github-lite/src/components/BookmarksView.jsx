import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLangColor } from '../utils/githubColors';
import { formatNumber, formatDate } from '../utils/formatters';
import {
  Bookmark,
  Star,
  Trash2,
  Download,
  Upload,
  Search,
  Tag,
  FolderGit2,
  ExternalLink,
  ArrowRight,
  Eye,
  Plus,
  X,
  Sparkles,
  RefreshCw,
  User,
  Zap,
  Globe,
  Play,
} from 'lucide-react';

export default function BookmarksView() {
  const {
    bookmarks,
    setBookmarks,
    toggleBookmark,
    updateBookmarkTags,
    openRepo,
    openQuickReadme,
    openRepoWebsite,
    showToast,
    language,
    navigateTo,
    currentUser,
    isLoggedIn,
    token,
    githubStars,
    loadingGithubStars,
    fetchGithubStars,
    setIsLoginModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState('local'); // 'local' | 'github'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [newTagInput, setNewTagInput] = useState('');
  const [activeRepoForTag, setActiveRepoForTag] = useState(null);

  const t = {
    ru: {
      title: 'Моя коллекция',
      subtitle: 'Управляйте сохраненными закладками и синхронизируйте ваши звёзды на GitHub.',
      tabLocal: '📌 Локальные закладки',
      tabGithub: '⭐ Звёзды на GitHub',
      allTags: 'Все теги',
      searchPlaceholder: 'Поиск по проектам...',
      emptyTitle: 'Закладок пока нет',
      emptySubtitle: 'Нажимайте на звёздочку ⭐ рядом с любым проектом, чтобы сохранить его здесь.',
      exploreBtn: 'Найти интересные проекты',
      exportJson: 'Экспорт JSON',
      importJson: 'Импорт JSON',
      clearAll: 'Очистить всё',
      clearConfirm: 'Вы уверены, что хотите удалить все закладки?',
      addTag: 'Добавить тег',
      tagPlaceholder: 'Название тега...',
      removeBookmark: 'Удалить из закладок',
      quickReadme: 'Быстрый README',
      viewDetails: 'Открыть',
      openWebsite: '🌐 Сайт из репозитория',
      notLoggedInTitle: 'Синхронизация звёзд с GitHub',
      notLoggedInDesc: 'Войдите в свой аккаунт через Personal Access Token или логин, чтобы увидеть все ваши избранные репозитории с github.com.',
      loginBtn: 'Войти в аккаунт',
      refreshStars: 'Обновить звёзды',
    },
    en: {
      title: 'My Collection',
      subtitle: 'Manage local bookmarks and synchronize your starred GitHub repositories.',
      tabLocal: '📌 Local Bookmarks',
      tabGithub: '⭐ GitHub Stars',
      allTags: 'All Tags',
      searchPlaceholder: 'Filter saved projects...',
      emptyTitle: 'No bookmarks yet',
      emptySubtitle: 'Click the star icon ⭐ on any repository to bookmark it here.',
      exploreBtn: 'Explore Trending Projects',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      clearAll: 'Clear All',
      clearConfirm: 'Are you sure you want to delete all bookmarks?',
      addTag: 'Add tag',
      tagPlaceholder: 'Tag name...',
      removeBookmark: 'Remove bookmark',
      quickReadme: 'Quick README',
      viewDetails: 'Open',
      openWebsite: '🌐 In-Repo Website',
      notLoggedInTitle: 'Sync GitHub Starred Repositories',
      notLoggedInDesc: 'Sign in to your GitHub account via Token or Username to view and browse all your starred repositories.',
      loginBtn: 'Sign In to GitHub',
      refreshStars: 'Refresh Stars',
    },
  }[language];

  // Auto-fetch stars when switching to github tab
  useEffect(() => {
    if (activeTab === 'github' && isLoggedIn && githubStars.length === 0) {
      fetchGithubStars();
    }
  }, [activeTab, isLoggedIn]);

  const allTags = Array.from(new Set(bookmarks.flatMap((b) => b.tags || [])));

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      !searchQuery.trim() ||
      b.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'all' || (b.tags && b.tags.includes(selectedTag));

    return matchesSearch && matchesTag;
  });

  const filteredGithubStars = githubStars.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `github-lite-bookmarks-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(language === 'ru' ? 'Закладки экспортированы' : 'Bookmarks exported', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          const existingIds = new Set(bookmarks.map((b) => b.id || b.full_name));
          const newItems = imported.filter((item) => !existingIds.has(item.id || item.full_name));
          setBookmarks([...newItems, ...bookmarks]);
          showToast(
            language === 'ru'
              ? `Импортировано ${newItems.length} закладок`
              : `Imported ${newItems.length} bookmarks`,
            'success'
          );
        }
      } catch (err) {
        showToast(language === 'ru' ? 'Ошибка чтения JSON' : 'Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleAddTag = (repoId) => {
    if (!newTagInput.trim()) return;
    const repo = bookmarks.find((b) => b.id === repoId);
    if (repo) {
      const currentTags = repo.tags || [];
      if (!currentTags.includes(newTagInput.trim())) {
        updateBookmarkTags(repoId, [...currentTags, newTagInput.trim()]);
      }
    }
    setNewTagInput('');
    setActiveRepoForTag(null);
  };

  const handleRemoveTag = (repoId, tagToRemove) => {
    const repo = bookmarks.find((b) => b.id === repoId);
    if (repo) {
      updateBookmarkTags(
        repoId,
        (repo.tags || []).filter((t) => t !== tagToRemove)
      );
    }
  };

  const handleClearAll = () => {
    if (window.confirm(t.clearConfirm)) {
      setBookmarks([]);
      showToast(language === 'ru' ? 'Все закладки удалены' : 'All bookmarks cleared', 'info');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-fg flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-amber-400 fill-amber-400/20" />
            <span>{t.title}</span>
          </h1>
          <p className="text-sm text-muted mt-1">{t.subtitle}</p>
        </div>

        {/* Action buttons: Export / Import / Clear */}
        {bookmarks.length > 0 && activeTab === 'local' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-semibold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.exportJson}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-semibold transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{t.importJson}</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs: Local Bookmarks vs Real GitHub Stars */}
      <div className="flex items-center justify-between border-b border-border pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('local')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'local'
                ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'text-muted hover:text-fg'
            }`}
          >
            <span>{t.tabLocal}</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-slate-950 font-bold ml-1">
              {bookmarks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === 'github'
                ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'text-muted hover:text-fg'
            }`}
          >
            <span>{t.tabGithub}</span>
            {isLoggedIn && githubStars.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-600 text-white font-bold ml-1">
                {githubStars.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'github' && isLoggedIn && (
          <button
            onClick={() => fetchGithubStars()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingGithubStars ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">{t.refreshStars}</span>
          </button>
        )}
      </div>

      {/* TAB 1: LOCAL BOOKMARKS */}
      {activeTab === 'local' && (
        <>
          {bookmarks.length === 0 ? (
            <div className="text-center py-20 bg-canvas-subtle rounded-2xl border border-border space-y-4">
              <Star className="w-16 h-16 text-amber-400/40 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-fg">{t.emptyTitle}</h3>
                <p className="text-sm text-muted max-w-md mx-auto">{t.emptySubtitle}</p>
              </div>
              <button
                onClick={() => navigateTo('trending')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition-all cursor-pointer shadow"
              >
                {t.exploreBtn}
              </button>
            </div>
          ) : (
            <>
              {/* Filter & Tag Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-canvas-subtle p-4 rounded-xl border border-border">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-canvas border border-border text-fg placeholder-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {allTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedTag('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        selectedTag === 'all'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-canvas text-muted hover:text-fg border border-border'
                      }`}
                    >
                      {t.allTags}
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                          selectedTag === tag
                            ? 'bg-indigo-600 text-white'
                            : 'bg-canvas text-muted hover:text-fg border border-border'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBookmarks.map((repo) => {
                  const ownerLogin = repo.owner?.login || repo.full_name?.split('/')[0] || '';
                  const repoName = repo.name || repo.full_name?.split('/')[1] || '';

                  return (
                    <div
                      key={repo.id || repo.full_name}
                      className="p-5 rounded-xl bg-canvas-subtle hover:bg-canvas-muted/70 border border-border hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={repo.owner?.avatar_url || `https://github.com/${ownerLogin}.png`}
                              alt=""
                              className="w-8 h-8 rounded-lg border border-border bg-slate-900 shrink-0"
                            />
                            <button
                              onClick={() => openRepo(ownerLogin, repoName)}
                              className="font-bold text-base text-fg hover:text-indigo-400 truncate text-left transition-colors cursor-pointer"
                            >
                              {repo.full_name || `${ownerLogin}/${repoName}`}
                            </button>
                          </div>

                          <button
                            onClick={() => toggleBookmark(repo)}
                            title={t.removeBookmark}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-muted mt-2 line-clamp-2">
                          {repo.description || 'Без описания'}
                        </p>

                        {/* Custom Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          {repo.tags &&
                            repo.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              >
                                <span>#{tag}</span>
                                <button
                                  onClick={() => handleRemoveTag(repo.id, tag)}
                                  className="hover:text-white"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}

                          {activeRepoForTag === repo.id ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="text"
                                value={newTagInput}
                                onChange={(e) => setNewTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag(repo.id)}
                                placeholder={t.tagPlaceholder}
                                className="px-2 py-0.5 text-[10px] rounded bg-canvas border border-border text-fg focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleAddTag(repo.id)}
                                className="px-1.5 py-0.5 bg-indigo-600 text-white text-[10px] rounded"
                              >
                                +
                              </button>
                              <button
                                onClick={() => setActiveRepoForTag(null)}
                                className="text-muted text-[10px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveRepoForTag(repo.id);
                                setNewTagInput('');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-muted hover:text-fg bg-canvas border border-border transition-colors cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                              <span>{t.addTag}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3 text-muted">
                          {repo.language && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: getLangColor(repo.language) }}
                              />
                              <span>{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400" />
                            <span>{formatNumber(repo.stargazers_count)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Website Button */}
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
            </>
          )}
        </>
      )}

      {/* TAB 2: GITHUB STARS */}
      {activeTab === 'github' && (
        <div>
          {!isLoggedIn ? (
            <div className="text-center py-16 p-8 bg-canvas-subtle rounded-2xl border border-border space-y-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <Star className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-fg">{t.notLoggedInTitle}</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">{t.notLoggedInDesc}</p>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow cursor-pointer"
              >
                {t.loginBtn}
              </button>
            </div>
          ) : loadingGithubStars ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 rounded-xl bg-canvas-subtle border border-border animate-pulse space-y-3">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-800 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filteredGithubStars.length === 0 ? (
            <div className="text-center py-12 bg-canvas-subtle rounded-2xl border border-border text-muted">
              <Star className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>У вас пока нет звёзд на GitHub или список пуст.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGithubStars.map((repo) => {
                const ownerLogin = repo.owner?.login || repo.full_name?.split('/')[0] || '';
                const repoName = repo.name || repo.full_name?.split('/')[1] || '';

                return (
                  <div
                    key={repo.id || repo.full_name}
                    className="p-5 rounded-xl bg-canvas-subtle hover:bg-canvas-muted/70 border border-border hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={repo.owner?.avatar_url || `https://github.com/${ownerLogin}.png`}
                            alt=""
                            className="w-8 h-8 rounded-lg border border-border bg-slate-900 shrink-0"
                          />
                          <button
                            onClick={() => openRepo(ownerLogin, repoName)}
                            className="font-bold text-base text-fg hover:text-indigo-400 truncate text-left transition-colors cursor-pointer"
                          >
                            {repo.full_name}
                          </button>
                        </div>

                        <span className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400">
                          <Star className="w-4 h-4 fill-amber-400" />
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-muted mt-2 line-clamp-2">
                        {repo.description || 'Без описания'}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/70 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3 text-muted">
                        {repo.language && (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: getLangColor(repo.language) }}
                            />
                            <span>{repo.language}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-amber-400" />
                          <span>{formatNumber(repo.stargazers_count)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
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
      )}

    </div>
  );
}
