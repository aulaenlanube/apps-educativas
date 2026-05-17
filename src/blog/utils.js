// Helpers compartidos por las páginas del blog.

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatDateLong(isoDate) {
  // isoDate viene del frontmatter como string "YYYY-MM-DD".
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return isoDate;
  return `${d} de ${MONTHS_ES[m - 1]} de ${y}`;
}

export function formatDateShort(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map((n) => parseInt(n, 10));
  if (!y || !m || !d) return isoDate;
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
}

export function buildPostUrl(slug) {
  return `/blog/${slug}`;
}

export function buildCategoryUrl(slug) {
  return `/blog/categoria/${slug}`;
}

export function buildAbsoluteUrl(path) {
  const base = 'https://apps-educativas.com';
  return path.startsWith('http') ? path : `${base}${path}`;
}
