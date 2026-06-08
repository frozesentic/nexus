import type { GithubRepo, GraphData, GraphNode, GraphLink } from '../types';

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
  default: '#6b7280',
};

// Languages that are closely related → weak connection even without shared topics
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
  Ruby: 'ruby',
  Swift: 'apple',
  'Objective-C': 'apple',
  HTML: 'web-markup',
  CSS: 'web-markup',
  SCSS: 'web-markup',
  Sass: 'web-markup',
};

// Technology keywords to extract from name + description
const TECH_KEYWORDS = [
  'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'remix',
  'node', 'express', 'fastify', 'nestjs',
  'django', 'flask', 'fastapi', 'rails', 'laravel', 'spring',
  'tensorflow', 'pytorch', 'keras', 'sklearn', 'ml', 'ai', 'machine learning',
  'docker', 'kubernetes', 'k8s', 'aws', 'gcp', 'azure', 'serverless',
  'mongodb', 'postgres', 'postgresql', 'mysql', 'sqlite', 'redis',
  'graphql', 'rest', 'websocket', 'grpc',
  'game', 'opengl', 'unity', 'pygame', 'godot',
  'cli', 'terminal', 'shell', 'bash',
  'api', 'library', 'framework', 'plugin', 'extension',
  'mobile', 'android', 'ios', 'flutter', 'react native',
  'blockchain', 'web3', 'crypto', 'nft',
  'discord', 'slack', 'telegram', 'bot',
  'scraper', 'crawler', 'automation',
];

function extractKeywords(repo: GithubRepo): Set<string> {
  const text = `${repo.name} ${repo.description ?? ''} ${repo.topics.join(' ')}`.toLowerCase();
  return new Set(TECH_KEYWORDS.filter((kw) => text.includes(kw)));
}

export function getLanguageColor(language: string | null): string {
  if (!language) return LANGUAGE_COLORS.default;
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.default;
}

export function buildGraphData(repos: GithubRepo[]): GraphData {
  const filtered = repos.filter((r) => !r.archived);

  const nodes: GraphNode[] = filtered.map((repo) => {
    const stars = repo.stargazers_count;
    const forks = repo.forks_count;
    const val = Math.max(2, Math.log2(stars + forks + 2) * 4);
    return {
      id: repo.name,
      name: repo.name,
      val,
      color: getLanguageColor(repo.language),
      group: repo.language ?? 'Other',
      repo,
    };
  });

  const links: GraphLink[] = [];
  const seenKeys = new Map<string, GraphLink>();

  const upsertLink = (
    a: string,
    b: string,
    type: GraphLink['type'],
    value: number,
    sharedItems?: string[]
  ) => {
    const key = [a, b].sort().join('|||');
    if (seenKeys.has(key)) {
      const existing = seenKeys.get(key)!;
      existing.value += value;
      if (sharedItems) existing.sharedItems = [...(existing.sharedItems ?? []), ...sharedItems];
    } else {
      const link: GraphLink = { source: a, target: b, value, type, sharedItems };
      seenKeys.set(key, link);
      links.push(link);
    }
  };

  const repoKeywords = new Map<string, Set<string>>();
  filtered.forEach((r) => repoKeywords.set(r.name, extractKeywords(r)));

  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      const a = filtered[i];
      const b = filtered[j];

      // 1. Shared topics (strongest — explicit human-assigned tags)
      const sharedTopics = a.topics.filter((t) => b.topics.includes(t));
      if (sharedTopics.length > 0) {
        upsertLink(a.name, b.name, 'topic', sharedTopics.length * 3, sharedTopics);
      }

      // 2. Tech keyword overlap (≥1 shared keyword = same ecosystem)
      const kwA = repoKeywords.get(a.name)!;
      const kwB = repoKeywords.get(b.name)!;
      const sharedKw = [...kwA].filter((k) => kwB.has(k));
      if (sharedKw.length >= 1) {
        upsertLink(a.name, b.name, 'topic', sharedKw.length, sharedKw);
      }

      // 3. Same primary language (direct link)
      if (a.language && a.language === b.language) {
        upsertLink(a.name, b.name, 'language', 2);
      }

      // 4. Related language family (JS↔TS, Java↔Kotlin, etc.) — weak link
      const famA = a.language ? LANGUAGE_FAMILIES[a.language] : null;
      const famB = b.language ? LANGUAGE_FAMILIES[b.language] : null;
      if (famA && famB && famA === famB && a.language !== b.language) {
        upsertLink(a.name, b.name, 'language', 1);
      }

      // 5. Time proximity — repos created within 3 months of each other
      const gap = Math.abs(new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const months = gap / (1000 * 60 * 60 * 24 * 30.5);
      if (months < 1) upsertLink(a.name, b.name, 'language', 1.5);
      else if (months < 3) upsertLink(a.name, b.name, 'language', 0.8);

      // 6. Fork relationship (very strong)
      if (a.fork && b.full_name && a.full_name.includes(b.name)) {
        upsertLink(a.name, b.name, 'fork', 8);
      }
    }
  }

  return { nodes, links };
}

export function getGraphStats(data: GraphData) {
  const repoNodes = data.nodes.filter((n) => !n.isFileNode);
  const languages = new Set(repoNodes.map((n) => n.group).filter((g) => g !== 'Other'));
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
  };
}
