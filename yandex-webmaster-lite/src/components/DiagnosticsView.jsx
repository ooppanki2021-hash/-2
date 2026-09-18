import React from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';

export default function DiagnosticsView() {
  const { diagnostics, activeSite, runAutoScan, isScanning } = useWebmaster();
  const siteUrl = activeSite?.unicode_host_url || 'Ваш сайт';

  const total = diagnostics.length;
  const okCount = diagnostics.filter((d) => d.severity === 'ok').length;
  const warnCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const scorePercent = total > 0 ? Math.round((okCount / total) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Диагностика сайта и технический аудит</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Проверка технических факторов, robots.txt, sitemap и протокола для {siteUrl}
          </p>
        </div>

        <button
          onClick={() => runAutoScan(siteUrl)}
          disabled={isScanning}
          className="px-4 py-2 rounded-xl bg-[#161c28] hover:bg-[#20293a] text-white border border-[#2e3c54] text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Проверка...' : 'Повторить диагностику'}</span>
        </button>
      </div>

      {/* Summary Score Strip */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl font-mono border shadow ${
            scorePercent >= 80
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : scorePercent >= 50
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            {scorePercent}%
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {scorePercent >= 80 ? 'Техническое здоровье: Отличное' : scorePercent >= 50 ? 'Техническое здоровье: Есть замечания' : 'Требуется оптимизация'}
            </h3>
            <p className="text-xs text-gray-400">
              {warnCount === 0
                ? 'Критических ошибок не обнаружено. Сайт готов к индексации роботом Яндекса.'
                : `Обнаружено ${warnCount} замечаний, требующих внимания.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
            {okCount} успешно
          </div>
          {warnCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold">
              {warnCount} предупреждений
            </div>
          )}
        </div>
      </div>

      {/* Checks List */}
      <div className="bg-[#121720] border border-[#283347] rounded-2xl overflow-hidden divide-y divide-[#283347] shadow-sm">
        {diagnostics.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            Нет данных диагностики. Нажмите кнопку «Повторить диагностику» выше.
          </div>
        ) : (
          diagnostics.map((item) => {
            const isOk = item.severity === 'ok';
            return (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-[#18202d] transition-colors flex items-start gap-3.5 text-xs">
                {isOk ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                      isOk ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {isOk ? 'Успешно' : 'Замечание'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
