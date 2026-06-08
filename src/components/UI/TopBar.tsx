import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  username: string;
  avatarUrl?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  languages: string[];
  languageColors: Record<string, string>;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onBack: () => void;
}

export default function TopBar({
  username,
  avatarUrl,
  searchQuery,
  onSearchChange,
  languages,
  languageColors,
  selectedLanguage,
  onLanguageChange,
  onBack,
}: Props) {
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-5 py-3"
      style={{
        background: 'linear-gradient(to bottom, rgba(4,8,22,0.9) 0%, transparent 100%)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 shrink-0">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="white" />
            <circle cx="4" cy="6" r="2" fill="white" opacity="0.7" />
            <circle cx="20" cy="6" r="2" fill="white" opacity="0.7" />
            <circle cx="4" cy="18" r="2" fill="white" opacity="0.7" />
            <circle cx="20" cy="18" r="2" fill="white" opacity="0.7" />
            <line x1="12" y1="9" x2="4" y2="6" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="12" y1="9" x2="20" y2="6" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="12" y1="15" x2="4" y2="18" stroke="white" strokeWidth="1.5" opacity="0.5" />
            <line x1="12" y1="15" x2="20" y2="18" stroke="white" strokeWidth="1.5" opacity="0.5" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-widest gradient-text">NEXUS</span>
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="input-glass pl-9 py-2 text-sm"
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Language filter */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => setLangOpen(!langOpen)}
          className="glass glass-hover flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 transition-all"
        >
          {selectedLanguage ? (
            <>
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: languageColors[selectedLanguage] ?? '#6b7280' }}
              />
              <span className="font-medium">{selectedLanguage}</span>
            </>
          ) : (
            <span className="text-slate-400">All Languages</span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${langOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <AnimatePresence>
          {langOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 left-0 glass-strong rounded-xl overflow-hidden shadow-2xl z-50 min-w-[160px]"
              style={{ maxHeight: 280, overflowY: 'auto' }}
            >
              <div className="p-1">
                <button
                  onClick={() => { onLanguageChange(''); setLangOpen(false); }}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedLanguage ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  All Languages
                </button>
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => { onLanguageChange(lang); setLangOpen(false); }}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedLanguage === lang ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: languageColors[lang] ?? '#6b7280' }}
                    />
                    {lang}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* User avatar */}
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className="w-7 h-7 rounded-full" style={{ border: '1px solid rgba(255,255,255,0.15)' }} />
          ) : (
            <div className="w-7 h-7 rounded-full glass flex items-center justify-center text-xs font-semibold text-slate-300">
              {username[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-slate-400 text-sm hidden sm:block">@{username}</span>
        </div>

        {/* Back */}
        <button
          onClick={onBack}
          className="glass glass-hover rounded-lg px-3 py-2 text-slate-400 hover:text-slate-200 transition-colors text-sm flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="hidden sm:block">Change</span>
        </button>
      </div>
    </div>
  );
}
