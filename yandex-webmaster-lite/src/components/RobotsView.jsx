import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import { testRobotsTxtRule } from '../services/yandexApi';
import {
  Bot,
  Play,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Save,
} from 'lucide-react';

export default function RobotsView() {
  const { robotsTxt, setRobotsTxt, activeSite, showToast } = useWebmaster();
  const siteUrl = activeSite?.unicode_host_url || 'https://vash-site.ru';

  const [testUrl, setTestUrl] = useState(`${siteUrl}/admin/`);
  const [testResult, setTestResult] = useState(() => testRobotsTxtRule(robotsTxt, `${siteUrl}/admin/`));
  const [copied, setCopied] = useState(false);

  const handleTest = (e) => {
    e?.preventDefault();
    const res = testRobotsTxtRule(robotsTxt, testUrl);
    setTestResult(res);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(robotsTxt);
    setCopied(true);
    showToast('Содержимое robots.txt скопировано!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    showToast('Изменения сохранены в песочнице Вебмастера 💾', 'success');
    handleTest();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-red-400" />
            <span>Анализ и проверка robots.txt</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Проверьте, разрешена ли индексация страниц для робота Яндекса согласно вашим правилам
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161c28] hover:bg-[#20293a] text-gray-300 hover:text-white border border-[#2e3c54] text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Копировать</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Сохранить</span>
          </button>
        </div>
      </div>

      {/* Interactive URL Tester Strip */}
      <div className="p-5 rounded-2xl bg-[#121720] border-2 border-[#283347] space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Play className="w-4 h-4 text-red-400 fill-red-400" />
          <span>Интерактивный тестер URL для Яндекс.Робота (User-agent: Yandex)</span>
        </h3>

        <form onSubmit={handleTest} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder={`${siteUrl}/catalog/`}
            className="flex-1 px-4 py-2 text-xs sm:text-sm rounded-xl bg-[#090c10] border border-[#2e3c54] text-white font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow transition-all cursor-pointer shrink-0"
          >
            Проверить URL
          </button>
        </form>

        {/* Test Result Box */}
        {testResult && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              testResult.allowed
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {testResult.allowed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="font-bold text-sm block">
                  {testResult.allowed ? 'Индексация РАЗРЕШЕНА (Allow)' : 'Индексация ЗАПРЕЩЕНА (Disallow)'}
                </span>
                <span className="text-[11px] opacity-80 font-mono">
                  Сработавшее правило: {testResult.matchedRule}
                </span>
              </div>
            </div>

            <span className="font-mono text-[11px] px-2 py-1 rounded bg-black/40 text-white">
              Путь: {testResult.testedPath}
            </span>
          </div>
        )}
      </div>

      {/* Robots.txt Editor Area */}
      <div className="bg-[#121720] p-4 rounded-2xl border border-[#283347] space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-bold text-white">Редактор robots.txt</span>
          <span>Кодировка: UTF-8</span>
        </div>

        <textarea
          value={robotsTxt}
          onChange={(e) => {
            setRobotsTxt(e.target.value);
            testRobotsTxtRule(e.target.value, testUrl);
          }}
          rows={12}
          className="w-full p-4 rounded-xl bg-[#090c10] border border-[#283347] text-white font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500/50"
        />
      </div>

    </div>
  );
}
