import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { uploadOrUpdateFile } from '../services/githubApi';
import { formatSize } from '../utils/formatters';
import {
  Upload,
  Folder,
  File,
  FileArchive,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Info,
  ChevronRight,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function UploadModal({
  isOpen,
  onClose,
  owner,
  repoName,
  currentPath = '',
  defaultBranch = 'main',
  token,
  onSuccess,
  showToast,
  language = 'ru',
  openLoginModal,
}) {
  const [uploadMode, setUploadMode] = useState('folder'); // 'folder' | 'zip' | 'files'
  const [fileList, setFileList] = useState([]); // [{ name, path, contentBase64, size }]
  const [uploadTargetPath, setUploadTargetPath] = useState(currentPath ? `${currentPath}/` : '');
  const [commitMessage, setCommitMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, currentFileName: '', status: 'idle' });
  const [isDragging, setIsDragging] = useState(false);

  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);
  const zipInputRef = useRef(null);

  if (!isOpen) return null;

  const t = {
    ru: {
      modalTitle: 'Загрузка папки или файлов',
      modalSubtitle: 'Загружайте целые директории, веб-сайты и архивы прямо в репозиторий',
      tabFolder: '📁 Выбрать папку',
      tabZip: '📦 ZIP-архив с папкой',
      tabFiles: '📄 Файлы',
      dragFolderPrompt: 'Перетащите сюда папку или архив с файлами',
      dragFolderSub: 'или нажмите одну из кнопок ниже для выбора на устройстве',
      browseFolder: 'Выбрать папку на устройстве',
      browseZip: 'Выбрать ZIP-архив',
      browseFiles: 'Выбрать файлы',
      targetFolderLabel: 'Куда загрузить в репозитории (целевая папка):',
      targetFolderHint: 'Оставьте пустым для корня репозитория или укажите путь (например: public, docs, assets)',
      commitMsgLabel: 'Сообщение коммита (commit message):',
      filesToUpload: 'Файлов к отправке:',
      totalSize: 'Общий размер:',
      clearList: 'Очистить список',
      startUpload: 'Загрузить всю папку на GitHub',
      uploading: 'Отправка на GitHub...',
      uploadSuccess: 'Папка успешно загружена на GitHub! 🚀',
      uploadError: 'Ошибка при загрузке',
      noFilesSelected: 'Файлы ещё не выбраны. Выберите папку или ZIP-архив выше.',
      authRequired: 'Для загрузки требуется авторизация с токеном GitHub.',
      loginBtn: 'Войти с токеном',
      unpackingZip: 'Распаковка архива...',
      readingFiles: 'Чтение структуры папки...',
    },
    en: {
      modalTitle: 'Upload Folder or Files',
      modalSubtitle: 'Upload complete directories, websites, and archives directly into GitHub',
      tabFolder: '📁 Choose Folder',
      tabZip: '📦 ZIP Archive',
      tabFiles: '📄 Files',
      dragFolderPrompt: 'Drag & drop folder or ZIP archive here',
      dragFolderSub: 'or use the buttons below to browse files from your device',
      browseFolder: 'Browse Folder on Device',
      browseZip: 'Browse ZIP Archive',
      browseFiles: 'Browse Files',
      targetFolderLabel: 'Target repository directory:',
      targetFolderHint: 'Leave blank for repo root or specify subfolder (e.g. public, docs, assets)',
      commitMsgLabel: 'Commit message:',
      filesToUpload: 'Files to upload:',
      totalSize: 'Total size:',
      clearList: 'Clear list',
      startUpload: 'Upload entire folder to GitHub',
      uploading: 'Uploading to GitHub...',
      uploadSuccess: 'Folder successfully uploaded to GitHub! 🚀',
      uploadError: 'Upload error',
      noFilesSelected: 'No files selected yet. Choose a folder or ZIP archive above.',
      authRequired: 'GitHub Personal Access Token required to push files.',
      loginBtn: 'Sign In with Token',
      unpackingZip: 'Unpacking ZIP archive...',
      readingFiles: 'Reading directory tree...',
    },
  }[language];

  // Helper to convert browser File object to Base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        const base64 = typeof dataUrl === 'string' && dataUrl.includes(',')
          ? dataUrl.split(',')[1]
          : dataUrl;
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle standard Directory picker: <input webkitdirectory />
  const handleFolderSelect = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const processed = [];
      for (const file of rawFiles) {
        // webkitRelativePath contains e.g. "my-site/css/style.css"
        const relPath = file.webkitRelativePath || file.name;
        const base64 = await fileToBase64(file);
        processed.push({
          name: file.name,
          path: relPath,
          contentBase64: base64,
          size: file.size,
        });
      }
      setFileList(processed);
      if (!commitMessage) {
        const topFolder = rawFiles[0]?.webkitRelativePath?.split('/')[0] || 'folder';
        setCommitMessage(`Upload ${topFolder} (${processed.length} files) via GitHub Lite`);
      }
      showToast(`Выбрано ${processed.length} файлов из папки`, 'success');
    } catch (err) {
      showToast('Ошибка чтения папки: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle multiple standard files selection
  const handleFilesSelect = async (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    setIsProcessing(true);
    try {
      const processed = [];
      for (const file of rawFiles) {
        const base64 = await fileToBase64(file);
        processed.push({
          name: file.name,
          path: file.name,
          contentBase64: base64,
          size: file.size,
        });
      }
      setFileList((prev) => [...prev, ...processed]);
      if (!commitMessage) {
        setCommitMessage(`Upload ${processed.length} files via GitHub Lite`);
      }
      showToast(`Добавлено ${processed.length} файлов`, 'success');
    } catch (err) {
      showToast('Ошибка чтения файлов: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle ZIP Archive extraction using JSZip
  const handleZipSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const zipContents = await zip.loadAsync(file);
      const processed = [];

      for (const [relativePath, zipEntry] of Object.entries(zipContents.files)) {
        // Skip directory entries themselves and system junk (__MACOSX, .DS_Store)
        if (zipEntry.dir || relativePath.startsWith('__MACOSX/') || relativePath.endsWith('.DS_Store')) {
          continue;
        }

        const base64 = await zipEntry.async('base64');
        processed.push({
          name: relativePath.split('/').pop(),
          path: relativePath,
          contentBase64: base64,
          size: base64.length * 0.75, // approximate size
        });
      }

      setFileList(processed);
      const zipName = file.name.replace(/\.zip$/i, '');
      if (!commitMessage) {
        setCommitMessage(`Upload ${zipName} (${processed.length} files) via GitHub Lite`);
      }
      showToast(`Распаковано ${processed.length} файлов из архива ${file.name}! 📦`, 'success');
    } catch (err) {
      showToast('Ошибка распаковки ZIP: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Drag & Drop with folder/directory recursion
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (!items || items.length === 0) return;

    setIsProcessing(true);
    const collectedFiles = [];

    // Helper to read FileSystemEntry recursively
    const traverseEntry = async (entry, path = '') => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          entry.file(async (file) => {
            const base64 = await fileToBase64(file);
            collectedFiles.push({
              name: file.name,
              path: path ? `${path}/${file.name}` : file.name,
              contentBase64: base64,
              size: file.size,
            });
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        const entries = await new Promise((resolve) => {
          dirReader.readEntries((ents) => resolve(ents));
        });
        for (const subEntry of entries) {
          await traverseEntry(subEntry, path ? `${path}/${entry.name}` : entry.name);
        }
      }
    };

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          // If it's a ZIP file dropped
          const fileObj = item.getAsFile();
          if (fileObj && fileObj.name.toLowerCase().endsWith('.zip')) {
            const zip = new JSZip();
            const zipContents = await zip.loadAsync(fileObj);
            for (const [relPath, zipEntry] of Object.entries(zipContents.files)) {
              if (zipEntry.dir || relPath.startsWith('__MACOSX/') || relPath.endsWith('.DS_Store')) continue;
              const b64 = await zipEntry.async('base64');
              collectedFiles.push({
                name: relPath.split('/').pop(),
                path: relPath,
                contentBase64: b64,
                size: b64.length * 0.75,
              });
            }
            continue;
          }

          const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
          if (entry) {
            await traverseEntry(entry);
          } else if (fileObj) {
            const base64 = await fileToBase64(fileObj);
            collectedFiles.push({
              name: fileObj.name,
              path: fileObj.name,
              contentBase64: base64,
              size: fileObj.size,
            });
          }
        }
      }

      setFileList(collectedFiles);
      if (!commitMessage) {
        setCommitMessage(`Upload ${collectedFiles.length} files via GitHub Lite`);
      }
      showToast(`Успешно добавлено ${collectedFiles.length} файлов!`, 'success');
    } catch (err) {
      showToast('Ошибка Drag & Drop: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecuteBatchUpload = async () => {
    if (fileList.length === 0) {
      showToast(t.noFilesSelected, 'warning');
      return;
    }
    if (!token) {
      openLoginModal();
      showToast(t.authRequired, 'warning');
      return;
    }

    setIsProcessing(true);
    setUploadProgress({
      current: 0,
      total: fileList.length,
      currentFileName: '',
      status: 'uploading',
    });

    const basePath = uploadTargetPath.trim().replace(/^\/|\/$/g, '');
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const item = fileList[i];
      const finalRepoPath = basePath ? `${basePath}/${item.path}` : item.path;

      setUploadProgress({
        current: i + 1,
        total: fileList.length,
        currentFileName: finalRepoPath,
        status: 'uploading',
      });

      try {
        await uploadOrUpdateFile(
          owner,
          repoName,
          finalRepoPath,
          item.contentBase64,
          commitMessage.trim() || `Upload ${item.name} via GitHub Lite`,
          token,
          defaultBranch
        );
        successCount++;
      } catch (err) {
        console.error(`Failed to upload ${finalRepoPath}:`, err);
        failCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      showToast(`Успешно загружено ${successCount} из ${fileList.length} файлов! 🚀`, 'success');
      onSuccess?.();
      onClose?.();
      setFileList([]);
    } else {
      showToast(`Не удалось загрузить файлы. Ошибок: ${failCount}`, 'error');
    }
  };

  const totalSize = fileList.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-canvas border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border bg-canvas-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-fg">{t.modalTitle}</h3>
              <p className="text-xs text-muted">{t.modalSubtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-muted hover:text-fg hover:bg-canvas border border-transparent hover:border-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm flex-1">
          
          {/* Auth warning if no token */}
          {!token && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{t.authRequired}</span>
              </div>
              <button
                onClick={openLoginModal}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold whitespace-nowrap cursor-pointer hover:bg-indigo-500 transition-colors"
              >
                {t.loginBtn}
              </button>
            </div>
          )}

          {/* Upload Method Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-canvas-subtle rounded-xl border border-border">
            <button
              onClick={() => {
                setUploadMode('folder');
                folderInputRef.current?.click();
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                uploadMode === 'folder'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-muted hover:text-fg hover:bg-canvas'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>{t.tabFolder}</span>
            </button>

            <button
              onClick={() => {
                setUploadMode('zip');
                zipInputRef.current?.click();
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                uploadMode === 'zip'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-muted hover:text-fg hover:bg-canvas'
              }`}
            >
              <FileArchive className="w-4 h-4" />
              <span>{t.tabZip}</span>
            </button>

            <button
              onClick={() => {
                setUploadMode('files');
                filesInputRef.current?.click();
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                uploadMode === 'files'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-muted hover:text-fg hover:bg-canvas'
              }`}
            >
              <File className="w-4 h-4" />
              <span>{t.tabFiles}</span>
            </button>
          </div>

          {/* Hidden File Inputs */}
          {/* 1. Directory Input */}
          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderSelect}
            webkitdirectory=""
            directory=""
            multiple
            className="hidden"
          />

          {/* 2. ZIP Input */}
          <input
            type="file"
            ref={zipInputRef}
            onChange={handleZipSelect}
            accept=".zip"
            className="hidden"
          />

          {/* 3. Multiple Files Input */}
          <input
            type="file"
            ref={filesInputRef}
            onChange={handleFilesSelect}
            multiple
            className="hidden"
          />

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all flex flex-col items-center justify-center gap-3 cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                : 'border-border hover:border-indigo-500/50 bg-canvas-subtle/50'
            }`}
            onClick={() => {
              if (uploadMode === 'folder') folderInputRef.current?.click();
              else if (uploadMode === 'zip') zipInputRef.current?.click();
              else filesInputRef.current?.click();
            }}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-fg text-sm sm:text-base">{t.dragFolderPrompt}</p>
              <p className="text-xs text-muted mt-0.5">{t.dragFolderSub}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  folderInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{t.browseFolder}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  zipInputRef.current?.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-canvas hover:bg-canvas-muted text-fg border border-border font-bold text-xs flex items-center gap-1.5"
              >
                <FileArchive className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.browseZip}</span>
              </button>
            </div>
          </div>

          {/* Destination Path & Commit Message */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-fg block text-xs">{t.targetFolderLabel}</label>
              <input
                type="text"
                value={uploadTargetPath}
                onChange={(e) => setUploadTargetPath(e.target.value)}
                placeholder="public / assets / docs"
                className="w-full px-3 py-2 rounded-xl bg-canvas border border-border text-fg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-muted">{t.targetFolderHint}</p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-fg block text-xs">{t.commitMsgLabel}</label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Upload folder via GitHub Lite"
                className="w-full px-3 py-2 rounded-xl bg-canvas border border-border text-fg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Selected Files Queue Preview */}
          {fileList.length > 0 && (
            <div className="space-y-2 border border-border rounded-xl bg-canvas p-3">
              <div className="flex items-center justify-between border-b border-border/70 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-fg">{t.filesToUpload}</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-300 font-mono font-bold text-[11px]">
                    {fileList.length}
                  </span>
                  <span className="text-muted">({formatSize(totalSize / 1024)})</span>
                </div>

                <button
                  type="button"
                  onClick={() => setFileList([])}
                  className="text-rose-400 hover:underline text-[11px] font-semibold cursor-pointer"
                >
                  {t.clearList}
                </button>
              </div>

              {/* Scrollable List of Files */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-border/40 text-xs">
                {fileList.map((file, idx) => (
                  <div key={idx} className="pt-1.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <File className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="font-mono text-[11px] text-fg truncate">{file.path}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-muted text-[10px]">
                      <span>{formatSize(file.size / 1024)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-muted hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress Bar */}
          {uploadProgress.status === 'uploading' && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span className="flex items-center gap-2 font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Загрузка {uploadProgress.current} из {uploadProgress.total}...</span>
                </span>
                <span className="font-mono font-bold">
                  {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%
                </span>
              </div>

              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-200"
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                />
              </div>

              <p className="text-[11px] font-mono text-muted truncate">
                {uploadProgress.currentFileName}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-canvas-subtle flex items-center justify-between gap-3">
          <div className="text-[11px] text-muted flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Файлы загружаются напрямую через REST API без git комманд.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-canvas border border-border text-fg text-xs font-semibold hover:bg-canvas-muted transition-colors cursor-pointer"
            >
              Отмена
            </button>

            <button
              type="button"
              onClick={handleExecuteBatchUpload}
              disabled={isProcessing || fileList.length === 0}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.uploading}</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.startUpload} ({fileList.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
