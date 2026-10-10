import { guideHref } from '/assets/site-links.js';

// Presentation only: consume the guide already selected by loadGuide.
// No Firebase imports, extra reads, or writes are needed for these screens.
export const troubleItems = [
  { route: 'section/electricity', title: '停電・電気が使えない', description: '停電時・ブレーカーの案内を確認', icon: 'electricity', color: 'orange' },
  { route: 'no-hot-water', title: 'お湯が出ない', description: '給湯器やガスを確認', icon: 'heater', color: 'orange' },
  { route: 'water-leak', title: '水漏れ', description: '漏れている場所と状況を確認', icon: 'water' },
  { route: 'toilet-trouble', title: 'トイレのトラブル', description: '症状ごとの確認事項を見る', icon: 'toilet' },
  { route: 'air-conditioner-trouble', title: 'エアコンが効かない', description: '設定や運転状況を確認', icon: 'air' },
  { route: 'lost-key', title: '鍵をなくした', description: '鍵の所在と連絡方法を確認', icon: 'key', color: 'purple' },
  { route: 'internet-trouble', title: 'インターネットにつながらない', description: '接続・利用方法を確認', icon: 'wifi' },
  { route: 'noise-trouble', title: '騒音', description: '状況と生活ルールを確認', icon: 'sound', color: 'green' },
  { route: 'other-trouble', title: 'その他のお困りごと', description: '状況と管理会社の案内を確認', icon: 'faq', color: 'purple' }
];

export function mountTrouble(main, guide, { element: el, link, icon }) {
  main.append(el('p', 'trouble-intro', 'どのようなことでお困りですか？'));
  const list = el('nav', 'trouble-list');
  list.setAttribute('aria-label', 'お困りごとの種類');
  for (const item of troubleItems) {
    if (item.route.startsWith('section/') && !guide.sections[item.route.slice(8)]) continue;
    const row = link('', '#' + item.route, 'trouble-item');
    const symbol = el('span', 'icon ' + (item.color || ''));
    symbol.innerHTML = icon(item.icon);
    const copy = el('span', 'trouble-item-copy');
    copy.append(el('strong', '', item.title), el('small', '', item.description));
    const arrow = el('span', 'trouble-arrow', '›');
    arrow.setAttribute('aria-hidden', 'true');
    row.append(symbol, copy, arrow);
    list.append(row);
  }
  main.append(list);
}

function mountEmergencyContact(main, guide, { element: el, link }) {
  if (String(guide.propertyNo) !== '11300') return;
  const panel = el('aside', 'trouble-emergency');
  panel.tabIndex = -1;
  panel.setAttribute('aria-label', '急ぎの対応が必要な場合の連絡先');
  panel.append(el('h2', '', '急ぎの対応が必要な場合'), el('p', '', '水漏れの拡大・鍵の紛失で入室できないなど、お急ぎの場合はお電話ください。'));
  panel.append(link('0120-107-001 に電話する', 'tel:0120107001', 'button'));
  const hours = el('dl', 'trouble-contact-hours');
  for (const [time, destination] of [
    ['平日 9:30〜17:30', 'ユニヴ・ライフが受付'],
    ['平日 17:30〜翌9:30', 'JBRコールセンターが受付'],
    ['土日・祝日', 'JBRコールセンターが受付']
  ]) {
    const desk = el('dd');
    desk.append(el('span', 'trouble-contact-desk', destination.replace(/が受付$/, '')), el('span', 'trouble-contact-reception', 'が受付'));
    hours.append(el('dt', '', time), desk);
  }
  if (guide.sections.usac) {
    const membership = el('p', '', 'USAC会員の方はJBRに対応を依頼できます。');
    membership.append(' ', link('USACの利用条件を見る', '#section/usac'));
    panel.append(hours, membership);
  } else panel.append(hours);
  main.append(panel);
}

