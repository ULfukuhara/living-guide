import { gasEmergencyContact, GAS_EMERGENCY_SOURCE } from './gas-emergency.js?v=20261015-customer-regions-1';
import { guideHref } from '/assets/site-links.js';

// Presentation only: consume the guide already selected by loadGuide.
// No Firebase imports, extra reads, or writes are needed for these screens.
export const troubleItems = [
  { route: 'gas-smell', title: 'ガスのにおいがする', description: 'ガスもれ時の対応・緊急窓口', icon: 'heater', color: 'orange' },
  { route: 'electricity-trouble', title: '停電・電気が使えない', description: '停電時・ブレーカーの案内を確認', icon: 'electricity', color: 'orange' },
  { route: 'no-hot-water', title: 'お湯が出ない', description: '給湯器やガスを確認', icon: 'heater', color: 'orange' },
  { route: 'gas-trouble', title: 'コンロが点かない', description: 'ガスコンロの点火・電池を確認', icon: 'heater', color: 'orange' },
  { route: 'water-leak', title: '水漏れ', description: '漏れている場所と状況を確認', icon: 'water' },
  { route: 'toilet-trouble', title: 'トイレのトラブル', description: '症状ごとの確認事項を見る', icon: 'toilet' },
  { route: 'air-conditioner-trouble', title: 'エアコンが効かない', description: '設定や運転状況を確認', icon: 'air' },
  { route: 'lost-key', title: '鍵をなくした', description: '鍵の所在と連絡方法を確認', icon: 'key', color: 'purple' },
  { route: 'internet-trouble', title: 'インターネットにつながらない', description: '接続・利用方法を確認', icon: 'wifi' },
  { route: 'noise-trouble', title: '騒音', description: '状況と生活ルールを確認', icon: 'sound', color: 'green' },
  { route: 'other-trouble', title: 'その他のお困りごと', description: '状況と管理会社の案内を確認', icon: 'faq', color: 'purple' }
];

export function troubleItemAvailable(item, guide) {
  if (item.route === 'gas-trouble' && guide.policy?.cookingSource !== 'gas') return false;
  if (['gas-smell','gas-trouble'].includes(item.route) && !guide.sections.gas) return false;
  if (item.route === 'electricity-trouble' && !guide.sections.electricity) return false;
  return !item.route.startsWith('section/') || !!guide.sections[item.route.slice(8)];
}

export function mountTrouble(main, guide, { element: el, link, icon }) {
  main.append(el('p', 'trouble-intro', 'どのようなことでお困りですか？'));
  const list = el('nav', 'trouble-list');
  list.setAttribute('aria-label', 'お困りごとの種類');
  for (const item of troubleItems) {
    if (!troubleItemAvailable(item, guide)) continue;
    if (item.route === 'electricity-trouble' && !guide.sections.electricity) continue;
    if (item.route.startsWith('section/') && !guide.sections[item.route.slice(8)]) continue;
    const destination = item.route;
    const row = link('', '#' + destination, 'trouble-item');
    const symbol = el('span', 'icon ' + (item.color || ''));
    symbol.innerHTML = icon(item.icon);
    const copy = el('span', 'trouble-item-copy');
    const description = item.route === 'no-hot-water'
      ? ({ electric: '電気温水器の状態を確認', central: 'セントラル給湯の状況を確認' }[guide.policy?.hotWaterSource] || item.description)
      : item.description;
    copy.append(el('strong', '', item.title), el('small', '', description));
    const arrow = el('span', 'trouble-arrow', '›');
    arrow.setAttribute('aria-hidden', 'true');
    row.append(symbol, copy, arrow);
    list.append(row);
  }
  main.append(list);
}

