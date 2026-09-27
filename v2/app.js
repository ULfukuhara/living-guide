import { renderContentBlocks, loadPreview, blocksToAiText } from './content-blocks.js?v=20260927-blocks';
import { BRAND } from './config.js';
import { safeWebUrl } from './content.js?v=20260927-blocks';
import { guideHref, KURASAPO_LINKS } from '/assets/site-links.js';

const main = document.querySelector('#main');
let guide;
let previewBlocks = [];
let previewLoaded = false;
let renderVersion = 0;
const routes = {
  'delivery-box': '宅配ボックス', 'content-blocks-poc': '宅配ボックス表示テスト', home: 'ホーム', trouble: '困ったとき', heater: 'お湯・給湯器', 'no-hot-water': 'お湯が出ない',
  trash: 'ゴミの出し方', kurasapo: 'くらさぽコネクト', procedures: '各種手続き', rules: '暮らしのルール', faq: 'よくある質問'
};
const icons = {
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  trouble: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v1"/>',
  trash: '<path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7"/>',
  rules: '<path d="M4 4h6l2 2 2-2h6v16h-6l-2 1-2-1H4Z M12 6v15"/>',
  procedures: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6m-6 5h6"/>',
  kurasapo: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-4 14h4"/>',
  faq: '<path d="M21 11a9 9 0 0 1-9 9H3l1-5A9 9 0 1 1 21 11Z"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 4m0 3v1"/>',
  heater: '<path d="M13 2c2 6-4 7-2 11 2-1 3-3 3-5 4 4 6 7 3 11-3 4-10 3-12-1C2 12 9 7 13 2Z"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>'
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.trouble}</svg>`; }
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function link(label, href, className = '') {
  const a = element('a', className, label); a.href = href; return a;
}
function card(route, title, description, color, symbol = route) {
  const a = link('', `#${route}`, 'card');
  const pictogram = element('span', `icon ${color || ''}`); pictogram.innerHTML = icon(symbol);
  a.append(pictogram, element('strong', '', title), element('small', '', description));
  return a;
}
function renderBody(section, title) {
  const panel = element('section', 'panel');
  panel.append(element('h2', '', title || section?.label || 'ご案内'));
  if (!section) {
    panel.append(element('p', 'muted', 'この物件では、この案内が登録されていないか、公開対象になっていません。'));
    return panel;
  }
  if (section.blocks?.length) {
    panel.append(renderContentBlocks(section.blocks, guideHref));
    return panel;
  }
  // Treat source content as text, allowing only the existing Markdown web-link notation.
  for (const paragraph of section.body.split(/\r?\n\s*\r?\n/)) {
    const p = element('p', 'body-text');
    const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    let cursor = 0;
    for (const match of paragraph.matchAll(pattern)) {
      p.append(document.createTextNode(paragraph.slice(cursor, match.index)));
      const url = safeWebUrl(match[2]);
      if (url) { const a = link(match[1], url); a.target = '_blank'; a.rel = 'noopener noreferrer'; p.append(a); }
      else p.append(document.createTextNode(match[0]));
      cursor = match.index + match[0].length;
    }
    p.append(document.createTextNode(paragraph.slice(cursor))); panel.append(p);
  }
  const photos = element('div', 'photos');
  for (const [index, src] of section.images.entries()) {
    const url = safeWebUrl(src); if (!url) continue;
    const img = element('img'); img.src = url; img.alt = `${section.label}の案内画像 ${index + 1}`; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', () => img.replaceWith(element('p', 'muted', '案内画像を読み込めませんでした。')));
    photos.append(img);
  }
  if (photos.childElementCount) panel.append(photos);
  return panel;
}
function helpBanner() {
  const banner = element('aside', 'support-banner');
  const text = element('div'); text.append(element('h2', '', '解決しないときは'), element('p', '', 'くらさぽコネクトのご案内をご確認ください。'));
  banner.append(text, link('問い合わせの案内へ →', '#kurasapo', 'button light')); return banner;
}
function renderHome() {
  const intro = element('section', 'intro');
  intro.append(element('h1', '', 'お困りごとを検索'));
  const search = element('label', 'search'); const symbol = element('span'); symbol.innerHTML = icon('search');
  const input = element('input'); input.type = 'search'; input.placeholder = 'お湯が出ない、ゴミ、解約など'; input.setAttribute('aria-label', 'お困りごとを検索'); input.setAttribute('aria-controls', 'searchResults');
  search.append(symbol, input); intro.append(search);
  const results = element('div', 'result-list'); results.id = 'searchResults'; results.setAttribute('aria-live', 'polite'); results.hidden = true;
  intro.append(results); main.append(intro);
  const quickRow = element('div', 'quick-row'); quickRow.setAttribute('aria-label', 'よく使う項目へのショートカット');
  for (const [route, label, tone] of [['trouble', '困ったとき', 'warm'], ['trash', 'ゴミ', 'mint'], ['procedures', '手続き', 'sky'], ['rules', 'ルール', 'lavender']]) {
    const a = link('', `#${route}`, `quick-item ${tone}`);
    const bubble = element('span', 'quick-bubble'); bubble.innerHTML = icon(route);
    a.append(bubble, element('span', '', label)); quickRow.append(a);
  }
  main.append(quickRow);
  input.addEventListener('input', () => {
    const query = input.value.normalize('NFKC').trim().toLowerCase(); results.replaceChildren(); results.hidden = !query;
    if (!query) return;
    const targets = [
      ['no-hot-water', 'お湯が出ない', guide.sections.gas?.body || '', '給湯器 お湯 温度 エラー'],
      ['trash', 'ゴミの出し方', guide.sections.trash?.body || '', 'ごみ 分別 収集日 粗大ごみ'],
      ['kurasapo', 'くらさぽコネクト', guide.sections.kurasapo_connect?.body || '', '問い合わせ 修理 相談']
    ];
    if (guide.sections.delivery_box) targets.push(['delivery-box', '宅配ボックス', guide.sections.delivery_box.blocks?.length ? blocksToAiText(guide.sections.delivery_box.blocks) : guide.sections.delivery_box.body, '荷物 受け取り']);
    const hits = targets.filter(item => item.slice(1).join(' ').normalize('NFKC').toLowerCase().includes(query));
    for (const [route, title] of hits) results.append(link(`${title} →`, `#${route}`));
    if (!hits.length) results.append(element('p', 'status', '該当する案内が見つかりませんでした。別の言葉で検索するか、現在の入居のしおりをご確認ください。'));
  });
  const menu = element('section', 'home-menu');
  menu.setAttribute('aria-labelledby', 'homeMenuTitle');
  const heading = element('h2', '', 'よく使うメニュー'); heading.id = 'homeMenuTitle';
  const cards = element('div', 'cards');
  cards.append(card('trouble', '困ったとき', '水漏れ・お湯・電気など', 'orange'), card('trash', 'ゴミの出し方', '収集日・分別', 'green'), card('procedures', '各種手続き', '解約・引越しなど', 'blue'), card('rules', '暮らしのルール', '生活マナー・注意事項', 'purple'));
  menu.append(heading, cards); main.append(menu);

  // Only surface shortcuts backed by the property's already-selected content.
  const popular = [
    ['gas', 'no-hot-water', 'お湯が出ない', 'heater', 'warm'],
    ['trash', 'trash', 'ゴミの出し方', 'trash', 'mint'],
    ['delivery_box', 'delivery-box', '宅配ボックス', 'parcel', 'sky'],
    ['kurasapo_connect', 'kurasapo', 'くらさぽ', 'kurasapo', 'lavender']
  ].filter(([key]) => guide.sections[key]);
  function homeList(title, id, items) {
    const section = element('section', 'home-links'); section.setAttribute('aria-labelledby', id);
    const heading = element('h2', '', title); heading.id = id;
    const list = element('ul', 'home-list');
    for (const [route, label, description] of items) {
      const row = element('li'); const a = link('', '#' + route);
      const arrow = element('span', 'home-chevron', '›'); arrow.setAttribute('aria-hidden', 'true');
      const text = element('span', 'home-link-text', label);
      if (description) text.append(element('small', '', description));
      a.append(text, arrow); row.append(a); list.append(row);
    }
    section.append(heading, list); return section;
  }
  if (popular.length) {
    const section = element('section', 'home-links home-popular'); section.setAttribute('aria-labelledby', 'popularTitle');
    const heading = element('h2', '', 'よくあるお困りごと'); heading.id = 'popularTitle';
    const list = element('ul', 'popular-grid');
    for (const [, route, title, symbol, tone] of popular) {
      const row = element('li'); const a = link('', '#' + route, 'popular-card ' + tone);
      const visual = element('span', 'popular-visual'); visual.setAttribute('aria-hidden', 'true');
      visual.innerHTML = symbol === 'parcel'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 7 9-4 9 4v11l-9 4-9-4Z M3 7l9 4 9-4 M12 11v11 M7.5 5l9 4v5"/></svg>'
        : icon(symbol);
      const label = element('span', 'popular-label');
      const arrow = element('span', 'home-chevron', '›'); arrow.setAttribute('aria-hidden', 'true');
      label.append(element('strong', '', title), arrow); a.append(visual, label); row.append(a); list.append(row);
    }
    section.append(heading, list); main.append(section);
  }
  main.append(homeList('その他のサポート', 'otherSupportTitle', [
    ['kurasapo', 'お問い合わせ・修理の相談', 'くらさぽコネクト'], ['faq', 'よくある質問']
  ]));
  if (guide.propertyNo === '11300') {
    const test = element('details', 'home-preview');
    test.append(element('summary', '', '表示テスト'));
    test.append(element('p', '', '表示テスト：物件の設定は変更せず、宅配ボックスの別パターンを確認できます。'), link('宅配ボックス表示テストを開く →', '#content-blocks-poc', 'button secondary'));
    main.append(test);
  }
}
async function render() {
  const currentRender = ++renderVersion;
  const requested = location.hash.slice(1) || 'home';
  const route = Object.hasOwn(routes, requested) ? requested : 'home';
  document.body.classList.toggle('home-view', route === 'home');
  const photo = document.querySelector('#homePhoto');
  // This supplied photo is approved only for Casa Nebbia; do not infer photos for other properties.
  const showPhoto = route === 'home' && !guide.unpublished && guide.propertyNo === '11300' && !photo.dataset.failed;
  photo.hidden = !showPhoto;
  document.querySelector('.property').classList.toggle('has-home-photo', showPhoto);
  document.body.classList.toggle('home-ready', !guide.unpublished);
  document.querySelector('#homeBadge').hidden = !guide.sections.kurasapo_connect;
  if (showPhoto && !photo.getAttribute('src')) photo.src = './casa-nebbia.webp';
  main.replaceChildren();
  if (guide.partial) main.append(element('p', 'notice', '一部の案内を取得できませんでした。再読み込みするか、現在の入居のしおりをご確認ください。'));
  if (guide.unpublished) {
    main.append(element('h1', '', '入居者サポート'), element('p', 'status', 'この物件の入居のしおりは準備中です。'));
    document.querySelector('#bottomNav').hidden = true;
    return;
  }
  if (route === 'home') renderHome();
  else {
    const parent = route === 'no-hot-water' ? 'heater' : route === 'heater' ? 'trouble' : 'home';
    main.append(link(`← ${routes[parent]}`, `#${parent}`, 'back'), element('h1', '', routes[route]));
    if (route === 'trouble') {
      main.append(element('p', 'muted', 'お困りの設備を選んでください。'));
      const cards = element('div', 'cards'); cards.append(card('heater', 'お湯・給湯器', 'お湯が出ないとき', 'orange'));
      const other = link('', guideHref('/'), 'card'); const pictogram = element('span', 'icon'); pictogram.innerHTML = icon('rules'); other.append(pictogram, element('strong', '', 'その他のお困りごと'), element('small', '', '水回り・エアコン・電気・鍵などは、現在のしおりへ'));
      cards.append(other); main.append(cards);
    } else if (route === 'heater') {
      main.append(element('p', 'muted', '症状から案内を確認できます。'));
      const cards = element('div', 'cards'); cards.append(card('no-hot-water', 'お湯が出ない', '給湯器の案内を確認する', 'orange', 'heater')); main.append(cards);
    } else if (route === 'no-hot-water') {
      main.append(element('p', 'muted', '現在の入居のしおりにある、給湯器を含むガスの案内をご確認ください。'), renderBody(guide.sections.gas, 'ガス・給湯器のご案内'));
      if (guide.sections.kurasapo_connect) main.append(helpBanner());
    } else if (route === 'delivery-box') main.append(renderBody(guide.sections.delivery_box));
    else if (route === 'content-blocks-poc') {
      if (guide.propertyNo !== '11300') {
        main.append(element('p', 'status', 'この物件では表示テストを利用できません。'));
      } else {
        main.append(element('p', 'notice', '表示テスト用の下書きです。この物件の設定は変更していません。掲載内容・画像は実際の宅配ボックスの操作案内として使用しないでください。'));
        const actions = element('div', 'actions');
        actions.append(link('この物件の現在の案内と比較する', '#delivery-box', 'button secondary'));
        main.append(actions);
        const loading = element('p', 'status', 'テスト用コンテンツを読み込んでいます…'); main.append(loading);
        if (!previewLoaded) { previewBlocks = await loadPreview(); previewLoaded = true; }
        if (currentRender !== renderVersion) return;
        loading.remove();
        if (previewBlocks.length) main.append(renderBody({label:'宅配ボックス', blocks:previewBlocks}, '宅配ボックス（表示テスト）'));
        else {
          main.append(element('p', 'notice', 'テスト用コンテンツを読み込めませんでした。現在の案内を表示します。'));
          main.append(renderBody(guide.sections.delivery_box));
        }
      }
    } else if (route === 'trash') main.append(renderBody(guide.sections.trash, 'この物件のゴミ案内'));
    else if (route === 'kurasapo') {
      main.append(renderBody(guide.sections.kurasapo_connect, 'くらさぽコネクトのご案内'));
      if (guide.sections.kurasapo_connect) {
        const actions = element('div', 'actions');
        const external = link('くらさぽコネクト公式サイトを開く ↗', KURASAPO_LINKS.official, 'button'); external.target = '_blank'; external.rel = 'noopener noreferrer';
        actions.append(external, link('使い方・利用開始方法を見る', guideHref('/kurasapo/'), 'button secondary')); main.append(actions);
      }
    } else {
      const panel = element('section', 'panel'); panel.append(element('p', '', 'この項目は、現在の入居のしおりでご確認いただけます。'), link('現在の入居のしおりへ →', guideHref('/'), 'button')); main.append(panel);
    }
  }
  const nav = document.querySelector('#bottomNav'); nav.hidden = false; nav.replaceChildren();
  for (const [key, label] of [['home', 'ホーム'], ['trouble', '困ったとき'], ['procedures', '手続き'], ['kurasapo', 'くらさぽ']]) {
    const a = link('', `#${key}`); a.innerHTML = icon(key); a.append(element('span', '', label));
    const active = ['heater', 'no-hot-water'].includes(route) ? 'trouble' : route;
    if (key === active) a.setAttribute('aria-current', 'page'); nav.append(a);
  }
  document.title = `${routes[route]}｜${guide.title}｜UNIV LIFE 入居者サポート`;
}
document.querySelector('#homePhoto').addEventListener('error', event => {
  event.currentTarget.hidden = true; event.currentTarget.dataset.failed = 'true';
  document.querySelector('.property').classList.remove('has-home-photo');
});
document.querySelector('#notice').textContent = BRAND.notice;
document.querySelector('#currentGuide').href = guideHref('/');
if (BRAND.logoSrc) {
  const logo = document.querySelector('#brandLogo'); logo.src = BRAND.logoSrc;
  logo.addEventListener('load', () => { logo.hidden = false; document.querySelector('#brandText').hidden = true; });
}
try {
  const { loadGuide } = await import('./data.js?v=20260927-blocks');
  guide = await loadGuide(location.search);
  document.querySelector('#propertyName').textContent = guide.title;
  if (guide.room) { const room = document.querySelector('#roomName'); room.textContent = `${guide.room}号室`; room.hidden = false; }
  render();
  window.addEventListener('hashchange', () => { render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); });
} catch (error) {
  document.querySelector('#propertyName').textContent = 'UNIV LIFE 入居者サポート';
  main.replaceChildren(element('h1', '', '案内を表示できませんでした'));
  const message = element('p', 'status'); message.setAttribute('role', 'alert');
  // Firebase errors can contain internal paths: never show raw SDK error messages.
  message.textContent = error?.code || !(error instanceof Error) || !/[ぁ-んァ-ン一-龥]/.test(error.message)
    ? '案内の読み込みに失敗しました。通信状況をご確認のうえ、再度お試しください。' : error.message;
  const retry = element('button', 'button', '再読み込み'); retry.type = 'button'; retry.addEventListener('click', () => location.reload());
  main.append(message, retry);
}
