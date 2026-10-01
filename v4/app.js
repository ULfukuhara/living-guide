import { troubleItems, otherTroubleGuides, mountTrouble, mountNoHotWater, mountToiletTrouble, mountAirConditionerTrouble, mountOtherTrouble } from './trouble.js?v=20261001-4';
import { BRAND } from './config.js';
import { mountHome, initHeader } from './home.js?v=20261001-1';
import { safeWebUrl, SECTION_KEYS } from './content.js';
import { guideHref, KURASAPO_LINKS } from '/assets/site-links.js';

const main = document.querySelector('#main');
let guide;
const routes = {
  home: 'ホーム', property: '物件情報', equipment: 'お部屋・設備', trouble: '困ったとき', heater: 'お湯・給湯器', 'no-hot-water': 'お湯が出ない', 'toilet-trouble': 'トイレのトラブル', 'air-conditioner-trouble': 'エアコンが効かない',
  trash: 'ゴミの出し方', kurasapo: 'くらさぽコネクト', procedures: '各種手続き', rules: '暮らしのルール', faq: 'よくある質問',
  ...Object.fromEntries(troubleItems.map(({ route, title }) => [route, title]))
};
const troubleRoutes = new Set(troubleItems.map(item => item.route));
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
const categories = [
  ['trash', 'ゴミの出し方', '収集日・分別を確認', 'trash', 'green'],
  ['internet', 'インターネット', '利用開始・接続について', 'wifi'],
  ['delivery_box', '宅配ボックス', '荷物の受け取り方', 'box', 'orange'],
  ['bicycle_space', '駐輪場', '自転車の置き場所・ルール', 'bicycle', 'green'],
  ['gas', 'ガス', '開栓・給湯器のご案内', 'heater', 'orange'],
  ['water', '水道・お湯', '水まわりの使い方', 'water'],
  ['electricity', '電気', '電気・ブレーカーの確認', 'electricity', 'orange'],
  ['air_conditioner', 'エアコン', '使い方・お手入れ', 'air'],
  ['common_area', '共用部分', 'みんなで使う場所のルール', 'home', 'green'],
  ['noise', '生活マナー', '音への配慮・快適な暮らし', 'rules', 'purple'],
  ['cancellation', '退去・解約', 'お引越し前の確認事項', 'moving', 'purple'],
  ['management_other', '各種手続き', '申請・ご連絡について', 'procedures']
];
const guideGroups = {
  equipment: ['key', 'mailbox', 'delivery_box', 'room_equipment', 'internet', 'electricity', 'gas', 'water', 'heater', 'air_conditioner', 'toilet', 'drainage', 'ventilation'],
  trash: ['trash'],
  rules: ['trash', 'common_area', 'noise', 'pets', 'bicycle_space', 'bike_parking', 'car_parking', 'special_note'],
  procedures: ['moving', 'cancellation', 'expenses', 'sales', 'management_other', 'kurasapo_connect', 'usac']
};
Object.assign(icons, {
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/>',
  box: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M9 4v6m6-6v6m-5 5h4"/>',
  bicycle: '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-9 9 9M8 5h4m3-1h3l-3 13H5"/>',
  water: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z M9 15a3 3 0 0 0 3 3"/>',
  electricity: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  air: '<rect x="2" y="3" width="20" height="10" rx="2"/><path d="M5 10h14M7 16v4m5-4v6m5-6v4"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-1 5 3-3"/>',
  moving: '<path d="M3 10V3h12v18H3v-6m7-3h12m-4-4 4 4-4 4"/>'
});
function sectionCard(item, compact = false) {
  const [key, title, description, symbol, color] = item;
  const a = card('section/' + key, title, description, color, symbol);
  if (compact) a.classList.add('category-card');
  return a;
}
function appendGrid(title, description, items, className) {
  const section = element('section', 'home-section');
  const heading = element('div', 'section-label');
  heading.append(element('h2', '', title));
  section.append(heading);
  if (description) section.append(element('p', 'section-description', description));
  const grid = element('div', 'cards ' + className);
  items.forEach(item => grid.append(sectionCard(item, className === 'living-grid')));
  if (!items.length) grid.append(element('p', 'status', 'この物件で公開されている案内はありません。'));
  section.append(grid); main.append(section);
}
function helpBanner() {
  const banner = element('aside', 'support-banner');
  const text = element('div');
  text.append(element('h2', '', '解決しませんでしたか？'), element('p', '', '入居のしおりWebで解決しない場合は、くらさぽコネクトからお問い合わせください。'));
  banner.append(text, link('くらさぽコネクトで問い合わせる →', guideHref('/kurasapo/'), 'button'));
  return banner;
}
function renderHome() { mountHome(main, guide, { element, link, icon, card }); }

function renderGuideList(route) {
  const descriptions = {
    equipment: 'お部屋や設備の案内をお選びください。',
    trash: 'ゴミの出し方や収集日の案内をご確認ください。',
    rules: '暮らしのルールをお選びください。',
    procedures: '手続きの案内をお選びください。'
  };
  main.append(element('p', 'trouble-intro', descriptions[route]));
  const list = element('nav', 'trouble-list');
  list.setAttribute('aria-label', routes[route] + 'の案内');
  for (const key of guideGroups[route]) {
    const section = guide.sections[key];
    if (!section) continue;
    const [, title, description, symbol, color] = categories.find(item => item[0] === key) || [key, section.label, 'ご案内を確認する', 'rules'];
    const row = link('', '#section/' + key, 'trouble-item');
    const pictogram = element('span', 'icon ' + (color || ''));
    pictogram.innerHTML = icon(symbol);
    const copy = element('span', 'trouble-item-copy');
    copy.append(element('strong', '', title), element('small', '', description));
    const arrow = element('span', 'trouble-arrow', '›');
    arrow.setAttribute('aria-hidden', 'true');
    row.append(pictogram, copy, arrow);
    list.append(row);
  }
  if (list.childElementCount) main.append(list);
  else main.append(element('p', 'status', 'この物件で公開されている案内はありません。'));
  main.append(helpBanner());
}

