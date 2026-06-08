import { motion } from 'framer-motion';
import type { FetchProgress } from '../../types';

interface Props {
  progress: FetchProgress;
  username: string;
}

export default function LoadingUniverse({ progress, username }: Props) {
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8">
      {/* Animated orbs */}
      <div className="relative w-32 h-32">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${
                i === 0 ? 'rgba(99,102,241,0.6)' : i === 1 ? 'rgba(139,92,246,0.4)' : 'rgba(167,139,250,0.2)'
              } 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.2 + i * 0.15, 1],
              opacity: [0.8, 0.4, 0.8],
            }}
            transition={{
              duration: 2 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}
        <div
          className="absolute inset-0 m-auto rounded-full flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 0 30px rgba(99,102,241,0.7)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" fill="white" />
            <circle cx="4" cy="6" r="2" fill="white" opacity="0.7" />
            <circle cx="20" cy="6" r="2" fill="white" opacity="0.7" />
            <circle cx="4" cy="18" r="2" fill="white" opacity="0.7" />
            <circle cx="20" cy="18" r="2" fill="white" opacity="0.7" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-slate-200 font-medium text-base">{progress.message}</p>
        <p className="text-slate-500 text-sm">
          @{username}
          {progress.total > 0 && (
            <span className="text-slate-600">
              {' '}· {progress.current} / {progress.total} repos
            </span>
          )}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
          initial={{ width: '0%' }}
          animate={{ width: progress.total > 0 ? `${pct}%` : '30%' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
