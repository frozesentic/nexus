import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGithubData } from './hooks/useGithubData';
import GithubSetup from './components/Setup/GithubSetup';
import LoadingUniverse from './components/Setup/LoadingUniverse';
import GraphView from './components/Graph/GraphView';
import type { AppPhase, GraphNode } from './types';

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('setup');
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const { graphData, profile, loading, loadingDeps, error, progress, fetch, reset } = useGithubData();

  useEffect(() => {
    const savedUsername = localStorage.getItem('nexus-username') ?? '';
    const savedToken = localStorage.getItem('nexus-token') ?? '';
    if (savedUsername) {
      setUsername(savedUsername);
      setToken(savedToken);
    }
  }, []);

  const handleExplore = async (u: string, t: string) => {
    setUsername(u);
    setToken(t);
    localStorage.setItem('nexus-username', u);
    if (t) localStorage.setItem('nexus-token', t);
    setPhase('loading');
    await fetch(u, t || undefined);
  };

  useEffect(() => {
    if (!loading && graphData && phase === 'loading') {
      setPhase('graph');
    }
    if (!loading && error && phase === 'loading') {
      setPhase('setup');
    }
  }, [loading, graphData, error, phase]);

  const handleBack = () => {
    reset();
    setSelectedNode(null);
    setPhase('setup');
  };

  return (
    <div className="w-screen h-screen overflow-hidden" style={{ background: '#040816' }}>
      <div className="nebula" />

      <AnimatePresence mode="wait">
        {phase === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <GithubSetup
              defaultUsername={username}
              onExplore={handleExplore}
              error={error}
            />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <LoadingUniverse progress={progress} username={username} />
          </motion.div>
        )}

        {phase === 'graph' && graphData && (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <GraphView
              graphData={graphData}
              profile={profile}
              username={username}
              token={token || undefined}
              loadingDeps={loadingDeps}
              selectedNode={selectedNode}
              onSelectNode={setSelectedNode}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
