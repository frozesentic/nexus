import { useState, useMemo, useCallback } from 'react';
import GraphCanvas from './GraphCanvas';
import TopBar from '../UI/TopBar';
import ProjectPanel from '../UI/ProjectPanel';
import StatsBar from '../UI/StatsBar';
import { getGraphStats, LANGUAGE_COLORS, getLanguageColor } from '../../lib/graphBuilder';
import { fetchRepoContents } from '../../lib/github';
import type { GraphData, GraphNode, GraphLink, RepoFile } from '../../types';

interface Props {
  graphData: GraphData;
  profile: Record<string, unknown> | null;
  username: string;
  token?: string;
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  onBack: () => void;
}

function fileColor(file: RepoFile): string {
  if (file.type === 'dir') return '#6366f1';
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const extColors: Record<string, string> = {
    ts: '#3178c6', tsx: '#3178c6', js: '#f7df1e', jsx: '#f7df1e',
    py: '#3572A5', rs: '#dea584', go: '#00ADD8', java: '#b07219',
    cs: '#178600', cpp: '#f34b7d', c: '#a8a8a8', rb: '#CC342D',
    swift: '#F05138', kt: '#A97BFF', html: '#e34c26', css: '#563d7c',
    scss: '#c6538c', sh: '#89e051', vue: '#41B883', svelte: '#FF3E00',
    json: '#cbcb41', md: '#94a3b8', yml: '#cb171e', yaml: '#cb171e',
    toml: '#9c4221', lock: '#6b7280',
  };
  return extColors[ext] ?? '#64748b';
}

export default function GraphView({
  graphData,
  profile,
  username,
  token,
  selectedNode,
  onSelectNode,
  onBack,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [repoFiles, setRepoFiles] = useState<Map<string, RepoFile[]>>(new Map());
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  const toggleExpand = useCallback(
    async (repoName: string) => {
      if (expandedRepos.has(repoName)) {
        setExpandedRepos((prev) => {
          const next = new Set(prev);
          next.delete(repoName);
          return next;
        });
        return;
      }

      if (!repoFiles.has(repoName)) {
        setLoadingFiles((prev) => new Set(prev).add(repoName));
        try {
          const files = await fetchRepoContents(username, repoName, token);
          setRepoFiles((prev) => new Map(prev).set(repoName, files));
        } finally {
          setLoadingFiles((prev) => {
            const next = new Set(prev);
            next.delete(repoName);
            return next;
          });
        }
      }

      setExpandedRepos((prev) => new Set(prev).add(repoName));
    },
    [expandedRepos, repoFiles, username, token]
  );

  const combinedGraphData = useMemo((): GraphData => {
    const fileNodes: GraphNode[] = [];
    const fileLinks: GraphLink[] = [];

    expandedRepos.forEach((repoName) => {
      const files = repoFiles.get(repoName) ?? [];
      files.forEach((file) => {
        const id = `${repoName}::file::${file.path}`;
        fileNodes.push({
          id,
          name: file.name,
          val: file.type === 'dir' ? 1.2 : 0.6,
          color: fileColor(file),
          group: 'file',
          nodeType: 'file',
          isFileNode: true,
          fileType: file.type,
          filePath: file.path,
          fileUrl: file.html_url,
          parentRepo: repoName,
        });
        fileLinks.push({
          source: repoName,
          target: id,
          value: 1,
          type: 'file',
          isFileLink: true,
        });
      });
    });

    return {
      nodes: [...graphData.nodes, ...fileNodes],
      links: [...graphData.links, ...fileLinks],
    };
  }, [graphData, expandedRepos, repoFiles]);

  const stats = useMemo(() => getGraphStats(combinedGraphData), [combinedGraphData]);

  const languages = useMemo(
    () =>
      [...new Set(graphData.nodes.map((n) => n.repo?.language).filter(Boolean) as string[])].sort(),
    [graphData.nodes]
  );

  const connectedNodes = useMemo(() => {
    if (!selectedNode || selectedNode.isFileNode) return [];
    const ids = new Set<string>();
    combinedGraphData.links.forEach((l) => {
      if (l.isFileLink) return;
      const src = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const tgt = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      if (src === selectedNode.id) ids.add(tgt);
      if (tgt === selectedNode.id) ids.add(src);
    });
    return combinedGraphData.nodes.filter((n) => ids.has(n.id) && !n.isFileNode);
  }, [selectedNode, combinedGraphData]);

  const selectedNodeFiles = useMemo(() => {
    if (!selectedNode || selectedNode.isFileNode) return [];
    return repoFiles.get(selectedNode.id) ?? [];
  }, [selectedNode, repoFiles]);

  const isExpanded = selectedNode ? expandedRepos.has(selectedNode.id) : false;
  const isLoadingFiles = selectedNode ? loadingFiles.has(selectedNode.id) : false;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <GraphCanvas
        graphData={combinedGraphData}
        selectedNode={selectedNode}
        searchQuery={searchQuery}
        selectedLanguage={selectedLanguage}
        onSelectNode={onSelectNode}
      />

      <TopBar
        username={username}
        avatarUrl={profile?.avatar_url as string | undefined}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        languages={languages}
        languageColors={LANGUAGE_COLORS}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onBack={onBack}
      />

      <ProjectPanel
        node={selectedNode}
        connectedNodes={connectedNodes}
        repoFiles={selectedNodeFiles}
        isExpanded={isExpanded}
        isLoadingFiles={isLoadingFiles}
        getLanguageColor={getLanguageColor}
        onClose={() => onSelectNode(null)}
        onSelectConnected={(n) => {
          if (!n.isFileNode) onSelectNode(n);
        }}
        onToggleExpand={() => selectedNode && toggleExpand(selectedNode.id)}
      />

      <StatsBar stats={stats} />
    </div>
  );
}
