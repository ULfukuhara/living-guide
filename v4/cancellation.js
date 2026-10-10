// Form destinations stay in the selected property's sheet-managed blocks.
export function mountCancellationFlow(main, section, { element: el, link, isCasa = false }) {
  const flow = el('section', 'cancellation-flow');
  flow.setAttribute('aria-labelledby', 'cancellation-flow-title');
  const title = el('h2', '', '退去までの流れ');
  title.id = 'cancellation-flow-title';
  flow.append(title);
  const actions = (section?.blocks || []).filter(block => block.actionUrl?.startsWith('https://') && block.actionLabel);
  const steps = [
    ['賃貸借契約書を確認', '予告期間は契約ごとに異なります。解約日の条件もご確認ください。'],
    ['部屋の解約を申請', '申請後は、受付状況と退去日を管理会社に確認してください。', /部屋.*解約/],
    ['退去立会いを予約', '立会いが必要な場合に予約します。解約申請とは別の手続きです。', /立会/],
    ['退去までの準備', 'ご自身で契約しているサービスの停止・住所変更、荷物の搬出・室内の清掃を済ませます。'],
    ['室内の引渡し・鍵の返却', '日時や返却方法は、管理会社の案内に従ってください。'],
    ['退去後の精算', '届いた精算書をご確認ください。']
  ];
  const list = el('ol', 'cancellation-flow-steps');
  steps.forEach(([heading, text, match], i) => {
    const item = el('li', 'cancellation-flow-step');
    const number = el('span', 'cancellation-flow-number', String(i + 1));
    number.setAttribute('aria-hidden', 'true');
    const copy = el('div', 'cancellation-flow-copy');
    copy.append(el('h3', '', heading));
    if (isCasa && i === 3) {
      const checklist = el('ul', 'cancellation-preparation-list');
      for (const task of ['荷物をすべて搬出する', '室内を清掃する', '設備の不具合は退去前にくらさぽから連絡する', 'ご自身で契約したサービスの停止・住所変更をする']) checklist.append(el('li', '', task));
      copy.append(checklist);
    } else copy.append(el('p', '', text));
    if (isCasa && i === 3) copy.append(el('p', '', 'この物件の電気と備え付けインターネット（0net）は、停止・解約手続きが不要です。電気の最終使用分は退去後に精算します。ご自身で別途契約した回線は、契約先で手続きしてください。'));
    const action = match && actions.find(block => match.test(block.actionLabel));
    if (action) {
      const button = link(action.actionLabel, action.actionUrl, 'button');
      button.target = '_blank'; button.rel = 'noopener noreferrer';
      copy.append(button);
    }
    item.append(number, copy); list.append(item);
  });
  flow.append(list);
  const parkingAction = actions.find(block => /駐車場.*解約/.test(block.actionLabel));
  if (parkingAction) {
    const parking = el('aside', 'cancellation-flow-parking');
    parking.append(el('h3', '', '駐車場を契約している方'), el('p', '', '駐車場の解約は別のフォームから申請します。解約条件は駐車場の契約書をご確認ください。'));
    const button = link(parkingAction.actionLabel, parkingAction.actionUrl, 'button secondary');
    button.target = '_blank'; button.rel = 'noopener noreferrer';
    parking.append(button); flow.append(parking);
  }
  main.append(flow);
}
