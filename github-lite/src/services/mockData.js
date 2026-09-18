// High quality fallback database for popular repositories, trending, users, issues, and releases
export const MOCK_REPOSITORIES = [
  {
    id: 10270250,
    name: 'react',
    full_name: 'facebook/react',
    owner: {
      login: 'facebook',
      avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
      html_url: 'https://github.com/facebook',
      type: 'Organization',
    },
    html_url: 'https://github.com/facebook/react',
    description: 'The library for web and native user interfaces.',
    homepage: 'https://react.dev',
    stargazers_count: 228400,
    forks_count: 46200,
    watchers_count: 228400,
    open_issues_count: 1250,
    language: 'JavaScript',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['declarative', 'frontend', 'javascript', 'library', 'react', 'ui'],
    updated_at: '2026-09-17T10:30:00Z',
    created_at: '2013-05-24T16:15:54Z',
    size: 385000,
    default_branch: 'main',
  },
  {
    id: 24195239,
    name: 'vue',
    full_name: 'vuejs/core',
    owner: {
      login: 'vuejs',
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
      html_url: 'https://github.com/vuejs',
      type: 'Organization',
    },
    html_url: 'https://github.com/vuejs/core',
    description: '🖖 Vue.js is a progressive, incrementally-adoptable JavaScript framework for building UI on the web.',
    homepage: 'https://vuejs.org',
    stargazers_count: 215000,
    forks_count: 38000,
    watchers_count: 215000,
    open_issues_count: 620,
    language: 'TypeScript',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['framework', 'frontend', 'javascript', 'typescript', 'vue'],
    updated_at: '2026-09-17T11:15:00Z',
    created_at: '2014-07-29T01:38:36Z',
    size: 92000,
    default_branch: 'main',
  },
  {
    id: 330154122,
    name: 'ollama',
    full_name: 'ollama/ollama',
    owner: {
      login: 'ollama',
      avatar_url: 'https://avatars.githubusercontent.com/u/142930358?v=4',
      html_url: 'https://github.com/ollama',
      type: 'Organization',
    },
    html_url: 'https://github.com/ollama/ollama',
    description: 'Get up and running with Llama 3, Mistral, Gemma, and other large language models locally.',
    homepage: 'https://ollama.com',
    stargazers_count: 112000,
    forks_count: 9800,
    watchers_count: 112000,
    open_issues_count: 450,
    language: 'Go',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['ai', 'llm', 'llama', 'machine-learning', 'local-ai'],
    updated_at: '2026-09-17T09:40:00Z',
    created_at: '2023-06-21T18:31:00Z',
    size: 45000,
    default_branch: 'main',
  },
  {
    id: 16087932,
    name: 'fastapi',
    full_name: 'fastapi/fastapi',
    owner: {
      login: 'fastapi',
      avatar_url: 'https://avatars.githubusercontent.com/u/1329385?v=4',
      html_url: 'https://github.com/fastapi',
      type: 'Organization',
    },
    html_url: 'https://github.com/fastapi/fastapi',
    description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production.',
    homepage: 'https://fastapi.tiangolo.com/',
    stargazers_count: 82500,
    forks_count: 7200,
    watchers_count: 82500,
    open_issues_count: 310,
    language: 'Python',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['api', 'asyncio', 'fastapi', 'framework', 'python', 'rest'],
    updated_at: '2026-09-17T08:20:00Z',
    created_at: '2018-12-08T08:21:47Z',
    size: 28000,
    default_branch: 'master',
  },
  {
    id: 135786012,
    name: 'rustlings',
    full_name: 'rust-lang/rustlings',
    owner: {
      login: 'rust-lang',
      avatar_url: 'https://avatars.githubusercontent.com/u/5430905?v=4',
      html_url: 'https://github.com/rust-lang',
      type: 'Organization',
    },
    html_url: 'https://github.com/rust-lang/rustlings',
    description: '🦀 Small exercises to get you used to reading and writing Rust code!',
    homepage: 'https://rustlings.rust-lang.org',
    stargazers_count: 53000,
    forks_count: 10400,
    watchers_count: 53000,
    open_issues_count: 42,
    language: 'Rust',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['education', 'exercises', 'learn', 'rust', 'tutorial'],
    updated_at: '2026-09-17T07:10:00Z',
    created_at: '2018-06-02T13:42:00Z',
    size: 15400,
    default_branch: 'main',
  },
  {
    id: 28457823,
    name: 'freeCodeCamp',
    full_name: 'freeCodeCamp/freeCodeCamp',
    owner: {
      login: 'freeCodeCamp',
      avatar_url: 'https://avatars.githubusercontent.com/u/9892522?v=4',
      html_url: 'https://github.com/freeCodeCamp',
      type: 'Organization',
    },
    html_url: 'https://github.com/freeCodeCamp/freeCodeCamp',
    description: "freeCodeCamp.org's open-source codebase and curriculum. Learn to code for free.",
    homepage: 'https://www.freecodecamp.org',
    stargazers_count: 405000,
    forks_count: 39500,
    watchers_count: 405000,
    open_issues_count: 340,
    language: 'TypeScript',
    license: { key: 'bsd-3-clause', name: 'BSD 3-Clause License' },
    topics: ['careers', 'certification', 'curriculum', 'education', 'javascript', 'learn-to-code'],
    updated_at: '2026-09-17T12:00:00Z',
    created_at: '2014-12-24T17:49:19Z',
    size: 420000,
    default_branch: 'main',
  },
  {
    id: 70107786,
    name: 'next.js',
    full_name: 'vercel/next.js',
    owner: {
      login: 'vercel',
      avatar_url: 'https://avatars.githubusercontent.com/u/14985020?v=4',
      html_url: 'https://github.com/vercel',
      type: 'Organization',
    },
    html_url: 'https://github.com/vercel/next.js',
    description: 'The React Framework for the Web. Used by some of the world\'s largest companies.',
    homepage: 'https://nextjs.org',
    stargazers_count: 128000,
    forks_count: 27500,
    watchers_count: 128000,
    open_issues_count: 2400,
    language: 'JavaScript',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['react', 'nextjs', 'ssr', 'framework', 'serverless', 'web'],
    updated_at: '2026-09-17T11:45:00Z',
    created_at: '2016-10-05T23:32:51Z',
    size: 210000,
    default_branch: 'canary',
  },
  {
    id: 54346799,
    name: 'public-apis',
    full_name: 'public-apis/public-apis',
    owner: {
      login: 'public-apis',
      avatar_url: 'https://avatars.githubusercontent.com/u/5112010?v=4',
      html_url: 'https://github.com/public-apis',
      type: 'Organization',
    },
    html_url: 'https://github.com/public-apis/public-apis',
    description: 'A collective list of free APIs for use in software and web development.',
    homepage: 'https://public-apis.io',
    stargazers_count: 320000,
    forks_count: 34500,
    watchers_count: 320000,
    open_issues_count: 120,
    language: 'Python',
    license: { key: 'mit', name: 'MIT License' },
    topics: ['api', 'apis', 'development', 'free', 'list', 'resources'],
    updated_at: '2026-09-17T09:15:00Z',
    created_at: '2016-03-20T23:49:42Z',
    size: 6800,
    default_branch: 'master',
  },
];

