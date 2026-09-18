import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  Key,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Save,
  Trash2,
  RefreshCw,
  Sparkles,
  Info,
  Globe,
  ArrowRight,
} from 'lucide-react';

export default function SettingsView() {
  const {
    oauthToken,
    setOauthToken,
    yandexUser,
    setYandexUser,
    showToast,
    sites,
    handleAddSite,
    handleDeleteSite,
    syncWithYandexApi,
    isSyncing,
  } = useWebmaster();

  const [loginInput, setLoginInput] = useState(yandexUser?.login || '');
  const [tokenInput, setTokenInput] = useState(oauthToken || '');
  const [newSiteUrl, setNewSiteUrl] = useState('');

  const handleSaveAndSync = async (e) => {
    e?.preventDefault();
    const cleanToken = tokenInput.trim();
    setOauthToken(cleanToken);
    
    if (loginInput.trim()) {
      setYandexUser({ ...yandexUser, login: loginInput.trim() });
    }

    if (cleanToken) {
      await syncWithYandexApi(cleanToken);
    } else {
      showToast('Настройки сохранены! 💾', 'success');
    }
  };

  const handleAddSiteSubmit = (e) => {
    e.preventDefault();
    if (!newSiteUrl.trim()) return;
    handleAddSite(newSiteUrl.trim());
    setNewSiteUrl('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Key className="w-6 h-6 text-amber-400" />
          <span>Подключение Яндекс ID и ваших сайтов</span>
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Введите ваш OAuth-токен для автоматической загрузки сайтов из аккаунта Яндекс Вебмастера
        </p>
      </div>

      {/* 1. YANDEX ID & OAUTH FORM */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-5 shadow-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Авторизация в Яндекс ID</h3>
              <p className="text-xs text-gray-400">
                {oauthToken ? `Подключен: @${yandexUser?.login || 'аккаунт'}` : 'Автономный режим'}
              </p>
            </div>
          </div>

          {oauthToken && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Токен активен</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveAndSync} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 block">
              1. Ваш логин в Яндексе:
            </label>
            <input
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="Ваш логин на Яндексе"
              className="w-full px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-200 block flex items-center justify-between">
              <span>2. Вставьте ваш OAuth-токен:</span>
              <span className="text-[11px] text-gray-400 font-mono font-normal">y0_AgAAAA...</span>
            </label>
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Вставьте полученный токен сюда..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-[#18202d] border border-[#2e3c54] text-xs text-gray-300 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-400">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Синхронизация с сервером:</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Приложение свяжется с официальным API Яндекс Вебмастера и загрузит список ваших реальных подтвержденных сайтов.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {oauthToken ? (
              <button
                type="button"
                onClick={() => {
                  setTokenInput('');
                  setOauthToken('');
                  showToast('Токен очищен', 'info');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
              >
                Очистить токен
              </button>
            ) : <div />}

            <button
              type="submit"
              disabled={isSyncing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow cursor-pointer transition-all flex items-center gap-2"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Синхронизация с Яндексом...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Сохранить и загрузить мои сайты</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 2. DIRECT SITE ADD & MANAGEMENT */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-4 shadow-xl">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Добавить сайт вручную</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Введите адрес вашего сайта для мониторинга:
          </p>
        </div>
        
        {/* Add site inline form */}
        <form onSubmit={handleAddSiteSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newSiteUrl}
            onChange={(e) => setNewSiteUrl(e.target.value)}
            placeholder="https://vash-site.ru"
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            required
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition-all cursor-pointer shrink-0"
          >
            + Добавить сайт
          </button>
        </form>

        {/* Current Sites list */}
        {sites.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-gray-300 block">Ваши сайты:</span>
            <div className="bg-[#090c10] rounded-xl border border-[#283347] divide-y divide-[#283347] overflow-hidden">
              {sites.map((site) => (
                <div key={site.host_id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-mono font-bold text-white truncate">{site.unicode_host_url}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono text-[11px] font-bold border border-amber-500/30 shrink-0">
                      ИКС {site.sqi}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteSite(site.host_id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Удалить сайт из списка"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
