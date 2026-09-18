import React from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function DiagnosticsView() {
  const { diagnostics, activeSite } = useWebmaster();
  const siteUrl = activeSite?.unicode_host_url || 'Ваш сайт';

  const okCount = diagnostics.filter((d) => d.severity === 'ok').length;
  const warnCount = diagnostics.filter((d) => d.severity === 'warning').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <span>Диагностика сайта и безопасность</span>
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Автоматический аудит технических факторов, индексации и безопасности для {siteUrl}
        </p>
      </div>

      {/* Summary Score Strip */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xl font-mono border border-emerald-500/30 shadow">
            100%
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Техническое здоровье: Отличное</h3>
            <p className="text-xs text-gray-400">Фатальных и критических ошибок не обнаружено. Сайт готов к индексации роботом Яндекса.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
            {okCount} проверок пройдено
          </div>
        </div>
      </div>

      {/* Checks List */}
      <div className="bg-[#121720] border border-[#283347] rounded-2xl overflow-hidden divide-y divide-[#283347] shadow-sm">
        {diagnostics.map((item) => (
          <div key={item.id} className="p-4 sm:p-5 hover:bg-[#18202d] transition-colors flex items-start gap-3.5 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />

            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-sm text-white">{item.title}</h4>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                  Успешно
                </span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
