import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Format large numbers to compact human-readable format (e.g., 250.5k, 1.2M)
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return num.toLocaleString();
}

/**
 * Format repository size (GitHub API returns size in KB)
 */
export function formatSize(sizeInKB) {
  if (!sizeInKB) return '0 KB';
  if (sizeInKB >= 1024 * 1024) {
    return (sizeInKB / (1024 * 1024)).toFixed(1) + ' GB';
  }
  if (sizeInKB >= 1024) {
    return (sizeInKB / 1024).toFixed(1) + ' MB';
  }
  return sizeInKB + ' KB';
}

/**
 * Relative time formatter in Russian or English
 */
export function formatRelativeTime(dateString, lang = 'ru') {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (isNaN(diffInSeconds)) return dateString;

  if (lang === 'ru') {
    if (diffInSeconds < 60) return 'только что';
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) {
      if (minutes % 10 === 1 && minutes !== 11) return `${minutes} минуту назад`;
      if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes)) return `${minutes} минуты назад`;
      return `${minutes} минут назад`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      if (hours % 10 === 1 && hours !== 11) return `${hours} час назад`;
      if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours)) return `${hours} часа назад`;
      return `${hours} часов назад`;
    }
    const days = Math.floor(hours / 24);
    if (days < 30) {
      if (days % 10 === 1 && days !== 11) return `${days} день назад`;
      if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days)) return `${days} дня назад`;
      return `${days} дней назад`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      if (months % 10 === 1 && months !== 11) return `${months} месяц назад`;
      if ([2, 3, 4].includes(months % 10) && ![12, 13, 14].includes(months)) return `${months} месяца назад`;
      return `${months} месяцев назад`;
    }
    const years = Math.floor(months / 12);
    if (years % 10 === 1 && years !== 11) return `${years} год назад`;
    if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years)) return `${years} года назад`;
    return `${years} лет назад`;
  }

  // English fallback
  if (diffInSeconds < 60) return 'just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/**
 * Format full date string (e.g. 17 сен 2026 / Sep 17, 2026)
 */
export function formatDate(dateString, lang = 'ru') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Render and sanitize markdown safely with image fixups for GitHub
 */
export function renderMarkdown(markdownText, repoFullName = '', defaultBranch = 'main') {
  if (!markdownText) return '';
  try {
    let rawHtml = marked.parse(markdownText);

    // Fix relative image links if repository context is available
    if (repoFullName) {
      const rawBaseUrl = `https://raw.githubusercontent.com/${repoFullName}/${defaultBranch}/`;
      // Replace src="./path" or src="path" with raw github URL
      rawHtml = rawHtml.replace(/<img\s+([^>]*?)src=["'](?!(?:https?:|\/\/|data:))([^"']+)["']([^>]*)>/gi, (match, prefix, path, suffix) => {
        const cleanPath = path.replace(/^\.\//, '');
        return `<img ${prefix}src="${rawBaseUrl}${cleanPath}"${suffix}>`;
      });
    }

    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_ATTR: ['target', 'rel'],
    });

    return cleanHtml;
  } catch (err) {
    console.error('Markdown rendering error:', err);
    return `<p class="text-red-400">Ошибка отображения разметки: ${err.message}</p>`;
  }
}
