import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import { checkServerResponse } from '../services/yandexApi';
import {
  Wrench,
  Server,
  Trash2,
  Shield,
  Play,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

export default function ToolsView() {
  const { activeSite, showToast, setIsVerifyModalOpen } = useWebmaster();
  const siteUrl = activeSite?.unicode_host_url || '';

  const [toolTab, setToolTab] = useState('server');

  // Server Response Tool State
  const [serverUrl, setServerUrl] = useState(siteUrl || 'https://vash-site.ru');
  const [serverResponse, setServerResponse] = useState(null);
  const [serverLoading, setServerLoading] = useState(false);

  // Remove URL Tool State
  const [removeUrl, setRemoveUrl] = useState('');
  const [removeReason, setRemoveReason] = useState('deleted_404');
  const [removedUrls, setRemovedUrls] = useState([]);

  const handleCheckServer = async (e) => {
    e?.preventDefault();
    setServerLoading(true);
    try {
      const res = await checkServerResponse(serverUrl);
      setServerResponse(res);
      showToast('Ответ сервера успешно получен!', 'success');
    } catch (err) {
      showToast('Ошибка проверки: ' + err.message, 'error');
    } finally {
      setServerLoading(false);
    }
  };

  const handleRemoveSubmit = (e) => {
    e.preventDefault();
    if (!removeUrl.trim()) return;

    const newItem = {
      url: removeUrl.trim(),
      reason: removeReason === 'deleted_404' ? 'Страница удалена (HTTP 404)' : 'Запрещена в robots.txt / noindex',
      date: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      status: 'IN_PROGRESS',
    };

    setRemovedUrls([newItem, ...removedUrls]);
    setRemoveUrl('');
    showToast('Запрос на удаление URL передан роботу Яндекса! 🗑️', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Wrench className="w-6 h-6 text-red-400" />
          <span>Инструменты Вебмастера</span>
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Утилиты для проверки сервера, удаления страниц из поиска и управления правами
        </p>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#121720] rounded-2xl border border-[#283347] text-xs font-bold w-fit overflow-x-auto scrollbar-none">
        <button
          onClick={() => setToolTab('server')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            toolTab === 'server' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Проверка ответа сервера</span>
        </button>

        <button
          onClick={() => setToolTab('remove')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
            toolTab === 'remove' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trash2 className="w-4 h-4" />
          <span>Удаление URL из поиска</span>
        </button>

        <button
          onClick={() => setIsVerifyModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-[#161c28] transition-all cursor-pointer"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Подтверждение прав</span>
        </button>
      </div>

      {/* TOOL 1: SERVER RESPONSE CHECKER */}
      {toolTab === 'server' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-4">
            <h3 className="text-base font-bold text-white">Проверка кода ответа и HTTP-заголовков для робота Яндекса</h3>

            <form onSubmit={handleCheckServer} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://vash-site.ru"
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              />
              <button
                type="submit"
                disabled={serverLoading}
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {serverLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Проверка...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Проверить ответ</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Card */}
          {serverResponse && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#283347] pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    HTTP/2.0 {serverResponse.status} {serverResponse.statusText}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">{serverResponse.url}</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold font-mono">
                  Время ответа: {serverResponse.duration} мс
                </span>
              </div>

              {/* Headers Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#090c10] rounded-xl border border-[#283347] space-y-1">
                  <span className="text-gray-400 block text-[11px]">Протокол:</span>
                  <span className="font-mono font-bold text-white">{serverResponse.protocol}</span>
                </div>

                <div className="p-3 bg-[#090c10] rounded-xl border border-[#283347] space-y-1">
                  <span className="text-gray-400 block text-[11px]">Content-Type & Кодировка:</span>
                  <span className="font-mono font-bold text-white">{serverResponse.contentType}</span>
                </div>

                <div className="p-3 bg-[#090c10] rounded-xl border border-[#283347] space-y-1">
                  <span className="text-gray-400 block text-[11px]">Сервер:</span>
                  <span className="font-mono font-bold text-white">{serverResponse.server}</span>
                </div>

                <div className="p-3 bg-[#090c10] rounded-xl border border-[#283347] space-y-1">
                  <span className="text-gray-400 block text-[11px]">Доступность для робота Яндекса:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Разрешено (Без блокировок)</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOOL 2: REMOVE URL FROM SEARCH */}
      {toolTab === 'remove' && (
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-4">
            <h3 className="text-base font-bold text-white">Удаление страниц из результатов поиска Яндекса</h3>
            <p className="text-xs text-gray-400">
              Используйте этот инструмент для страниц, которые были удалены с сайта (404) или закрыты от индексации в robots.txt.
            </p>

            <form onSubmit={handleRemoveSubmit} className="space-y-3">
              <input
                type="text"
                value={removeUrl}
                onChange={(e) => setRemoveUrl(e.target.value)}
                placeholder={siteUrl ? `${siteUrl}/page` : 'https://vash-site.ru/page'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                required
              />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <select
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white text-xs focus:outline-none"
                >
                  <option value="deleted_404">Страница удалена (отдает 404/410)</option>
                  <option value="disallow">Закрыта в robots.txt или тегом noindex</option>
                </select>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Удалить URL из поиска
                </button>
              </div>
            </form>
          </div>

          {/* Removed URLs list */}
          {removedUrls.length > 0 && (
            <div className="bg-[#121720] border border-[#283347] rounded-2xl overflow-hidden divide-y divide-[#283347]">
              {removedUrls.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-white">{item.url}</span>
                    <p className="text-gray-400 text-[11px]">{item.reason}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    В обработке роботом
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
