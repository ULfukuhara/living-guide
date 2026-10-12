import { SECTION_KEYS } from './content.js?v=20261012-production-1';
// Public property settings only. Room secrets and internal records do not belong here.
export const PROPERTY_POLICY_FIELDS = ['electricity_billing','water_billing','hot_water_source','cooking_source','internet_provider_key','wifi_router_provided','electricity_stop_required','internet_stop_required','lost_key_policy','key_loan_available','key_return_method','emergency_support_phone','emergency_support_hours','gas_emergency_directory','gas_network_operator','trash_collection_type','trash_region_id','cancellation_form_enabled','kurasapo_enabled','emergency_support_provider','washlet_provided'];
const bool=(v,fallback=false)=>v===undefined||v===null||v===''?fallback:v===true||v===1||typeof v==='string'&&['true','1','yes','on'].includes(v.trim().toLowerCase());
const enumValue=(v,allowed,fallback='unknown')=>allowed.includes(v)?v:fallback;
// V1 gas=base denotes a gas cooker; an explicit V4 setting takes priority.
function cookingSource(property) {
 const setting=property.cooking_source;
 if(setting!==undefined && setting!==null && setting!=='')return enumValue(setting,['ih','gas']);
 const legacy=String(property.gas||'').trim().toLowerCase().replace(/\s+/g,' ');
 return legacy==='ih'?'ih':['base','gas stove'].includes(legacy)?'gas':'unknown';
}
export function propertyPolicy(property={}) {
 const phone=String(property.emergency_support_phone||'').trim();
 const emergencyPhone=/^\+?[0-9][0-9-]{2,19}$/.test(phone)?phone:'';
 const emergencyHours=String(property.emergency_support_hours||'').split(/\r?\n/).map(line=>line.split('：')).filter(parts=>parts.length===2&&parts.every(v=>v.trim())).map(parts=>parts.map(v=>v.trim()));
 return {
  washletProvided:bool(property.washlet_provided),
  electricityBilling:enumValue(property.electricity_billing,['management','provider']),
  waterBilling:enumValue(property.water_billing,['water_utility','management']),
  hotWaterSource:enumValue(property.hot_water_source,['gas','electric']),cookingSource:cookingSource(property),
  internetProvider:enumValue(property.internet_provider_key,['zero_net','other']),
  wifiRouterProvided:property.wifi_router_provided===undefined||property.wifi_router_provided===''?null:bool(property.wifi_router_provided),
  electricityStopRequired:bool(property.electricity_stop_required,true),internetStopRequired:bool(property.internet_stop_required,true),
  lostKeyPolicy:enumValue(property.lost_key_policy,['usac_paid_loan_week']),keyLoanAvailable:bool(property.key_loan_available),keyReturnMethod:enumValue(property.key_return_method,['inspection_or_contact']),
  emergencyPhone,emergencyHours,emergencyProvider:enumValue(property.emergency_support_provider,['jbr','other']),gasEmergencyDirectory:enumValue(property.gas_emergency_directory,['osaka_gas_network']),
  kurasapoEnabled:bool(property.kurasapo_enabled,!!property.kurasapo_connect&&!['false','0','off','no'].includes(String(property.kurasapo_connect).trim().toLowerCase()))
 };
}
// Legacy column aliases are shared, and an explicit new FALSE always wins.
export function normalizePropertySections(property,masters) {
 const normalized={...property};
 if(property.v4_section_variants){
  const settings=typeof property.v4_section_variants==='string'?JSON.parse(property.v4_section_variants):property.v4_section_variants;
  if(!settings||Array.isArray(settings)||typeof settings!=='object')throw new Error('V4本文設定の形式を確認してください。');
  for(const [key,value] of Object.entries(settings))if(SECTION_KEYS.includes(key)&&['string','boolean','number'].includes(typeof value))normalized[key]=value;
 }
 if(!Object.hasOwn(normalized,'drainage')||normalized.drainage===undefined||property.drainage===null||property.drainage==='')normalized.drainage=property.water_area;
 return {property:normalized,masters:{...masters,drainage:masters.drainage||masters.plumbing||{label_ja:'水まわり全般'},heater:masters.heater||{label_ja:'暖房器具'}}};
}

// Only explicitly confirmed washlets receive equipment-specific guidance.
export function applyEquipmentConditions(sections, policy) {
 if (policy?.washletProvided === true || !sections.toilet) return sections;
 const toilet = sections.toilet;
 const blocks = (toilet.blocks || []).filter(block => !block.id.startsWith('toilet_v4_eq_common_washlet_')).map(block => block.type === 'text' && (block.content || '').includes('暖房便座・温水洗浄便座') ? { ...block, content: block.content.split(/\r?\n/).filter(line => !line.includes('暖房便座・温水洗浄便座')).join('\n') } : block);
 return { ...sections, toilet: { ...toilet, blocks, body: blocks.map(block => block.content || block.actionLabel || '').join('\n') } };
}
