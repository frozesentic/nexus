import type { GithubRepo, DomainKey, Domain } from '../types';

export const DOMAINS: Record<DomainKey, Domain> = {
  'web-app':        { key: 'web-app',        name: 'Web App',          color: '#60a5fa', icon: '🌐' },
  'backend-api':    { key: 'backend-api',    name: 'Backend / API',    color: '#34d399', icon: '⚡' },
  'data-analysis':  { key: 'data-analysis',  name: 'Data & Analytics', color: '#fb923c', icon: '📊' },
  'machine-learning': { key: 'machine-learning', name: 'Machine Learning', color: '#c084fc', icon: '🧠' },
  'game':           { key: 'game',           name: 'Game',             color: '#f472b6', icon: '🎮' },
  'cli-tool':       { key: 'cli-tool',       name: 'CLI Tool',         color: '#94a3b8', icon: '💻' },
  'library':        { key: 'library',        name: 'Library / SDK',    color: '#fbbf24', icon: '📦' },
  'mobile':         { key: 'mobile',         name: 'Mobile',           color: '#4ade80', icon: '📱' },
  'hardware-iot':   { key: 'hardware-iot',   name: 'Hardware / IoT',   color: '#f59e0b', icon: '🔧' },
  'realtime':       { key: 'realtime',       name: 'Realtime / Live',  color: '#22d3ee', icon: '📡' },
  'devtools':       { key: 'devtools',       name: 'Dev Tools',        color: '#818cf8', icon: '🛠️' },
  'bot':            { key: 'bot',            name: 'Bot / Automation', color: '#7289da', icon: '🤖' },
  'database':       { key: 'database',       name: 'Database',         color: '#e879f9', icon: '🗄️' },
  'blockchain':     { key: 'blockchain',     name: 'Blockchain / Web3', color: '#f59e0b', icon: '⛓️' },
  'security':       { key: 'security',       name: 'Security',         color: '#ef4444', icon: '🔒' },
};

interface Signal { keywords: string[]; weight: number }

