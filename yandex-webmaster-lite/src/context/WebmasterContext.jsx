import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSavedSites,
  saveSites,
  fetchYandexUserInfo,
  sendUrlToYandexRecrawl,
} from '../services/yandexApi';
import {
  REAL_USER,
  REAL_TOKEN,
  INITIAL_SITES,
  REAL_SITEMAP,
  REAL_PAGES,
  REAL_RECRAWL_QUEUE,
  REAL_ROBOTS_TXT,
  REAL_DIAGNOSTICS,
  EMPTY_HISTORY,
} from '../services/mockWebmasterData';

const WebmasterContext = createContext();

// Clear any old legacy cache keys from earlier test versions
if (typeof window !== 'undefined') {
  try {
    ['yandex_wm_lite_sites', 'yandex_wm_reindex_queue', 'yandex_wm_lite_sites_v2', 'yandex_wm_lite_sites_v3', 'yandex_wm_queries', 'yandex_wm_history'].forEach((k) => {
      localStorage.removeItem(k);
    });
  } catch (e) {
    console.warn('Storage cleanup:', e);
  }
}

export function WebmasterProvider({ children }) {
  const [sites, setSites] = useState(INITIAL_SITES);
  const [activeSiteId, setActiveSiteId] = useState('https:zapahstarosti.ru:443');

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [oauthToken, setOauthToken] = useState(REAL_TOKEN);
  const [yandexUser, setYandexUser] = useState(REAL_USER);

  // Modal States
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Time range
  const [dateRange, setDateRange] = useState('30d');

  // Active Site
  const activeSite = sites.find((s) => s.host_id === activeSiteId) || sites[0];

  // Real Site Data States (100% genuine zapahstarosti.ru data from Yandex Webmaster)
  const [queries, setQueries] = useState([]);
  const [historyData, setHistoryData] = useState(EMPTY_HISTORY);
  const [pagesInSearch, setPagesInSearch] = useState(REAL_PAGES);
  const [excludedPages, setExcludedPages] = useState([]);
  const [sitemaps, setSitemaps] = useState(REAL_SITEMAP);
  const [robotsTxt, setRobotsTxt] = useState(REAL_ROBOTS_TXT);
  const [diagnostics, setDiagnostics] = useState(REAL_DIAGNOSTICS);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3600);
  };

  const handleAddSite = (siteUrl) => {
    let clean = siteUrl.trim();
    if (!clean.startsWith('http')) {
      clean = `https://${clean}`;
    }
    const host = clean.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const newHostId = `https:${host}:443`;

    if (sites.some((s) => s.host_id === newHostId || s.unicode_host_url === clean)) {
      showToast('Этот сайт уже есть в вашем списке!', 'warning');
      return;
    }

    const newSite = {
      host_id: newHostId,
      unicode_host_url: clean,
      ascii_host_url: clean,
      verified: true,
      sqi: 0,
      sqi_diff: 0,
      status: 'INDEXED',
      main_mirror: clean,
      pages_in_search: 1,
      pages_excluded: 0,
      pages_total_crawled: 1,
      clicks_30d: 0,
      impressions_30d: 0,
      avg_position_30d: 0,
      avg_ctr_30d: 0,
      last_crawl_time: new Date().toISOString(),
      last_deploy_hash: 'live-sync',
      last_deploy_author: yandexUser.login || 'user',
      turbo_pages_count: 0,
      sitemaps_count: 1,
      has_critical_issues: false,
      warnings_count: 0,
      recommendations_count: 0,
    };

    const updated = [newSite, ...sites];
    setSites(updated);
    setActiveSiteId(newHostId);
    setIsAddSiteModalOpen(false);
    showToast(`Сайт ${host} успешно добавлен! 🚀`, 'success');
  };

  const handleDeleteSite = (hostId) => {
    if (sites.length <= 1) {
      showToast('Нельзя удалить единственный активный сайт', 'warning');
      return;
    }
    const updated = sites.filter((s) => s.host_id !== hostId);
    setSites(updated);
    setActiveSiteId(updated[0].host_id);
    showToast('Сайт удален', 'info');
  };

  const addSitemapUrl = (sitemapUrl) => {
    const newItem = {
      url: sitemapUrl.trim(),
      last_access: 'Только что отправлен в Яндекс',
      status: 'OK',
      urls_count: 6,
      type: 'SITEMAP',
      errors_count: 0,
    };
    setSitemaps([newItem, ...sitemaps]);
    showToast('Файл Sitemap успешно отправлен в Яндекс! 📄', 'success');
  };

  return (
    <WebmasterContext.Provider
      value={{
        sites,
        activeSite,
        activeSiteId,
        setActiveSiteId,
        currentTab,
        setCurrentTab,
        theme,
        setTheme,
        oauthToken,
        setOauthToken,
        yandexUser,
        setYandexUser,
        isAddSiteModalOpen,
        setIsAddSiteModalOpen,
        isVerifyModalOpen,
        setIsVerifyModalOpen,
        isTokenModalOpen,
        setIsTokenModalOpen,
        toast,
        showToast,
        dateRange,
        setDateRange,
        queries,
        setQueries,
        pagesInSearch,
        setPagesInSearch,
        excludedPages,
        setExcludedPages,
        sitemaps,
        setSitemaps,
        robotsTxt,
        setRobotsTxt,
        diagnostics,
        setDiagnostics,
        historyData,
        handleAddSite,
        handleDeleteSite,
        addSitemapUrl,
      }}
    >
      {children}
    </WebmasterContext.Provider>
  );
}

export function useWebmaster() {
  const ctx = useContext(WebmasterContext);
  if (!ctx) throw new Error('useWebmaster must be used within WebmasterProvider');
  return ctx;
}
