import { MOCK_REPOSITORIES, MOCK_README, MOCK_RELEASES, MOCK_ISSUES } from './mockData';

const BASE_URL = 'https://api.github.com';
const cache = new Map();

// Helper to build headers with optional Personal Access Token
function getHeaders(token, raw = false) {
  const headers = {
    Accept: raw ? 'application/vnd.github.v3.raw' : 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token && token.trim()) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }
  return headers;
}

// Track rate limit info
let rateLimitInfo = {
  limit: 60,
  remaining: 60,
  reset: Date.now() + 3600000,
  isRateLimited: false,
};

let rateLimitListeners = [];

export function onRateLimitChange(listener) {
  rateLimitListeners.push(listener);
  return () => {
    rateLimitListeners = rateLimitListeners.filter((l) => l !== listener);
  };
}

function updateRateLimit(response) {
  const limit = response.headers.get('x-ratelimit-limit');
  const remaining = response.headers.get('x-ratelimit-remaining');
  const reset = response.headers.get('x-ratelimit-reset');

  if (limit !== null && remaining !== null) {
    rateLimitInfo = {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: reset ? parseInt(reset, 10) * 1000 : Date.now() + 3600000,
      isRateLimited: parseInt(remaining, 10) <= 0,
    };
    rateLimitListeners.forEach((l) => l(rateLimitInfo));
  }
}

export function getCurrentRateLimit() {
  return rateLimitInfo;
}

/**
 * Fetch with automatic caching & rate-limit handling
 */
async function apiFetch(url, options = {}, token = '', isRaw = false, noCache = false) {
  const cacheKey = `${url}_${isRaw ? 'raw' : 'json'}_${token ? 'auth' : 'anon'}`;
  
  if (!noCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    // Cache for 2 minutes
    if (Date.now() - cached.timestamp < 120000) {
      return cached.data;
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(token, isRaw),
        ...options.headers,
      },
    });

    updateRateLimit(response);

    if (response.status === 403 || response.status === 429) {
      console.warn('GitHub API Rate limited. Falling back to cached / fallback data.');
      rateLimitInfo.isRateLimited = true;
      rateLimitListeners.forEach((l) => l(rateLimitInfo));
      throw new Error('RATE_LIMITED');
    }

    if (!response.ok) {
      throw new Error(`GitHub API HTTP ${response.status}: ${response.statusText}`);
    }

    const data = isRaw ? await response.text() : await response.json();
    if (!noCache) {
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    return data;
  } catch (err) {
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey).data;
    }
    throw err;
  }
}

/**
 * Fetch Authenticated User Profile via Token
 */
export async function getAuthenticatedUser(token) {
  if (!token || !token.trim()) return null;
  const url = `${BASE_URL}/user`;
  const res = await fetch(url, {
    headers: getHeaders(token),
  });
  updateRateLimit(res);
  if (!res.ok) {
    throw new Error(`Токен недействителен или срок его действия истек (HTTP ${res.status})`);
  }
  return await res.json();
}

/**
 * Fetch User's Starred Repositories on GitHub
 */
export async function getUserStarredRepos(username = '', token = '') {
  try {
    const url = token
      ? `${BASE_URL}/user/starred?per_page=50&sort=created`
      : `${BASE_URL}/users/${username}/starred?per_page=50`;
    const repos = await apiFetch(url, {}, token, false, true);
    return Array.isArray(repos) ? repos : [];
  } catch (err) {
    console.warn('Failed to fetch user starred repos:', err);
    return [];
  }
}

/**
 * Star repository on GitHub
 */
export async function starRepoOnGithub(owner, repo, token) {
  if (!token) return false;
  try {
    const url = `${BASE_URL}/user/starred/${owner}/${repo}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...getHeaders(token),
        'Content-Length': '0',
      },
    });
    updateRateLimit(res);
    return res.status === 204;
  } catch (err) {
    console.error('Star repo error:', err);
    return false;
  }
}

/**
 * Unstar repository on GitHub
 */
export async function unstarRepoOnGithub(owner, repo, token) {
  if (!token) return false;
  try {
    const url = `${BASE_URL}/user/starred/${owner}/${repo}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    updateRateLimit(res);
    return res.status === 204;
  } catch (err) {
    console.error('Unstar repo error:', err);
    return false;
  }
}