function render() {
  const requested = location.hash.slice(1) || 'home';
  const sectionKey = requested.startsWith('section/') ? requested.slice(8) : '';
  const route = sectionKey && SECTION_KEYS.includes(sectionKey) ? requested : Object.hasOwn(routes, requested) ? requested : 'home';
  const routeTitle = guide.sections[sectionKey]?.label || routes[route] || 'ご案内';
  document.body.classList.toggle('is-home', route === 'home');
  document.body.classList.toggle('is-trouble', route === 'trouble' || troubleRoutes.has(route));
  document.body.classList.toggle('is-detail', route === 'trouble' || troubleRoutes.has(route) || Object.hasOwn(guideGroups, route) || (sectionKey && Object.values(guideGroups).some(keys => keys.includes(sectionKey))));
  main.replaceChildren();
  if (guide.partial) main.append(element('p', 'notice', '一部の案内を取得できませんでした。再読み込みするか、現在の入居のしおりをご確認ください。'));
  if (guide.unpublished) {
    main.append(element('h1', '', '入居者サポート'), element('p', 'status', 'この物件の入居のしおりは準備中です。'));
    document.querySelector('#bottomNav').hidden = true;
    return;
  }
  if (route === 'home') renderHome();
  else {
    const parent = troubleRoutes.has(route) || route === 'heater' ? 'trouble' : sectionKey ? Object.keys(guideGroups).find(key => guideGroups[key].includes(sectionKey)) || 'home' : 'home';
    main.append(link(`← ${routes[parent]}`, `#${parent}`, 'back'), element('h1', '', routeTitle));
    if (route === 'property') {
      const panel = element('section', 'panel');
      panel.append(element('h2', '', guide.title), element('p', '', guide.address || '所在地情報は現在準備中です'));
      if (guide.room) panel.append(element('p', '', guide.room + '号室'));
      panel.append(element('p', 'muted', '掲載内容と契約条件が異なる場合は、賃貸借契約書の内容が優先されます。'));
      main.append(panel);
    } else if (route.startsWith('section/')) {
      main.append(renderBody(guide.sections[sectionKey]), helpBanner());
    } else if (route === 'trouble') {
      mountTrouble(main, guide, { element, link, icon });
    } else if (Object.hasOwn(guideGroups, route)) {
      renderGuideList(route);
    } else if (route === 'heater') {
      main.append(element('p', 'muted', '症状から案内を確認できます。'));
      const cards = element('div', 'cards'); cards.append(card('no-hot-water', 'お湯が出ない', '給湯器の案内を確認する', 'orange', 'heater')); main.append(cards);
    } else if (route === 'no-hot-water') {
      mountNoHotWater(main, guide, { element, link, renderBody });
    } else if (route === 'toilet-trouble') {
      mountToiletTrouble(main, guide, { element, link, renderBody });
    } else if (route === 'air-conditioner-trouble') {
      mountAirConditionerTrouble(main, guide, { element, link, renderBody });
    } else if (Object.hasOwn(otherTroubleGuides, route)) {
      mountOtherTrouble(main, guide, { element, link, renderBody }, route);
    } else if (route === 'kurasapo') {
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
  const nav = document.querySelector('#bottomNav');
  nav.replaceChildren();
  nav.hidden = route === 'home';
  // TOP already offers search and all main destinations; keep persistent navigation on subpages only.
  if (route !== 'home') {
    for (const [key, label] of [['home', 'ホーム'], ['trouble', '困ったとき'], ['procedures', '手続き'], ['kurasapo', 'くらさぽ']]) {
      const a = link('', '#'+key); a.innerHTML = icon(key); a.append(element('span', '', label));
      const active = troubleRoutes.has(route) || route === 'heater' ? 'trouble' : sectionKey && guideGroups.procedures.includes(sectionKey) ? 'procedures' : route;
      if (key === active) a.setAttribute('aria-current', 'page');
      nav.append(a);
    }
  }
  document.title = `${routeTitle}｜${guide.title}｜入居のしおり`;
}
initHeader();
document.querySelector('#notice').textContent = BRAND.notice;
document.querySelector('#currentGuide').href = guideHref('/');
if (BRAND.logoSrc) {
  const logo = document.querySelector('#brandLogo'); logo.src = BRAND.logoSrc;
  logo.addEventListener('load', () => { logo.hidden = false; document.querySelector('#brandText').hidden = true; });
}
try {
  const { loadGuide } = await import('./data.js');
  guide = await loadGuide(location.search);
  render();
  window.addEventListener('hashchange', () => { render(); main.focus({ preventScroll: true }); window.scrollTo(0, 0); });
} catch (error) {

  main.replaceChildren(element('h1', '', '案内を表示できませんでした'));
  const message = element('p', 'status'); message.setAttribute('role', 'alert');
  // Firebase errors can contain internal paths: never show raw SDK error messages.
  message.textContent = error?.code || !(error instanceof Error) || !/[ぁ-んァ-ン一-龥]/.test(error.message)
    ? '案内の読み込みに失敗しました。通信状況をご確認のうえ、再度お試しください。' : error.message;
  const retry = element('button', 'button', '再読み込み'); retry.type = 'button'; retry.addEventListener('click', () => location.reload());
  main.append(message, retry);
}

