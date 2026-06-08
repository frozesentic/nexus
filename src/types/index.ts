export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  homepage: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  fork: boolean;
  open_issues_count: number;
  default_branch: string;
  visibility: string;
  archived: boolean;
}

export interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  html_url: string;
  download_url: string | null;
}

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color: string;
  repo?: GithubRepo;
  group: string;
  // File node fields
  isFileNode?: boolean;
  fileType?: 'file' | 'dir';
  filePath?: string;
  fileUrl?: string;
  parentRepo?: string;
  // Three.js simulation positions (managed by library)
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  type: 'language' | 'topic' | 'fork' | 'file';
  sharedItems?: string[];
  isFileLink?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type AppPhase = 'setup' | 'loading' | 'graph';

export interface FetchProgress {
  current: number;
  total: number;
  message: string;
}
