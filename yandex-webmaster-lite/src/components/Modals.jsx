import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  X,
  Shield,
  CheckCircle2,
  Key,
  Copy,
  Download,
} from 'lucide-react';

export default function Modals() {
  const {
    isAddSiteModalOpen,
    setIsAddSiteModalOpen,
    isVerifyModalOpen,
    setIsVerifyModalOpen,
    isTokenModalOpen,
    setIsTokenModalOpen,
    handleAddSite,
    activeSite,
    oauthToken,
    setOauthToken,
    yandexUser,
    setYandexUser,
    showToast,
    toast,
  } = useWebmaster();

  // Add Site state
  const [siteInput, setSiteInput] = useState('');

  // Verify modal state
  const [verifyTab, setVerifyTab] = useState('meta');
  const [copiedCode, setCopiedCode] = useState(false);

  // Token modal state
  const [tokenInput, setTokenInput] = useState(oauthToken || '');
  const [loginInput, setLoginInput] = useState(yandexUser.login || '');

  const siteUrl = activeSite?.unicode_host_url || 'https://vash-site.ru';
  const siteDomain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const verificationHash = 'yandex_verification_hash';

  const metaTagCode = `<meta name="yandex-verification" content="${verificationHash}" />`;
  const htmlFileName = `${verificationHash}.html`;
  const dnsTxtRecord = `yandex-verification: ${verificationHash}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast('Код скопирован в буфер обмена!', 'success');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveToken = (e) => {
    e.preventDefault();
    setOauthToken(tokenInput.trim());
    setYandexUser({ ...yandexUser, login: loginInput.trim() || 'user' });
    setIsTokenModalOpen(false);
    showToast('Настройки Яндекс ID сохранены! 🚀', 'success');
  };

  return (
    <>
      {/* 1. ADD SITE MODAL */}
      {isAddSiteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#121720] border-2 border-[#3b4b66] rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-[#283347] bg-[#161c28] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  +
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Добавить сайт в Вебмастер</h3>
                  <p className="text-xs text-gray-400">Мониторинг индексации и поиска</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSiteModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#20293a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (siteInput.trim()) {
                  handleAddSite(siteInput.trim());
                  setSiteInput('');
                }
              }}
              className="p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-200 block">Адрес сайта (URL):</label>
                <input
                  type="text"
                  value={siteInput}
                  onChange={(e) => setSiteInput(e.target.value)}
                  placeholder="https://vash-site.ru"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090c10] border border-[#2e3c54] text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  required
                  autoFocus
                />
                <p className="text-[11px] text-gray-400">
                  Укажите главное зеркало сайта (рекомендуется с протоколом HTTPS).
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSiteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#1c2331] border border-[#2e3c54] text-gray-200 text-xs font-semibold hover:bg-[#252f42]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  Добавить сайт
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. VERIFICATION MODAL */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#121720] border-2 border-[#3b4b66] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-[#283347] bg-[#161c28] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Подтверждение прав на сайт</h3>
                  <p className="text-xs text-gray-400 font-mono">{siteDomain}</p>
                </div>
              </div>
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#20293a] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Права на домен {siteDomain} подтверждены! ✅</span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-white block text-xs">Способы подтверждения:</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#090c10] rounded-xl border border-[#2e3c54] text-xs">
                  <button
                    onClick={() => setVerifyTab('meta')}
                    className={`py-1.5 rounded-lg font-semibold transition-colors ${
                      verifyTab === 'meta' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    HTML Мета-тег
                  </button>
                  <button
                    onClick={() => setVerifyTab('html')}
                    className={`py-1.5 rounded-lg font-semibold transition-colors ${
                      verifyTab === 'html' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    HTML-файл
                  </button>
                  <button
                    onClick={() => setVerifyTab('dns')}
                    className={`py-1.5 rounded-lg font-semibold transition-colors ${
                      verifyTab === 'dns' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    DNS TXT
                  </button>
                </div>
              </div>

              {verifyTab === 'meta' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    Добавьте этот мета-тег в заголовок страницы <code>&lt;head&gt;</code> главной страницы вашего сайта:
                  </p>
                  <div className="p-3 rounded-xl bg-[#090c10] border border-[#2e3c54] font-mono text-xs flex items-center justify-between gap-2">
                    <span className="text-amber-300 truncate">{metaTagCode}</span>
                    <button
                      onClick={() => handleCopy(metaTagCode)}
                      className="p-1.5 rounded-lg bg-[#161c28] hover:bg-[#20293a] text-gray-300 hover:text-white border border-[#2e3c54] shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {verifyTab === 'html' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    Создайте HTML-файл с именем <code>{htmlFileName}</code> в корневом каталоге вашего веб-сервера.
                  </p>
                  <button
                    onClick={() => {
                      const blob = new Blob([`<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"></head><body>Verification: ${verificationHash}</body></html>`], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = htmlFileName;
                      a.click();
                      showToast(`Файл ${htmlFileName} скачан!`, 'success');
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#090c10] hover:bg-[#161c28] border border-[#2e3c54] font-bold text-xs flex items-center justify-center gap-2 text-white"
                  >
                    <Download className="w-3.5 h-3.5 text-red-400" />
                    <span>Скачать проверочный файл ({htmlFileName})</span>
                  </button>
                </div>
              )}

              {verifyTab === 'dns' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">
                    Добавьте TXT-запись в DNS-панели управления вашим доменом:
                  </p>
                  <div className="p-3 rounded-xl bg-[#090c10] border border-[#2e3c54] font-mono text-xs flex items-center justify-between gap-2">
                    <span className="text-amber-300 truncate">{dnsTxtRecord}</span>
                    <button
                      onClick={() => handleCopy(dnsTxtRecord)}
                      className="p-1.5 rounded-lg bg-[#161c28] hover:bg-[#20293a] text-gray-300 hover:text-white border border-[#2e3c54] shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#283347] bg-[#161c28] flex justify-end">
              <button
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
          <div className="px-4 py-3 rounded-2xl bg-[#161c28] border-2 border-emerald-500/50 shadow-2xl flex items-center gap-3 text-xs sm:text-sm text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
}
