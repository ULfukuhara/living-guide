// Property copy is managed in content_blocks. Only presentation is adjusted here.
export function applyPropertyContent(propertyNo, selected) {
  if (String(propertyNo) !== '11300') return selected;
  let result = selected;
  for (const key of ['mailbox', 'bicycle_space', 'internet', 'trash', 'common_area', 'noise', 'pets', 'bike_parking', 'car_parking', 'sales', 'expenses', 'cancellation', 'usac', 'management_other', 'toilet', 'ventilation', 'air_conditioner', 'electricity', 'gas', 'water', 'key', 'moving', 'room_equipment', 'kurasapo_connect', 'drainage', 'heater']) {
    if (selected[key]?.variant === 'casa_11300' && selected[key].blocks?.length) {
      result = { ...result, [key]: { ...selected[key], hidePanelTitle: true } };
    }
  }
  return result;
}