export const MOCK_README = `# 🚀 React

> **The library for web and native user interfaces**

React lets you build user interfaces out of individual pieces called components. Create your own React components like \`Thumbnail\`, \`LikeButton\`, and \`Video\`. Then combine them into entire screens, pages, and apps.

---

## ✨ Features

- **Declarative**: React makes it painless to create interactive UIs. Design simple views for each state in your application.
- **Component-Based**: Build encapsulated components that manage their own state, then compose them to make complex UIs.
- **Learn Once, Write Anywhere**: Develop new features in React without rewriting existing code.

## 📦 Quick Start

\`\`\`bash
npm create vite@latest my-react-app -- --template react
cd my-react-app
npm install
npm run dev
\`\`\`

## 🛠️ Example Code

\`\`\`jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
\`\`\`

## 📚 Documentation

Visit [react.dev](https://react.dev) for comprehensive tutorials and API reference.
`;

export const MOCK_RELEASES = [
  {
    id: 1,
    tag_name: 'v19.0.0',
    name: 'React 19.0.0 - Actions, Server Components & Hooks',
    published_at: '2025-12-05T18:00:00Z',
    html_url: 'https://github.com/facebook/react/releases/tag/v19.0.0',
    body: `### What's New in React 19
- **Actions:** Async transitions with auto pending state handling
- **useActionState & useOptimistic:** Built-in optimistic UI updates
- **Server Components & Server Actions:** First-class production support
- **Asset Loading:** Automatic stylesheet and script preloading
- **Document Metadata:** Direct \`<title>\` and \`<meta>\` tag support inside components

#### Bug Fixes & Improvements
- Improved hydration error diffs
- Faster compiler optimizations
- Full TypeScript type definition enhancements
`,
    assets: [
      {
        name: 'react-19.0.0.zip',
        size: 3450000,
        download_count: 85400,
        browser_download_url: 'https://github.com/facebook/react/archive/refs/tags/v19.0.0.zip',
      },
      {
        name: 'react-19.0.0.tar.gz',
        size: 2980000,
        download_count: 24100,
        browser_download_url: 'https://github.com/facebook/react/archive/refs/tags/v19.0.0.tar.gz',
      },
    ],
  },
  {
    id: 2,
    tag_name: 'v18.3.1',
    name: 'React 18.3.1 - Maintenance release',
    published_at: '2024-04-26T14:20:00Z',
    html_url: 'https://github.com/facebook/react/releases/tag/v18.3.1',
    body: `### Changes
- Adds warnings for deprecated APIs to prepare projects for React 19.
- Bug fix for transition scheduling in edge cases.
`,
    assets: [
      {
        name: 'react-18.3.1.zip',
        size: 3200000,
        download_count: 142000,
        browser_download_url: 'https://github.com/facebook/react/archive/refs/tags/v18.3.1.zip',
      },
    ],
  },
];