function mountEmergencyContact(main, guide, { element: el, link }) {
  if (!guide.policy?.emergencyPhone) return;
  const conditions = {
    'water-leak': ['水が止まらない・漏れが広がっている場合', '水を止められない、床や下の階へ漏れが広がっている場合は、お電話でご相談ください。'],
    'toilet-trouble': ['水があふれる・トイレが使えない場合', '水があふれる、止まらない、詰まってトイレが使えない場合は、お電話でご相談ください。'],
    'lost-key': ['鍵をなくして部屋に入れない場合', '鍵をなくして入室できず、開錠などの対応が必要な場合は、お電話でご相談ください。']
  };
  const condition = conditions[location.hash.slice(1)];
  if (!condition) return;
  const entry = el('section', 'panel trouble-urgent-contact');
  entry.append(el('h2', '', condition[0]));
  const panel = el('aside', 'trouble-emergency');
  panel.tabIndex = -1;
  panel.setAttribute('aria-label', '急ぎの対応が必要な場合の連絡先');
  panel.append(el('p', '', condition[1]));
  panel.append(link(guide.policy.emergencyPhone + 'に電話する', 'tel:' + guide.policy.emergencyPhone.replace(/-/g,''), 'button'));
  const hours = el('dl', 'trouble-contact-hours');
  for (const [time, destination] of guide.policy.emergencyHours) {
    const desk = el('dd');
    desk.append(el('span', 'trouble-contact-desk', destination.replace(/が受付$/, '')), el('span', 'trouble-contact-reception', 'が受付'));
    hours.append(el('dt', '', time), desk);
  }
  if (guide.sections.usac && guide.policy?.emergencyProvider === 'jbr') {
    const membership = el('p', '', 'USAC会員の方はJBRに対応を依頼できます。');
    membership.append(' ', link('USACの利用条件を見る', '#section/usac'));
    panel.append(hours, membership);
  } else panel.append(hours);
  entry.append(panel); main.append(entry);
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

const TROUBLE_INTRO = '当てはまる症状や状況を開いてご確認ください。';
function mountTroubleIntro(main, guide, helpers) {
  main.append(helpers.element('p', 'trouble-intro', location.hash === '#noise-trouble' ? '日時や音の状況を確認し、管理会社へご相談ください。' : TROUBLE_INTRO));
  mountEmergencyContact(main, guide, helpers);
}

function mountChecks(main, guide, { element: el, link }, checks, sectionKeys, missingMessage) {
  const steps = el('div', 'trouble-steps trouble-symptoms');
  const labels = {
    key: '鍵の管理・合鍵・返却の案内を見る',
    gas: 'ガスの契約・給湯設備の案内を見る',
    toilet: 'トイレの使い方・お手入れを見る',
    air_conditioner: 'エアコンの使い方・お手入れを見る',
    drainage: '排水・水まわりの案内を見る',
    water: 'この物件の水道案内を見る',
    noise: '音に関する生活ルールを見る',
    room_equipment: 'この物件の設備の案内を見る',
    electricity: '給湯・電気契約の案内を見る',
    kurasapo_connect: '管理会社への連絡方法を見る'
  };
  for (const [title, messages] of checks) {
    const safetyAdvice = location.hash === '#other-trouble' && title === '事故・けがなどがある場合';
    const expandable = messages.length > 0 && !safetyAdvice && location.hash !== '#noise-trouble';
    const step = el(expandable ? 'details' : 'section', 'panel trouble-step' + (safetyAdvice ? ' trouble-safety-note' : ''));
    step.append(el(expandable ? 'summary' : 'h2', '', title));
    if (messages.length) {
      const list = el('ul');
      for (const message of messages) list.append(el('li', '', message));
      step.append(list);
    } else {
      const keys = sectionKeys.filter(key => guide.sections[key]);
      if (keys.length) {
        for (const key of keys) step.append(link(labels[key] || (guide.sections[key].label + 'の詳しい案内を見る'), '#section/' + key, 'trouble-guide-link'));
      } else if (missingMessage) step.append(el('p', 'muted', missingMessage));
    }
    steps.append(step);
  }
  main.append(steps);
}

function mountContact(main, guide, { element: el, link }, message, action) {
  const route = location.hash.slice(1);
  const heading = '解決しない場合の問い合わせ';
  const urgent = Boolean(guide.policy?.emergencyPhone) && ['water-leak', 'toilet-trouble', 'lost-key'].includes(route);
  const help = el(urgent ? 'details' : 'section', 'panel trouble-help' + (urgent ? ' trouble-routine-contact' : ''));
  const conciseMessage = guide.policy?.kurasapoEnabled === false && !action ? '確認した症状や日時、写真などを控え、契約時に案内された管理会社の連絡先へご相談ください。' : action ? message : message.replace(/、?くらさぽコネクトの案内から(?:お問い合わせ方法|相談方法)をご確認ください。$/, 'ご相談ください。');
  help.append(el(urgent ? 'summary' : 'h2', '', urgent ? '急ぎでない相談・写真を送る場合' : heading), el('p', '', conciseMessage));
  if (!action && guide.policy?.kurasapoEnabled !== false) {
    help.append(el('p', '', '通常のお問い合わせは、くらさぽコネクトの「お問い合わせ」から、発生場所・日時・症状をお送りください。入居時の傷・汚れの登録とは窓口が異なります。'));
  }
  const requestGuide = guideHref('/kurasapo/') + '#request';
  help.append(link(action?.actionLabel || (guide.policy?.kurasapoEnabled === false ? '管理会社の案内を確認する' : 'くらさぽで相談する方法を見る'), action?.actionUrl || (guide.policy?.kurasapoEnabled === false ? (guide.sections.management_other ? '#section/management_other' : '#procedures') : requestGuide), 'button'));
  main.append(help);

}

export function mountNoHotWater(main, guide, helpers) {
  const {element:el}=helpers,policy=guide.policy||{};
  const gasHeating=policy.hotWaterSource==='gas';
  const ihGas=policy.cookingSource==='ih'&&policy.hotWaterSource==='gas';
  mountTroubleIntro(main, guide, helpers);

  if (policy.hotWaterSource === 'central') {
    main.append(el('p', 'trouble-equipment-note', '本物件は建物のセントラル給湯を利用しています。給湯の不具合は管理会社へご連絡ください。'));
    mountChecks(main, guide, helpers, [
      ['水も出ないか、お湯だけ出ないか', ['水とお湯のどちらが出ないか、ほかの蛇口でも同じ状態かを確認してください。']],
      ['いつから・どの場所で使えないか', ['発生した日時と、キッチン・浴室など使えない場所を控えてください。表示部がある場合は、エラー表示も控えてください。']],
      ['水漏れ・異臭などがある場合', ['使用を控え、管理会社へご連絡ください。共用の給湯設備や配管は、ご自身で操作しないでください。']],
      ['この物件の給湯・料金の案内', []]
    ], ['water'], '');
    mountContact(main, guide, helpers, 'お湯が出なくなった日時、場所、確認した内容を添えて管理会社へご連絡ください。');
    return;
  }

  if (policy.hotWaterSource === 'electric') {
    main.append(el('p', 'trouble-equipment-note', '本物件はオール電化で、給湯には電気温水器を使用しています。'));
    mountChecks(main, guide, helpers, [
      ['お湯を使い切っていないか', ['タンク内のお湯を使い切ると、お湯が出なくなることがあります。再び沸き上がるまで時間がかかります。', '沸き増し機能がある場合は、操作部の案内をご確認ください。機種や電気の契約によって、利用できる機能は異なります。']],
      ['入居直後・停電の後ではないか', ['電気の使用開始手続きが済んでいるか確認してください。', '温水器用と表示されたブレーカーが切れていないか確認してください。繰り返し落ちる場合は、入れ直しを繰り返さず管理会社へご相談ください。', '電源を入れた直後は、すぐにお湯が使えない場合があります。']],
      ['操作部・エラー表示を確認', ['リモコンや操作部がある場合は、表示と設定を確認してください。エラー番号があれば、番号を控えてください。']],
      ['水漏れ・異臭・煙がある場合', ['使用を控え、管理会社へご相談ください。']],
      ['この物件の給湯・電気契約の案内', []]
    ], ['electricity'], '');
    mountContact(main, guide, helpers, 'いつからお湯が出ないか、確認した内容とエラー表示を控えて、管理会社へご相談ください。');
    return;
  }

  if(gasHeating){const safety=el('p','trouble-safety','ガスのにおいがする場合は、点火や復帰操作をしないでください。');safety.append(helpers.link('ガスもれの案内を見る', '#gas-smell', 'trouble-guide-link'));main.append(safety);}
  if(ihGas)main.append(el('p','trouble-equipment-note','この物件はIHコンロですが、給湯にはガスを使用しています。'));
  const errorNotes=splitGasGuide(gasHeating ? guide.sections.gas : undefined).error.blocks.filter(block=>block.type==='text').flatMap(block=>block.content.split(/\r?\n/)).filter(line=>line && !/給湯器のリモコンにエラー表示/.test(line));
  mountChecks(main,guide,helpers,[
    [errorNotes.length?'給湯器リモコン・エラー表示':'給湯器リモコン',['電源が入っているか確認してください。',...errorNotes,'エラー番号が表示されている場合は、番号を控えてください。']],
    ...(gasHeating&&policy.cookingSource==='gas'?[['ガスコンロ',['ガスのにおいがしないことを確認してから、ガスコンロが点火するか確認してください。']]]:[]),
    ...(gasHeating?[['ガスメーター',['ガスのにおいがする場合は、復帰操作をせず、ガス会社の緊急窓口へご連絡ください。','安全装置が作動していないか、表示を確認してください。','復帰操作は、ご契約のガス会社の案内に従ってください。']]]:[]),
    ...(!gasHeating?[['異臭・煙・水漏れがある場合',['使用を控え、管理会社へご相談ください。']]]:[]),
    ['その他・この物件の給湯設備',[]]
  ],gasHeating?['gas']:['room_equipment'],'この物件の給湯設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。');
  mountContact(main,guide,helpers,'確認した内容と、表示されているエラー番号を控えて、管理会社へご相談ください。');
}

export function mountToiletTrouble(main, guide, helpers) {
  const { element: el } = helpers;
  mountTroubleIntro(main, guide, helpers);

  mountChecks(main, guide, helpers, [
    ['水が流れない・詰まっている', ['続けて水を流すとあふれるおそれがあります。繰り返し流さず、便器内の水位を確認してください。', '異物を落とした場合は、何を落としたか控えてください。']],
    ['水が止まらない・漏れている', ['水があふれている、または床に漏れている場合は、使用を中止してください。','どこから水が出ているか、床への漏れがあるか確認してください。', '止水栓の場所や操作が分からない場合は、無理に操作せずご相談ください。']],
    ...(guide.policy?.washletProvided === true ? [['洗浄・便座が動かない', ['電源プラグや本体の操作部を確認してください。リモコンがある場合は、電池や表示も確認してください。', 'エラー表示がある場合は、その内容を控えてください。']]] : []),
    ['この物件のトイレ設備', []]
  ], ['toilet'], 'この物件のトイレ設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。', true);
  mountContact(main, guide, helpers, '症状と確認した内容を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。');
}

export function mountAirConditionerTrouble(main, guide, helpers) {
  const { element: el } = helpers;
  mountTroubleIntro(main, guide, helpers);
  mountChecks(main, guide, helpers, [
    ['運転しない', ['リモコンの表示と電池、運転モードを確認してください。', 'ブレーカーが切れていないか確認してください。繰り返し切れる場合は、無理に入れ直さずご相談ください。']],
    ['冷えない・暖まらない', ['冷房・暖房の運転モードと設定温度を確認してください。', 'フィルターや室内機・室外機の吹き出し口がふさがれていないか確認してください。']],
    ['異音・水漏れ・エラー表示', ['いつからどのような症状が出ているか確認してください。', 'エラー番号が表示されている場合は、番号を控えてください。水漏れがある場合は運転を止めてください。']],
    ['焦げたにおい・煙がある', ['運転を止め、使用を控えて管理会社へご相談ください。火災の場合は安全な場所へ避難し、119番へ通報してください。']],
    ['この物件のエアコン設備', []]
  ], ['air_conditioner'], 'この物件のエアコン設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。', true);
  mountContact(main, guide, helpers, '症状と確認した内容、エラー番号を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。');
}

export const otherTroubleGuides = {
  'water-leak': {
    note: '',
    checks: [
      ['漏れている場所', ['漏れている場所の水の使用を控えてください。','蛇口、排水口、配管、天井など、どこから水が出ているか確認してください。', '水が出ている場所の写真を撮れる場合は、記録してください。']],
      ['水の広がり', ['濡れている電気設備には触れないでください。','床や壁に水が広がっているか確認してください。', '下の階などにも影響しそうな場合は、早めにご相談ください。']],
      ['水漏れを止めたい場合（止水栓）', ['漏れている場所の水の使用を控えてください。', '止水栓は、お部屋への水を止めるバルブです。玄関横などのPS（配管やメーターを収めたスペース）内の、水道メーター付近にある場合があります。場所は物件によって異なります。', '自分のお部屋の止水栓と閉め方が分かる場合は、閉めて水を止めてください。ほかのお部屋のバルブやガスの元栓は操作しないでください。', '場所が分からない、扉が開かない、バルブが固い場合は無理に操作せず、管理会社へご連絡ください。']],
      ['この物件の水まわりの案内', []]
    ],
    sections: ['drainage', 'water', 'toilet'],
    missing: 'この物件の水まわりに関する追加の案内は、現在掲載されていません。',
    contact: '漏れている場所と水の広がり、確認した内容を控えて、くらさぽコネクトの案内からお問い合わせ方法をご確認ください。'
  },
  'lost-key': {
    note: '',
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
    note: '',
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
    note: '',
    checks: [
      ['発生した日時', ['音が聞こえた日時と、続いた時間を控えてください。']],
      ['音の状況', ['どのような音か、どの場所で聞こえるかを確認してください。', '音の発生元を推測だけで決めつけないようにしてください。']],
      ['相談するときの注意', ['相手の住戸へ直接訪ねず、日時と音の状況を管理会社へお知らせください。']],
      ['この物件の生活ルール', []]
    ],
    sections: ['noise'],
    missing: 'この物件の騒音や生活ルールに関する追加の案内は、現在掲載されていません。',
    contact: '日時と音の状況を控えて、くらさぽコネクトの案内から相談方法をご確認ください。'
  },
  'other-trouble': {
    note: '',
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

function mountInternetTrouble(main, guide, { element: el, link }) {
  const policy = guide.policy || {};
  const section = guide.sections.internet;
  const zeroNet = policy.internetProvider === 'zero_net';
  const baycom = policy.internetProvider === 'baycom';
  const ebroad = policy.internetProvider === 'ebroad' || /イーブロード|https:\/\/u\.e-broad\.jp\/spt\//.test(section?.body || '');
  const jcom = !zeroNet && !baycom && !ebroad && /J[:：]?COM\b|https:\/\/(?:www\.)?jcom\.co\.jp(?:\/|$)/i.test(section?.body || '');
  const ucom = !zeroNet && !baycom && !ebroad && !jcom && /UCOM光|https:\/\/(?:www\.)?ucom-r\.ne\.jp\//i.test(section?.body || '');
  const scopedProvider = /^v4_suita_/.test(section?.variant || '') && /B-CUBIC|Best Bit Net|Fiber net|eo光|フレッツ光|BUFFALO|バッファロー/i.test(section?.body || '');
  const sharedProvider = zeroNet || baycom || ebroad || jcom || ucom || scopedProvider;
  const providerWeb = scopedProvider ? section?.blocks?.find(block => block.type === 'button' && /^https?:/.test(block.actionUrl || '')) : (jcom || ucom) ? section?.blocks?.find(block => (jcom
    ? /^https:\/\/(?:www\.)?jcom\.co\.jp\/contactus\//i
    : /^https:\/\/(?:www\.)?ucom-r\.ne\.jp\/search\.html(?:[?#]|$)/i).test(block.actionUrl || '')) : undefined;
  main.append(el('p', 'trouble-intro', TROUBLE_INTRO));
  const noRouter = policy.wifiRouterProvided === false;
  const providerContact = sharedProvider ? section?.blocks?.find(block => block.type === 'button' && /^tel:[+\d\s()-]+$/.test(block.actionUrl || '')) : undefined;
  const property = el('section', 'panel trouble-internet-property');
  property.append(el('h2', '', 'この物件のインターネット'));
  property.append(el('p', '', zeroNet ? '無料インターネット（0net）をご利用いただけます。' : baycom ? 'ベイコムの無料インターネットをご利用いただけます。利用開始や機器の案内はベイコムへご確認ください。' : ebroad ? 'イーブロードの無料インターネットをご利用いただけます。接続の不具合はイーブロードへお問い合わせください。' : jcom ? 'J:COMのインターネットをご利用いただけます。接続の不具合は、J:COMへお問い合わせください。' : ucom ? 'UCOM光レジデンスをご利用いただけます。接続方法やサポート窓口は、建物専用ページをご確認ください。' : scopedProvider ? 'この物件に導入されているインターネットをご利用いただけます。接続の不具合は、案内に記載された提供会社へお問い合わせください。' : '利用方法や契約先は、この物件のインターネット案内をご確認ください。ご自身で契約している場合は、契約先が問い合わせ窓口です。'));
  if (noRouter) property.append(el('p', '', 'Wi-Fiルーターは備え付けではありません。Wi-Fiを使う場合は、ご自身で用意したルーターをご確認ください。'));
  if (section) property.append(link('利用方法・設備の案内を見る →', '#section/internet', 'trouble-guide-link'));
  main.append(property);
  const steps = el('div', 'trouble-steps trouble-symptoms');
  const checks = [
    ['電源・ケーブルを確認', ['ルーターなどの電源が入っているか、ランプが消えていないか確認してください。ランプの色や点滅は機種によって意味が異なります。', zeroNet ? '壁のLANケーブル差し込み口と、ルーター・パソコンの間のLANケーブルに抜けやゆるみがないか確認してください。' : 'お部屋の接続口と通信機器の間のケーブルに、抜けやゆるみがないか確認してください。光ケーブルは抜かず、折り曲げないでください。']],
    ['機器を再起動する', [zeroNet && noRouter ? 'ご自身のルーターの電源を切り、機器の案内に従って入れ直してください。ランプが落ち着くまでお待ちください。' : '機器・契約先の案内に従って電源を入れ直してください。ONU（光回線の機器）やモデムがある場合は、その機器が起動してからルーターの電源を入れてください。', 'リセットボタン（初期化）は押さないでください。接続設定が消えてしまいます。', '停電から復旧した後も、再起動で改善する場合があります。']],
    ['他の端末でも確認', ['スマホ・パソコンなど、他の端末でもつながらないか確認してください。', '1台だけの場合は、その端末の機内モードを解除し、Wi-Fiのオン・オフや端末の再起動を試してください。']]
  ];
  for (const [title, messages] of checks) {
    const details = el('details', 'panel trouble-step');
    details.append(el('summary', '', title));
    const list = el('ul');
    for (const message of messages) list.append(el('li', '', message));
    details.append(list);steps.append(details);
  }
  main.append(steps);
  const more = el('details', 'panel trouble-step');
  more.append(el('summary', '', 'まだつながらない場合'));
  const further = el('ul');
  for (const message of ['Wi-Fiの名前（SSID）とパスワードが、ご自身の機器や契約先から案内されたものと一致するか確認してください。', ...(zeroNet && noRouter ? ['ルーターの動作モード（AP／BRなど）は、この物件のインターネット案内と機器の説明に従って確認してください。'] : []), ...(!sharedProvider ? ['ご自身で契約している場合は、利用開始の手続きや料金の支払い・契約状況をご確認ください。'] : []), '回線事業者・プロバイダの公式サイトで、障害や工事の情報をご確認ください。']) further.append(el('li', '', message));
  more.append(further);steps.append(more);
  const help = el('section', 'panel trouble-help');
  help.append(el('h2', '', '解決しない場合の問い合わせ'));
  help.append(el('p', '', zeroNet ? '0netのサポート窓口へ、接続状況と試した内容をお知らせください。' : baycom ? 'ベイコムのサポート窓口へ、接続状況と試した内容をお知らせください。' : ebroad ? 'イーブロードのサポート窓口へ、接続状況と試した内容をお知らせください。' : jcom ? 'J:COMのサポート窓口へ、接続状況と試した内容をお知らせください。' : ucom ? 'UCOM光レジデンスの建物専用ページから、接続方法やお問い合わせ先をご確認ください。' : scopedProvider ? 'この物件のインターネット案内に記載されたサービス提供会社へ、接続状況と試した内容をお知らせください。' : 'ご自身で契約している回線事業者・プロバイダへお問い合わせください。契約先が分からない場合や、建物側の設備については管理会社へご相談ください。'));
  if (providerContact) {
    const phone = providerContact.actionUrl.replace(/^tel:/, '');
    const label = phone === '08001003311' ? '0800-100-3311に電話する' : phone === '0120401173' ? '0120-40-1173に電話する' : providerContact.actionLabel;
    help.append(link(label, providerContact.actionUrl, 'button'));
  }
  else if (providerWeb) help.append(link(scopedProvider ? 'サービス提供会社の案内を確認する' : jcom ? 'J:COMの問い合わせ先を確認する' : 'UCOM光レジデンスの建物専用ページを確認する', providerWeb.actionUrl, 'button'));
  else if (ebroad) help.append(link('イーブロードのサポートを確認する', 'https://u.e-broad.jp/spt/', 'button'));
  else if (zeroNet && section) help.append(link('0netの問い合わせ先を確認する →', '#section/internet', 'button'));
  const report = el('details', 'trouble-property-guide');
  report.append(el('summary', '', '問い合わせ時に伝えること'));
  const reportList = el('ul');
  for (const message of ['物件名・部屋番号', 'いつから、どの端末でつながらないか', '機器のランプの色・点滅', '再起動など、試した内容', '有線でつながるか（確認できる場合）']) reportList.append(el('li', '', message));
  report.append(reportList);help.append(report);
  if (!sharedProvider || (!providerContact && !(ucom && providerWeb))) help.append(link(policy.kurasapoEnabled === false ? '管理会社の案内を確認する' : '管理会社に相談する方法を見る', policy.kurasapoEnabled === false ? (guide.sections.management_other ? '#section/management_other' : '#procedures') : guideHref('/kurasapo/') + '#request', 'trouble-guide-link'));
  main.append(help);
}

export function mountOtherTrouble(main, guide, helpers, route) {
  if (route === 'internet-trouble') { mountInternetTrouble(main, guide, helpers); return; }
  const { element: el } = helpers;
  const baseInfo = otherTroubleGuides[route];
  const confirmedLostKeyPolicy = guide.policy?.lostKeyPolicy === 'usac_paid_loan_week';
  let info = route === 'lost-key' && confirmedLostKeyPolicy
    ? { ...baseInfo, checks: [
        ['部屋に入れない場合の開錠サービス', ['USAC会員の方は、開錠サービスをご利用いただけます。' + (guide.policy?.emergencyPhone ? '下の急ぎの連絡先からご相談ください。' : '契約時に案内されたUSACの連絡先へご相談ください。'), '非会員の方も、有償で対応可能です。依頼時に費用や対応条件をご確認ください。']],
        ['営業時間内に管理会社で鍵を借りる', ['管理会社の営業時間内にお越しいただければ、顔写真付きの身分証をご提示いただき、本人確認後に鍵をお貸しできます。来社前に受付時間と対応可否をご確認ください。']],
        ['借りた鍵は1週間以内に返却する', ['貸出日から1週間以内に、管理会社へ鍵をご返却ください。', '返却がない場合は追加発行として扱い、費用をご請求します。']],
        ['紛失後はシリンダー交換をおすすめします', ['防犯上、鍵を紛失した場合はシリンダー（鍵穴部分）の交換をおすすめしています。交換の手配や費用は、管理会社へご相談ください。']],
        ['退去時はお渡しした本数分を返却する', ['退去時は、お渡しした鍵の本数分をご返却ください。スペアキーや、ご自身で複製した合鍵もすべて返却が必要です。']],
      ] }
    : route === 'lost-key' && guide.policy?.keyLoanAvailable
    ? { ...baseInfo, checks: [
        ['部屋に入れない', [...(guide.sections.usac && guide.policy?.emergencyProvider === 'jbr' && guide.policy?.emergencyPhone ? ['USAC会員の方は、JBRに対応を依頼できます。下の急ぎの連絡先からご相談ください。'] : []), '管理会社へお越しいただければ、顔写真付きの身分証をご提示いただき、本人確認後に鍵をお貸しできます。来社前に受付時間と対応可否をご確認ください。']],
        ['部屋には入れるが、鍵をなくした', baseInfo.checks[2][1]],
        ['鍵を探すときに確認すること', baseInfo.checks[0][1]],
        baseInfo.checks[3]
      ] }
    : route === 'other-trouble'
    ? { ...baseInfo,
        checks: [...baseInfo.checks.slice(0, -1), ['事故・けがなどがある場合', ['安全を確保し、状況に応じた緊急窓口へご連絡ください。通常のお問い合わせの返答を待たないでください。']]],
        sections: ['room_equipment', 'kurasapo_connect'],
        missing: '設備や連絡方法に関する追加の案内は、現在掲載されていません。' }
    : route === 'water-leak' && guide.policy?.waterBilling === 'water_utility'
      ? { ...baseInfo, sections: ['drainage', 'toilet'] }
      : route === 'internet-trouble' && guide.policy?.internetProvider === 'zero_net' && guide.policy?.wifiRouterProvided === false
        ? { ...baseInfo, checks: [
            ['有線で接続する場合', ['LANケーブルが、壁のLANケーブル差し込み口とルーター・パソコンなどにつながっているか確認してください。']],
            ['Wi-Fiで接続する場合', ['この物件にはWi-Fiルーターが設置されていません。ご自身で用意したルーターの接続とランプ表示を確認してください。', 'ルーターのAP／BRなどの動作モードは、機器の取扱説明書とこの物件のインターネット案内に沿って確認してください。', '端末のWi-Fi設定と、ご自身のルーターのネットワーク名を確認してください。']],
            ['接続できても利用できない', ['ほかの端末でも同じ症状か確認してください。', 'いつから利用できないか、表示されるエラーがあれば控えてください。']],
            ['この物件の無料インターネット（0net）案内', []]
          ] }
      : baseInfo;
  if (!info) return;
  if (route === 'internet-trouble' && guide.policy?.internetProvider === 'other') info = { ...info, contact: '接続状況と確認した内容を控えて、ご契約の回線事業者へお問い合わせください。回線工事や建物側の設備については、管理会社へご相談ください。' };
  mountTroubleIntro(main, guide, helpers);
  if (info.note) {
    const safety = el('p', 'trouble-safety', info.note);
    if (route === 'water-leak' && guide.policy?.emergencyPhone) appendEmergencyJump(main, safety, el);
    main.append(safety);
  }
  mountChecks(main, guide, helpers, info.checks, info.sections, info.missing, route === 'lost-key' && guide.policy?.keyLoanAvailable);
  if (route === 'lost-key' && !confirmedLostKeyPolicy && guide.policy?.keyLoanAvailable && helpers.renderBody) {
    const lost = splitKeyGuide(guide.sections.key).trouble;
    if (lost.blocks.length) {
      const details = el('details', 'trouble-property-guide');
      details.append(el('summary', '', '紛失した鍵の交換・費用について'), helpers.renderBody({ ...lost, blocks: lost.blocks.filter(b => b.type !== 'heading') }, '紛失した鍵の交換', { hideContactAction: true }));
      main.append(details);
    }
  }
  const providerContact = route === 'internet-trouble' && guide.policy?.internetProvider === 'zero_net' && guide.policy?.wifiRouterProvided === false
    ? guide.sections.internet?.blocks?.find(block => block.type === 'button' && block.actionUrl?.startsWith('tel:'))
    : undefined;
  mountContact(main, guide, helpers, providerContact
    ? '接続状況と確認した内容を控えて、物件のインターネット案内に記載されたサービス提供会社へお問い合わせください。'
    : info.contact, providerContact);
}

export function mountElectricityTrouble(main, guide, helpers) {
  const { element: el, link, renderBody } = helpers;
  const section = guide.sections.electricity;
  const { area: { blocks }, breaker: { blocks: breakerBlocks } } = splitElectricityGuide(section);
  mountTroubleIntro(main, guide, helpers);
  const symptoms = el('div', 'trouble-steps trouble-symptoms');
  const lighting = el('details', 'panel trouble-step');
  lighting.append(el('summary', '', '照明だけがつかない'), el('p', '', '1つの照明だけがつかない場合は、電球切れの可能性があります。交換できる電球は、適合する種類・定格のものに交換してみてください。交換前に電源を切り、電球が冷えてから作業してください。交換してもつかない場合は、照明器具の不具合も考えられます。備え付けの照明は、管理会社へご相談ください。LED一体型など電球を交換できない器具や、安全に手が届かない場所は、無理に外さないでください。'));
  const tripped = el('details', 'panel trouble-step');
  tripped.append(el('summary', '', 'ブレーカーが落ちている'));
  if (breakerBlocks.length) tripped.append(renderBody({ ...section, blocks: breakerBlocks.filter(block => block.type !== 'heading'), hidePanelTitle: true }, 'ブレーカーの確認', { hideContactAction: true, plainLayout: true, inlineLayout: true }));
  else tripped.append(link('電気・ブレーカーの案内を見る →', '#section/electricity', 'trouble-guide-link'));
  const payment = el('details', 'panel trouble-step');
  payment.append(el('summary', '', 'ブレーカーが上がっていても電気がつかない'), el('p', '', guide.policy?.electricityBilling === 'management' ? '電気料金の支払い状況をご確認ください。支払い状況が分からない場合や、支払い済みでも電気がつかない場合は、管理会社へご相談ください。' : '電気料金の支払い状況と契約先の案内をご確認ください。支払い済みでも電気がつかない場合は、契約先へお問い合わせください。設備の不具合は管理会社へご相談ください。'), link('電気料金の案内を見る →', '#section/electricity', 'trouble-guide-link'));
  const breaker = el('details', 'panel trouble-step');
  breaker.append(el('summary', '', 'ブレーカーが上がらない'), el('p', '', 'ブレーカーの故障や漏電などの可能性があります。無理に繰り返し操作せず、管理会社へご相談ください。'));
  symptoms.append(lighting, tripped, payment, breaker);
  main.append(symptoms);
  if (blocks.length) {
    const area = el('details', 'panel trouble-step');
    area.append(el('summary', '', '建物全体・周辺も停電している'), renderBody({ ...section, blocks: blocks.filter(block => block.type !== 'heading'), hidePanelTitle: true }, '周辺の停電案内', { hideContactAction: true, plainLayout: true, inlineLayout: true }));
    symptoms.append(area);
  }
  mountContact(main, guide, helpers, '停電している範囲・発生した日時・ブレーカーの状態を控えて、管理会社へご相談ください。');
}
export function splitGasGuide(section) {
  const topics = { preparation: [], error: [], interruption: [], smell: [] };
  let topic = 'preparation';
  for (const block of section?.blocks || []) {
    if (block.type === 'heading') {
      const id = block.id || '';
      const heading = block.content || '';
      topic = id === 'gas_casa_11300_004' || /給湯器.*エラー/.test(heading) ? 'error'
        : id === 'gas_casa_11300_006' || /ガス.*急に.*使え/.test(heading) ? 'interruption'
        : id === 'gas_casa_11300_008' || /ガス.*(?:におい|臭い|匂い)/.test(heading) ? 'smell' : 'preparation';
    }
    topics[topic].push(block);
  }
  return Object.fromEntries(Object.entries(topics).map(([key, blocks]) => [key, {
    ...section, blocks,
    body: blocks.map(block => block.type === 'button' ? block.actionLabel : block.content || '').join('\n'),
    hidePanelTitle: true
  }]));
}

export function mountGasTrouble(main, guide, helpers, smell = false) {
  const { element: el, link, renderBody } = helpers;
  if (!guide.sections.gas || guide.policy?.hotWaterSource === 'electric') {
    main.append(el('p', '', 'この物件のガス案内はありません。お湯が出ない場合は、給湯の案内をご確認ください。'), link('お湯が出ないときの案内を見る →', '#no-hot-water', 'button secondary'));
    return;
  }
  const parts = splitGasGuide(guide.sections.gas);
  if (smell) {
    main.append(el('p','trouble-intro','まず安全を確保し、ガス会社の緊急窓口へご連絡ください。'));
    const steps = el('section', 'panel trouble-gas-actions');
    steps.append(el('h2', '', 'まず行うこと'));
    const list = el('ol');
    for (const message of ['ガス機器の使用を止め、火を使わないでください。', '室内では窓や戸を開けて換気してください。換気扇・電気のスイッチやコンセントは操作しないでください。', 'ガス栓の場所と操作が分かり、安全に閉められる場合は閉めてください。', 'ガス会社のガスもれ窓口へ連絡し、屋外など安全な場所で案内を受けてください。']) list.append(el('li', '', message));
    steps.append(list); main.append(steps);
    const contactPanel=el('section','panel trouble-help trouble-gas-contact');
    contactPanel.append(el('h2','','ガスもれの連絡先'));
    main.append(contactPanel);
    // Confirmed LP-gas variants use their supplier's emergency instructions.
    if (/^(?:v4_gas_lp_|lp_)/.test(guide.sections.gas?.variant || '')) {
      const blocks=parts.smell.blocks.filter(block=>block.type!=='heading' && !/^火気を使用せず、換気扇/.test(block.content || ''));
      contactPanel.append(renderBody({...parts.smell,blocks},'',{plainLayout:true,inlineLayout:true,hideContactAction:true}));
      return;
    }
    // Only a confirmed network operator enables address-based emergency routing.
    const configuredOperator = guide.gasNetworkOperator || '';
    const contact = gasEmergencyContact(configuredOperator, guide.address);
    if (contact) {
      contactPanel.append(el('p', '', '大阪ガスネットワーク ' + contact.region + '（' + contact.municipality + '）・' + contact.hours), link(contact.phone + ' に電話する（ガスもれ通報専用）', contact.href, 'button'));
    } else if (configuredOperator === 'osaka_gas_network') {
      const official = link('大阪ガスネットワークの地域別ガスもれ連絡先を確認する', GAS_EMERGENCY_SOURCE, 'button secondary');
      official.target = '_blank'; official.rel = 'noopener noreferrer'; contactPanel.append(official);
    } else {
      contactPanel.append(el('p', '', 'ガス会社からの案内やガスメーター付近の表示で、供給会社とガスもれの緊急連絡先を確認し、屋外など安全な場所からご連絡ください。'));
    }

    return;
  }
  mountTroubleIntro(main, guide, helpers);
  const safety = el('p', 'trouble-safety', 'ガスのにおいがある場合は、点火や復帰操作をせず、ガスのにおいの案内をご確認ください。');
  safety.append(' ', link('ガスもれの案内を見る →', '#gas-smell'));
  main.append(safety);
  const symptoms = el('div', 'trouble-steps trouble-symptoms');
  main.append(symptoms);
  if (guide.policy?.cookingSource === 'gas') {
    const cooker = el('details', 'panel trouble-step');
    cooker.append(el('summary', '', 'ガスコンロだけ点火しない（においがしない場合）'));
    const checks = el('ol', '');
    for (const [title, text] of [
      ['まず電池切れを確認', '電池式のコンロは、まず電池切れを確認してください。電池交換の表示がある、点火音が弱いなどの場合は、操作を止め、電池ケースや本体の表示で電池の種類と＋・−の向きを確認し、新しい電池に交換してください。電池の種類や交換場所が分からない場合は、管理会社へご相談ください。'],
      ['汚れ・吹きこぼれを確認', '吹きこぼれや油汚れが、火の出る部分や点火する部分に付くと、点火しないことがあります。操作を止め、ガス栓を閉め、コンロが十分冷めてから、柔らかい布で表面の汚れや水分を拭き取ってください。点火する部分を強くこすったり、曲げたりしないでください。'],
      ['清掃後の水分を確認', '吹きこぼれや清掃でぬれた部品は、十分に乾かしてください。'],
      ['部品の取り付けを確認', '清掃後に点かなくなった場合は、バーナーキャップ（火の出る部分のふた）が浮いたり、ずれたりしていないか確認してください。取り付け方が分からない場合は、無理に動かさず管理会社へご相談ください。']
    ]) { const item = el('li', ''); item.append(el('strong', '', title), el('p', '', text)); checks.append(item); }
    cooker.append(checks, el('p', '', '確認しても点かない場合は、繰り返し点火操作をせず、備え付けのコンロは管理会社へ、ご自身で用意したコンロはメーカーや購入店へご相談ください。'));
    symptoms.append(cooker);
  }
  if (parts.interruption.blocks.length) {
    const both = el('details', 'panel trouble-step');
    both.append(el('summary', '', 'コンロとお湯の両方が使えない場合'));
    both.append(renderBody({ ...parts.interruption, blocks: parts.interruption.blocks.filter(block => block.type !== 'heading') }, '', { hideContactAction: true, inlineLayout: true }));
    symptoms.append(both);
  }
  else main.append(el('p', '', 'ガスメーターの表示を控え、ご契約のガス会社へお問い合わせください。復帰操作は、ガス会社の案内に従ってください。'));
  mountContact(main, guide, helpers, 'コンロとお湯の両方が使えない場合や、復帰操作をしても使えない場合は、ご契約のガス会社へお問い合わせください。備え付けのコンロだけの不具合は管理会社へ、ご自身で用意したコンロはメーカーや購入店へご相談ください。', {actionLabel:'ガスの契約・連絡先の案内を見る',actionUrl:'#section/gas'});

}

export function splitElectricityGuide(section) {
  const topics = { preparation: [], breaker: [], area: [] };
  let topic = 'preparation';
  for (const block of section?.blocks || []) {
    if (block.type === 'heading') {
      const heading = block.content || '';
      topic = block.id === 'electricity_casa_11300_005' || /ブレーカー/.test(heading) ? 'breaker'
        : block.id === 'electricity_casa_11300_007' || /建物.*停電|周辺.*停電/.test(heading) ? 'area' : 'preparation';
    }
    topics[topic].push(block);
  }
  return Object.fromEntries(Object.entries(topics).map(([key, blocks]) => [key, {
    ...section, blocks,
    body: blocks.map(block => block.type === 'button' ? block.actionLabel : block.content || '').join('\n'),
    hidePanelTitle: true
  }]));
}

export function splitInternetGuide(section) {
  const topics = { preparation: [], trouble: [] };
  let topic = 'preparation';
  for (const block of section?.blocks || []) {
    if (block.type === 'heading') topic = block.id === 'internet_casa_11300_009' || /接続できない|つながらない/.test(block.content || '') ? 'trouble' : 'preparation';
    const destination = block.type === 'button' && block.actionUrl?.includes('0net-internet-service.com') ? 'preparation' : topic;
    topics[destination].push(block);
  }
  return Object.fromEntries(Object.entries(topics).map(([key, blocks]) => [key, { ...section, blocks, body: blocks.map(b => b.content || b.actionLabel || '').join('\n'), hidePanelTitle: true }]));
}
export function splitKeyGuide(section) {
  const topics = { preparation: [], trouble: [] };
  let topic = 'preparation';
  for (const block of section?.blocks || []) {
    if (block.type === 'heading') topic = block.id === 'key_casa_11300_009' || /紛失した|なくした/.test(block.content || '') ? 'trouble' : 'preparation';
    topics[topic].push(block);
  }
  return Object.fromEntries(Object.entries(topics).map(([key, blocks]) => [key, { ...section, blocks, body: blocks.map(b => b.content || b.actionLabel || '').join('\n'), hidePanelTitle: true }]));
}
