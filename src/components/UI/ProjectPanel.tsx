import { AnimatePresence, motion } from 'framer-motion';
import type { GraphNode, RepoFile, DomainKey } from '../../types';
import { DOMAINS } from '../../lib/domainClassifier';

interface Props {
  node: GraphNode | null;
  connectedNodes: GraphNode[];
  repoFiles: RepoFile[];
  isExpanded: boolean;
  isLoadingFiles: boolean;
  getLanguageColor: (lang: string | null) => string;
  onClose: () => void;
  onSelectConnected: (node: GraphNode) => void;
  onToggleExpand: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const FILE_ICONS: Record<string, string> = {
  dir: '📁',
  ts: '🔷', tsx: '🔷', js: '🟨', jsx: '🟨',
  py: '🐍', rs: '🦀', go: '🐹', java: '☕',
  cs: '🔵', cpp: '🔴', c: '⚫', rb: '💎',
  swift: '🍊', kt: '🟣', html: '🌐', css: '🎨',
  scss: '🎨', sh: '🐚', vue: '💚', svelte: '🔥',
  json: '📋', md: '📝', yml: '⚙️', yaml: '⚙️',
  toml: '⚙️', txt: '📄', env: '🔐', gitignore: '🙈',
  dockerfile: '🐳', makefile: '🔨',
};

function fileIcon(file: RepoFile): string {
  if (file.type === 'dir') return FILE_ICONS.dir;
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return FILE_ICONS[ext] ?? FILE_ICONS[file.name.toLowerCase()] ?? '📄';
}

function FileRow({ file }: { file: RepoFile }) {
  return (
    <a
      href={file.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
    >
      <span className="text-sm leading-none">{fileIcon(file)}</span>
      <span
        className="text-xs truncate flex-1 transition-colors"
        style={{ color: file.type === 'dir' ? '#a5b4fc' : '#94a3b8' }}
      >
        {file.name}
      </span>
      {file.type === 'file' && file.size > 0 && (
        <span className="text-[10px] text-slate-600 flex-shrink-0">
          {file.size < 1024 ? `${file.size}B` : `${(file.size / 1024).toFixed(1)}K`}
        </span>
      )}
      <svg
        className="w-3 h-3 text-slate-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}

export default function ProjectPanel({
  node,
  connectedNodes,
  repoFiles,
  isExpanded,
  isLoadingFiles,
  getLanguageColor,
  onClose,
  onSelectConnected,
  onToggleExpand,
}: Props) {
  return (
    <AnimatePresence>
      {node && !node.isFileNode && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="absolute right-4 top-16 bottom-12 z-20 w-80 glass-strong rounded-2xl flex flex-col overflow-hidden"
          style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)' }}
        >
          {/* Language color accent strip */}
          <div
            className="h-0.5 w-full flex-shrink-0"
            style={{
              background: `linear-gradient(90deg, ${getLanguageColor(node.repo?.language ?? null)}, transparent)`,
            }}
          />

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="p-5 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-slate-100 truncate">{node.name}</h2>
                  {node.repo?.description && (
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-3">
                      {node.repo.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {node.repo?.language && (
                  <div className="flex items-center gap-1.5 tag-pill">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: getLanguageColor(node.repo.language) }}
                    />
                    {node.repo.language}
                  </div>
                )}
                {node.repo?.fork && <span className="tag-pill">fork</span>}
                {node.repo?.archived && <span className="tag-pill">archived</span>}
                {node.repo?.visibility === 'private' && <span className="tag-pill">private</span>}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
                    value: (node.repo?.stargazers_count ?? 0).toLocaleString(),
                    label: 'stars',
                  },
                  {
                    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>,
                    value: (node.repo?.forks_count ?? 0).toLocaleString(),
                    label: 'forks',
                  },
                  {
                    icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
                    value: (node.repo?.open_issues_count ?? 0).toLocaleString(),
                    label: 'issues',
                  },
                ].map((s) => (
                  <div key={s.label} className="glass rounded-xl p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">{s.icon}</div>
                    <div className="text-sm font-semibold text-slate-200">{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Domains */}
              {(node.domains?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Subject</p>
                  <div className="flex flex-wrap gap-1.5">
                    {node.domains!.map((dk) => {
                      const d = DOMAINS[dk as DomainKey];
                      return d ? (
                        <span
                          key={dk}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{
                            background: `${d.color}18`,
                            border: `1px solid ${d.color}40`,
                            color: d.color,
                          }}
                        >
                          <span className="text-xs">{d.icon}</span>
                          {d.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Topics */}
              {(node.repo?.topics?.length ?? 0) > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {node.repo!.topics.map((t) => (
                      <span key={t} className="tag-pill">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-1.5">
                {node.repo && (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Created</span>
                      <span className="text-slate-400">{formatDate(node.repo.created_at)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Last pushed</span>
                      <span className="text-slate-400">{timeAgo(node.repo.pushed_at)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Connected repos */}
              {connectedNodes.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-medium">
                    Connected — {connectedNodes.length}
                  </p>
                  <div className="space-y-0.5">
                    {connectedNodes.slice(0, 7).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => onSelectConnected(n)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: getLanguageColor(n.repo?.language ?? null) }}
                        />
                        <span className="text-xs text-slate-300 truncate">{n.name}</span>
                        <svg className="ml-auto flex-shrink-0 text-slate-600" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    ))}
                    {connectedNodes.length > 7 && (
                      <p className="text-[10px] text-slate-600 px-3">+{connectedNodes.length - 7} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* File tree section */}
              <div>
                <button
                  onClick={onToggleExpand}
                  disabled={isLoadingFiles}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium"
                  style={{
                    background: isExpanded
                      ? 'rgba(99,102,241,0.15)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isExpanded ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    color: isExpanded ? '#a5b4fc' : '#64748b',
                  }}
                >
                  <div className="flex items-center gap-2">
                    {isLoadingFiles ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                      </motion.div>
                    ) : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                    )}
                    <span>
                      {isLoadingFiles ? 'Loading files...' : isExpanded ? `Files (${repoFiles.length})` : 'Expand file tree'}
                    </span>
                  </div>
                  {!isLoadingFiles && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && repoFiles.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="mt-1 space-y-0.5">
                        {repoFiles.map((f) => (
                          <FileRow key={f.path} file={f} />
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-600 px-3 mt-2">
                        Files also appear as nodes in the graph · click to open on GitHub
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <a
              href={node.repo?.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.35))';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Open on GitHub
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
