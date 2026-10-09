import { troubleItems, otherTroubleGuides, mountTrouble, mountNoHotWater, mountToiletTrouble, mountAirConditionerTrouble, mountOtherTrouble } from './trouble.js?v=20261009-utilities-1';
import { mountCancellationFlow } from './cancellation.js?v=20261008-flow-1';
import { guideGroups, groupTitles, sectionGroup, sectionTitle } from './navigation.js?v=20261009-utilities-1';
import { renderBody, GUIDE_LAYOUT_KEYS } from './body.js?v=20261008-procedures-1';
import { BRAND } from './config.js';
import { mountHome, initHeader } from './home.js?v=20261009-utilities-1';
import { SECTION_KEYS } from './content.js';
import { guideHref, KURASAPO_LINKS } from '/assets/site-links.js';

const main = document.querySelector('#main');
let guide;
const routes = {
  home: 'ホーム', ...groupTitles, property: '物件情報', equipment: 'お部屋・設備', trouble: '困ったとき', heater: 'お湯・給湯器', 'no-hot-water': 'お湯が出ない', 'toilet-trouble': 'トイレのトラブル', 'air-conditioner-trouble': 'エアコンが効かない',
  trash: 'ゴミの出し方', kurasapo: 'くらさぽコネクト', procedures: '手続き・サポート', rules: '暮らしのルール', faq: 'よくある質問',
  ...Object.fromEntries(troubleItems.map(({ route, title }) => [route, title]))
};
const troubleRoutes = new Set(troubleItems.map(item => item.route).filter(route => !route.startsWith('section/')));
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
  ['noise', '生活マナー', '音への配慮・快適な暮らし', 'sound', 'purple'],
  ['cancellation', '退去・解約', 'お引越し前の確認事項', 'moving', 'purple'],
  ['management_other', '各種手続き', 'ご案内を確認する', 'procedures']
];
const sectionDescriptions = {
  key: '鍵の管理・紛失時の対応', mailbox: '郵便物の受け取り・開錠方法',
  room_equipment: '設備の確認・お手入れ・不具合の連絡', moving: '入居前後に行うこと',
  heater: '暖房器具の使い方・注意事項', toilet: '使い方・詰まりを防ぐために',
  drainage: '排水口のお手入れ・水まわりの注意', ventilation: '換気・結露やカビの予防',
  pets: '飼育に関するルール', bike_parking: 'バイクの駐車場所・利用ルール',
  car_parking: '駐車場の契約・利用ルール', sales: '訪問販売・勧誘への対応',
  expenses: '修理・消耗品などの費用負担', special_note: 'この物件の注意事項',
  kurasapo_connect: 'アプリの登録・管理会社への連絡', usac: '入居者サポートのご案内'
};
Object.assign(icons, {
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/>',
  box: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 10h18M9 4v6m6-6v6m-5 5h4"/>',
  bicycle: '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 5-9 9 9M8 5h4m3-1h3l-3 13H5"/>',
  water: '<path d="M12 2C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-13Z M9 15a3 3 0 0 0 3 3"/>',
  electricity: '<path d="m13 2-9 12h7l-1 8 10-13h-7Z"/>',
  air: '<rect x="2" y="3" width="20" height="10" rx="2"/><path d="M5 10h14M7 16v4m5-4v6m5-6v4"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-1 5 3-3"/>',
  mailbox: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  equipment: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0L21.5 5.5a6 6 0 0 1-7.9 7.9l-7.8 7.8a2.1 2.1 0 0 1-3-3l7.8-7.8a6 6 0 0 1 7.9-7.9Z"/>',
  moving: '<path d="M3 10V3h12v18H3v-6m7-3h12m-4-4 4 4-4 4"/>'
});
icons.support = '<path d="m12 2 8 3v6c0 5-4 8-8 11-4-3-8-6-8-11V5z"/><path d="m8 12 3 3 5-6"/>';
Object.assign(icons, {
  sound: '<path d="M4 9h4l5-4v14l-5-4H4zM17 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  paw: '<ellipse cx="6" cy="8" rx="2" ry="3"/><ellipse cx="11" cy="5" rx="2" ry="3"/><ellipse cx="17" cy="7" rx="2" ry="3"/><ellipse cx="21" cy="12" rx="1.5" ry="2.5"/><path d="M5 18c0-3 3-7 6-7s7 4 7 7c0 4-4 2-6 2s-7 2-7-2Z"/>',
  motorcycle: '<circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="M5 17h7l4-8 3 8M13 5h3l2 4M4 10h7l3 3M3 7h5"/>',
  car: '<path d="m3 11 3-7h12l3 7v9h-3v-3H6v3H3zM3 11h18M7 14h1m8 0h1"/>',
  visitor: '<path d="M3 21V3h10v18M1 21h14M9 12h1"/><circle cx="19" cy="9" r="3"/><path d="M15 21v-4a4 4 0 0 1 8 0v4"/>',
  toilet: '<path d="M4 3h8v8H4zM4 7h3M3 11h18v2a6 6 0 0 1-6 6h-3l-1 3H7l1-6a7 7 0 0 1-5-5Z"/>',
  faucet: '<path d="M3 13v-3h14a4 4 0 0 1 4 4v2h-5v-2H3M9 10V5m-4 0h8M19 19v2"/>',
  fan: '<rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="12" cy="12" r="2"/><path d="M12 10C6 3 5 10 10 12m4 0c7-6 0-7-2-2m0 4c6 7 7 0 2-2m-4 0c-7 6 0 7 2 2"/>',
  radiator: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 8v8m5-8v8m5-8v8M6 19v3m12-3v3"/>'
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
function helpBanner(context) {
  const banner = element('aside', 'support-banner');
  const text = element('div');
  const guidance = {
    intro: ['入居時のご案内で不明な点がある場合', '入居時の準備や手続きについて分からないことがある場合は、くらさぽコネクトから管理会社へお問い合わせください。'],
    equipment: ['設備について不明な点や不具合がある場合', '設備の使い方やお手入れで分からないこと、故障・不具合がある場合は、くらさぽコネクトから管理会社へお問い合わせください。'],
    procedures: ['手続きで不明な点がある場合', '申請方法や費用について分からないことは、くらさぽコネクトから管理会社へご相談ください。'],
    cancellation: ['解約・退去の手続きを確認したい場合', '申請先や手続きについて不明な点は、管理会社へご相談ください。通常のお問い合わせを送信するだけでは、解約申請が完了したとは限りません。'],
    expenses: ['費用負担について確認したい場合', '原因や使用状況、契約条件によって判断が異なります。状況が分かる写真などを添えて、管理会社へご相談ください。'],
    usac: ['USACの利用について不明な点がある場合', '加入状況や利用条件は、契約時の書類とパンフレットをご確認ください。分からないことは管理会社へお問い合わせください。'],
    kurasapo_connect: ['利用開始・お問い合わせの方法', 'アプリの登録からお問い合わせまでの操作は、使い方の案内をご確認ください。']
  }[context];
  text.append(element('h2', '', guidance?.[0] || '解決しませんでしたか？'), element('p', '', guidance?.[1] || '入居のしおりWebで解決しない場合は、くらさぽコネクトからお問い合わせください。'));
  banner.append(text, link(guidance ? 'くらさぽコネクトの使い方を見る →' : 'くらさぽコネクトで問い合わせる →', guideHref('/kurasapo/'), 'button'));
  return banner;
}
function renderHome() { mountHome(main, guide, { element, link, icon, card }); }

function renderGuideList(route) {
  const descriptions = {
    intro: 'くらさぽコネクトの準備から、電気・ガス・水道、入居直後の確認へ、順番にご確認ください。',
    equipment: '設備の使い方・お手入れ・不具合時の案内をご確認ください。',
    trash: 'ゴミの出し方や収集日の案内をご確認ください。',
    rules: '暮らしのルールをお選びください。',
    procedures: '解約・費用の確認、管理会社への連絡、サポートの案内です。'
  };
  main.append(element('p', 'trouble-intro', descriptions[route]));
  const list = element('nav', 'trouble-list');
  list.setAttribute('aria-label', routes[route] + 'の案内');
  const procedureGroups = [
    ['解約・費用', ['cancellation', 'expenses']],
    ['連絡・サポート', ['kurasapo_connect', 'usac']],
    [/アンケート/.test(guide.sections.management_other?.label || '') ? 'アンケート' : 'その他のご案内', ['management_other']]
  ];
  const keys = route === 'procedures' ? procedureGroups.flatMap(([, keys]) => keys) : guideGroups[route];
  for (const key of keys) {
    const section = guide.sections[key];
    if (!section) continue;
    if (route === 'procedures') {
      const [groupLabel, groupKeys] = procedureGroups.find(([, keys]) => keys.includes(key));
      if (groupKeys.find(key => guide.sections[key]) === key) list.append(element('h2', 'procedure-group-title', groupLabel));
    }
    const fallbackSymbol = { key: 'key', mailbox: 'mailbox', room_equipment: 'equipment', moving: 'moving', heater: 'radiator', toilet: 'toilet', drainage: 'faucet', ventilation: 'fan', pets: 'paw', bike_parking: 'motorcycle', car_parking: 'car', sales: 'visitor', expenses: 'procedures', kurasapo_connect: 'kurasapo', usac: 'support' }[key] || 'rules';
    const [, , description, symbol, color] = categories.find(item => item[0] === key) || [key, section.label, 'ご案内を確認する', fallbackSymbol];
    const title = route === 'intro' && key === 'moving' ? '入居直後の確認・引っ越しの注意' : sectionTitle(key, section);
    const row = link('', '#section/' + key, 'trouble-item');
    const pictogram = element('span', 'icon ' + (color || ''));
    pictogram.innerHTML = icon(symbol);
    const copy = element('span', 'trouble-item-copy');
    const introDescriptions = { moving: '設備の動作確認・入居時点検への登録・搬入時の注意', electricity: '使用開始・電気料金の確認', gas: '使用開始・給湯の確認', water: '使用開始・水道料金の確認', key: '受け取った鍵の確認・管理', mailbox: '郵便受けの場所・開錠方法', internet: '接続方法・Wi-Fiの準備', kurasapo_connect: 'アプリの利用開始・入居時の登録', special_note: 'この物件で確認しておくこと' };
    const procedureDescriptions = { cancellation: '申請・退去までの準備・精算', expenses: '修理や退去時の費用を確認', kurasapo_connect: '利用開始・管理会社へのお問い合わせ', usac: '生活サポートの内容・利用条件' };
    if (/アンケート/.test(section.label)) procedureDescriptions.management_other = '入居後の感想を回答する';
    copy.append(element('strong', '', title), element('small', '', route === 'intro' ? introDescriptions[key] || description : route === 'procedures' ? procedureDescriptions[key] || description : sectionDescriptions[key] || description));
    const arrow = element('span', 'trouble-arrow', '›');
    arrow.setAttribute('aria-hidden', 'true');
    row.append(pictogram, copy, arrow);
    list.append(row);
  }
  if (list.childElementCount) main.append(list);
  else main.append(element('p', 'status', 'この物件で公開されている案内はありません。'));
  main.append(helpBanner(route));
}

function render() {
  const requested = location.hash.slice(1) || 'home';
  const sectionKey = requested.startsWith('section/') ? requested.slice(8) : '';
  const route = sectionKey && SECTION_KEYS.includes(sectionKey) ? requested : Object.hasOwn(routes, requested) ? requested : 'home';
  const routeTitle = sectionKey === 'key' && guide.sections.key
    ? '鍵の管理・紛失時の対応'
    : guide.sections[sectionKey] ? sectionTitle(sectionKey, guide.sections[sectionKey]) : routes[route] || 'ご案内';
  document.body.classList.toggle('is-home', route === 'home');
  document.body.classList.toggle('is-trouble', route === 'trouble' || troubleRoutes.has(route));
  document.body.classList.toggle('is-detail', route === 'kurasapo' || route === 'trouble' || troubleRoutes.has(route) || Object.hasOwn(guideGroups, route) || (sectionKey && Object.values(guideGroups).some(keys => keys.includes(sectionKey))));
  main.replaceChildren();
  if (guide.partial) main.append(element('p', 'notice', '一部の案内を取得できませんでした。再読み込みするか、現在の入居のしおりをご確認ください。'));
  if (guide.unpublished) {
    main.append(element('h1', '', '入居者サポート'), element('p', 'status', 'この物件の入居のしおりは準備中です。'));
    document.querySelector('#bottomNav').hidden = true;
    return;
  }
  if (route === 'home') renderHome();
  else {
    const parent = troubleRoutes.has(route) || route === 'heater' ? 'trouble' : sectionKey ? sectionGroup(sectionKey) : 'home';
    main.append(link(`← ${routes[parent]}`, `#${parent}`, 'back'), element('h1', '', routeTitle));
    if (route === 'property') {
      const panel = element('section', 'panel');
      panel.append(element('h2', '', guide.title), element('p', '', guide.address || '所在地情報は現在準備中です'));
      if (guide.room) panel.append(element('p', '', guide.room + '号室'));
      panel.append(element('p', 'muted', '掲載内容と契約条件が異なる場合は、賃貸借契約書の内容が優先されます。'));
      main.append(panel);
    } else if (route.startsWith('section/')) {
      const sectionBody = renderBody(guide.sections[sectionKey], sectionKey === 'bike_parking' ? 'バイク置き場' : undefined, { deliveryLayout: sectionKey === 'delivery_box', hideContactAction: GUIDE_LAYOUT_KEYS.includes(sectionKey), procedureExamples: sectionKey === 'expenses' });
      if (sectionKey === 'cancellation') {
        mountCancellationFlow(main, guide.sections[sectionKey], { element, link });
        const contents = element('details', 'cancellation-contents');
        contents.append(element('summary', '', '詳しい案内の目次を開く'));
        const index = element('nav', 'procedure-index');
        index.setAttribute('aria-label', '解約・退去の案内目次');
        sectionBody.querySelectorAll('.moving-guide-item h2,.moving-guide-item h3').forEach((heading, i) => {
          heading.id = 'procedure-topic-' + i;
          const jump = element('button', 'procedure-jump', heading.textContent);
          jump.type = 'button';
          jump.addEventListener('click', () => { heading.tabIndex = -1; heading.focus({ preventScroll: true }); heading.scrollIntoView({ behavior: 'auto', block: 'start' }); });
          index.append(jump);
        });
        if (index.childElementCount) { contents.append(index); main.append(contents); }
      }
      main.append(sectionBody);
      const survey = sectionKey === 'management_other' && /アンケート/.test(guide.sections[sectionKey]?.label || '');
      if (!survey) main.append(helpBanner(sectionKey === 'moving' ? 'intro' : sectionGroup(sectionKey) === 'equipment' ? 'equipment' : sectionGroup(sectionKey) === 'procedures' ? sectionKey : undefined));
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
      main.append(renderBody(guide.sections.kurasapo_connect, 'くらさぽコネクトのご案内', { hideContactAction: true }));
      if (guide.sections.kurasapo_connect) {
        const banner = element('aside', 'support-banner');
        banner.append(element('h2', '', '利用開始・ログインのご案内'), element('p', '', 'アプリの登録やログインについては、使い方・利用開始方法をご確認ください。'));
        const actions = element('div', 'actions');
        const external = link('くらさぽコネクト公式サイトを開く ↗', KURASAPO_LINKS.official, 'button secondary'); external.target = '_blank'; external.rel = 'noopener noreferrer';
        actions.append(link('使い方・利用開始方法を見る', guideHref('/kurasapo/'), 'button'), external); banner.append(actions); main.append(banner);
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
      const active = troubleRoutes.has(route) || route === 'heater' ? 'trouble' : sectionKey && sectionGroup(sectionKey) === 'procedures' ? 'procedures' : route;
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
  const { loadGuide } = await import('./data.js?v=20261006-2');
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
} finally {
  document.body.classList.remove('is-loading');
}
