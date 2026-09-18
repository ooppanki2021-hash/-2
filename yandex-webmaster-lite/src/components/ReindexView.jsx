import React, { useState, useEffect } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import { getReindexQueue, addReindexUrl } from '../services/yandexApi';
import {
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function ReindexView() {
  const { activeSite, showToast } = useWebmaster();
  const siteUrl = activeSite?.unicode_host_url || '';

  const [inputUrl, setInputUrl] = useState('');
  const [queue, setQueue] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (siteUrl) {
      setQueue(getReindexQueue(siteUrl));
    }
  }, [siteUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    let fullUrl = inputUrl.trim();
    if (!fullUrl.startsWith('http')) {
      fullUrl = siteUrl ? `${siteUrl}/${fullUrl.replace(/^\//, '')}` : `https://${fullUrl}`;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const updated = addReindexUrl(siteUrl || 'my-site', fullUrl);
      setQueue(updated);
      setInputUrl('');
      setIsSubmitting(false);
      showToast('URL успешно добавлен в приоритетную очередь робота Яндекса! ⚡', 'success');
    }, 300);
  };

  const quotaUsed = queue.length;
  const quotaTotal = 20;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
          <span>Переобход страниц (Fast Reindex)</span>
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Сообщите роботу Яндекса о новых или обновленных страницах для ускоренной индексации
        </p>
      </div>

      {/* Input Box & Quota Strip */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-white">Дневная квота переобхода:</span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-mono font-bold border border-amber-500/30">
              {quotaTotal - quotaUsed} из {quotaTotal} URL доступно
            </span>
          </div>

          <span className="text-[11px] text-gray-400">Квота обновляется ежедневно в 00:00 МСК</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder={siteUrl ? `${siteUrl}/novaya-statya` : 'https://vash-site.ru/page'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            required
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm shadow transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Отправить роботу</span>
              </>
            )}
          </button>
        </form>

        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Робот Яндекса обычно обходит отправленные страницы в течение 10–40 минут.</span>
        </div>

      </div>

      {/* Reindex History Queue Table */}
      <div className="bg-[#121720] border border-[#283347] rounded-2xl overflow-hidden shadow-sm space-y-1">
        <div className="p-4 border-b border-[#283347] bg-[#090c10] flex items-center justify-between text-xs font-bold text-white">
          <span>История отправленных страниц ({queue.length})</span>
          <span className="text-gray-400 text-[11px]">Статус обхода</span>
        </div>

        {queue.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            В очереди пока нет страниц. Введите URL выше для быстрой отправки робоbox Яндекса.
          </div>
        ) : (
          <div className="divide-y divide-[#283347]">
            {queue.map((item, idx) => (
              <div key={idx} className="p-4 hover:bg-[#18202d] transition-colors flex items-center justify-between gap-3 text-xs">
                <div className="space-y-1 min-w-0">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono font-bold text-white hover:text-red-400 truncate flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">{item.url}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                  </a>
                  <div className="text-[11px] text-gray-400">
                    Добавлен: {new Date(item.addedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="shrink-0">
                  {item.status === 'DONE' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Робот обошел</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>В очереди робота</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
