// Completed copy lives in sheet-managed content_blocks. Formatting is shared.
export function applyPropertyContent(_propertyNo, selected) {
  return Object.fromEntries(Object.entries(selected).map(([key,section])=>[key,section.blocks?.length?{...section,hidePanelTitle:true}:section]));
}