const SIGNALS: Record<DomainKey, Signal[]> = {
  'web-app': [
    { keywords: ['react', 'vue', 'angular', 'svelte', 'solid', 'nextjs', 'next.js', 'nuxt', 'remix', 'astro'], weight: 4 },
    { keywords: ['frontend', 'ui', 'dashboard', 'portfolio', 'website', 'landing page', 'web app', 'web application'], weight: 3 },
    { keywords: ['tailwind', 'bootstrap', 'material-ui', 'chakra', 'shadcn', 'styled-components'], weight: 2 },
    { keywords: ['single page', 'spa', 'ssr', 'static site', 'component'], weight: 2 },
  ],
  'backend-api': [
    { keywords: ['express', 'fastify', 'koa', 'nestjs', 'nest.js', 'fastapi', 'django', 'flask', 'rails', 'spring', 'gin', 'fiber', 'actix', 'axum', 'echo'], weight: 4 },
    { keywords: ['api', 'rest', 'restful', 'graphql', 'grpc', 'server', 'backend', 'microservice'], weight: 3 },
    { keywords: ['endpoint', 'middleware', 'route', 'controller', 'handler', 'service'], weight: 2 },
    { keywords: ['jwt', 'oauth', 'authentication', 'authorization', 'session', 'cookie'], weight: 2 },
  ],
  'data-analysis': [
    { keywords: ['pandas', 'matplotlib', 'seaborn', 'plotly', 'bokeh', 'altair', 'vega', 'numpy', 'scipy'], weight: 5 },
    { keywords: ['data analysis', 'data science', 'analytics', 'statistics', 'visualization', 'chart', 'plot'], weight: 3 },
    { keywords: ['csv', 'dataset', 'jupyter', 'notebook', 'dataframe', 'excel', 'spreadsheet'], weight: 2 },
    { keywords: ['tracker', 'tracking', 'stock', 'finance', 'metric', 'report', 'insight'], weight: 2 },
  ],
  'machine-learning': [
    { keywords: ['tensorflow', 'pytorch', 'keras', 'sklearn', 'scikit-learn', 'huggingface', 'transformers', 'openai', 'llm', 'gpt'], weight: 5 },
    { keywords: ['machine learning', 'deep learning', 'neural network', 'artificial intelligence', 'nlp', 'computer vision'], weight: 5 },
    { keywords: ['ai', 'ml', 'model', 'training', 'inference', 'embedding', 'classification', 'prediction', 'regression'], weight: 3 },
    { keywords: ['reinforcement learning', 'rl', 'gym', 'diffusion', 'generative', 'bert', 'gnn'], weight: 4 },
  ],
  'game': [
    { keywords: ['game', 'pygame', 'unity', 'godot', 'phaser', 'pixi', 'opengl', 'directx', 'vulkan', 'raylib'], weight: 4 },
    { keywords: ['player', 'enemy', 'level', 'score', 'collision', 'sprite', 'tilemap', '2d', 'rpg', 'platformer', 'shooter', 'puzzle'], weight: 2 },
    { keywords: ['physics', 'render', 'engine', 'world', 'map', 'spawn', 'health', 'inventory', 'multiplayer'], weight: 2 },
  ],
  'cli-tool': [
    { keywords: ['cli', 'command-line', 'command line', 'terminal', 'console', 'shell', 'bash script'], weight: 4 },
    { keywords: ['argparse', 'click', 'typer', 'commander', 'yargs', 'oclif', 'cobra', 'clap', 'inquirer'], weight: 5 },
    { keywords: ['script', 'utility', 'tool', 'generator', 'converter', 'automation', 'workflow'], weight: 1 },
  ],
  'library': [
    { keywords: ['library', 'package', 'sdk', 'framework', 'wrapper', 'plugin', 'extension', 'module', 'npm package', 'pypi package'], weight: 3 },
    { keywords: ['util', 'helper', 'toolkit', 'collection', 'api client', 'bindings', 'port of'], weight: 2 },
  ],
  'mobile': [
    { keywords: ['flutter', 'react native', 'react-native', 'expo', 'ionic', 'capacitor', 'xamarin', 'android', 'ios'], weight: 5 },
    { keywords: ['mobile app', 'app store', 'play store', 'apk', 'ipa', 'swift', 'swiftui', 'jetpack compose'], weight: 4 },
  ],
  'hardware-iot': [
    { keywords: ['arduino', 'raspberry pi', 'raspberrypi', 'esp32', 'esp8266', 'stm32', 'avr', 'pic', 'microcontroller', 'embedded', 'firmware'], weight: 5 },
    { keywords: ['sensor', 'actuator', 'gpio', 'i2c', 'spi', 'uart', 'pwm', 'lcd', 'led', 'motor', 'servo', 'relay'], weight: 4 },
    { keywords: ['iot', 'mqtt', 'zigbee', 'bluetooth', 'rf', 'interrupt', 'timer', 'register', 'bit manipulation', 'serial'], weight: 3 },
    // cross-domain: polling hardware sensors ~ polling APIs — same conceptual pattern
    { keywords: ['polling', 'sampling', 'read sensor', 'adc', 'dac'], weight: 3 },
  ],
  'realtime': [
    { keywords: ['websocket', 'socket.io', 'sse', 'server-sent', 'realtime', 'real-time', 'live', 'streaming', 'pubsub', 'event-driven'], weight: 4 },
    { keywords: ['chat', 'messaging', 'notification', 'kafka', 'rabbitmq', 'nats', 'redis pub', 'push'], weight: 3 },
    // polling pattern also belongs here — connects Arduino polling to API polling conceptually
    { keywords: ['polling', 'long polling', 'interval', 'periodic', 'real time data', 'live data', 'live update'], weight: 3 },
  ],
  'devtools': [
    { keywords: ['linter', 'formatter', 'prettier', 'eslint', 'stylelint', 'debugging', 'profiler', 'analyzer'], weight: 4 },
    { keywords: ['ci', 'cd', 'continuous integration', 'github actions', 'jenkins', 'travis', 'pipeline', 'workflow'], weight: 3 },
    { keywords: ['docker', 'container', 'kubernetes', 'k8s', 'helm', 'terraform', 'ansible', 'infrastructure as code'], weight: 3 },
    { keywords: ['testing', 'unit test', 'integration test', 'e2e', 'jest', 'mocha', 'pytest', 'cypress', 'playwright'], weight: 3 },
    { keywords: ['bundler', 'build tool', 'compiler', 'transpiler', 'codegen'], weight: 2 },
  ],
  'bot': [
    { keywords: ['discord', 'discord.js', 'discord.py', 'discordbot', 'slash command', 'discord bot'], weight: 5 },
    { keywords: ['telegram bot', 'slack bot', 'twitter bot', 'reddit bot', 'chatbot', 'webhook automation'], weight: 4 },
    { keywords: ['scraper', 'crawler', 'web scraping', 'puppeteer', 'playwright scrape', 'selenium', 'cheerio'], weight: 3 },
    { keywords: ['cron', 'scheduled task', 'periodic job', 'job queue', 'worker'], weight: 2 },
  ],
  'database': [
    { keywords: ['prisma', 'sequelize', 'typeorm', 'drizzle', 'sqlalchemy', 'peewee', 'gorm', 'ent', 'hibernate'], weight: 5 },
    { keywords: ['postgres', 'postgresql', 'mysql', 'mariadb', 'sqlite', 'mongodb', 'redis', 'cassandra', 'elasticsearch', 'dynamodb', 'supabase', 'firebase firestore'], weight: 4 },
    { keywords: ['database', 'migration', 'schema', 'query', 'sql', 'nosql', 'orm', 'crud', 'repository'], weight: 2 },
  ],
  'blockchain': [
    { keywords: ['blockchain', 'web3', 'smart contract', 'solidity', 'ethereum', 'defi', 'nft', 'token', 'wallet', 'crypto'], weight: 5 },
    { keywords: ['hardhat', 'foundry', 'truffle', 'ethers.js', 'web3.js', 'metamask', 'ipfs', 'dao', 'dapp'], weight: 5 },
  ],
  'security': [
    { keywords: ['security', 'cybersecurity', 'encryption', 'cryptography', 'pentest', 'vulnerability', 'exploit', 'ctf', 'capture the flag'], weight: 5 },
    { keywords: ['ssl', 'tls', 'certificate', 'firewall', 'reverse engineering', 'forensics', 'malware', 'ids'], weight: 4 },
    { keywords: ['hash', 'aes', 'rsa', 'xss', 'csrf', 'injection', 'owasp', 'zero day'], weight: 3 },
  ],
};

