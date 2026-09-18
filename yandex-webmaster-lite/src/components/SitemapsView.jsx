import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  Map,
  Plus,
  CheckCircle2,
  ExternalLink,
  FileCode,
} from 'lucide-react';

export default function SitemapsView() {
  const { sitemaps, addSitemapUrl, activeSite } = useWebmaster();
  const siteUrl = activeSite?.unicode_host_url || 'https://vash-site.ru';

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSitemapUrl, setNewSitemapUrl] = useState(`${siteUrl}/sitemap.xml`);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newSitemapUrl.trim()) return;
    addSitemapUrl(newSitemapUrl.trim());
    setIsAddOpen(false);
  };

  const totalSitemapUrls = sitemaps.reduce((acc, s) => acc + (s.urls_count || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Map className="w-6 h-6 text-red-400" />
            <span>Файлы Sitemap (Карты сайта)</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Управление файлами Sitemap.xml для полного обхода роботом Яндекса
          </p>
        </div>

        <button
          onClick={() => {
            setNewSitemapUrl(`${siteUrl}/sitemap.xml`);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить Sitemap</span>
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-[#121720] border border-[#283347]">
          <span className="text-gray-400">Файлов Sitemap</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">{sitemaps.length}</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121720] border border-[#283347]">
          <span className="text-gray-400">Всего URL в картах</span>
          <div className="text-2xl font-extrabold text-white font-mono mt-1">
            {totalSitemapUrls.toLocaleString('ru-RU')}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121720] border border-[#283347]">
          <span className="text-gray-400">Ошибок парсинга</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">0</div>
        </div>
      </div>

      {/* Add Sitemap Modal */}
      {isAddOpen && (
        <div className="p-5 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-3 animate-fade-in">
          <h3 className="text-sm font-bold text-white">Добавление нового файла Sitemap.xml</h3>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newSitemapUrl}
              onChange={(e) => setNewSitemapUrl(e.target.value)}
              placeholder={`${siteUrl}/sitemap.xml`}
              className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50"
              required
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl bg-[#161c28] hover:bg-[#20293a] text-white border border-[#2e3c54] text-xs font-semibold"
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Sitemaps List */}
      <div className="bg-[#121720] border border-[#283347] rounded-2xl overflow-hidden divide-y divide-[#283347] shadow-sm">
        {sitemaps.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            Файлы Sitemap пока не добавлены. Нажмите кнопку «Добавить Sitemap» выше, чтобы указать адрес карты сайта.
          </div>
        ) : (
          sitemaps.map((s, idx) => (
            <div key={idx} className="p-4 sm:p-5 hover:bg-[#18202d] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-400 shrink-0" />
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-white hover:text-red-400 truncate flex items-center gap-1 font-mono"
                  >
                    <span>{s.url}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                  </a>
                </div>
                <p className="text-gray-400 text-[11px]">
                  Статус: {s.last_access}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <span className="px-2.5 py-1 rounded-full font-bold text-[11px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Успешно обработан</span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