/**
 * Fetch Repository GitHub Pages Information
 * GET /repos/{owner}/{repo}/pages
 */
export async function getRepoPages(owner, repo, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/pages`;
    const data = await apiFetch(url, {}, token, false, true);
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Fetch Repository Deployments (GitHub Pages, Vercel, Netlify, Production environments)
 * GET /repos/{owner}/{repo}/deployments
 */
export async function getRepoDeployments(owner, repo, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/deployments?per_page=10`;
    const data = await apiFetch(url, {}, token, false, true);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch Deployment Statuses
 * GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses
 */
export async function getDeploymentStatuses(owner, repo, deploymentId, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/deployments/${deploymentId}/statuses`;
    const data = await apiFetch(url, {}, token, false, true);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

/**
 * Fetch Repository Contents (Files and Folders in a path)
 */
export async function getRepoContents(owner, repo, path = '', token = '') {
  try {
    const cleanPath = path ? `/${path.replace(/^\//, '')}` : '';
    const url = `${BASE_URL}/repos/${owner}/${repo}/contents${cleanPath}`;
    const data = await apiFetch(url, {}, token, false, true);
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.warn(`Fetch contents ${owner}/${repo}/${path} failed:`, err);
    return [];
  }
}

/**
 * Fetch Single File Content & SHA
 */
export async function getFileContent(owner, repo, path, token = '') {
  try {
    const cleanPath = path.replace(/^\//, '');
    const url = `${BASE_URL}/repos/${owner}/${repo}/contents/${cleanPath}`;
    const data = await apiFetch(url, {}, token, false, true);
    return data;
  } catch (err) {
    console.warn(`Fetch file ${owner}/${repo}/${path} failed:`, err);
    return null;
  }
}

/**
 * Upload or Update/Replace a File in a Repository
 * PUT /repos/{owner}/{repo}/contents/{path}
 */
export async function uploadOrUpdateFile(owner, repo, path, base64Content, commitMessage = '', token = '', branch = '') {
  if (!token || !token.trim()) {
    throw new Error('Для загрузки файлов на GitHub нужно войти с токеном (кнопка «Войти» в правом верхнем углу).');
  }

  const cleanPath = path.replace(/^\//, '');
  const url = `${BASE_URL}/repos/${owner}/${repo}/contents/${cleanPath}`;

  let existingSha = null;
  try {
    const checkRes = await fetch(url + (branch ? `?ref=${encodeURIComponent(branch)}` : ''), {
      headers: getHeaders(token),
    });
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      existingSha = fileData.sha;
    }
  } catch (e) {
    // File doesn't exist yet
  }

  const body = {
    message: commitMessage || (existingSha ? `Update ${cleanPath} via GitHub Lite` : `Upload ${cleanPath} via GitHub Lite`),
    content: base64Content.replace(/\s/g, ''),
  };

  if (existingSha) {
    body.sha = existingSha;
  }

  if (branch) {
    body.branch = branch;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  updateRateLimit(res);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    if (res.status === 404 || res.status === 403) {
      throw new Error(`Ошибка доступа (HTTP ${res.status}): Убедитесь, что токен имеет права 'repo' и у вас есть доступ к репозиторию ${owner}/${repo}.`);
    }
    if (res.status === 409) {
      throw new Error('Конфликт файла: файл был изменен. Попробуйте обновить страницу и загрузить заново.');
    }
    throw new Error(errData.message || `Ошибка загрузки файла HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Delete a File in a Repository
 */
export async function deleteRepoFile(owner, repo, path, sha, commitMessage = '', token = '', branch = '') {
  if (!token) {
    throw new Error('Для удаления файла требуется токен авторизации.');
  }

  const cleanPath = path.replace(/^\//, '');
  const url = `${BASE_URL}/repos/${owner}/${repo}/contents/${cleanPath}`;

  const body = {
    message: commitMessage || `Delete ${cleanPath} via GitHub Lite`,
    sha: sha,
  };

  if (branch) {
    body.branch = branch;
  }

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      ...getHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  updateRateLimit(res);

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Ошибка удаления файла HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Fetch Trending or Popular Repositories
 */
export async function getTrendingRepos(topicId = 'all', timeRange = 'weekly', token = '') {
  try {
    let query = 'stars:>500';
    const now = new Date();
    let dateFilter = '';

    if (timeRange === 'daily') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateFilter = `created:>${yesterday}`;
    } else if (timeRange === 'weekly') {
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateFilter = `pushed:>${lastWeek}`;
    } else if (timeRange === 'monthly') {
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      dateFilter = `pushed:>${lastMonth}`;
    }

    if (topicId === 'javascript') {
      query += ` language:javascript ${dateFilter}`;
    } else if (topicId === 'typescript') {
      query += ` language:typescript ${dateFilter}`;
    } else if (topicId === 'python') {
      query += ` language:python ${dateFilter}`;
    } else if (topicId === 'rust') {
      query += ` language:rust ${dateFilter}`;
    } else if (topicId === 'go') {
      query += ` language:go ${dateFilter}`;
    } else if (topicId === 'ai') {
      query += ` topic:ai OR topic:llm OR topic:machine-learning ${dateFilter}`;
    } else if (topicId === 'tools') {
      query += ` topic:cli OR topic:developer-tools ${dateFilter}`;
    } else if (topicId === 'mobile') {
      query += ` topic:react-native OR topic:flutter OR topic:swift ${dateFilter}`;
    } else if (topicId === 'web') {
      query += ` topic:frontend OR topic:react OR topic:vue ${dateFilter}`;
    } else {
      query += ` ${dateFilter}`;
    }

    const url = `${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=25`;
    const res = await apiFetch(url, {}, token);
    return res.items || [];
  } catch (err) {
    console.warn('API fetch trending failed, using mock data:', err);
    if (topicId === 'all') return MOCK_REPOSITORIES;
    return MOCK_REPOSITORIES.filter(
      (r) =>
        r.language?.toLowerCase() === topicId.toLowerCase() ||
        r.topics?.some((t) => t.toLowerCase().includes(topicId.toLowerCase()))
    );
  }
}

/**
 * Search Repositories
 */
export async function searchRepositories(query, sort = 'stars', order = 'desc', page = 1, perPage = 20, token = '') {
  if (!query || !query.trim()) {
    return { total_count: 0, items: [] };
  }
  try {
    const url = `${BASE_URL}/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&order=${order}&page=${page}&per_page=${perPage}`;
    const data = await apiFetch(url, {}, token);
    return data;
  } catch (err) {
    console.warn('Search failed, matching mock repos:', err);
    const qLower = query.toLowerCase();
    const filtered = MOCK_REPOSITORIES.filter(
      (r) =>
        r.name.toLowerCase().includes(qLower) ||
        r.description?.toLowerCase().includes(qLower) ||
        r.topics?.some((t) => t.toLowerCase().includes(qLower))
    );
    return {
      total_count: filtered.length,
      items: filtered,
    };
  }
}

/**
 * Search Users
 */
export async function searchUsers(query, page = 1, perPage = 20, token = '') {
  if (!query || !query.trim()) {
    return { total_count: 0, items: [] };
  }
  try {
    const url = `${BASE_URL}/search/users?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;
    const data = await apiFetch(url, {}, token);
    return data;
  } catch (err) {
    console.warn('Search users failed:', err);
    return {
      total_count: 1,
      items: [
        {
          login: query,
          id: 12345,
          avatar_url: `https://github.com/${query}.png`,
          html_url: `https://github.com/${query}`,
          type: 'User',
        },
      ],
    };
  }
}

/**
 * Fetch Repository Details
 */
export async function getRepository(owner, repo, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}`;
    return await apiFetch(url, {}, token);
  } catch (err) {
    console.warn(`Fetch repo ${owner}/${repo} failed:`, err);
    const mock = MOCK_REPOSITORIES.find(
      (r) => r.full_name.toLowerCase() === `${owner}/${repo}`.toLowerCase()
    );
    if (mock) return mock;
    return {
      id: 999999,
      name: repo,
      full_name: `${owner}/${repo}`,
      owner: {
        login: owner,
        avatar_url: `https://github.com/${owner}.png`,
        html_url: `https://github.com/${owner}`,
      },
      html_url: `https://github.com/${owner}/${repo}`,
      description: `Репозиторий ${owner}/${repo}`,
      stargazers_count: 1540,
      forks_count: 240,
      watchers_count: 1540,
      open_issues_count: 12,
      language: 'JavaScript',
      license: { name: 'MIT License' },
      topics: ['web', 'app', 'tools'],
      updated_at: new Date().toISOString(),
      created_at: '2022-01-01T00:00:00Z',
      size: 12400,
      default_branch: 'main',
    };
  }
}

/**
 * Fetch Repository README
 */
export async function getReadme(owner, repo, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/readme`;
    return await apiFetch(url, {}, token, true);
  } catch (err) {
    console.warn(`Fetch readme ${owner}/${repo} failed:`, err);
    return MOCK_README;
  }
}

/**
 * Fetch Releases
 */
export async function getReleases(owner, repo, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/releases?per_page=15`;
    const releases = await apiFetch(url, {}, token);
    return Array.isArray(releases) ? releases : [];
  } catch (err) {
    console.warn(`Fetch releases ${owner}/${repo} failed:`, err);
    return MOCK_RELEASES;
  }
}

