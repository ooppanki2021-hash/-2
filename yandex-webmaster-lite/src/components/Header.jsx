import React, { useState } from 'react';
import { useWebmaster } from '../context/WebmasterContext';
import {
  Plus,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Key,
  Shield,
  ChevronDown,
  Trash2,
  Settings,
} from 'lucide-react';

export default function Header() {
  const {
    sites,
    activeSite,
    activeSiteId,
    setActiveSiteId,
    setIsAddSiteModalOpen,
    setIsTokenModalOpen,
    setIsVerifyModalOpen,
    handleDeleteSite,
    yandexUser,
    setCurrentTab,
  } = useWebmaster();

  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0d1117] border-b border-[#283347] shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left: Logo & Site Selector */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          
          {/* Yandex Webmaster Logo */}
          <div
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-base shadow-md">
              Я
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-extrabold text-sm text-white tracking-tight block">
                Вебмастер <span className="text-red-400 text-xs font-semibold px-1 py-0.2 bg-red-500/15 rounded border border-red-500/30">Lite</span>
              </span>
              <span className="text-[10px] text-gray-400">Яндекс.Поиск</span>
            </div>
          </div>

          {/* Site Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#161c28] hover:bg-[#20293a] border border-[#2e3c54] text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer max-w-[190px] sm:max-w-xs"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="truncate font-mono">{activeSite?.unicode_host_url || 'Выберите сайт'}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-auto" />
            </button>

            {/* Dropdown Menu with 100% Solid Opaque Background */}
            {isSiteDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
                  onClick={() => setIsSiteDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 bg-[#121720] border-2 border-[#3b4b66] rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Мои сайты ({sites.length})</span>
                    <span className="text-[10px] text-emerald-400 font-normal">Активен</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {sites.map((site) => {
                      const isSelected = site.host_id === activeSiteId;
                      return (
                        <div
                          key={site.host_id}
                          onClick={() => {
                            setActiveSiteId(site.host_id);
                            setIsSiteDropdownOpen(false);
                          }}
                          className={`p-3 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? 'bg-red-500/20 border border-red-500/40 text-white font-bold'
                              : 'bg-[#18202d] hover:bg-[#222c3d] text-gray-200 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-red-400' : 'bg-gray-500'}`} />
                            <span className="truncate font-mono">{site.unicode_host_url}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#090c10] text-amber-400 font-mono font-bold border border-amber-500/30">
                              ИКС {site.sqi}
                            </span>
                            {sites.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSite(site.host_id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg cursor-pointer"
                                title="Удалить"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#283347]">
                    <button
                      onClick={() => {
                        setIsSiteDropdownOpen(false);
                        setIsAddSiteModalOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Добавить новый сайт</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Actions: Settings & APK Button */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Big Obvious Settings / Yandex ID Tab Button */}
          <button
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Яндекс ID</span>
          </button>

          {/* Download APK Button */}
          <a
            href="./yandex-webmaster.apk"
            download="yandex-webmaster.apk"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/40 text-xs font-bold transition-all shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-red-400" />
            <span>Скачать APK</span>
          </a>
        </div>

      </div>
    </header>
  );
}