function appendEmergencyJump(main, safety, el, label = '急ぎの連絡先を確認する ↓') {
  const jump = el('button', 'trouble-contact-jump', label);
  jump.type = 'button';
  jump.addEventListener('click', () => {
    const contact = main.querySelector('.trouble-emergency');
    contact?.focus({ preventScroll: true });
    contact?.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
  safety.append(jump);
}

const additionalNotes = {
  gas: 'まだガスの利用開始手続きがお済みでない場合は、ガスの案内をご確認ください。利用中の不具合は、エラー表示とガスメーターの状態を控えてご相談ください。',
  toilet: '詰まり・水漏れがある場合は使用を控え、症状を記録してください。日常の使い方はトイレの案内をご確認ください。',
  air_conditioner: '運転モードと設定温度、エラー表示を確認してください。お手入れ・機種の確認方法はエアコンの案内をご確認ください。',
  key: '室内に入れない場合は、契約時に案内された連絡先をご確認ください。対応時間や費用は、連絡先に確認してください。',
  noise: '発生した日時、音の種類、続いた時間を記録してください。音の発生元を推測だけで決めつけないようにしてください。'
};

function mountChecks(main, guide, { element: el, link }, checks, sectionKeys, missingMessage, symptoms = false) {
  const steps = el(symptoms ? 'div' : 'ol', 'trouble-steps' + (symptoms ? ' trouble-symptoms' : ''));
  checks.forEach(([title, messages], index) => {
    const step = el(symptoms && messages.length ? 'details' : symptoms ? 'section' : 'li', 'panel trouble-step');
    const heading = el(step.tagName === 'DETAILS' ? 'summary' : 'h2');
    if (!symptoms && messages.length) {
      const number = el('span', 'trouble-step-number', String(index + 1));
      number.setAttribute('aria-hidden', 'true');
      heading.append(number);
    }
    heading.append(title);
    step.append(heading);
    if (messages.length) {
      const list = el('ul');
      messages.forEach(message => list.append(el('li', '', message)));
      step.append(list);
    } else {
      const sections = sectionKeys.filter(key => guide.sections[key]);
      if (sections.length) {
        for (const key of sections) {
          const details = el('details', 'trouble-property-guide');
          details.append(el('summary', '', guide.sections[key].label + 'の補足案内'));
          if (additionalNotes[key]) details.append(el('p', '', additionalNotes[key]));
          details.append(link(guide.sections[key].label + 'の詳しい案内を見る →', '#section/' + key, 'trouble-guide-link'));
          const close = el('button', 'trouble-close', 'この案内を閉じる');
          close.type = 'button';
          close.addEventListener('click', () => { details.open = false; details.querySelector('summary').focus(); });
          details.append(close);
          step.append(details);
        }
      } else step.append(el('p', 'muted', missingMessage));
    }
    steps.append(step);
  });
  main.append(steps);
}

function mountContact(main, guide, { element: el, link }, message, action) {
  const route = location.hash.slice(1);
  const heading = { 'noise-trouble': '騒音について相談したい場合', 'lost-key': '鍵が見つからない・室内に入れない場合', 'other-trouble': '管理会社に相談する場合' }[route] || '確認しても改善しない場合';
  const urgent = String(guide.propertyNo) === '11300' && ['no-hot-water', 'water-leak', 'toilet-trouble', 'air-conditioner-trouble', 'lost-key', 'other-trouble'].includes(route);
  const help = el(urgent ? 'details' : 'section', 'panel trouble-help' + (urgent ? ' trouble-routine-contact' : ''));
  const conciseMessage = action ? message : message.replace(/、?くらさぽコネクトの案内から(?:お問い合わせ方法|相談方法)をご確認ください。$/, 'ご相談ください。');
  help.append(el(urgent ? 'summary' : 'h2', '', urgent ? '急ぎでない相談・写真を送る場合' : heading), el('p', '', conciseMessage));
  if (!action) {
    help.append(el('p', '', '通常のお問い合わせは、くらさぽコネクトの「お問い合わせ」から、発生場所・日時・症状をお送りください。入居時の傷・汚れの登録とは窓口が異なります。'));
  }
  const requestGuide = guideHref('/kurasapo/') + (urgent ? '#request' : '');
  help.append(link(action?.actionLabel || (urgent ? 'くらさぽで相談する方法を見る' : 'くらさぽコネクトの使い方を見る'), action?.actionUrl || requestGuide, 'button'));
  main.append(help);
  if (urgent) mountEmergencyContact(main, guide, { element: el, link });
}

export function mountNoHotWater(main, guide, helpers) {
  const { element: el } = helpers;
  const isCasa = String(guide.propertyNo) === '11300';
  main.append(el('p', 'trouble-intro', 'まず以下の内容をご確認ください。'));
  main.append(el('p', 'trouble-safety', 'ガスのにおいがする場合は、点火や電気のスイッチ操作をせず、ご契約のガス会社の緊急窓口へご連絡ください。'));
  if (isCasa) main.append(el('p', 'trouble-equipment-note', 'この物件はIHコンロですが、給湯にはガスを使用しています。'));
  mountChecks(main, guide, helpers, [
    ['給湯器リモコン', ['電源が入っているか確認してください。', 'エラー番号が表示されている場合は、番号を控えてください。']],
    ...(!isCasa ? [['ガスコンロ', ['ガスのにおいがしないことを確認してから、ガスコンロが点火するか確認してください。', 'ガスコンロがない場合は、次の確認へ進んでください。']]] : []),
    ['ガスメーター', ['安全装置が作動していないか、表示を確認してください。', '復帰操作は、ご契約のガス会社の案内に従ってください。']],
    ['その他・この物件の給湯設備', []]
  ], ['gas'], 'この物件の給湯設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。');
  mountContact(main, guide, helpers, '確認した内容と、表示されているエラー番号を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。');
}

export function mountToiletTrouble(main, guide, helpers) {
  const { element: el } = helpers;
  main.append(el('p', 'trouble-intro', '当てはまる症状を開いてご確認ください。'));
  main.append(el('p', 'trouble-safety', '水があふれている、または床に漏れている場合は、トイレの使用を中止し、周囲に水が広がらないようにしてください。'));
  mountChecks(main, guide, helpers, [
    ['水が流れない・詰まっている', ['続けて水を流すとあふれるおそれがあります。繰り返し流さず、便器内の水位を確認してください。', '異物を落とした場合は、何を落としたか控えてください。']],
    ['水が止まらない・漏れている', ['どこから水が出ているか、床への漏れがあるか確認してください。', '止水栓の場所や操作が分からない場合は、無理に操作せずご相談ください。']],
    ['洗浄・便座が動かない', ['電源プラグやリモコンの表示を確認してください。', 'エラー表示がある場合は、その内容を控えてください。']],
    ['この物件のトイレ設備', []]
  ], ['toilet'], 'この物件のトイレ設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。', true);
  mountContact(main, guide, helpers, '症状と確認した内容を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。');
}

export function mountAirConditionerTrouble(main, guide, helpers) {
  const { element: el } = helpers;
  main.append(el('p', 'trouble-intro', '当てはまる症状を開いてご確認ください。'));
  if (String(guide.propertyNo) === '11300') {
    const safety = el('p', 'trouble-safety', '焦げたにおいや煙、水漏れがある場合は運転を止め、無理に使わないでください。火災の場合は安全な場所へ避難し、119番へ通報してください。');
    appendEmergencyJump(main, safety, el, '設備の急ぎの連絡先を確認する ↓');
    main.append(safety);
  } else main.append(el('p', 'trouble-safety', '焦げたにおいや煙、水漏れがある場合は運転を止め、無理に使わず、くらさぽコネクトの案内からご相談ください。'));
  mountChecks(main, guide, helpers, [
    ['運転しない', ['リモコンの表示と電池、運転モードを確認してください。', 'ブレーカーが切れていないか確認してください。繰り返し切れる場合は、無理に入れ直さずご相談ください。']],
    ['冷えない・暖まらない', ['冷房・暖房の運転モードと設定温度を確認してください。', 'フィルターや室内機・室外機の吹き出し口がふさがれていないか確認してください。']],
    ['異音・水漏れ・エラー表示', ['いつからどのような症状が出ているか確認してください。', 'エラー番号が表示されている場合は、番号を控えてください。水漏れがある場合は運転を止めてください。']],
    ['この物件のエアコン設備', []]
  ], ['air_conditioner'], 'この物件のエアコン設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。', true);
  mountContact(main, guide, helpers, '症状と確認した内容、エラー番号を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。');
}

export const otherTroubleGuides = {
  'water-leak': {
    note: '水が広がっている場合は、水の使用を止めてください。濡れている電気設備には触れず、早めにご相談ください。',
    checks: [
      ['漏れている場所', ['蛇口、排水口、配管、天井など、どこから水が出ているか確認してください。', '水が出ている場所の写真を撮れる場合は、記録してください。']],
      ['水の広がり', ['床や壁に水が広がっているか確認してください。', '下の階などにも影響しそうな場合は、早めにご相談ください。']],
      ['使用できる設備', ['漏れている場所の水の使用を控えてください。', '止水栓の場所や操作が分からない場合は、無理に操作せずご相談ください。']],
      ['この物件の水まわりの案内', []]
    ],
    sections: ['drainage', 'water', 'toilet'],
    missing: 'この物件の水まわりに関する追加の案内は、現在掲載されていません。',
    contact: '漏れている場所と水の広がり、確認した内容を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。'
  },
  'lost-key': {
    note: '鍵をなくした場合は、無理にドアを開けようとせず、契約時に案内された連絡先もご確認ください。',
    checks: [
      ['鍵の所在', ['最後に鍵を使用した場所や、持ち物の中を確認してください。', '予備の鍵がある場合は、利用できるか確認してください。']],
      ['室内に入れない場合', ['契約時に案内された連絡先をご確認ください。対応時間や解錠の費用は、連絡先に確認してください。']],
      ['入室できるが鍵を紛失した場合', ['紛失した鍵の種類と状況を控えて、管理会社へご相談ください。', '盗難の可能性がある場合は、その状況もお伝えください。']],
      ['この物件の鍵の案内', []]
    ],
    sections: ['key'],
    missing: 'この物件の鍵に関する追加の案内は、現在掲載されていません。',
    contact: '鍵をなくした状況を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。'
  },
  'internet-trouble': {
    note: '通信機器や配線を無理に分解せず、契約内容と機器の案内に沿って確認してください。',
    checks: [
      ['接続できない', ['端末のWi-Fi設定と、接続先のネットワーク名を確認してください。', 'ルーターなどの通信機器のランプ表示を確認してください。']],
      ['接続できても利用できない', ['ほかの端末でも同じ症状か確認してください。', 'いつから利用できないか、表示されるエラーがあれば控えてください。']],
      ['利用開始・契約', ['利用開始の手続きや契約が必要な場合があります。物件の案内を確認してください。']],
      ['この物件のインターネット案内', []]
    ],
    sections: ['internet'],
    missing: 'この物件のインターネットに関する追加の案内は、現在掲載されていません。',
    contact: '接続状況と確認した内容を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。'
  },
  'noise-trouble': {
    note: '相手の住戸を直接訪ねるなど、対立につながる行動は避けてください。',
    checks: [
      ['発生した日時', ['音が聞こえた日時と、続いた時間を控えてください。']],
      ['音の状況', ['どのような音か、どの場所で聞こえるかを確認してください。', '音の発生元を推測だけで決めつけないようにしてください。']],
      ['この物件の生活ルール', []]
    ],
    sections: ['noise'],
    missing: 'この物件の騒音や生活ルールに関する追加の案内は、現在掲載されていません。',
    contact: '日時と音の状況を控えて、くらさぽコネクトの案内から相談方法をご確認ください。'
  },
  'other-trouble': {
    note: '事故やけがなど緊急の場合は、安全を確保し、状況に応じた緊急窓口へご連絡ください。',
    checks: [
      ['困っている内容', ['設備、共用部分、手続きなど、何について困っているか整理してください。']],
      ['発生場所・時期', ['いつ、どこで起きたかを控えてください。', '写真やエラー表示がある場合は、記録してください。']],
      ['この物件の管理会社からの案内', []]
    ],
    sections: ['management_other'],
    missing: 'この物件の管理会社からの追加の案内は、現在掲載されていません。',
    contact: '困っている内容と確認した状況を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。'
  }
};

export function mountOtherTrouble(main, guide, helpers, route) {
  const { element: el } = helpers;
  const baseInfo = otherTroubleGuides[route];
  const info = route === 'lost-key' && String(guide.propertyNo) === '11300'
    ? { ...baseInfo, checks: [
        ['部屋に入れない', baseInfo.checks[1][1]],
        ['部屋には入れるが、鍵をなくした', baseInfo.checks[2][1]],
        ['鍵を探すときに確認すること', baseInfo.checks[0][1]],
        baseInfo.checks[3]
      ] }
    : route === 'other-trouble' && String(guide.propertyNo) === '11300'
    ? { ...baseInfo,
        checks: [...baseInfo.checks.slice(0, -1), ['この物件の設備・連絡方法の案内', []]],
        sections: ['room_equipment', 'kurasapo_connect'],
        missing: '設備や連絡方法に関する追加の案内は、現在掲載されていません。' }
    : route === 'water-leak' && String(guide.propertyNo) === '11300'
      ? { ...baseInfo, sections: ['drainage', 'toilet'] }
      : route === 'internet-trouble' && String(guide.propertyNo) === '11300'
        ? { ...baseInfo, checks: [
            ['有線で接続する場合', ['LANケーブルがお部屋の情報コンセントと接続機器に接続されているか確認してください。']],
            ['Wi-Fiで接続する場合', ['この物件にはWi-Fiルーターが設置されていません。ご自身で用意したルーターの接続とランプ表示を確認してください。', 'ルーターのAP／BRなどの動作モードは、機器の取扱説明書とこの物件のインターネット案内に沿って確認してください。', '端末のWi-Fi設定と、ご自身のルーターのネットワーク名を確認してください。']],
            ['接続できても利用できない', ['ほかの端末でも同じ症状か確認してください。', 'いつから利用できないか、表示されるエラーがあれば控えてください。']],
            ['この物件の無料インターネット（0net）案内', []]
          ] }
      : baseInfo;
  if (!info) return;
  main.append(el('p', 'trouble-intro', 'まず以下の内容をご確認ください。'));
  const safety = el('p', 'trouble-safety', info.note);
  if (route === 'water-leak' && String(guide.propertyNo) === '11300') appendEmergencyJump(main, safety, el);
  main.append(safety);
  mountChecks(main, guide, helpers, info.checks, info.sections, info.missing, route === 'lost-key' && String(guide.propertyNo) === '11300');
  const providerContact = route === 'internet-trouble' && String(guide.propertyNo) === '11300'
    ? guide.sections.internet?.blocks?.find(block => block.type === 'button' && block.actionUrl?.startsWith('tel:'))
    : undefined;
  mountContact(main, guide, helpers, providerContact
    ? '接続状況と確認した内容を控えて、物件のインターネット案内に記載されたサービス提供会社へお問い合わせください。'
    : info.contact, providerContact);
}
