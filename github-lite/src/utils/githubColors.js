// Language color map based on GitHub's official colors
export const GITHUB_LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Rust: '#dea584',
  Go: '#00ADD8',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Java: '#b07219',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  Lua: '#000080',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Zig: '#ec915c',
  Solidity: '#AA6746',
  Haskell: '#5e5086',
  Clojure: '#db5855',
  Julia: '#a270ba',
  Perl: '#0298c3',
  Assembly: '#6E4C13',
  Jupyter: '#DA5B0B',
  'Jupyter Notebook': '#DA5B0B',
  Default: '#8b949e',
};

export function getLangColor(lang) {
  if (!lang) return GITHUB_LANG_COLORS.Default;
  return GITHUB_LANG_COLORS[lang] || '#8b949e';
}
