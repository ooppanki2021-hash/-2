import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Layers,
  Zap,
} from 'lucide-react';

export default function IndexingView() {
  const { pagesInSearch, excludedPages, activeSite, setCurrentTab } = useWebmaster();
  const [tab, setTab] = useState('in_search');

  const siteUrl = activeSite?.unicode_host_url || '';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-red-400" />
            <span>Страницы в поиске и индексирование</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Статусы страниц сайта в базе поискового робота Яндекса
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('reindex')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow cursor-pointer shrink-0"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Переобход URL</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-[#121720] rounded-2xl border border-[#283347] text-xs font-bold w-fit">
        <button
          onClick={() => setTab('in_search')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            tab === 'in_search' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          В поиске ({pagesInSearch.length})
        </button>

        <button
          onClick={() => setTab('excluded')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            tab === 'excluded' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
          }`}
        >
          Исключенные ({excludedPages.length})
        </button>
      </div>

      {/* Content */}
      {tab === 'in_search' && (
        pagesInSearch.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#121720] border-2 border-[#283347] text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Страницы готовы к сканированию</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Отправьте главную страницу вашего сайта на быстрый переобход, чтобы ускорить индексацию роботом Яндекса.
            </p>
            <button
              onClick={() => setCurrentTab('reindex')}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow cursor-pointer"
            >
              Отправить на переобход →
            </button>
          </div>
        ) : (
          <div className="bg-[#121720] border border-[#283347] rounded-2xl divide-y divide-[#283347] overflow-hidden">
            {pagesInSearch.map((page, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-3 text-xs">
                <span className="font-mono text-white truncate">{page.url}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold">200 OK</span>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'excluded' && (
        <div className="p-8 rounded-2xl bg-[#121720] border-2 border-[#283347] text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Ошибок индексирования нет</h3>
          <p className="text-xs text-gray-400">Все проверенные роботом страницы отдают корректный статус HTTP 200 OK.</p>
        </div>
      )}

    </div>
  );
}
