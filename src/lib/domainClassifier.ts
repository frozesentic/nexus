import type { DomainKey, GithubRepo } from '../types';

export const DOMAINS: Record<DomainKey, { name: string; color: string; icon: string }> = {
  'web-app':         { name: 'Web App',         color: '#60a5fa', icon: '🌐' },
  'backend-api':     { name: 'Backend / API',   color: '#34d399', icon: '⚙️' },
  'data-analysis':   { name: 'Data Analysis',   color: '#fb923c', icon: '📊' },
  'machine-learning':{ name: 'Machine Learning',color: '#c084fc', icon: '🤖' },
  'game':            { name: 'Game Dev',         color: '#f472b6', icon: '🎮' },
  'cli-tool':        { name: 'CLI Tool',         color: '#94a3b8', icon: '🔧' },
  'library':         { name: 'Library / SDK',   color: '#38bdf8', icon: '📦' },
  'mobile':          { name: 'Mobile',           color: '#fb7185', icon: '📱' },
  'hardware-iot':    { name: 'Hardware / IoT',  color: '#f59e0b', icon: '🔌' },
  'realtime':        { name: 'Realtime',         color: '#22d3ee', icon: '⚡' },
  'devtools':        { name: 'DevTools',         color: '#a3e635', icon: '🛠️' },
  'bot':             { name: 'Bot / Automation', color: '#7289da', icon: '🤖' },
  'database':        { name: 'Database',         color: '#f97316', icon: '🗄️' },
  'blockchain':      { name: 'Blockchain',       color: '#fbbf24', icon: '⛓️' },
  'security':        { name: 'Security',         color: '#ef4444', icon: '🔒' },
};

// Maps specific GitHub topics to their parent domain
export const TOPIC_TO_DOMAIN: Record<string, DomainKey> = {
  // Game
  minecraft: 'game', forge: 'game', fabric: 'game', bukkit: 'game', spigot: 'game',
  modding: 'game', mods: 'game', 'game-development': 'game', gamedev: 'game',
  unity: 'game', godot: 'game', 'game-engine': 'game', opengl: 'game', sdl: 'game',
  pygame: 'game', libgdx: 'game', phaser: 'game', rpg: 'game', platformer: 'game',
  // Web
  react: 'web-app', nextjs: 'web-app', vue: 'web-app', angular: 'web-app',
  svelte: 'web-app', 'web-development': 'web-app', frontend: 'web-app',
  tailwindcss: 'web-app', vite: 'web-app', html: 'web-app', css: 'web-app',
  // Backend
  'rest-api': 'backend-api', graphql: 'backend-api', api: 'backend-api',
  backend: 'backend-api', fastapi: 'backend-api', express: 'backend-api',
  flask: 'backend-api', django: 'backend-api', spring: 'backend-api',
  nestjs: 'backend-api', microservices: 'backend-api', grpc: 'backend-api',
  // ML/AI
  'machine-learning': 'machine-learning', 'deep-learning': 'machine-learning',
  tensorflow: 'machine-learning', pytorch: 'machine-learning', keras: 'machine-learning',
  'neural-network': 'machine-learning', nlp: 'machine-learning',
  'computer-vision': 'machine-learning', huggingface: 'machine-learning',
  'artificial-intelligence': 'machine-learning', llm: 'machine-learning',
  // Data
  'data-science': 'data-analysis', pandas: 'data-analysis', numpy: 'data-analysis',
  'data-analysis': 'data-analysis', visualization: 'data-analysis', jupyter: 'data-analysis',
  matplotlib: 'data-analysis', plotly: 'data-analysis', etl: 'data-analysis',
  // Bot
  discord: 'bot', 'discord-bot': 'bot', bot: 'bot', chatbot: 'bot',
  telegram: 'bot', automation: 'bot', scraper: 'bot', crawler: 'bot',
  // CLI
  cli: 'cli-tool', 'command-line': 'cli-tool', terminal: 'cli-tool', shell: 'cli-tool',
  // Hardware
  arduino: 'hardware-iot', raspberry: 'hardware-iot', iot: 'hardware-iot',
  embedded: 'hardware-iot', firmware: 'hardware-iot', esp32: 'hardware-iot',
  // Library
  library: 'library', sdk: 'library', package: 'library', framework: 'library',
  // Mobile
  android: 'mobile', ios: 'mobile', 'react-native': 'mobile', flutter: 'mobile',
  expo: 'mobile',
  // Realtime
  websocket: 'realtime', 'real-time': 'realtime', streaming: 'realtime',
  // Database
  database: 'database', mongodb: 'database', postgresql: 'database', mysql: 'database',
  redis: 'database', sqlite: 'database',
  // Security
  security: 'security', cryptography: 'security', encryption: 'security',
  ctf: 'security', hacking: 'security', pentest: 'security', cybersecurity: 'security',
  // Devtools
  devtools: 'devtools', linter: 'devtools', formatter: 'devtools', testing: 'devtools',
  docker: 'devtools', kubernetes: 'devtools',
  // Blockchain
  blockchain: 'blockchain', ethereum: 'blockchain', solidity: 'blockchain',
  web3: 'blockchain', nft: 'blockchain', defi: 'blockchain',
};

