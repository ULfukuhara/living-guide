import { SECTION_KEYS, sectionSetting } from './content.js?v=20261012-production-1';
// Include every variant the selector can use, including its explicit shared parts
// and base fallback, without downloading unrelated properties' content.
export function blockVariantGroups(normalizedProperty) {
 const variants=new Set(['base']);
 for(const key of SECTION_KEYS){const setting=sectionSetting(normalizedProperty[key]);if(setting.enabled){const v=setting.variant||normalizedProperty.variant_key||'base';if(typeof v==='string'&&v)variants.add(v);}}
 if([...variants].some(v=>/^v4_eq_property_\d+$/.test(v)))variants.add('v4_eq_common');
 if(variants.has('v4_move_autolock'))variants.add('v4_move_check');
 const list=[...variants];return Array.from({length:Math.ceil(list.length/10)},(_,i)=>list.slice(i*10,i*10+10));
}
