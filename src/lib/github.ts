import type { GithubRepo, RepoFile } from '../types';

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
  const allRepos: GithubRepo[] = [];
  let page = 1;

  while (true) {
    // /user/repos includes private repos; /users/{u}/repos is public-only
    const url = token
      ? `${BASE}/user/repos?per_page=100&sort=updated&page=${page}&type=owner`
      : `${BASE}/users/${username}/repos?per_page=100&sort=updated&page=${page}&type=owner`;
    const res = await fetch(url, { headers });
    if (res.status === 404) throw new Error('USER_NOT_FOUND');
    if (res.status === 403) throw new Error('RATE_LIMIT');
    if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);

    const repos: GithubRepo[] = await res.json();
    if (repos.length === 0) break;
    allRepos.push(...repos);
    onProgress?.(allRepos.length);
    if (repos.length < 100) break;
    page++;
  }

  return allRepos;
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
