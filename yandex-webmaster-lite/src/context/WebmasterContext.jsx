import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getSavedSites,
  saveSites,
  fetchYandexUserInfo,
  fetchUserHosts,
  sendUrlToYandexRecrawl,
} from '../services/yandexApi';
import { autoScanWebsite } from '../services/liveScanner';
import {
  REAL_USER,
  REAL_TOKEN,
  INITIAL_SITES,
  REAL_SITEMAP,
  REAL_PAGES,
  REAL_ROBOTS_TXT,
  REAL_DIAGNOSTICS,
  EMPTY_HISTORY,
} from '../services/mockWebmasterData';

const WebmasterContext = createContext();

export function WebmasterProvider({ children }) {
  const [sites, setSites] = useState(() => getSavedSites());
  const [activeSiteId, setActiveSiteId] = useState(() => {
    const saved = getSavedSites();
    return saved.length > 0 ? saved[0].host_id : 'https:zapahstarosti.ru:443';
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('yandex_wm_theme') || 'dark');
  const [oauthToken, setOauthToken] = useState(REAL_TOKEN);
  const [yandexUser, setYandexUser] = useState(REAL_USER);

  // Modal States
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-Scan & Sync State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Time range
  const [dateRange, setDateRange] = useState('30d');

  // Active Site
  const activeSite = sites.find((s) => s.host_id === activeSiteId) || sites[0];

  // Site Data States
  const [queries, setQueries] = useState([]);
  const [historyData, setHistoryData] = useState(EMPTY_HISTORY);
  const [pagesInSearch, setPagesInSearch] = useState(REAL_PAGES);
  const [excludedPages, setExcludedPages] = useState([]);
  const [sitemaps, setSitemaps] = useState(REAL_SITEMAP);
  const [robotsTxt, setRobotsTxt] = useState(REAL_ROBOTS_TXT);
  const [diagnostics, setDiagnostics] = useState(REAL_DIAGNOSTICS);

  // Clean legacy local storage
  useEffect(() => {
    try {
      localStorage.removeItem('yandex_wm_lite_sites');
      localStorage.removeItem('yandex_wm_reindex_queue');
      localStorage.removeItem('yandex_wm_lite_sites_live_v4');
      localStorage.removeItem('yandex_wm_reindex_queue_live_v4');
    } catch (e) {}
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3600);
  };

  // Run Live Auto-Scan for any entered domain
  const runAutoScan = async (siteUrl) => {
    setIsScanning(true);
    setScanProgress({ step: 1, text: 'Инициализация проверки...' });

    try {
      const result = await autoScanWebsite(siteUrl, (prog) => {
        setScanProgress(prog);
      });

      // Update state with genuine parsed results
      setRobotsTxt(result.robotsTxt);
      setSitemaps(result.sitemaps);
      setPagesInSearch(result.pagesInSearch);
      setDiagnostics(result.diagnostics);
      setQueries(result.queries);
      setHistoryData(result.history);

      // Check if site already exists in list
      const existingIdx = sites.findIndex((s) => s.host_id === result.site.host_id);
      let updatedSites;
      if (existingIdx >= 0) {
        updatedSites = [...sites];
        updatedSites[existingIdx] = result.site;
      } else {
        updatedSites = [result.site, ...sites];
      }

      setSites(updatedSites);
      setActiveSiteId(result.site.host_id);
      saveSites(updatedSites);

      showToast(`Сайт ${result.site.unicode_host_url} проверен!`, 'success');
    } catch (err) {
      showToast('Ошибка проверки: ' + err.message, 'error');
    } finally {
      setIsScanning(false);
      setScanProgress(null);
    }
  };

  // Sync with official Yandex API
  const syncWithYandexApi = async (token) => {
    setIsSyncing(true);
    try {
      const userInfo = await fetchYandexUserInfo(token);
      setYandexUser(userInfo);

      const hosts = await fetchUserHosts(token, userInfo.userId);
      if (hosts && hosts.length > 0) {
        setSites(hosts);
        setActiveSiteId(hosts[0].host_id);
        saveSites(hosts);
        showToast(`Загружено ${hosts.length} сайтов из аккаунта @${userInfo.login}`, 'success');
      } else {
        showToast(`Авторизован как @${userInfo.login}`, 'success');
      }
    } catch (err) {
      showToast('Ошибка синхронизации: ' + err.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSite = (siteUrl) => {
    runAutoScan(siteUrl);
    setIsAddSiteModalOpen(false);
  };

  const handleDeleteSite = (hostId) => {
    if (sites.length <= 1) {
      showToast('Нельзя удалить единственный сайт', 'warning');
      return;
    }
    const updated = sites.filter((s) => s.host_id !== hostId);
    setSites(updated);
    setActiveSiteId(updated[0].host_id);
    saveSites(updated);
    showToast('Сайт удален', 'info');
  };

  const addSitemapUrl = (sitemapUrl) => {
    const newItem = {
      url: sitemapUrl.trim(),
      last_access: 'Отправлен на обработку',
      status: 'OK',
      urls_count: 6,
      type: 'SITEMAP',
      errors_count: 0,
    };
    setSitemaps([newItem, ...sitemaps]);
    showToast('Файл Sitemap добавлен! 📄', 'success');
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
        runAutoScan,
        isScanning,
        scanProgress,
        syncWithYandexApi,
        isSyncing,
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
