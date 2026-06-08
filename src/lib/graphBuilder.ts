import type { GithubRepo, GraphData, GraphNode, GraphLink, DomainKey } from '../types';
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

// Languages in the same family → small pull toward each other
const LANGUAGE_FAMILIES: Record<string, string> = {
  JavaScript: 'web-scripting',
  TypeScript: 'web-scripting',
  CoffeeScript: 'web-scripting',
  Python: 'python',
  'Jupyter Notebook': 'python',
  Java: 'jvm',
  Kotlin: 'jvm',
  Scala: 'jvm',
  Groovy: 'jvm',
  C: 'c-family',
  'C++': 'c-family',
  'C#': 'dotnet',
  'F#': 'dotnet',
  Swift: 'apple',
  'Objective-C': 'apple',
  HTML: 'web-markup',
  CSS: 'web-markup',
  SCSS: 'web-markup',
  Sass: 'web-markup',
};

export function getLanguageColor(language: string | null): string {
  if (!language) return LANGUAGE_COLORS.default;
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.default;
}

function quarterKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
}

function monthsApart(isoA: string, isoB: string): number {
  return Math.abs(new Date(isoA).getTime() - new Date(isoB).getTime()) / (1000 * 60 * 60 * 24 * 30.5);
}

export function buildGraphData(repos: GithubRepo[]): GraphData {
  const filtered = repos.filter((r) => !r.archived);

  // Pre-compute domains for each repo
  const repoDomains = new Map<string, DomainKey[]>();
  filtered.forEach((r) => repoDomains.set(r.name, classifyRepo(r)));

  const nodes: GraphNode[] = filtered.map((repo) => {
    const val = Math.max(2, Math.log2(repo.stargazers_count + repo.forks_count + 2) * 4);
    return {
      id: repo.name,
      name: repo.name,
      val,
      color: getLanguageColor(repo.language),
      group: repo.language ?? 'Other',
      domains: repoDomains.get(repo.name) ?? [],
      repo,
    };
  });

  const links: GraphLink[] = [];
  const linkMap = new Map<string, GraphLink>();

  const upsert = (
    a: string,
    b: string,
    type: GraphLink['type'],
    value: number,
    shared?: string[]
  ) => {
    const key = [a, b].sort().join('|||');
    if (linkMap.has(key)) {
      const ex = linkMap.get(key)!;
      ex.value += value;
      if (shared) ex.sharedItems = [...(ex.sharedItems ?? []), ...shared];
    } else {
      const link: GraphLink = { source: a, target: b, value, type, sharedItems: shared };
      linkMap.set(key, link);
      links.push(link);
    }
  };

  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      const a = filtered[i];
      const b = filtered[j];

      // 1. Shared GitHub topics — highest confidence (user-curated signal)
      const sharedTopics = a.topics.filter((t) => b.topics.includes(t));
      if (sharedTopics.length > 0) {
        upsert(a.name, b.name, 'topic', sharedTopics.length * 4, sharedTopics);
      }

      // 2. Shared semantic domain — connects projects that solve the same class of problem
      const domainsA = repoDomains.get(a.name) ?? [];
      const domainsB = repoDomains.get(b.name) ?? [];
      const sharedDomains = domainsA.filter((d) => domainsB.includes(d));
      if (sharedDomains.length > 0) {
        upsert(a.name, b.name, 'domain', sharedDomains.length * 3, sharedDomains);
      }

      // 3. Time proximity — repos built around the same time are likely part of the same phase
      const gap = monthsApart(a.created_at, b.created_at);
      if (gap < 1) upsert(a.name, b.name, 'time', 2);
      else if (gap < 3) upsert(a.name, b.name, 'time', 1.5);
      else if (gap < 6) upsert(a.name, b.name, 'time', 0.8);

      // 4. Related language family — weak pull for JS↔TS, Java↔Kotlin, etc.
      const famA = LANGUAGE_FAMILIES[a.language ?? ''];
      const famB = LANGUAGE_FAMILIES[b.language ?? ''];
      if (famA && famB && famA === famB && a.language !== b.language) {
        upsert(a.name, b.name, 'language', 0.8);
      }

      // 5. Fork relationship
      if (a.fork && a.full_name.toLowerCase().includes(b.name.toLowerCase())) {
        upsert(a.name, b.name, 'fork', 8);
      }
    }
  }

  return { nodes, links };
}

/** Merge dependency-based links into existing graph data (called progressively after initial load) */
export function applyDependencyLinks(
  existing: GraphData,
  depLinks: GraphLink[]
): GraphData {
  if (depLinks.length === 0) return existing;
  const existingKeys = new Set(
    existing.links.map((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      return [s, t].sort().join('|||');
    })
  );
  const newLinks = depLinks.filter((l) => {
    const key = [l.source as string, l.target as string].sort().join('|||');
    return !existingKeys.has(key);
  });
  return { ...existing, links: [...existing.links, ...newLinks] };
}

export function getGraphStats(data: GraphData) {
  const repoNodes = data.nodes.filter((n) => !n.isFileNode);
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
