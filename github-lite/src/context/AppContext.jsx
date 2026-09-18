import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onRateLimitChange,
  getCurrentRateLimit,
  fetchRateLimit,
  getAuthenticatedUser,
  getUserProfile,
  getUserStarredRepos,
  starRepoOnGithub,
  unstarRepoOnGithub,
} from '../services/githubApi';

const AppContext = createContext();

const STORAGE_KEYS = {
  BOOKMARKS: 'gh_lite_bookmarks',
  TOKEN: 'gh_lite_token',
  USER: 'gh_lite_user',
  THEME: 'gh_lite_theme',
  LANG: 'gh_lite_lang',
  HISTORY: 'gh_lite_history',
};

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('trending'); // 'trending', 'search', 'repo', 'user', 'bookmarks', 'compare'
  const [viewParams, setViewParams] = useState({});
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem(STORAGE_KEYS.LANG) || 'ru');
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [rateLimit, setRateLimit] = useState(getCurrentRateLimit());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [quickReadmeModal, setQuickReadmeModal] = useState({ isOpen: false, repo: null });
  const [issueDetailModal, setIssueDetailModal] = useState({ isOpen: false, issue: null, repoFullName: '' });
  const [repoWebsiteModal, setRepoWebsiteModal] = useState({ isOpen: false, repo: null, filePath: '' });
  const [toast, setToast] = useState(null);

  // GitHub remote stars
  const [githubStars, setGithubStars] = useState([]);
  const [loadingGithubStars, setLoadingGithubStars] = useState(false);

  // Local Bookmarks in localStorage
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Recent history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync theme changes to DOM
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.classList.remove('theme-dark', 'theme-dimmed', 'theme-light');
    document.documentElement.classList.add(`theme-${theme}`);
    if (theme === 'light') {
      document.documentElement.style.colorScheme = 'light';
    } else {
      document.documentElement.style.colorScheme = 'dark';
    }
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  // Sync token & user
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    fetchRateLimit(token);
  }, [token, currentUser]);

  // Auto-verify token on start if token exists
  useEffect(() => {
    if (token && !currentUser) {
      getAuthenticatedUser(token)
        .then((user) => {
          setCurrentUser(user);
        })
        .catch(() => {
          // Token invalid, keep existing user or clear
        });
    }
  }, [token]);

  // Sync bookmarks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Sync history
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  }, [history]);

  // Subscribe to rate limit updates
  useEffect(() => {
    const unsubscribe = onRateLimitChange((info) => {
      setRateLimit({ ...info });
    });
    fetchRateLimit(token);
    return unsubscribe;
  }, [token]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const navigateTo = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openRepo = (owner, repo, tab = 'readme') => {
    const fullName = `${owner}/${repo}`;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.full_name !== fullName);
      return [{ full_name: fullName, owner, repo, visitedAt: Date.now() }, ...filtered].slice(0, 15);
    });
    navigateTo('repo', { owner, repo, tab });
  };

  const openUser = (username) => {
    navigateTo('user', { username });
  };

  const openSearch = (query, type = 'repos') => {
    navigateTo('search', { query, type });
  };

  // Login using Personal Access Token
  const loginWithToken = async (newToken) => {
    try {
      const user = await getAuthenticatedUser(newToken);
      setToken(newToken);
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      showToast(
        language === 'ru'
          ? `Добро пожаловать, ${user.login}! Лимит 5000/час активирован 🚀`
          : `Welcome, ${user.login}! 5000 req/hr activated 🚀`,
        'success'
      );
      fetchGithubStars(newToken, user.login);
      return { success: true, user };
    } catch (err) {
      showToast(
        language === 'ru'
          ? 'Ошибка авторизации. Проверьте правильность токена.'
          : 'Authentication failed. Check your token.',
        'error'
      );
      return { success: false, error: err.message };
    }
  };

  // Login without token (Just username preview mode)
  const loginByUsername = async (username) => {
    try {
      const user = await getUserProfile(username);
      setCurrentUser(user);
      setIsLoginModalOpen(false);
      showToast(
        language === 'ru'
          ? `Профиль @${user.login} подключен!`
          : `Profile @${user.login} connected!`,
        'success'
      );
      fetchGithubStars('', user.login);
      return { success: true, user };
    } catch (err) {
      showToast(language === 'ru' ? 'Пользователь не найден' : 'User not found', 'error');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken('');
    setCurrentUser(null);
    setGithubStars([]);
    showToast(language === 'ru' ? 'Вы вышли из аккаунта' : 'Signed out', 'info');
  };

  const fetchGithubStars = async (activeToken = token, activeUsername = currentUser?.login) => {
    if (!activeToken && !activeUsername) return;
    setLoadingGithubStars(true);
    try {
      const stars = await getUserStarredRepos(activeUsername, activeToken);
      setGithubStars(stars);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoadingGithubStars(false);
    }
  };

  const toggleBookmark = async (repo, customTag = '') => {
    const exists = bookmarks.some((b) => b.id === repo.id || b.full_name === repo.full_name);
    
    // Also star on GitHub if token is active
    if (token && repo.owner?.login && repo.name) {
      if (exists) {
        unstarRepoOnGithub(repo.owner.login, repo.name, token);
      } else {
        starRepoOnGithub(repo.owner.login, repo.name, token);
      }
    }

    if (exists) {
      setBookmarks((prev) => prev.filter((b) => b.id !== repo.id && b.full_name !== repo.full_name));
      showToast(language === 'ru' ? 'Удалено из закладок' : 'Removed from bookmarks', 'info');
    } else {
      const newBookmark = {
        id: repo.id || Date.now(),
        full_name: repo.full_name,
        name: repo.name,
        owner: repo.owner,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        homepage: repo.homepage,
        has_pages: repo.has_pages,
        default_branch: repo.default_branch || 'main',
        tags: customTag ? [customTag] : [],
        addedAt: Date.now(),
      };
      setBookmarks((prev) => [newBookmark, ...prev]);
      showToast(language === 'ru' ? 'Добавлено в закладки ⭐' : 'Saved to bookmarks ⭐', 'success');
    }
  };

  const isBookmarked = (repoOrId) => {
    if (typeof repoOrId === 'number') {
      return bookmarks.some((b) => b.id === repoOrId);
    }
    if (typeof repoOrId === 'string') {
      return bookmarks.some((b) => b.full_name === repoOrId);
    }
    if (repoOrId && typeof repoOrId === 'object') {
      return bookmarks.some((b) => b.id === repoOrId.id || b.full_name === repoOrId.full_name);
    }
    return false;
  };

  const updateBookmarkTags = (repoId, tags) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === repoId ? { ...b, tags } : b))
    );
  };

  const openQuickReadme = (repo) => {
    setQuickReadmeModal({ isOpen: true, repo });
  };

  const closeQuickReadme = () => {
    setQuickReadmeModal({ isOpen: false, repo: null });
  };

  const openIssueDetail = (issue, repoFullName) => {
    setIssueDetailModal({ isOpen: true, issue, repoFullName });
  };

  const closeIssueDetail = () => {
    setIssueDetailModal({ isOpen: false, issue: null, repoFullName: '' });
  };

  const openRepoWebsite = (repo, filePath = '') => {
    setRepoWebsiteModal({ isOpen: true, repo, filePath });
  };

  const closeRepoWebsite = () => {
    setRepoWebsiteModal({ isOpen: false, repo: null, filePath: '' });
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        viewParams,
        theme,
        setTheme,
        language,
        setLanguage,
        token,
        setToken,
        currentUser,
        isLoggedIn: !!currentUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginWithToken,
        loginByUsername,
        logout,
        githubStars,
        loadingGithubStars,
        fetchGithubStars,
        rateLimit,
        bookmarks,
        setBookmarks,
        history,
        isSettingsOpen,
        setIsSettingsOpen,
        quickReadmeModal,
        issueDetailModal,
        repoWebsiteModal,
        openRepoWebsite,
        closeRepoWebsite,
        toast,
        navigateTo,
        openRepo,
        openUser,
        openSearch,
        toggleBookmark,
        isBookmarked,
        updateBookmarkTags,
        openQuickReadme,
        closeQuickReadme,
        openIssueDetail,
        closeIssueDetail,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
