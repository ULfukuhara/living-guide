// Property copy is managed in content_blocks. Only presentation is adjusted here.
export function applyPropertyContent(propertyNo, selected) {
  if (String(propertyNo) !== '11300' || selected.mailbox?.variant !== 'casa_11300' || !selected.mailbox.blocks?.length) return selected;
  return { ...selected, mailbox: { ...selected.mailbox, hidePanelTitle: true } };
}
