import type { GithubRepo, GraphData, GraphNode, GraphLink } from '../types';
import { classifyRepo, DOMAINS } from './domainClassifier';

export { DOMAINS };

export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#a8a8a8',
  Ruby: '#CC342D',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Vue: '#41B883',
  Dart: '#00B4AB',
  PHP: '#4F5D95',
  Haskell: '#5e5086',
  Elixir: '#6e4a7e',
  Scala: '#c22d40',
  Lua: '#000080',
  R: '#198CE7',
  'Jupyter Notebook': '#DA5B0B',
  Svelte: '#FF3E00',
  Zig: '#ec915c',
  Nix: '#7e7eff',
  OCaml: '#ef7a08',
  Clojure: '#db5855',
  Elm: '#60B5CC',
  Solidity: '#AA6746',
  default: '#6b7280',
};

export function getLanguageColor(language: string | null): string {
  if (!language) return LANGUAGE_COLORS.default;
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.default;
}

export function buildGraphData(repos: GithubRepo[]): GraphData {
  const filtered = repos.filter((r) => !r.archived);

  const repoDomains = new Map<string, ReturnType<typeof classifyRepo>>();
  filtered.forEach((r) => repoDomains.set(r.name, classifyRepo(r)));

  const nodes: GraphNode[] = filtered.map((repo) => {
    const domains = repoDomains.get(repo.name) ?? [];
    return {
      id: repo.name,
      name: repo.name,
      val: Math.max(2, Math.log2(repo.stargazers_count + repo.forks_count + 2) * 4),
      color: getLanguageColor(repo.language),
      group: repo.language ?? 'Other',
      nodeType: 'repo' as const,
      domains,
      // Primary domain drives clustering and glow color
      primaryDomain: domains[0] ?? null,
      repo,
    };
  });

  // Only fork links — they mark true parent/child relationships
  const links: GraphLink[] = [];
  filtered.forEach((repo) => {
    if (!repo.fork) return;
    const parentName = repo.name; // fork itself
    // Try to find if any repo in the set is its source
    filtered.forEach((candidate) => {
      if (candidate.name !== repo.name && repo.full_name.toLowerCase().includes(candidate.name.toLowerCase())) {
        links.push({ source: repo.name, target: candidate.name, value: 6, type: 'topic' });
      }
    });
  });

  return { nodes, links };
}

export function getGraphStats(data: GraphData) {
  const repoNodes = data.nodes.filter((n) => n.nodeType === 'repo' && !n.isFileNode);
  const languages = new Set(repoNodes.map((n) => n.group).filter((g) => g !== 'Other'));
  const allDomains = new Set(repoNodes.flatMap((n) => n.domains ?? []));
  const totalStars = repoNodes.reduce((s, n) => s + (n.repo?.stargazers_count ?? 0), 0);
  const topLanguage = [...languages].reduce(
    (top, lang) => {
      const count = repoNodes.filter((n) => n.group === lang).length;
      return count > top.count ? { lang, count } : top;
    },
    { lang: '', count: 0 }
  );

  return {
    totalRepos: repoNodes.length,
    totalLanguages: languages.size,
    totalConnections: data.links.filter((l) => !l.isFileLink).length,
    totalStars,
    topLanguage: topLanguage.lang,
    totalDomains: allDomains.size,
  };
}