/**
 * Fetch Issues
 */
export async function getIssues(owner, repo, state = 'open', token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/issues?state=${state}&per_page=30`;
    const issues = await apiFetch(url, {}, token);
    return Array.isArray(issues) ? issues.filter((item) => !item.pull_request) : [];
  } catch (err) {
    console.warn(`Fetch issues ${owner}/${repo} failed:`, err);
    return MOCK_ISSUES;
  }
}

/**
 * Fetch Issue Comments
 */
export async function getIssueComments(owner, repo, issueNumber, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/issues/${issueNumber}/comments`;
    const comments = await apiFetch(url, {}, token);
    return Array.isArray(comments) ? comments : [];
  } catch (err) {
    console.warn(`Fetch comments for issue #${issueNumber} failed:`, err);
    return [
      {
        id: 1,
        user: { login: 'github-bot', avatar_url: 'https://avatars.githubusercontent.com/u/9919?v=4' },
        body: 'Thank you for opening this issue. Our team is investigating.',
        created_at: new Date().toISOString(),
      },
    ];
  }
}

/**
 * Fetch Contributors
 */
export async function getContributors(owner, repo, token = '') {
  try {
    const url = `${BASE_URL}/repos/${owner}/${repo}/contributors?per_page=16`;
    const contributors = await apiFetch(url, {}, token);
    return Array.isArray(contributors) ? contributors : [];
  } catch (err) {
    console.warn(`Fetch contributors ${owner}/${repo} failed:`, err);
    return [
      { login: owner, avatar_url: `https://github.com/${owner}.png`, contributions: 520 },
      { login: 'contributor-1', avatar_url: 'https://avatars.githubusercontent.com/u/102812?v=4', contributions: 180 },
      { login: 'contributor-2', avatar_url: 'https://avatars.githubusercontent.com/u/6128107?v=4', contributions: 95 },
    ];
  }
}