export const MOCK_ISSUES = [
  {
    id: 1,
    number: 31201,
    title: 'Support for React compiler in Monorepos',
    state: 'open',
    created_at: '2026-09-14T08:12:00Z',
    comments: 8,
    user: {
      login: 'alex_dev',
      avatar_url: 'https://avatars.githubusercontent.com/u/102812?v=4',
    },
    labels: [
      { name: 'enhancement', color: 'a2eeef' },
      { name: 'compiler', color: '1d76db' },
    ],
    body: 'We are trying to configure React 19 compiler in a Turborepo environment. Would appreciate a recommended preset config.',
  },
  {
    id: 2,
    number: 31189,
    title: 'Hydration mismatch on dynamically inserted script tag',
    state: 'open',
    created_at: '2026-09-12T15:45:00Z',
    comments: 4,
    user: {
      login: 'sarah_code',
      avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4',
    },
    labels: [
      { name: 'bug', color: 'd73a4a' },
      { name: 'hydration', color: 'e99695' },
    ],
    body: 'When rendering external analytics script inside a client component, hydration shows warning in console.',
  },
  {
    id: 3,
    number: 31050,
    title: 'Documentation: clarify useOptimistic with custom reducer',
    state: 'closed',
    created_at: '2026-09-02T11:20:00Z',
    comments: 12,
    user: {
      login: 'vladimir_k',
      avatar_url: 'https://avatars.githubusercontent.com/u/9892522?v=4',
    },
    labels: [
      { name: 'documentation', color: '0075ca' },
    ],
    body: 'The documentation page for useOptimistic hook could use an example with nested state structures.',
  },
];

export const MOCK_TOPICS = [
  { id: 'all', labelRu: 'Все', labelEn: 'All', icon: '🌟' },
  { id: 'ai', labelRu: '🤖 AI & Нейросети', labelEn: '🤖 AI & LLMs', query: 'topic:ai OR topic:llm OR topic:machine-learning' },
  { id: 'javascript', labelRu: '🌐 JavaScript', labelEn: '🌐 JavaScript', language: 'javascript' },
  { id: 'typescript', labelRu: '🔷 TypeScript', labelEn: '🔷 TypeScript', language: 'typescript' },
  { id: 'python', labelRu: '🐍 Python', labelEn: '🐍 Python', language: 'python' },
  { id: 'rust', labelRu: '🦀 Rust', labelEn: '🦀 Rust', language: 'rust' },
  { id: 'go', labelRu: '🐹 Go', labelEn: '🐹 Go', language: 'go' },
  { id: 'tools', labelRu: '🛠️ Инструменты & CLI', labelEn: '🛠️ DevTools & CLI', query: 'topic:cli OR topic:developer-tools' },
  { id: 'mobile', labelRu: '📱 Мобильная разработка', labelEn: '📱 Mobile', query: 'topic:react-native OR topic:flutter OR topic:swift' },
  { id: 'web', labelRu: '⚡ Web & UI', labelEn: '⚡ Web & UI', query: 'topic:frontend OR topic:react OR topic:vue OR topic:svelte' },
];