export function getTopicDomain(topic: string): DomainKey | null {
  return TOPIC_TO_DOMAIN[topic.toLowerCase()] ?? null;
}

const DOMAIN_SIGNALS: Record<DomainKey, { keywords: string[]; languages: string[]; weight: number }> = {
  'web-app': {
    keywords: ['react', 'vue', 'angular', 'svelte', 'frontend', 'website', 'dashboard', 'ui', 'nextjs', 'nuxt', 'html', 'css', 'tailwind', 'vite', 'webpack', 'portfolio', 'landing'],
    languages: ['TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS', 'Vue'],
    weight: 1,
  },
  'backend-api': {
    keywords: ['api', 'server', 'backend', 'microservice', 'endpoint', 'rest', 'graphql', 'express', 'fastapi', 'flask', 'django', 'nest', 'spring', 'grpc', 'webhook'],
    languages: ['Python', 'Go', 'Rust', 'Java', 'C#', 'Kotlin', 'Ruby'],
    weight: 1,
  },
  'data-analysis': {
    keywords: ['analysis', 'analytics', 'data', 'pandas', 'numpy', 'plot', 'chart', 'statistics', 'report', 'etl', 'pipeline', 'dataset', 'csv', 'visualization', 'matplotlib', 'jupyter'],
    languages: ['Python', 'R', 'Julia', 'Jupyter Notebook'],
    weight: 1,
  },
  'machine-learning': {
    keywords: ['machine learning', 'ml', 'ai', 'neural', 'model', 'train', 'pytorch', 'tensorflow', 'keras', 'llm', 'gpt', 'bert', 'diffusion', 'classification', 'prediction', 'inference', 'huggingface', 'nlp'],
    languages: ['Python', 'Jupyter Notebook'],
    weight: 1.2,
  },
  'game': {
    keywords: ['game', 'mod', 'minecraft', 'unity', 'godot', 'engine', 'player', 'level', 'sprite', 'render', 'physics', 'opengl', 'shader', 'rpg', 'platformer', 'forge', 'fabric'],
    languages: ['C#', 'C++', 'GDScript', 'Java', 'Lua'],
    weight: 1.2,
  },
  'cli-tool': {
    keywords: ['cli', 'command', 'tool', 'utility', 'script', 'terminal', 'shell', 'automation', 'generator', 'converter', 'parser'],
    languages: ['Bash', 'Python', 'Go', 'Rust', 'PowerShell'],
    weight: 0.8,
  },
  'library': {
    keywords: ['library', 'lib', 'sdk', 'framework', 'package', 'module', 'plugin', 'wrapper', 'component', 'util', 'helper', 'bindings'],
    languages: [],
    weight: 0.7,
  },
  'mobile': {
    keywords: ['android', 'ios', 'mobile', 'flutter', 'react native', 'expo', 'swift', 'kotlin', 'app'],
    languages: ['Swift', 'Kotlin', 'Dart', 'Java'],
    weight: 1.1,
  },
  'hardware-iot': {
    keywords: ['arduino', 'raspberry', 'iot', 'sensor', 'firmware', 'embedded', 'microcontroller', 'gpio', 'uart', 'spi', 'i2c', 'esp32', 'esp8266'],
    languages: ['C', 'C++', 'Assembly'],
    weight: 1.2,
  },
  'realtime': {
    keywords: ['realtime', 'real-time', 'websocket', 'socket.io', 'streaming', 'live', 'pubsub', 'event', 'message queue', 'kafka', 'rabbitmq'],
    languages: [],
    weight: 0.9,
  },
  'devtools': {
    keywords: ['devtools', 'lint', 'format', 'test', 'ci', 'cd', 'deploy', 'build', 'docker', 'kubernetes', 'terraform', 'monitoring', 'logging', 'debug'],
    languages: ['YAML', 'Dockerfile'],
    weight: 0.8,
  },
  'bot': {
    keywords: ['bot', 'discord', 'telegram', 'slack', 'chatbot', 'scraper', 'crawler', 'automation', 'webhook', 'automate'],
    languages: ['Python', 'JavaScript', 'TypeScript'],
    weight: 1,
  },
  'database': {
    keywords: ['database', 'sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'redis', 'orm', 'schema', 'migration', 'query'],
    languages: ['SQL', 'PLpgSQL'],
    weight: 0.8,
  },
  'blockchain': {
    keywords: ['blockchain', 'ethereum', 'solidity', 'web3', 'nft', 'defi', 'smart contract', 'crypto', 'token', 'wallet', 'dapp'],
    languages: ['Solidity'],
    weight: 1.3,
  },
  'security': {
    keywords: ['security', 'encrypt', 'decrypt', 'hash', 'auth', 'ctf', 'exploit', 'vulnerability', 'pentest', 'cipher', 'ssl', 'tls', 'hacking'],
    languages: ['Python', 'C', 'C++'],
    weight: 0.9,
  },
};

function repoText(repo: GithubRepo): string {
  return [repo.name, repo.description ?? '', ...repo.topics].join(' ').toLowerCase();
}

export function classifyRepo(repo: GithubRepo): DomainKey[] {
  const text = repoText(repo);
  const lang = repo.language ?? '';
  const scores = new Map<DomainKey, number>();

  for (const [key, sig] of Object.entries(DOMAIN_SIGNALS) as [DomainKey, typeof DOMAIN_SIGNALS[DomainKey]][]) {
    let score = 0;
    for (const kw of sig.keywords) {
      if (text.includes(kw)) score += sig.weight;
    }
    if (sig.languages.includes(lang)) score += 1.5;
    if (score >= 2) scores.set(key, score);
  }

  for (const topic of repo.topics) {
    const d = getTopicDomain(topic);
    if (d) scores.set(d, (scores.get(d) ?? 0) + 2);
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);
}

const COLOR_PALETTE = [
  '#60a5fa', '#34d399', '#fb923c', '#c084fc',
  '#f472b6', '#22d3ee', '#818cf8', '#fbbf24',
  '#4ade80', '#f87171', '#a78bfa', '#38bdf8',
  '#fdba74', '#86efac', '#67e8f9',
];

export function topicCategoryColor(topic: string): string {
  const domain = getTopicDomain(topic);
  if (domain) return DOMAINS[domain].color;
  let hash = 0;
  for (const ch of topic) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

export function formatTopicLabel(topic: string): string {
  return topic
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
