import { motion } from 'framer-motion';

interface Stats {
  totalRepos: number;
  totalLanguages: number;
  totalConnections: number;
  totalStars: number;
  topLanguage: string;
}

interface Props {
  stats: Stats;
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-200 text-sm font-semibold tabular-nums">{value}</span>
      <span className="text-slate-500 text-xs">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="text-slate-700 text-xs">·</span>;
}

export default function StatsBar({ stats }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-4 py-2.5 px-5"
      style={{ background: 'linear-gradient(to top, rgba(4,8,22,0.85) 0%, transparent 100%)' }}
    >
      <Stat value={stats.totalRepos} label="repositories" />
      <Divider />
      <Stat value={stats.totalLanguages} label="languages" />
      <Divider />
      <Stat value={stats.totalConnections} label="connections" />
      <Divider />
      <Stat value={stats.totalStars.toLocaleString()} label="total stars" />
      {stats.topLanguage && (
        <>
          <Divider />
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            Top language:
            <span className="text-slate-300 font-medium">{stats.topLanguage}</span>
          </div>
        </>
      )}
      <div className="ml-auto text-[10px] text-slate-700 hidden md:block">
        Scroll to zoom · Drag to rotate · Click to explore
      </div>
    </motion.div>
  );
}
