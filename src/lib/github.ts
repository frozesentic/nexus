import type { GithubRepo, RepoFile, GraphLink } from '../types';

const BASE = 'https://api.github.com';

function buildHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
  if (token) headers['Authorization'] = `token ${token}`;
  return headers;
}

export async function fetchUserRepos(
  username: string,
  token?: string,
  onProgress?: (fetched: number) => void
): Promise<GithubRepo[]> {
  const headers = buildHeaders(token);
  const all: GithubRepo[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${BASE}/users/${username}/repos?per_page=100&sort=updated&page=${page}&type=owner`,
      { headers }
    );
    if (res.status === 404) throw new Error('USER_NOT_FOUND');
    if (res.status === 403 || res.status === 429) throw new Error('RATE_LIMIT');
    if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);

    const repos: GithubRepo[] = await res.json();
    if (repos.length === 0) break;
    all.push(...repos);
    onProgress?.(all.length);
    if (repos.length < 100) break;
    page++;
  }

  return all;
}

export async function fetchUserProfile(username: string, token?: string) {
  const headers = buildHeaders(token);
  const res = await fetch(`${BASE}/users/${username}`, { headers });
  if (res.status === 403 || res.status === 429) throw new Error('RATE_LIMIT');
  if (res.status === 404) throw new Error('USER_NOT_FOUND');
  if (!res.ok) throw new Error(`GitHub error ${res.status}`);
  return res.json();
}

export async function fetchRepoContents(
  username: string,
  repo: string,
  token?: string
): Promise<RepoFile[]> {
  const headers = buildHeaders(token);
  const res = await fetch(`${BASE}/repos/${username}/${repo}/contents`, { headers });
  if (!res.ok) return [];
  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return (data as RepoFile[]).sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'dir' ? -1 : 1;
  });
}

// Significant deps to exclude — universal noise that connects everything
const DEP_NOISE = new Set([
  'typescript', 'prettier', 'eslint', '@types/node', '@types/react', '@types/react-dom',
  'husky', 'lint-staged', 'rimraf', 'cross-env', 'dotenv', 'nodemon',
  'jest', 'vitest', 'ts-jest', '@testing-library/react', 'c8', 'nyc',
  'webpack', 'vite', 'esbuild', 'rollup', 'parcel',
  '@babel/core', '@babel/preset-env', '@babel/preset-typescript',
  'pip', 'setuptools', 'wheel', 'black', 'flake8', 'mypy', 'pytest',
]);

async function fetchFileContent(
  username: string,
  repo: string,
  filename: string,
  token?: string
): Promise<string | null> {
  try {
    const headers = buildHeaders(token);
    const res = await fetch(`${BASE}/repos/${username}/${repo}/contents/${filename}`, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    return atob(data.content.replace(/\n/g, ''));
  } catch {
    return null;
  }
}

async function getRepoDeps(
  username: string,
  repo: GithubRepo,
  token?: string
): Promise<string[]> {
  const lang = repo.language ?? '';

  if (lang === 'JavaScript' || lang === 'TypeScript') {
    const content = await fetchFileContent(username, repo.name, 'package.json', token);
    if (!content) return [];
    try {
      const pkg = JSON.parse(content);
      return Object.keys({ ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) })
        .map((d) => d.replace(/^@/, '').split('/')[0])
        .filter((d) => !DEP_NOISE.has(d) && d.length > 1);
    } catch {
      return [];
    }
  }

  if (lang === 'Python') {
    const content =
      (await fetchFileContent(username, repo.name, 'requirements.txt', token)) ??
      (await fetchFileContent(username, repo.name, 'requirements/base.txt', token));
    if (!content) return [];
    return content
      .split('\n')
      .map((l) => l.trim().split(/[>=<!; ]/)[0].toLowerCase())
      .filter((d) => d.length > 1 && !d.startsWith('#') && !DEP_NOISE.has(d));
  }

  if (lang === 'Rust') {
    const content = await fetchFileContent(username, repo.name, 'Cargo.toml', token);
    if (!content) return [];
    const matches = content.matchAll(/^(\w[\w-]*)\s*=/gm);
    const deps = [...matches].map((m) => m[1]).filter((d) => !DEP_NOISE.has(d));
    return deps;
  }

  return [];
}

export async function fetchDependencyLinks(
  username: string,
  repos: GithubRepo[],
  token?: string,
  onProgress?: (pct: number) => void
): Promise<GraphLink[]> {
  const eligible = repos.filter(
    (r) => !r.archived && ['JavaScript', 'TypeScript', 'Python', 'Rust'].includes(r.language ?? '')
  );

  const repoDeps = new Map<string, Set<string>>();
  const BATCH = 5;

  for (let i = 0; i < eligible.length; i += BATCH) {
    const batch = eligible.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (repo) => {
        const deps = await getRepoDeps(username, repo, token);
        if (deps.length > 0) repoDeps.set(repo.name, new Set(deps));
      })
    );
    onProgress?.((i + BATCH) / eligible.length);
    if (i + BATCH < eligible.length) await new Promise((r) => setTimeout(r, 350));
  }

  const links: GraphLink[] = [];
  const names = [...repoDeps.keys()];

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = names[i];
      const b = names[j];
      const shared = [...repoDeps.get(a)!].filter((d) => repoDeps.get(b)!.has(d));
      if (shared.length >= 2) {
        links.push({
          source: a,
          target: b,
          value: Math.min(shared.length * 1.5, 6),
          type: 'dependency',
          sharedItems: shared.slice(0, 6),
        });
      }
    }
  }

  return links;
}
