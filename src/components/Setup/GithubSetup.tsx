import { useState } from 'react';
import { motion } from 'framer-motion';
import AnimatedBackground from './AnimatedBackground';

interface Props {
  defaultUsername: string;
  onExplore: (username: string, token: string) => void;
  error: string | null;
}

const FEATURES = [
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
        <line x1="2" y1="12" x2="6" y2="12" />
        <line x1="18" y1="12" x2="22" y2="12" />
      </svg>
    ),
    label: '3D force graph',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    label: 'Topic connections',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: 'Explore file trees',
  },
  {
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    ),
    label: '30+ language colors',
  },
];

export default function GithubSetup({ defaultUsername, onExplore, error }: Props) {
  const [username, setUsername] = useState(defaultUsername);
  const [token, setToken] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onExplore(username.trim(), token.trim());
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
      {/* Animated graph background */}
      <AnimatedBackground />

      {/* Dark gradient overlays to frame the form */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(4,8,22,0.55) 0%, rgba(4,8,22,0.92) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-10 text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 0 0 1px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2.5" fill="white" />
              <circle cx="4.5" cy="5.5" r="1.8" fill="white" opacity="0.75" />
              <circle cx="19.5" cy="5.5" r="1.8" fill="white" opacity="0.75" />
              <circle cx="4.5" cy="18.5" r="1.8" fill="white" opacity="0.75" />
              <circle cx="19.5" cy="18.5" r="1.8" fill="white" opacity="0.75" />
              <line x1="12" y1="9.5" x2="4.5" y2="5.5" stroke="white" strokeWidth="1.2" opacity="0.45" />
              <line x1="12" y1="9.5" x2="19.5" y2="5.5" stroke="white" strokeWidth="1.2" opacity="0.45" />
              <line x1="12" y1="14.5" x2="4.5" y2="18.5" stroke="white" strokeWidth="1.2" opacity="0.45" />
              <line x1="12" y1="14.5" x2="19.5" y2="18.5" stroke="white" strokeWidth="1.2" opacity="0.45" />
            </svg>
          </div>

          <h1
            className="text-5xl font-black tracking-tight mb-2"
            style={{
              background: 'linear-gradient(135deg, #e2e8f0 0%, #a5b4fc 50%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
            }}
          >
            NEXUS
          </h1>
          <p className="text-slate-400 text-sm font-light" style={{ letterSpacing: '0.02em' }}>
            Your programming projects as a knowledge graph
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full space-y-3"
        >
          <div className="relative">
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              style={{ pointerEvents: 'none' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </div>
            <input
              className="input-glass pl-10 py-3.5 text-sm font-medium"
              type="text"
              placeholder="GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          {/* Advanced / token */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors w-full justify-center py-1"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              {showAdvanced ? 'Hide' : 'Use private repos? Add a token'}
            </button>

            <motion.div
              initial={false}
              animate={{ height: showAdvanced ? 'auto' : 0, opacity: showAdvanced ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pt-2 relative">
                <input
                  className="input-glass pr-10 py-3 text-sm"
                  type={showToken ? 'text' : 'password'}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showToken ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl px-4 py-3 text-xs text-center"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={!username.trim()}
            className="btn-primary w-full text-sm font-semibold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            <span>Explore Universe</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </motion.form>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] text-slate-500"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-indigo-400">{f.icon}</span>
              {f.label}
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-700 text-[11px] mt-6 text-center"
        >
          GitHub Public API · Read-only · No data stored
        </motion.p>
      </div>
    </div>
  );
}
