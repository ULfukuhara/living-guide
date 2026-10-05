// Mailbox draft remains local-only. Delivery content is selected from Firestore blocks.
export function applyPropertyContent(propertyNo, selected, { mailboxPreview = false } = {}) {
  const result = selected;
  if (!mailboxPreview || String(propertyNo) !== '11300' || !result.mailbox) return result;
  const blocks = [];
  const add = (type, content) => blocks.push({id:`casa-mailbox-${blocks.length + 1}`,type,content,style:'default'});
  const part = (heading, text) => { add('heading', heading); add('text', text); };
  part('郵便物の受け取り', '・ご自身の郵便受けを確認し、郵便物はこまめにお受け取りください。\n・受け取った後は、必ず施錠してください。開けたままにすると、紛失・盗難の原因になります。');
  part('チラシ・広告の整理', '・郵便受けの中を定期的に整理し、詰まりや散乱を防いでください。\n・不要なチラシや広告は、各自で処分してください。');
  part('旅行・帰省などで不在にする場合', '長期間不在にする場合は、日本郵便の「不在届」をご検討ください。事前に届け出ると、最長30日間、その期間中に届く郵便物等を保管し、届出期間の終了後に配達するサービスです。利用条件は日本郵便の案内をご確認ください。\n\n[日本郵便：不在時の郵便物の取り扱い](https://www.post.japanpost.jp/question/115.html)');
  part('引っ越しをした場合', '郵便局で「転居届」を提出すると、旧住所宛ての郵便物等が新住所に無料で転送されます。転送期間は届出日から1年間です。窓口・ポスト投函・Webから手続きできます。\n\n[日本郵便：転居・転送サービス](https://www.post.japanpost.jp/service/receive/relocation/)');
  add('heading', '郵便物に関するトラブル');
  add('heading', '他の方宛ての郵便物が入っている場合');
  blocks.at(-1).level = 3;
  add('text', '郵便物を開封せず、配達した郵便局・配送業者へお問い合わせください。');
  add('heading', '郵便物が届かない場合');
  blocks.at(-1).level = 3;
  add('text', '差出人や配達した郵便局・配送業者へ、配達状況をご確認ください。重要書類やカード類が届かない場合は、発行元へ速やかに相談し、必要な手続きを確認してください。');
  add('heading', '盗難が疑われる場合');
  blocks.at(-1).level = 3;
  add('text', '必要に応じて警察へご相談ください。状況を確認のうえ、管理会社にもご相談ください。');
  add('text', '郵便物に関するトラブルは、状況を確認のうえ管理会社にもご相談ください。');
  return {...result, mailbox:{...result.mailbox,blocks,body:blocks.map(block=>block.content).join('\n'),images:[],hidePanelTitle:true}};
}
