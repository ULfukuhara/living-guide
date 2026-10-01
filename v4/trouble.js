// Presentation only: consume the guide already selected by loadGuide.
// No Firebase imports, extra reads, or writes are needed for these screens.
export const troubleItems = [
  { route: 'no-hot-water', title: 'お湯が出ない', description: '給湯器やガスを確認', icon: 'heater', color: 'orange' },
  { route: 'section/drainage', title: '水漏れ', description: '水まわりの案内を確認', icon: 'water' },
  { route: 'section/toilet', title: 'トイレのトラブル', description: '使い方や注意点を確認', icon: 'water' },
  { route: 'section/air_conditioner', title: 'エアコンが効かない', description: '設定やお手入れを確認', icon: 'air' },
  { route: 'section/key', title: '鍵をなくした', description: '鍵の案内・連絡先を確認', icon: 'key', color: 'purple' },
  { route: 'section/internet', title: 'インターネット', description: '接続・利用方法を確認', icon: 'wifi' },
  { route: 'section/noise', title: '騒音', description: '生活マナーと相談の案内', icon: 'rules', color: 'green' },
  { route: 'section/management_other', title: 'その他', description: '管理会社からの案内を確認', icon: 'trouble', color: 'purple' }
];

export function mountTrouble(main, guide, { element: el, link, icon }) {
  main.append(el('p', 'trouble-intro', 'どのようなことでお困りですか？'));
  const list = el('nav', 'trouble-list');
  list.setAttribute('aria-label', 'お困りごとの種類');
  for (const item of troubleItems) {
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

export function mountNoHotWater(main, guide, { element: el, link, renderBody }) {
  main.append(el('p', 'trouble-intro', 'まず以下の内容をご確認ください。'));
  const note = el('p', 'trouble-safety', 'ガスのにおいがする場合は、点火や電気のスイッチ操作をせず、ご契約のガス会社の緊急窓口へご連絡ください。');
  main.append(note);
  const steps = el('ol', 'trouble-steps');
  const checks = [
    ['給湯器リモコン', ['電源が入っているか確認してください。', 'エラー番号が表示されている場合は、番号を控えてください。']],
    ['ガスコンロ', ['ガスのにおいがしないことを確認してから、ガスコンロが点火するか確認してください。', 'ガスコンロがない場合は、次の確認へ進んでください。']],
    ['ガスメーター', ['安全装置が作動していないか、表示を確認してください。', '復帰操作は、ご契約のガス会社の案内に従ってください。']],
    ['その他・この物件の給湯設備', []]
  ];
  checks.forEach(([title, messages], index) => {
    const step = el('li', 'panel trouble-step');
    const heading = el('h2');
    const number = el('span', 'trouble-step-number', String(index + 1));
    number.setAttribute('aria-hidden', 'true');
    heading.append(number, title);
    step.append(heading);
    if (messages.length) {
      const list = el('ul');
      messages.forEach(message => list.append(el('li', '', message)));
      step.append(list);
    } else {
      const sections = ['heater', 'gas'].filter(key => guide.sections[key]);
      if (sections.length) {
        step.append(el('p', 'muted', 'この物件で公開されている案内もご確認ください。'));
        for (const key of sections) {
          const details = el('details', 'trouble-property-guide');
          details.append(el('summary', '', guide.sections[key].label), renderBody(guide.sections[key]));
          step.append(details);
        }
      } else {
        step.append(el('p', 'muted', 'この物件の給湯設備に関する追加の案内は、現在掲載されていません。設備の取扱説明書もご確認ください。'));
      }
    }
    steps.append(step);
  });
  main.append(steps);
  const help = el('section', 'panel trouble-help');
  help.append(el('h2', '', '改善しない場合'), el('p', '', '確認した内容と、表示されているエラー番号を控えて、管理会社へご相談ください。'));
  const button = el('button', 'button', 'お問い合わせ（準備中）');
  button.type = 'button';
  button.disabled = true;
  button.setAttribute('aria-describedby', 'trouble-contact-note');
  const explanation = el('p', 'muted', 'このボタンからはまだ連絡できません。お急ぎの場合は、契約時に案内された連絡先をご利用ください。');
  explanation.id = 'trouble-contact-note';
  help.append(button, explanation);
  main.append(help);
}
