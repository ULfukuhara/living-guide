// Public projection only. Never fetch internal Cybozu records from a tenant browser.
export function cancellationFormAllowed(property) {
  return property?.cancellation_form_enabled === true;
}
export function prepareCancellationSection(section, allowed) {
  if (allowed || !section) return section;
  const roomLabel = label => /部屋.*解約/.test(label || '');
  const urls = new Set((section.blocks || []).filter(block => roomLabel(block.actionLabel)).map(block => block.actionUrl).filter(Boolean));
  const clean = text => typeof text !== 'string' ? text : text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (original,label,url) => roomLabel(label) || urls.has(url) ? '解約方法は管理会社へご確認ください。' : original);
  return {...section, body: clean(section.body), blocks: section.blocks?.filter(block => !(block.type === 'button' && (roomLabel(block.actionLabel) || urls.has(block.actionUrl)))).map(block => { const roomAction = roomLabel(block.actionLabel) || urls.has(block.actionUrl); const copy = {...block, content:clean(block.content)}; if (roomAction) { delete copy.actionLabel; delete copy.actionUrl; if (typeof copy.content === 'string') copy.content = copy.content.replace(/^部屋の解約は、[^\n]*部屋解約フォーム[^\n]*/,'解約方法は管理会社へご確認ください。'); } if (copy.type === 'heading' && roomLabel(copy.content)) copy.content = '解約方法を確認する'; return copy; })};
}
