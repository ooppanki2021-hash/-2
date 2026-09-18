import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
  Smartphone,
  Monitor,
  Calendar,
  Key,
} from 'lucide-react';

export default function QueriesView() {
  const { queries, dateRange, setDateRange, showToast, activeSite, setCurrentTab } = useWebmaster();
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('clicks');
  const [deviceFilter, setDeviceFilter] = useState('all');

  const filteredQueries = queries
    .filter((q) => q.query.toLowerCase().includes(searchFilter.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'position') return a.position - b.position;
      return b[sortBy] - a[sortBy];
    });

  const handleExportCsv = () => {
    if (filteredQueries.length === 0) {
      showToast('Нет данных для экспорта', 'warning');
      return;
    }
    const header = 'Поисковый запрос,Клики,Показы,CTR %,Средняя позиция\n';
    const rows = filteredQueries.map(
      (q) => `"${q.query}",${q.clicks},${q.impressions},${q.ctr},${q.position}`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `yandex-webmaster-queries-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Поисковые запросы экспортированы в CSV!', 'success');
  };

  const totalClicks = filteredQueries.reduce((sum, q) => sum + q.clicks, 0);
  const totalImpressions = filteredQueries.reduce((sum, q) => sum + q.impressions, 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Search className="w-6 h-6 text-red-400" />
            <span>Поисковые запросы</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Статистика показов, кликов и позиций в результатах поиска Яндекса
          </p>
        </div>

        {filteredQueries.length > 0 && (
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#161c28] hover:bg-[#20293a] text-white border border-[#2e3c54] text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-red-400" />
            <span>Экспорт в CSV</span>
          </button>
        )}
      </div>

      {filteredQueries.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#121720] border-2 border-[#283347] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Статистика поисковых запросов собирается</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Для загрузки реальной истории поисковых фраз из вашего аккаунта Яндекса подключите OAuth-токен в настройках.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('settings')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow cursor-pointer"
          >
            Перейти в настройки Яндекс ID →
          </button>
        </div>
      ) : (
        <>
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-[#121720] border border-[#283347]">
              <span className="text-xs text-gray-400">Всего кликов</span>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
                {totalClicks.toLocaleString('ru-RU')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121720] border border-[#283347]">
              <span className="text-xs text-gray-400">Всего показов</span>
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono mt-1">
                {totalImpressions.toLocaleString('ru-RU')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#121720] border border-[#283347]">
              <span className="text-xs text-gray-400">Средний CTR</span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {avgCtr}%
              </div>
            </div>
          </div>

          {/* Queries Table */}
          <div className="bg-[#121720] border border-[#283347] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#090c10] border-b border-[#283347] text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Поисковый запрос</th>
                    <th className="py-3 px-4 text-right">Клики</th>
                    <th className="py-3 px-4 text-right">Показы</th>
                    <th className="py-3 px-4 text-right">CTR</th>
                    <th className="py-3 px-4 text-right">Позиция</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#283347] font-sans">
                  {filteredQueries.map((q) => (
                    <tr key={q.id} className="hover:bg-[#18202d] transition-colors">
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          <span>{q.query}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {q.clicks.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-400">
                        {q.impressions.toLocaleString('ru-RU')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                        {q.ctr}%
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                        #{q.position}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
