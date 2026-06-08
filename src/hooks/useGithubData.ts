import { useState, useCallback, useRef } from 'react';
import { fetchUserRepos, fetchUserProfile, fetchDependencyLinks } from '../lib/github';
import { buildGraphData, applyDependencyLinks } from '../lib/graphBuilder';
import type { GraphData, GraphLink, FetchProgress, GithubRepo } from '../types';

interface UseGithubDataReturn {
  graphData: GraphData | null;
  profile: Record<string, unknown> | null;
  loading: boolean;
  loadingDeps: boolean;
  error: string | null;
  progress: FetchProgress;
  fetch: (username: string, token?: string) => Promise<void>;
  reset: () => void;
}

export function useGithubData(): UseGithubDataReturn {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDeps, setLoadingDeps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<FetchProgress>({ current: 0, total: 0, message: '' });
  const reposRef = useRef<GithubRepo[]>([]);

  const fetch = useCallback(async (username: string, token?: string) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: 0, message: 'Connecting to GitHub...' });

    try {
      setProgress((p) => ({ ...p, message: 'Fetching your profile...' }));
      const profileData = await fetchUserProfile(username, token);
      setProfile(profileData);

      const totalRepos = profileData.public_repos as number;
      setProgress({ current: 0, total: totalRepos, message: 'Mapping your repositories...' });

      const repos = await fetchUserRepos(username, token, (fetched) => {
        setProgress({ current: fetched, total: Math.max(fetched, totalRepos), message: 'Mapping your repositories...' });
      });
      reposRef.current = repos;

      setProgress({ current: repos.length, total: repos.length, message: 'Building connections...' });
      await new Promise((r) => setTimeout(r, 400));

      const graph = buildGraphData(repos);
      setGraphData(graph);
      setLoading(false);

      // Progressive enhancement: fetch dependencies in background
      if (repos.length > 0) {
        setLoadingDeps(true);
        try {
          const depLinks = await fetchDependencyLinks(username, repos, token);
          if (depLinks.length > 0) {
            setGraphData((prev) => prev ? applyDependencyLinks(prev, depLinks) : prev);
          }
        } catch {
          // silently ignore dep fetch errors
        } finally {
          setLoadingDeps(false);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      if (msg === 'USER_NOT_FOUND') setError('GitHub user not found. Check the username and try again.');
      else if (msg === 'RATE_LIMIT') setError('GitHub API rate limit exceeded. Add a personal access token to continue.');
      else setError(`Failed to fetch data: ${msg}`);
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGraphData(null);
    setProfile(null);
    setError(null);
    setLoadingDeps(false);
    setProgress({ current: 0, total: 0, message: '' });
    reposRef.current = [];
  }, []);

  return { graphData, profile, loading, loadingDeps, error, progress, fetch, reset };
}
