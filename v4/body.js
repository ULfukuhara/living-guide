import { safeWebUrl } from './content.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function webLink(label, href, className) {
  const a = element('a', className, label);
  a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
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
  img.src = src; img.alt = alt; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
  img.addEventListener('error', () => img.replaceWith(element('p', 'muted', '案内画像を読み込めませんでした。')));
  return img;
}

export function renderBody(section, title) {
  const panel = element('section', 'panel');
  panel.append(element('h2', '', title || section?.label || 'ご案内'));
  if (!section) {
    panel.append(element('p', 'muted', 'この物件では、この案内が登録されていないか、公開対象になっていません。'));
    return panel;
  }
  if (section.blocks?.length) {
    for (const block of section.blocks) {
      const wrapper = element('div', `content-block content-block-${block.type} block-style-${block.style || 'default'}`);
      if (block.type === 'text') appendText(wrapper, block.content);
      if (block.type === 'heading') wrapper.append(element('h3', '', block.content));
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
      panel.append(wrapper);
    }
    return panel;
  }
  appendText(panel, section.body || '');
  const photos = element('div', 'photos');
  for (const [index, src] of (section.images || []).entries()) {
    const url = safeWebUrl(src);
    if (url) photos.append(image(url, `${section.label}の案内画像 ${index + 1}`));
  }
  if (photos.childElementCount) panel.append(photos);
  return panel;
}
