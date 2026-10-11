import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {SECTION_KEYS,sectionSetting,normalizeBlocks,normalizeBool,selectSections} from '../v4/content.js';
import {normalizePropertySections,propertyPolicy} from '../v4/property-settings.js';
// Read-only checks. Reports contain IDs and codes, never room secrets or source prose.
export function inspectPublicGuide(input) {
 const errors=[],warnings=[],add=(list,code,section,id)=>list.push({code,...(section?{section}:{}),...(id?{id}:{})});
 const property=input.property||{},propertyNo=String(property.propertyNo||property.doc_id||'');
 if(!propertyNo||property.doc_id&&String(property.doc_id)!==propertyNo)add(errors,'property_identity_mismatch');
 for(const key of Object.keys(property))if(/^(token|postdial|mailboxCode|deliveryBoxCode|wifi_pass|Wi-Fi_PASS|password)$/i.test(key))add(errors,'room_field_in_public_input');
 const masters=Array.isArray(input.masters)?Object.fromEntries(input.masters.map(x=>[x.id,x.data])):input.masters||{};
 const normalized=normalizePropertySections(property,masters),records=(input.blocks||[]).map(row=>row.data?row:{id:row.block_id,data:row});
 const seen=new Set();for(const record of records){const row=record.data;if(!normalizeBool(row.enabled))continue;const id=String(row.block_id||record.id||'');if(seen.has(id))add(errors,'duplicate_block_id',row.section_key,id);seen.add(id);if(!normalizeBlocks([record]).length)add(errors,'invalid_enabled_block',row.section_key,id);}
 const blocks=normalizeBlocks(records),sections=selectSections(normalized.property,normalized.masters,input.contents||[],blocks),selections=[];
 for(const key of SECTION_KEYS){const setting=sectionSetting(normalized.property[key]);if(!setting.enabled)continue;
  const requested=setting.variant||property.variant_key||'base',section=sections[key];
  if(!normalized.masters[key])add(errors,'missing_section_master',key);
  if(!section){add(errors,'missing_requested_content',key);continue;}
  if(section.variant!==requested)add(errors,'unexpected_base_fallback',key);
  if(!setting.variant&&property.variant_key&&property.variant_key!=='base')add(warnings,'implicit_property_variant_precedence',key);
  const expected=(input.catalogue||[]).find(x=>x.section===key&&x.variant===section.variant);
  if(expected?.expectedBlocks!==undefined&&section.blocks?.length!==expected.expectedBlocks)add(errors,'incomplete_variant_blocks',key);
  const texts=[section.body,...(section.blocks||[]).flatMap(b=>[b.content,b.actionUrl,b.imageUrl,b.alt])].filter(Boolean);
  for(const text of texts){if(/[?&]token=[A-Za-z0-9_-]{12,}/.test(text))add(errors,'embedded_room_token',key);
   for(const match of text.matchAll(/[?&]propertyNo=([^&#\s)]+)/g))if(match[1]!==propertyNo)add(errors,'foreign_property_link',key);
   for(const term of input.forbiddenTerms||[])if(term&&text.includes(term)&&!(input.approvedSharedTerms||[]).includes(term))add(errors,'foreign_property_term',key);
  }
  selections.push({section:key,requestedVariant:requested,selectedVariant:section.variant,format:section.blocks?'blocks':'legacy',blocks:section.blocks?.length||0});
 }
 if(property.hot_water_source==='electric'&&sections.gas)add(warnings,'gas_section_with_electric_hot_water');
 if(!normalizeBool(property.shiori_enabled))add(warnings,'draft_unpublished');
 const policy=propertyPolicy(property);if(policy.keyLoanAvailable&&property.key_loan_available===undefined)add(errors,'unconfirmed_key_loan');
 return{propertyNo,ok:errors.length===0,errors,warnings,selections,roomDataPersisted:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const [inputFile,outputFile]=process.argv.slice(2);if(!inputFile||!outputFile)throw Error('Usage: node tools/guide-preflight.mjs input.json report.json');
 const input=JSON.parse(await fs.readFile(inputFile,'utf8')),report=inspectPublicGuide(input);await fs.writeFile(outputFile,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ok:report.ok,sections:report.selections.length,errors:report.errors.length,warnings:report.warnings.length}));if(!report.ok)process.exitCode=1;
}