// Language gives domain hints even without keywords
const LANG_BOOSTS: Partial<Record<string, DomainKey[]>> = {
  python: ['data-analysis', 'machine-learning', 'cli-tool'],
  'jupyter notebook': ['data-analysis', 'machine-learning'],
  kotlin: ['mobile', 'backend-api'],
  swift: ['mobile'],
  dart: ['mobile'],
  c: ['hardware-iot'],
  'c++': ['hardware-iot', 'game'],
  solidity: ['blockchain'],
  html: ['web-app'],
  css: ['web-app'],
  scss: ['web-app'],
  r: ['data-analysis'],
};

export function classifyRepo(repo: GithubRepo): DomainKey[] {
  const text = [
    repo.name.replace(/[-_]/g, ' '),
    repo.description ?? '',
    repo.topics.join(' '),
  ].join(' ').toLowerCase();

  const scores = new Map<DomainKey, number>();

  for (const [domainKey, signals] of Object.entries(SIGNALS) as [DomainKey, Signal[]][]) {
    let score = 0;
    for (const { keywords, weight } of signals) {
      for (const kw of keywords) {
        if (text.includes(kw)) score += weight;
      }
    }
    if (score > 0) scores.set(domainKey, score);
  }

  // Language boosts
  const lang = repo.language?.toLowerCase() ?? '';
  for (const [langKey, domains] of Object.entries(LANG_BOOSTS)) {
    if (lang === langKey || lang.includes(langKey)) {
      for (const d of domains!) {
        scores.set(d, (scores.get(d) ?? 0) + 2);
      }
    }
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, s]) => s >= 3)
    .slice(0, 3)
    .map(([k]) => k);
}
