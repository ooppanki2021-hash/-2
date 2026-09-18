import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import UploadModal from './UploadModal';
import {
  getRepository,
  getReadme,
  getReleases,
  getIssues,
  getContributors,
  getRepoContents,
  getFileContent,
  uploadOrUpdateFile,
  deleteRepoFile,
  getRepoPages,
  getRepoDeployments,
} from '../services/githubApi';
import { getLangColor } from '../utils/githubColors';
import {
  formatNumber,
  formatSize,
  formatDate,
  formatRelativeTime,
  renderMarkdown,
} from '../utils/formatters';
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Copy,
  Check,
  BookOpen,
  Tag,
  MessageSquare,
  Users,
  Calendar,
  Globe,
  Scale,
  Download,
  Terminal,
  ArrowLeft,
  Share2,
  RefreshCw,
  Info,
  Layers,
  Sparkles,
  GitCompare,
  Folder,
  File,
  Upload,
  FileText,
  FileCode,
  FileImage,
  Trash2,
  Edit3,
  X,
  Plus,
  Lock,
  ChevronRight,
  Save,
  AlertTriangle,
  Play,
  Zap,
  Rocket,
  CheckCircle2,
  Clock,
  ExternalLink as LinkIcon,
} from 'lucide-react';

export default function RepoDetailView() {
  const {
    viewParams,
    navigateTo,
    openUser,
    toggleBookmark,
    isBookmarked,
    openIssueDetail,
    openRepoWebsite,
    showToast,
    language,
    token,
    currentUser,
    setIsLoginModalOpen,
  } = useApp();

  const owner = viewParams.owner || 'facebook';
  const repoName = viewParams.repo || 'react';
  const initialTab = viewParams.tab || 'readme';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [repo, setRepo] = useState(null);
  const [readme, setReadme] = useState('');
  const [releases, setReleases] = useState([]);
  const [issues, setIssues] = useState([]);
  const [issueFilter, setIssueFilter] = useState('open'); // 'open' | 'closed'
  const [contributors, setContributors] = useState([]);
  
  // Deployments & GitHub Pages State
  const [pagesInfo, setPagesInfo] = useState(null);
  const [deployments, setDeployments] = useState([]);
  
  // File Explorer State
  const [currentPath, setCurrentPath] = useState('');
  const [repoFiles, setRepoFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [viewingFile, setViewingFile] = useState(null); // { name, path, content, isEditing, editContent, sha }
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFileObj, setUploadFileObj] = useState(null);
  const [uploadTargetPath, setUploadTargetPath] = useState('');
  const [uploadCommitMsg, setUploadCommitMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [releasesLoading, setReleasesLoading] = useState(false);
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [copiedSiteUrl, setCopiedSiteUrl] = useState(false);

  const isMyRepo = currentUser && currentUser.login?.toLowerCase() === owner?.toLowerCase();
  const defaultBranch = repo?.default_branch || 'main';

  const t = {
    ru: {
      back: 'Назад',
      tabReadme: 'README & Описание',
      tabFiles: '📁 Файлы & Загрузка',
      tabReleases: 'Релизы и загрузки',
      tabIssues: 'Вопросы & Обсуждения',
      tabAbout: 'О проекте & Авторы',
      stars: 'Звёзды',
      forks: 'Форки',
      watchers: 'Наблюдатели',
      issuesCount: 'Открытых вопросов',
      size: 'Размер репозитория',
      license: 'Лицензия',
      created: 'Создан',
      updated: 'Обновлен',
      defaultBranch: 'Основная ветка',
      cloneTitle: 'Клонировать репозиторий',
      copyUrl: 'Скопировать URL',
      copied: 'Скопировано в буфер!',
      openGithub: 'На GitHub.com',
      openWebsiteBtn: '🌐 Перейти на сайт',
      openRepoWebsiteBtn: '🚀 Запустить сайт из репозитория',
      openWebsiteDesc: 'Перейти на живой сайт, документацию или запустить HTML прямо из репозитория',
      compareWith: 'Сравнить этот проект',
      starred: 'В закладках',
      star: 'В закладки',
      noReadme: 'README файл не найден для этого репозитория.',
      noReleases: 'Релизы пока не опубликованы.',
      noIssues: 'Нет вопросов с выбранным статусом.',
      downloads: 'Загрузки и исходный код:',
      assets: 'Файлы релиза:',
      openStatus: 'Открыт',
      closedStatus: 'Закрыт',
      comments: 'коммент.',
      topContributors: 'Ведущие авторы проекта',
      contributions: 'коммитов',
      uploadBtn: 'Загрузить / Перезалить файл',
      uploadTitle: 'Загрузка или замена файла',
      uploadDesc: 'Выберите файл с устройства для добавления или перезаписи в репозитории на GitHub.',
      chooseFile: 'Выберите файл на телефоне/ПК',
      targetPathLabel: 'Путь в репозитории (например: index.js или assets/image.png):',
      commitMsgLabel: 'Комментарий к изменению (commit message):',
      submitUpload: 'Загрузить на GitHub',
      uploading: 'Отправка на GitHub...',
      uploadSuccess: 'Файл успешно загружен на GitHub! 🚀',
      uploadFailed: 'Ошибка загрузки файла',
      noFiles: 'В этой папке нет файлов.',
      editFile: 'Редактировать',
      saveFile: 'Сохранить изменения',
      deleteFile: 'Удалить файл',
      deleteConfirm: 'Вы уверены, что хотите удалить этот файл с GitHub?',
      fileSaved: 'Файл успешно сохранен на GitHub! 💾',
      fileDeleted: 'Файл удален из репозитория',
      authNotice: 'Для перезаливки файлов требуется токен GitHub с правами "repo".',
      loginToUpload: 'Войти для управления файлами',
      runHtmlBtn: '▶️ Запустить этот сайт / HTML',
      runHtmlDesc: 'Открыть интерактивный просмотр этого веб-файла',
      deploymentsTitle: 'Развертывания & GitHub Pages',
      deployActive: 'Активно',
      siteAvailableAt: 'Ваш сайт доступен по адресу',
      lastDeployment: 'Последнее развертывание',
      ago: 'назад',
      openLiveSite: 'Открыть сайт',
      previewInApp: 'Предпросмотр в приложении',
    },
    en: {
      back: 'Back',
      tabReadme: 'README & Docs',
      tabFiles: '📁 Files & Upload',
      tabReleases: 'Releases & Downloads',
      tabIssues: 'Issues & Discussions',
      tabAbout: 'About & Contributors',
      stars: 'Stars',
      forks: 'Forks',
      watchers: 'Watchers',
      issuesCount: 'Open Issues',
      size: 'Repo Size',
      license: 'License',
      created: 'Created',
      updated: 'Updated',
      defaultBranch: 'Default Branch',
      cloneTitle: 'Clone Repository',
      copyUrl: 'Copy URL',
      copied: 'Copied to clipboard!',
      openGithub: 'Open on GitHub.com',
      openWebsiteBtn: '🌐 Open Website',
      openRepoWebsiteBtn: '🚀 Launch In-Repo Website',
      openWebsiteDesc: 'Visit live demo, docs, or launch HTML site directly from this repository',
      compareWith: 'Compare Project',
      starred: 'Saved',
      star: 'Save',
      noReadme: 'No README found for this repository.',
      noReleases: 'No releases published yet.',
      noIssues: 'No issues found with selected status.',
      downloads: 'Downloads & Source:',
      assets: 'Release Assets:',
      openStatus: 'Open',
      closedStatus: 'Closed',
      comments: 'comments',
      topContributors: 'Top Contributors',
      contributions: 'commits',
      uploadBtn: 'Upload / Replace File',
      uploadTitle: 'Upload or Replace File',
      uploadDesc: 'Select a file from your device to upload or overwrite in this GitHub repository.',
      chooseFile: 'Select file from phone/PC',
      targetPathLabel: 'Repository path (e.g. index.js or assets/image.png):',
      commitMsgLabel: 'Commit message:',
      submitUpload: 'Upload to GitHub',
      uploading: 'Uploading to GitHub...',
      uploadSuccess: 'File successfully uploaded to GitHub! 🚀',
      uploadFailed: 'Failed to upload file',
      noFiles: 'No files in this folder.',
      editFile: 'Edit',
      saveFile: 'Save changes',
      deleteFile: 'Delete file',
      deleteConfirm: 'Are you sure you want to delete this file from GitHub?',
      fileSaved: 'File saved to GitHub! 💾',
      fileDeleted: 'File deleted from repository',
      authNotice: 'To upload or edit files, sign in with a Personal Access Token with repo access.',
      loginToUpload: 'Sign In to manage files',
      runHtmlBtn: '▶️ Run this Website / HTML',
      runHtmlDesc: 'Open live preview of this web file',
      deploymentsTitle: 'Deployments & GitHub Pages',
      deployActive: 'Active',
      siteAvailableAt: 'Your site is live at',
      lastDeployment: 'Last deployment',
      ago: 'ago',
      openLiveSite: 'Open Live Site',
      previewInApp: 'Preview in App',
    },
  }[language];

  // Helper to determine the website URL
  const getWebsiteUrl = () => {
    if (pagesInfo?.html_url) {
      return pagesInfo.html_url;
    }
    if (repo?.homepage && repo.homepage.trim()) {
      return repo.homepage.startsWith('http') ? repo.homepage.trim() : `https://${repo.homepage.trim()}`;
    }
    if (repo?.has_pages) {
      return `https://${owner}.github.io/${repoName}/`;
    }
    return `https://${owner}.github.io/${repoName}/`;
  };

  const websiteUrl = getWebsiteUrl();

  // Load Repo Base details, Pages, and Deployments
  useEffect(() => {
    let isMounted = true;
    const loadRepoData = async () => {
      setLoading(true);
      try {
        const repoData = await getRepository(owner, repoName, token);
        if (isMounted) setRepo(repoData);

        // Fetch Pages and Deployments
        getRepoPages(owner, repoName, token).then((pages) => {
          if (isMounted && pages) setPagesInfo(pages);
        });
        getRepoDeployments(owner, repoName, token).then((deps) => {
          if (isMounted && deps) setDeployments(deps);
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadRepoData();
    return () => {
      isMounted = false;
    };
  }, [owner, repoName, token]);

  // Load tab data lazily
  useEffect(() => {
    let isMounted = true;
    if (activeTab === 'readme' && !readme) {
      setReadmeLoading(true);
      getReadme(owner, repoName, token).then((data) => {
        if (isMounted) {
          setReadme(data);
          setReadmeLoading(false);
        }
      });
    } else if (activeTab === 'files') {
      loadFiles(currentPath);
    } else if (activeTab === 'releases' && releases.length === 0) {
      setReleasesLoading(true);
      getReleases(owner, repoName, token).then((data) => {
        if (isMounted) {
          setReleases(data);
          setReleasesLoading(false);
        }
      });
    } else if (activeTab === 'issues') {
      setIssuesLoading(true);
      getIssues(owner, repoName, issueFilter, token).then((data) => {
        if (isMounted) {
          setIssues(data);
          setIssuesLoading(false);
        }
      });
    } else if (activeTab === 'about' && contributors.length === 0) {
      getContributors(owner, repoName, token).then((data) => {
        if (isMounted) setContributors(data);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab, owner, repoName, issueFilter, token]);

  const loadFiles = async (path) => {
    setFilesLoading(true);
    try {
      const items = await getRepoContents(owner, repoName, path, token);
      setRepoFiles(items);
    } catch (err) {
      console.error(err);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleNavigateFolder = (folderPath) => {
    setCurrentPath(folderPath);
    loadFiles(folderPath);
    setViewingFile(null);
  };

  const handleOpenFile = async (fileItem) => {
    try {
      const fileData = await getFileContent(owner, repoName, fileItem.path, token);
      let decodedContent = '';
      if (fileData?.content) {
        try {
          decodedContent = decodeURIComponent(
            escape(atob(fileData.content.replace(/\n/g, '')))
          );
        } catch {
          decodedContent = atob(fileData.content.replace(/\n/g, ''));
        }
      }
      setViewingFile({
        name: fileItem.name,
        path: fileItem.path,
        content: decodedContent,
        editContent: decodedContent,
        isEditing: false,
        sha: fileData?.sha || fileItem.sha,
        size: fileItem.size,
        download_url: fileItem.download_url,
      });
    } catch (err) {
      showToast('Не удалось открыть файл: ' + err.message, 'error');
    }
  };

  const handleSaveEditedFile = async () => {
    if (!viewingFile) return;
    if (!token) {
      setIsLoginModalOpen(true);
      showToast(t.authNotice, 'warning');
      return;
    }
    try {
      const utf8Bytes = unescape(encodeURIComponent(viewingFile.editContent));
      const base64 = btoa(utf8Bytes);

      await uploadOrUpdateFile(
        owner,
        repoName,
        viewingFile.path,
        base64,
        `Update ${viewingFile.name} via GitHub Lite`,
        token,
        repo?.default_branch || 'main'
      );
      showToast(t.fileSaved, 'success');
      setViewingFile({
        ...viewingFile,
        content: viewingFile.editContent,
        isEditing: false,
      });
      loadFiles(currentPath);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteFile = async (fileItem) => {
    if (!token) {
      setIsLoginModalOpen(true);
      showToast(t.authNotice, 'warning');
      return;
    }
    if (!window.confirm(t.deleteConfirm)) return;
    try {
      await deleteRepoFile(
        owner,
        repoName,
        fileItem.path,
        fileItem.sha,
        `Delete ${fileItem.name} via GitHub Lite`,
        token,
        repo?.default_branch || 'main'
      );
      showToast(t.fileDeleted, 'info');
      setViewingFile(null);
      loadFiles(currentPath);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleFileSelectForUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileObj(file);
      const target = currentPath ? `${currentPath}/${file.name}` : file.name;
      setUploadTargetPath(target);
      setUploadCommitMsg(`Upload ${file.name} via GitHub Lite`);
    }
  };

  const handleExecuteUpload = async (e) => {
    e.preventDefault();
    if (!uploadFileObj) {
      showToast('Пожалуйста, выберите файл для загрузки', 'warning');
      return;
    }
    if (!token) {
      setIsUploadModalOpen(false);
      setIsLoginModalOpen(true);
      showToast('Для загрузки файлов на GitHub нужно войти с токеном', 'warning');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onerror = () => {
      setIsUploading(false);
      showToast('Ошибка чтения файла на устройстве', 'error');
    };
    reader.onload = async (event) => {
      try {
        const dataUrl = event.target.result;
        const base64Content = typeof dataUrl === 'string' && dataUrl.includes(',')
          ? dataUrl.split(',')[1]
          : dataUrl;

        await uploadOrUpdateFile(
          owner,
          repoName,
          uploadTargetPath.trim() || uploadFileObj.name,
          base64Content,
          uploadCommitMsg.trim() || `Upload ${uploadFileObj.name} via GitHub Lite`,
          token,
          repo?.default_branch || 'main'
        );

        showToast(t.uploadSuccess, 'success');
        setIsUploadModalOpen(false);
        setUploadFileObj(null);
        setUploadTargetPath('');
        loadFiles(currentPath);
      } catch (err) {
        showToast(`${t.uploadFailed}: ${err.message}`, 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(uploadFileObj);
  };

  const handleCopyClone = () => {
    const cloneUrl = `git clone https://github.com/${owner}/${repoName}.git`;
    navigator.clipboard.writeText(cloneUrl);
    setCopiedClone(true);
    showToast(t.copied, 'success');
    setTimeout(() => setCopiedClone(false), 2000);
  };

  const handleCopySite = () => {
    navigator.clipboard.writeText(websiteUrl);
    setCopiedSiteUrl(true);
    showToast('Адрес сайта скопирован!', 'success');
    setTimeout(() => setCopiedSiteUrl(false), 2000);
  };

  const isSaved = repo ? isBookmarked(repo) : false;

  if (loading && !repo) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-canvas-subtle rounded-lg w-1/4 animate-pulse" />
        <div className="h-32 bg-canvas-subtle rounded-2xl border border-border animate-pulse" />
        <div className="h-96 bg-canvas-subtle rounded-2xl border border-border animate-pulse" />
      </div>
    );
  }

  const renderedReadmeHtml = renderMarkdown(
    readme,
    repo?.full_name || `${owner}/${repoName}`,
    repo?.default_branch || 'main'
  );

  const isHtmlFile = (path = '') => {
    const p = path.toLowerCase();
    return p.endsWith('.html') || p.endsWith('.htm') || p.endsWith('.xhtml');
  };

  // Latest deployment info
  const latestDeployment = deployments.length > 0 ? deployments[0] : null;
  const deployAuthor = latestDeployment?.creator?.login || owner;
  const deploySha = latestDeployment?.sha ? latestDeployment.sha.slice(0, 7) : (repo?.default_branch || 'main');
  const deployTime = latestDeployment?.created_at || repo?.pushed_at || repo?.updated_at;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumbs & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo('trending')}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted hover:text-fg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Compare Button */}
          <button
            onClick={() => navigateTo('compare', { repo1: `${owner}/${repoName}` })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-semibold transition-all cursor-pointer"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.compareWith}</span>
          </button>

          {/* GitHub.com External Link */}
          <a
            href={repo?.html_url || `https://github.com/${owner}/${repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-muted hover:text-fg border border-border text-xs font-semibold transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.openGithub}</span>
          </a>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-canvas-subtle border border-border space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          
          {/* Owner & Repo Name */}
          <div className="flex items-start gap-4 min-w-0">
            <img
              src={repo?.owner?.avatar_url || `https://github.com/${owner}.png`}
              alt={owner}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-border bg-slate-900 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => openUser(owner)}
            />
            <div className="space-y-2.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  onClick={() => openUser(owner)}
                  className="text-sm font-semibold text-muted hover:text-indigo-400 cursor-pointer transition-colors"
                >
                  {owner}
                </span>
                <span className="text-muted">/</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-fg tracking-tight truncate">
                  {repoName}
                </h1>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public
                </span>
              </div>

              <p className="text-sm sm:text-base text-muted leading-relaxed max-w-3xl">
                {repo?.description || 'Нет описания репозитория.'}
              </p>

              {/* WEBSITE & DEPLOYMENT SHORTCUT BUTTONS */}
              <div className="pt-2 flex items-center gap-2.5 flex-wrap">
                
                {/* Primary Button: Open Live Website / Launch Demo */}
                <button
                  onClick={() => openRepoWebsite(repo)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-950/40 transition-all cursor-pointer group"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
                  </span>
                  <Globe className="w-4 h-4" />
                  <span>{t.openRepoWebsiteBtn}</span>
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>

                {/* Direct browser link button */}
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-canvas hover:bg-canvas-muted text-emerald-400 hover:text-emerald-300 border border-emerald-800/50 text-xs font-semibold transition-all"
                  title="Открыть сайт напрямую в новой вкладке"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.openWebsiteBtn}</span>
                </a>

                {/* Online IDE */}
                <a
                  href={`https://github.dev/${owner}/${repoName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-canvas hover:bg-canvas-muted text-indigo-300 hover:text-indigo-200 border border-border text-xs font-semibold transition-all"
                  title="Открыть в GitHub.dev"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">GitHub.dev</span>
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons: Star/Bookmark & Clone */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => repo && toggleBookmark(repo)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  : 'bg-canvas border-border text-muted hover:text-amber-400 hover:border-amber-500/30'
              }`}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
              <span>{isSaved ? t.starred : t.star}</span>
            </button>

            <button
              onClick={handleCopyClone}
              title="git clone URL"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-canvas hover:bg-canvas-muted text-muted hover:text-fg border border-border text-sm font-semibold transition-all cursor-pointer"
            >
              {copiedClone ? <Check className="w-4 h-4 text-emerald-400" /> : <Terminal className="w-4 h-4" />}
              <span className="hidden sm:inline">Clone</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* GITHUB PAGES & DEPLOYMENT WIDGET (EXACT GITHUB INTERFACE) */}
        {/* "Ваш сайт доступен по адресу https://zapahstarosti.ru /" */}
        {/* "Последнее развертывание @user [hash] [time] назад"       */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-slate-900/40 border border-emerald-800/40 shadow-inner space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Status indicator & Title */}
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-fg">
                  {t.deploymentsTitle}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  github-pages • {t.deployActive}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySite}
                title="Скопировать адрес сайта"
                className="p-1.5 rounded-lg bg-canvas hover:bg-canvas-muted text-muted hover:text-fg border border-border transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                {copiedSiteUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Копировать URL</span>
              </button>

              <button
                onClick={() => openRepoWebsite(repo)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>{t.previewInApp}</span>
              </button>
            </div>
          </div>

          {/* Site address & Deployment metadata line */}
          <div className="p-3 bg-canvas/80 rounded-xl border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-fg">
                <span className="text-muted">{t.siteAvailableAt}:</span>
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:text-emerald-300 underline font-mono flex items-center gap-1 break-all"
                >
                  <span>{websiteUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>{t.lastDeployment}</span>
                <span className="font-semibold text-fg">@{deployAuthor}</span>
                <span className="px-1.5 py-0.2 rounded bg-canvas-subtle border border-border font-mono text-[11px] text-indigo-300">
                  {deploySha}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatRelativeTime(deployTime, language)}</span>
                </span>
              </div>
            </div>

            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow whitespace-nowrap cursor-pointer shrink-0"
            >
              <span>{t.openLiveSite}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Topics */}
        {repo?.topics && repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {repo.topics.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border/70 text-xs sm:text-sm">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-canvas border border-border">
            <Star className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-fg">{formatNumber(repo?.stargazers_count)}</div>
              <div className="text-[11px] text-muted">{t.stars}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-canvas border border-border">
            <GitFork className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="font-bold text-fg">{formatNumber(repo?.forks_count)}</div>
              <div className="text-[11px] text-muted">{t.forks}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-canvas border border-border">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-fg">{formatNumber(repo?.open_issues_count)}</div>
              <div className="text-[11px] text-muted">{t.issuesCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-canvas border border-border">
            <Scale className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-fg truncate">
                {repo?.license?.name || repo?.license?.key || 'Open Source'}
              </div>
              <div className="text-[11px] text-muted">{t.license}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('readme')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'readme'
              ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'text-muted hover:text-fg'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{t.tabReadme}</span>
        </button>

        {/* TAB: FILES & UPLOAD */}
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'files'
              ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Folder className="w-4 h-4 text-indigo-400" />
          <span>{t.tabFiles}</span>
        </button>

        <button
          onClick={() => setActiveTab('releases')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'releases'
              ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{t.tabReleases}</span>
          {releases.length > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] bg-canvas-muted rounded font-mono">
              {releases.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'issues'
              ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'text-muted hover:text-fg'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t.tabIssues}</span>
        </button>

        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'about'
              ? 'border-b-2 border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'text-muted hover:text-fg'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>{t.tabAbout}</span>
        </button>
      </div>

      {/* Tab 1: README Content */}
      {activeTab === 'readme' && (
        <div className="bg-canvas-subtle p-6 sm:p-8 rounded-2xl border border-border shadow-sm space-y-6">
          
          {readmeLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-5/6" />
              <div className="h-48 bg-slate-800 rounded w-full" />
            </div>
          ) : readme ? (
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: renderedReadmeHtml }}
            />
          ) : (
            <div className="text-center py-12 text-muted">
              <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{t.noReadme}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: FILES & UPLOAD EXPLORER */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          
          {/* Top action bar: Path breadcrumbs & Upload button & Run HTML */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-canvas-subtle p-4 rounded-xl border border-border">
            
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => handleNavigateFolder('')}
                className={`font-bold hover:text-indigo-400 cursor-pointer ${
                  !currentPath ? 'text-indigo-400' : 'text-fg'
                }`}
              >
                root
              </button>
              {currentPath.split('/').filter(Boolean).map((seg, idx, arr) => {
                const subPath = arr.slice(0, idx + 1).join('/');
                const isLast = idx === arr.length - 1;
                return (
                  <React.Fragment key={subPath}>
                    <span className="text-muted">/</span>
                    <button
                      onClick={() => handleNavigateFolder(subPath)}
                      className={`hover:text-indigo-400 cursor-pointer ${
                        isLast ? 'text-indigo-400 font-bold' : 'text-fg'
                      }`}
                    >
                      {seg}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Actions: Run in-repo website & Upload */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => openRepoWebsite(repo, currentPath ? `${currentPath}/index.html` : 'index.html')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                title="Запустить сайт или HTML из репозитория"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>Запустить сайт из репо</span>
              </button>

              <button
                onClick={() => {
                  if (!token) {
                    setIsLoginModalOpen(true);
                    showToast(t.authNotice, 'info');
                  } else {
                    setUploadTargetPath(currentPath ? `${currentPath}/` : '');
                    setIsUploadModalOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{t.uploadBtn}</span>
              </button>
            </div>
          </div>

          {/* If Not Logged In, show helpful notice */}
          {!token && (
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-indigo-300">
                <Info className="w-4 h-4 shrink-0" />
                <span>{t.authNotice}</span>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold whitespace-nowrap cursor-pointer hover:bg-indigo-500 transition-colors"
              >
                {t.loginToUpload}
              </button>
            </div>
          )}

          {/* Files List / Active File Viewer */}
          {viewingFile ? (
            /* File Viewer / Editor */
            <div className="bg-canvas-subtle rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-canvas flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="font-bold text-sm text-fg truncate">{viewingFile.path}</span>
                  <span className="text-xs text-muted">({formatSize(viewingFile.size / 1024)})</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* If HTML file, show direct run button */}
                  {isHtmlFile(viewingFile.path) && (
                    <button
                      onClick={() => openRepoWebsite(repo, viewingFile.path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{t.runHtmlBtn}</span>
                    </button>
                  )}

                  {viewingFile.isEditing ? (
                    <button
                      onClick={handleSaveEditedFile}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.saveFile}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!token) {
                          setIsLoginModalOpen(true);
                          showToast(t.authNotice, 'warning');
                        } else {
                          setViewingFile({ ...viewingFile, isEditing: true });
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-canvas-subtle hover:bg-canvas-muted text-fg border border-border text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{t.editFile}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteFile(viewingFile)}
                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors cursor-pointer"
                    title={t.deleteFile}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setViewingFile(null)}
                    className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-border transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor or Raw Content */}
              <div className="p-4">
                {viewingFile.isEditing ? (
                  <textarea
                    value={viewingFile.editContent}
                    onChange={(e) =>
                      setViewingFile({ ...viewingFile, editContent: e.target.value })
                    }
                    rows={18}
                    className="w-full p-4 rounded-xl bg-canvas border border-border text-fg font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <pre className="p-4 rounded-xl bg-canvas border border-border text-fg font-mono text-xs overflow-auto max-h-[600px] leading-relaxed">
                    <code>{viewingFile.content || 'Пустой файл'}</code>
                  </pre>
                )}
              </div>
            </div>
          ) : filesLoading ? (
            <div className="p-6 rounded-2xl bg-canvas-subtle border border-border animate-pulse space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 bg-slate-800 rounded w-full" />
              ))}
            </div>
          ) : repoFiles.length === 0 ? (
            <div className="text-center py-12 bg-canvas-subtle rounded-2xl border border-border text-muted">
              <Folder className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{t.noFiles}</p>
            </div>
          ) : (
            /* File Explorer Table */
            <div className="rounded-2xl bg-canvas-subtle border border-border overflow-hidden divide-y divide-border">
              {repoFiles.map((item) => {
                const isDir = item.type === 'dir';
                const isHtml = isHtmlFile(item.name);

                return (
                  <div
                    key={item.path}
                    onClick={() => {
                      if (isDir) handleNavigateFolder(item.path);
                      else handleOpenFile(item);
                    }}
                    className="p-3.5 hover:bg-canvas-muted/70 transition-colors flex items-center justify-between gap-3 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {isDir ? (
                        <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <FileCode className="w-4 h-4 text-muted shrink-0" />
                      )}
                      <span
                        className={`truncate font-medium ${
                          isDir ? 'text-indigo-300 font-bold' : isHtml ? 'text-emerald-300 font-semibold' : 'text-fg'
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-muted text-[11px] shrink-0">
                      {isHtml && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openRepoWebsite(repo, item.path);
                          }}
                          className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5 fill-emerald-400" />
                          <span>Запуск</span>
                        </button>
                      )}

                      {!isDir && item.size > 0 && <span>{formatSize(item.size / 1024)}</span>}
                      <ChevronRight className="w-3.5 h-3.5 text-muted" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Tab 3: Releases */}
      {activeTab === 'releases' && (
        <div className="space-y-4">
          {releasesLoading ? (
            <div className="p-6 rounded-2xl bg-canvas-subtle border border-border animate-pulse space-y-4">
              <div className="h-6 bg-slate-800 rounded w-1/4" />
              <div className="h-20 bg-slate-800 rounded w-full" />
            </div>
          ) : releases.length === 0 ? (
            <div className="text-center py-12 bg-canvas-subtle rounded-2xl border border-border text-muted">
              <Tag className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{t.noReleases}</p>
            </div>
          ) : (
            releases.map((rel) => (
              <div
                key={rel.id || rel.tag_name}
                className="p-6 rounded-2xl bg-canvas-subtle border border-border space-y-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {rel.tag_name}
                    </span>
                    <h3 className="text-base font-bold text-fg">{rel.name || rel.tag_name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(rel.published_at, language)}</span>
                  </div>
                </div>

                {rel.body && (
                  <div
                    className="markdown-body text-xs sm:text-sm text-muted"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(rel.body),
                    }}
                  />
                )}

                <div className="pt-3 border-t border-border/70 space-y-2">
                  <span className="text-xs font-semibold text-fg flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    {t.downloads}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href={`https://github.com/${owner}/${repoName}/archive/refs/tags/${rel.tag_name}.zip`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-canvas hover:bg-canvas-muted border border-border text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <span className="font-mono">Source code (zip)</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={`https://github.com/${owner}/${repoName}/archive/refs/tags/${rel.tag_name}.tar.gz`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-lg bg-canvas hover:bg-canvas-muted border border-border text-xs text-indigo-300 hover:text-indigo-200 transition-colors"
                    >
                      <span className="font-mono">Source code (tar.gz)</span>
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    {rel.assets &&
                      rel.assets.map((ast) => (
                        <a
                          key={ast.name}
                          href={ast.browser_download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-lg bg-indigo-950/20 hover:bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 hover:text-white transition-colors"
                        >
                          <div className="truncate pr-2">
                            <span className="font-mono font-medium block truncate">{ast.name}</span>
                            <span className="text-[10px] text-muted">{formatSize(ast.size / 1024)}</span>
                          </div>
                          <Download className="w-4 h-4 shrink-0 text-indigo-400" />
                        </a>
                      ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Issues */}
      {activeTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-canvas-subtle p-3 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIssueFilter('open')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  issueFilter === 'open'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {t.openStatus}
              </button>

              <button
                onClick={() => setIssueFilter('closed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  issueFilter === 'closed'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-muted hover:text-fg'
                }`}
              >
                {t.closedStatus}
              </button>
            </div>

            <span className="text-xs text-muted">
              {issues.length} {t.tabIssues.toLowerCase()}
            </span>
          </div>

          {issuesLoading ? (
            <div className="p-6 rounded-2xl bg-canvas-subtle border border-border animate-pulse space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-800 rounded w-full" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-12 bg-canvas-subtle rounded-2xl border border-border text-muted">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>{t.noIssues}</p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-2xl bg-canvas-subtle border border-border overflow-hidden">
              {issues.map((issue) => (
                <div
                  key={issue.id || issue.number}
                  onClick={() => openIssueDetail(issue, `${owner}/${repoName}`)}
                  className="p-4 hover:bg-canvas-muted/60 transition-colors cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono text-muted">#{issue.number}</span>
                      <h4 className="text-sm font-semibold text-fg hover:text-indigo-400 transition-colors">
                        {issue.title}
                      </h4>
                    </div>

                    {issue.labels && issue.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {issue.labels.map((lbl) => (
                          <span
                            key={lbl.name}
                            className="px-2 py-0.2 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: lbl.color ? `#${lbl.color}20` : '#30363d',
                              color: lbl.color ? `#${lbl.color}` : '#c9d1d9',
                              border: `1px solid #${lbl.color || '30363d'}40`,
                            }}
                          >
                            {lbl.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[11px] text-muted flex items-center gap-2 pt-0.5">
                      <span>{issue.user?.login}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(issue.created_at, language)}</span>
                    </div>
                  </div>

                  {issue.comments > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted shrink-0 pt-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{issue.comments}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: About & Contributors */}
      {activeTab === 'about' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="p-6 rounded-2xl bg-canvas-subtle border border-border space-y-4">
              <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Характеристики</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/70">
                  <span className="text-muted">{t.defaultBranch}</span>
                  <span className="font-mono text-fg font-semibold">{repo?.default_branch || 'main'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/70">
                  <span className="text-muted">{t.size}</span>
                  <span className="font-mono text-fg font-semibold">{formatSize(repo?.size)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border/70">
                  <span className="text-muted">{t.created}</span>
                  <span className="text-fg font-semibold">{formatDate(repo?.created_at, language)}</span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-muted">{t.updated}</span>
                  <span className="text-fg font-semibold">{formatRelativeTime(repo?.updated_at, language)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 p-6 rounded-2xl bg-canvas-subtle border border-border space-y-4">
            <h3 className="text-sm font-bold text-fg flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>{t.topContributors}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contributors.map((contrib) => (
                <div
                  key={contrib.login}
                  onClick={() => openUser(contrib.login)}
                  className="flex items-center justify-between p-3 rounded-xl bg-canvas hover:bg-canvas-muted border border-border transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={contrib.avatar_url || `https://github.com/${contrib.login}.png`}
                      alt={contrib.login}
                      className="w-9 h-9 rounded-full border border-border shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-fg block truncate hover:text-indigo-400">
                        {contrib.login}
                      </span>
                      <span className="text-[11px] text-muted">
                        {contrib.contributions} {t.contributions}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOLDER & MULTI-FILE UPLOAD MODAL */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        owner={owner}
        repoName={repoName}
        currentPath={currentPath}
        defaultBranch={defaultBranch}
        token={token}
        onSuccess={() => loadFiles(currentPath)}
        showToast={showToast}
        language={language}
        openLoginModal={() => setIsLoginModalOpen(true)}
      />

    </div>
  );
}
