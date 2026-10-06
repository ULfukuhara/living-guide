import { safeWebUrl } from './content.js';

export const GUIDE_LAYOUT_KEYS = Object.freeze([
  'moving', 'key', 'mailbox', 'delivery_box', 'bicycle_space', 'room_equipment',
  'internet', 'trash', 'common_area', 'electricity', 'gas', 'water',
  'air_conditioner', 'ventilation', 'drainage', 'toilet', 'heater',
  'noise', 'pets', 'cancellation', 'expenses', 'management_other', 'kurasapo_connect', 'usac',
  'bike_parking', 'car_parking', 'sales', 'special_note'
]);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function webLink(label, href, className) {
  const a = element('a', className, label);
  a.href = href;
  if (!href.startsWith('tel:')) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  return a;
}

function appendText(parent, text) {
  // Source text is never interpreted as HTML.
  for (const paragraph of text.split(/\r?\n\s*\r?\n/)) {
    const p = element('p', 'body-text');
    let cursor = 0;
    for (const match of paragraph.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g)) {
      p.append(document.createTextNode(paragraph.slice(cursor, match.index)));
      const url = safeWebUrl(match[2]);
      p.append(url ? webLink(match[1], url) : document.createTextNode(match[0]));
      cursor = match.index + match[0].length;
    }
    p.append(document.createTextNode(paragraph.slice(cursor)));
    parent.append(p);
  }
}

function image(src, alt) {
  const img = element('img');
  img.src = src; img.alt = alt; img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
  img.addEventListener('error', () => img.replaceWith(element('p', 'muted', '案内画像を読み込めませんでした。')));
  return img;
}

function appendDeliveryText(parent, text) {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() === '【宅配ボックスのご利用について】') lines.shift();
  let paragraph = [];
  const flush = () => {
    const content = paragraph.join('\n').trim();
    if (content) appendText(parent, content);
    paragraph = [];
  };
  for (const line of lines) {
    const heading = line.match(/^\s*■\s*(.+?)\s*$/);
    if (heading) {
      flush();
      parent.append(element('h2', 'delivery-heading', heading[1]));
    } else paragraph.push(line);
  }
  flush();
}

export function renderBody(section, title, options = {}) {
  const panel = element('section', 'panel');
  const label = title || section?.label || 'ご案内';
  if (options.deliveryLayout || section?.hidePanelTitle) panel.setAttribute('aria-label', label);
  else panel.append(element('h2', '', label));
  if (!section) {
    panel.append(element('p', 'muted', 'この物件では、この案内が登録されていないか、公開対象になっていません。'));
    return panel;
  }
  if (section.blocks?.length) {
    const movingLayout = GUIDE_LAYOUT_KEYS.includes(section.key);
    if (movingLayout) panel.classList.add('moving-guide');
    let movingCard;
    for (const [index, block] of section.blocks.entries()) {
      if (movingLayout && options.hideContactAction && block.type === 'button' && block.actionUrl) {
        const url = new URL(block.actionUrl);
        if (url.origin === 'https://guide.univ-life.com' && url.pathname === '/kurasapo/') continue;
      }
      if (movingLayout && block.type === 'heading' && block.level !== 3) {
        movingCard = undefined;
        if (section.blocks[index + 1]?.type !== 'heading') {
          movingCard = element('section', 'moving-guide-item');
          panel.append(movingCard);
        }
      }
      const wrapper = element('div', `content-block content-block-${block.type} block-style-${block.style || 'default'}`);
      if (block.type === 'text') appendText(wrapper, block.content);
      if (block.type === 'heading') wrapper.append(element((options.deliveryLayout || section.hidePanelTitle) && block.level !== 3 ? 'h2' : 'h3', '', block.content));
      if (block.type === 'notice') appendText(wrapper, block.content);
      if (block.type === 'image') {
        const photos = element('div', 'photos content-block-image');
        photos.append(image(block.imageUrl, block.alt || `${section.label}の案内画像`));
        wrapper.append(photos);
      }
      if (block.actionLabel && block.actionUrl) {
        const actions = element('div', 'actions content-block-actions');
        actions.append(webLink(block.actionLabel, block.actionUrl, block.type === 'button' && block.style === 'default' ? 'button secondary' : 'button'));
        wrapper.append(actions);
      }
      if (movingLayout && block.type === 'button') {
        panel.append(wrapper);
        movingCard = undefined;
      } else (movingCard || panel).append(wrapper);
    }
    return panel;
  }
  if (options.deliveryLayout) appendDeliveryText(panel, section.body || '');
  else appendText(panel, section.body || '');
  const photos = element('div', 'photos');
  for (const [index, src] of (section.images || []).entries()) {
    const url = safeWebUrl(src);
    if (url) photos.append(image(url, `${section.label}の案内画像 ${index + 1}`));
  }
  if (photos.childElementCount) panel.append(photos);
  return panel;
}
