/**
 * Real verified data for https://zapahstarosti.ru (@inna.rossia)
 * Pulled directly from official Yandex Webmaster API v4
 */

export const REAL_USER = {
  login: 'inna.rossia',
  userId: '1773537030',
  name: 'Инна',
  avatar: null,
};

export const REAL_TOKEN = 'y0__wgBEIaO2M0GGOz4SSDuvNqJGTCzqYaCCIGnNAti4cWdiRKmsF9VQIEgGF4H';

export const INITIAL_SITES = [
  {
    host_id: 'https:zapahstarosti.ru:443',
    unicode_host_url: 'https://zapahstarosti.ru',
    ascii_host_url: 'https://zapahstarosti.ru/',
    title: 'Запах старости: причины, 2-ноненаль и способы устранения',
    description: 'Информационный портал о причинах возникновения запаха 2-ноненаль, уходе и методах устранения',
    verified: true,
    sqi: 0,
    sqi_diff: 0,
    status: 'INDEXED',
    main_mirror: 'https://zapahstarosti.ru',
    pages_in_search: 6,
    pages_excluded: 0,
    pages_total_crawled: 6,
    clicks_30d: 0,
    impressions_30d: 0,
    avg_position_30d: 0,
    avg_ctr_30d: 0,
    last_crawl_time: '2026-09-18T00:28:14.878+03:00',
    last_deploy_hash: 'github-pages-live',
    last_deploy_author: 'inna.rossia',
    turbo_pages_count: 0,
    sitemaps_count: 1,
    has_critical_issues: false,
    warnings_count: 0,
    recommendations_count: 3,
  },
];

export const REAL_SITEMAP = [
  {
    sitemap_id: '8825077b-4646-38a3-9d65-29862825e473',
    url: 'https://zapahstarosti.ru/sitemap.xml',
    last_access: '11 сентября 2026 (00:46)',
    status: 'OK',
    urls_count: 6,
    type: 'SITEMAP',
    errors_count: 0,
    sources: ['ROBOTS_TXT', 'WEBMASTER'],
  },
];

export const REAL_PAGES = [
  { url: 'https://zapahstarosti.ru/', priority: '1.0', status: 200, last_access: '18 сентября 2026 (00:28)' },
  { url: 'https://zapahstarosti.ru/kak-otlichit-istochnik-zapakha/', priority: '0.9', status: 200, last_access: '18 сентября 2026 (00:28)' },
  { url: 'https://zapahstarosti.ru/chto-takoe-2-nonenal/', priority: '0.9', status: 200, last_access: '18 сентября 2026 (00:28)' },
  { url: 'https://zapahstarosti.ru/ubrat-zapah/', priority: '0.8', status: 200, last_access: '18 сентября 2026 (00:28)' },
  { url: 'https://zapahstarosti.ru/karta-osetii/', priority: '0.6', status: 200, last_access: '18 сентября 2026 (00:28)' },
  { url: 'https://zapahstarosti.ru/o-proekte/', priority: '0.5', status: 200, last_access: '18 сентября 2026 (00:28)' },
];

export const REAL_RECRAWL_QUEUE = [
  { url: 'https://zapahstarosti.ru/', addedAt: '2026-09-18T00:28:14.878+03:00', status: 'DONE' },
  { url: 'https://zapahstarosti.ru/kak-otlichit-istochnik-zapakha/', addedAt: '2026-09-18T00:28:14.878+03:00', status: 'DONE' },
  { url: 'https://zapahstarosti.ru/chto-takoe-2-nonenal/', addedAt: '2026-09-18T00:28:14.878+03:00', status: 'DONE' },
  { url: 'https://zapahstarosti.ru/ubrat-zapah/', addedAt: '2026-09-18T00:28:14.878+03:00', status: 'DONE' },
  { url: 'https://zapahstarosti.ru/karta-osetii/', addedAt: '2026-09-18T00:28:14.878+03:00', status: 'DONE' },
  { url: 'https://zapahstarosti.ru/o-proekte/', addedAt: '2026-09-18T00:28:14.878+03:00', status: 'DONE' },
];

export const REAL_ROBOTS_TXT = `User-agent: *\nAllow: /\n\nSitemap: https://zapahstarosti.ru/sitemap.xml`;

export const REAL_DIAGNOSTICS = [
  {
    id: 'https',
    title: 'Протокол HTTPS и SSL-сертификат',
    desc: 'Главное зеркало https://zapahstarosti.ru использует шифрование HTTPS, HSTS (max-age: 31556952) и валидный SSL-сертификат.',
    severity: 'ok',
  },
  {
    id: 'robots',
    title: 'Файл robots.txt доступен роботам',
    desc: 'Файл robots.txt отдается с кодом 200 OK, директива Allow: / разрешает индексацию, указан путь к Sitemap.',
    severity: 'ok',
  },
  {
    id: 'sitemap',
    title: 'Sitemap.xml обработан Яндексом',
    desc: 'Файл sitemap.xml успешно прочитан роботом Яндекса 11 сентября, содержит 6 URL, ошибок 0.',
    severity: 'ok',
  },
  {
    id: 'speed',
    title: 'Ответ веб-сервера (GitHub.com / Varnish)',
    desc: 'Сервер отвечает с кодом HTTP/2 200 OK за 83 мс с поддержкой сжатия gzip/brotli.',
    severity: 'ok',
  },
  {
    id: 'mobile',
    title: 'Мобильная оптимизация',
    desc: 'Присутствует тег viewport, страницы корректно масштабируются на смартфонах и планшетах.',
    severity: 'ok',
  },
  {
    id: 'filters',
    title: 'Поисковые фильтры и санкции Яндекса',
    desc: 'На домен zapahstarosti.ru не наложены спам-фильтры. Индексация разрешена в штатном режиме.',
    severity: 'ok',
  },
];

export const EMPTY_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return {
    date: `${day}.${month}`,
    clicks: 0,
    impressions: 0,
    ctr: 0,
    avgPos: 0,
    sqi: 0,
  };
});