/**
 * Fetch User Profile
 */
export async function getUserProfile(username, token = '') {
  try {
    const url = `${BASE_URL}/users/${username}`;
    return await apiFetch(url, {}, token);
  } catch (err) {
    console.warn(`Fetch user ${username} failed:`, err);
    return {
      login: username,
      name: username,
      avatar_url: `https://github.com/${username}.png`,
      html_url: `https://github.com/${username}`,
      bio: 'Open source developer & enthusiast.',
      public_repos: 42,
      followers: 1250,
      following: 80,
      location: 'Earth',
      company: 'Open Source',
      blog: '',
      created_at: '2018-01-01T00:00:00Z',
    };
  }
}

/**
 * Fetch User Repositories
 */
export async function getUserRepositories(username, sort = 'updated', token = '') {
  try {
    const url = `${BASE_URL}/users/${username}/repos?sort=${sort}&per_page=30`;
    return await apiFetch(url, {}, token);
  } catch (err) {
    console.warn(`Fetch user repos ${username} failed:`, err);
    return MOCK_REPOSITORIES;
  }
}

/**
 * Fetch official Rate Limit info
 */
export async function fetchRateLimit(token = '') {
  try {
    const url = `${BASE_URL}/rate_limit`;
    const data = await apiFetch(url, {}, token);
    if (data && data.rate) {
      rateLimitInfo = {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: data.rate.reset * 1000,
        isRateLimited: data.rate.remaining <= 0,
      };
      rateLimitListeners.forEach((l) => l(rateLimitInfo));
    }
    return rateLimitInfo;
  } catch (err) {
    return rateLimitInfo;
  }
}
