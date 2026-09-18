import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getUserProfile, getUserRepositories } from '../services/githubApi';
import { getLangColor } from '../utils/githubColors';
import { formatNumber, formatDate } from '../utils/formatters';
import { TwitterIcon } from './Icons';
import {
  Users,
  MapPin,
  Building,
  Globe,
  Calendar,
  FolderGit2,
  Star,
  GitFork,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Eye,
  Search,
} from 'lucide-react';

export default function UserProfileView() {
  const {
    viewParams,
    navigateTo,
    openRepo,
    toggleBookmark,
    isBookmarked,
    openQuickReadme,
    language,
    token,
  } = useApp();

  const username = viewParams.username || 'torvalds';

  const [profile, setProfile] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repoQuery, setRepoQuery] = useState('');
  const [repoSort, setRepoSort] = useState('updated'); // 'updated' | 'stars'

  const t = {
    ru: {
      back: 'Назад',
      followers: 'подписчиков',
      following: 'подписок',
      reposCount: 'репозиториев',
      joined: 'Регистрация:',
      openGithub: 'Профиль на GitHub',
      userRepos: 'Репозитории пользователя',
      searchRepos: 'Поиск по репозиториям...',
      sortUpdated: 'По дате обновления',
      sortStars: 'По количеству звёзд',
      viewDetails: 'Открыть',
      quickReadme: 'Быстрый README',
      noRepos: 'Репозитории не найдены.',
    },
    en: {
      back: 'Back',
      followers: 'followers',
      following: 'following',
      reposCount: 'repositories',
      joined: 'Joined:',
      openGithub: 'View on GitHub',
      userRepos: 'User Repositories',
      searchRepos: 'Filter repositories...',
      sortUpdated: 'Recently updated',
      sortStars: 'Most stars',
      viewDetails: 'Open',
      quickReadme: 'Quick README',
      noRepos: 'No repositories found.',
    },
  }[language];

  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      setLoading(true);
      try {
        const [profileData, reposData] = await Promise.all([
          getUserProfile(username, token),
          getUserRepositories(username, repoSort, token),
        ]);
        if (isMounted) {
          setProfile(profileData);
          setRepos(Array.isArray(reposData) ? reposData : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadUserData();
    return () => {
      isMounted = false;
    };
  }, [username, repoSort, token]);

  const filteredRepos = repos.filter((r) => {
    if (!repoQuery.trim()) return true;
    const q = repoQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('trending')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted hover:text-fg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <a
          href={profile?.html_url || `https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-semibold transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t.openGithub}</span>
        </a>
      </div>

      {/* Profile Card & Info */}
      <div className="p-6 sm:p-8 rounded-2xl bg-canvas-subtle border border-border space-y-6 shadow-sm">
        {loading && !profile ? (
          <div className="flex items-center gap-6 animate-pulse">
            <div className="w-24 h-24 rounded-full bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={profile?.avatar_url || `https://github.com/${username}.png`}
              alt={username}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-border bg-slate-900 shadow-md shrink-0"
            />

            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h1 className="text-2xl font-extrabold text-fg tracking-tight">
                  {profile?.name || profile?.login}
                </h1>
                <div className="text-sm font-semibold text-indigo-400">@{profile?.login}</div>
              </div>

              {profile?.bio && (
                <p className="text-sm text-muted leading-relaxed max-w-2xl">{profile.bio}</p>
              )}

              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                {profile?.company && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{profile.company}</span>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    <span>{profile.location}</span>
                  </div>
                )}

                {profile?.blog && (
                  <a
                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-400 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{profile.blog}</span>
                  </a>
                )}

                {profile?.twitter_username && (
                  <a
                    href={`https://twitter.com/${profile.twitter_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sky-400 hover:underline"
                  >
                    <TwitterIcon className="w-3.5 h-3.5" />
                    <span>@{profile.twitter_username}</span>
                  </a>
                )}

                {profile?.created_at && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {t.joined} {formatDate(profile.created_at, language)}
                    </span>
                  </div>
                )}
              </div>

              {/* Stats Counters */}
              <div className="flex items-center gap-6 pt-3 border-t border-border/70 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5">
                  <strong className="text-fg font-bold">{formatNumber(profile?.public_repos)}</strong>
                  <span className="text-muted">{t.reposCount}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <strong className="text-fg font-bold">{formatNumber(profile?.followers)}</strong>
                  <span className="text-muted">{t.followers}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <strong className="text-fg font-bold">{formatNumber(profile?.following)}</strong>
                  <span className="text-muted">{t.following}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User's Repositories Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-fg flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            <span>{t.userRepos}</span>
          </h2>

          <div className="flex items-center gap-2">
            {/* Search filter in user repos */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={repoQuery}
                onChange={(e) => setRepoQuery(e.target.value)}
                placeholder={t.searchRepos}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-canvas-subtle border border-border text-fg placeholder-muted focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Sort filter */}
            <select
              value={repoSort}
              onChange={(e) => setRepoSort(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-canvas-subtle border border-border text-fg text-xs focus:outline-none"
            >
              <option value="updated">{t.sortUpdated}</option>
              <option value="stars">{t.sortStars}</option>
            </select>
          </div>
        </div>

        {/* Repos Grid */}
        {filteredRepos.length === 0 ? (
          <div className="text-center py-12 bg-canvas-subtle rounded-2xl border border-border text-muted">
            <FolderGit2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>{t.noRepos}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => {
              const isSaved = isBookmarked(repo);
              const ownerLogin = profile?.login || username;

              return (
                <div
                  key={repo.id || repo.name}
                  className="p-5 rounded-xl bg-canvas-subtle hover:bg-canvas-muted/70 border border-border hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => openRepo(ownerLogin, repo.name)}
                        className="font-bold text-base text-fg hover:text-indigo-400 text-left transition-colors truncate block"
                      >
                        {repo.name}
                      </button>

                      <button
                        onClick={() => toggleBookmark(repo)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-canvas border-border text-muted hover:text-amber-400'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                      </button>
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
                      {repo.forks_count > 0 && (
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5" />
                          <span>{formatNumber(repo.forks_count)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openQuickReadme(repo)}
                        title={t.quickReadme}
                        className="p-1.5 rounded-md text-muted hover:text-fg hover:bg-canvas border border-border transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openRepo(ownerLogin, repo.name)}
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

    </div>
  );
}
