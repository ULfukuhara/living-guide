// Classification depends on section keys, independently of the body format.
// Keep all existing section URLs and labels supplied by sections_master.
export const guideGroups = Object.freeze({
  intro: ['moving', 'key', 'mailbox', 'electricity', 'gas', 'water', 'internet', 'special_note'],
  equipment: ['key', 'mailbox', 'delivery_box', 'room_equipment', 'internet', 'electricity', 'gas', 'water', 'heater', 'air_conditioner', 'toilet', 'drainage', 'ventilation'],
  trash: ['trash'],
  rules: ['common_area', 'noise', 'pets', 'bicycle_space', 'bike_parking', 'car_parking', 'sales', 'special_note'],
  procedures: ['cancellation', 'expenses', 'management_other', 'kurasapo_connect', 'usac']
});

export const groupTitles = Object.freeze({
  intro: 'はじめに', equipment: 'お部屋・設備', trash: 'ゴミの出し方',
  rules: '暮らしのルール', procedures: '各種手続き'
});

// Shared topics may appear in multiple menus; this determines their back link
// and their position in the complete guide list.
export function sectionGroup(key) {
  if (['moving', 'special_note'].includes(key)) return 'intro';
  return ['equipment', 'trash', 'rules', 'procedures'].find(group => guideGroups[group].includes(key)) || 'intro';
}

export function groupedSections(sections) {
  return Object.entries(groupTitles).map(([group, title]) => ({
    group, title,
    keys: Object.keys(sections).filter(key => sectionGroup(key) === group)
  })).filter(group => group.keys.length);
}
