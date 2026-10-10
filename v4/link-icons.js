// Consistent indication for buttons that open another website.
export function decorateExternalLink(link) {
  if (!link.className?.split(/\s+/).includes('button') || link.hasAttribute('data-external-link-icon')) return link;
  let url;
  try { url = new URL(link.href, 'https://guide.univ-life.com/'); } catch { return link; }
  if (!['https:', 'http:'].includes(url.protocol) || url.origin === 'https://guide.univ-life.com') return link;
  link.className += ' external-procedure-link';
  link.setAttribute('data-external-link-icon', '');
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [key, value] of Object.entries({ viewBox: '0 0 24 24', width: '18', height: '18', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' })) icon.setAttribute(key, value);
  icon.style.flexShrink = '0';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M15 3h6v6M21 3l-10 10M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4');
  icon.append(path); link.append(icon);
  return link;
}
