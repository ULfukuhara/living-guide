import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {inspectPublicGuide} from './guide-preflight.mjs';
import {SECTION_KEYS,normalizeBool} from '../v4/content.js';
import {PROPERTY_POLICY_FIELDS} from '../v4/property-settings.js';
// Scoped, additive synchronization. Existing rules and omitted fields never change.
const allowed=new Set(['doc_id','propertyNo','canonicalName','propertyName','address','variant_key','shiori_enabled','shiori_slug','photo_url','image_url','propertyPhotoUrl','water_area',...SECTION_KEYS,...PROPERTY_POLICY_FIELDS]);
const blockFields=['block_id','section_key','variant_key','block_order','block_type','content','image_url','alt_text','action_label','action_url','style_key','enabled'];
const booleans=new Set(['shiori_enabled','wifi_router_provided','electricity_stop_required','internet_stop_required','key_loan_available','cancellation_form_enabled','kurasapo_enabled']);
const [mode,inputFile,planFile,...options]=process.argv.slice(2);
if(!['prepare','apply'].includes(mode)||!inputFile||!planFile)throw Error('Usage: node tools/guide-sync.mjs prepare|apply input.json plan.json [--publish]');
const bytes=await fs.readFile(inputFile),hash=crypto.createHash('sha256').update(bytes).digest('hex'),input=JSON.parse(bytes);
const report=inspectPublicGuide(input);if(!report.ok)throw Error('Public preflight failed; correct input before synchronizing');
for(const key of Object.keys(input.property))if(!allowed.has(key))throw Error('Input contains a non-public or unmanaged property field');
if(normalizeBool(input.property.shiori_enabled)&&!options.includes('--publish'))throw Error('Publishing requires the explicit --publish option');
const propertyNo=report.propertyNo;if(!/^[0-9]+$/.test(propertyNo))throw Error('Use a confirmed numeric property number');
const propertyValues={};for(const[k,v]of Object.entries(input.property)){if(v===undefined||v===null||v==='')continue;if(typeof v!=='string'&&typeof v!=='boolean'&&typeof v!=='number')throw Error('Property fields must be public scalar values');if(booleans.has(k)){if(![true,false,1,0,'TRUE','FALSE','true','false'].includes(v))throw Error('Invalid boolean property field');propertyValues[k]=normalizeBool(v);}else propertyValues[k]=v;}
propertyValues.propertyNo=Number(propertyNo);
const rows=(input.blocks||[]).map(row=>row.data||row).map(row=>Object.fromEntries(blockFields.map(k=>[k,row[k]??''])));
if(rows.length>400)throw Error('Synchronize one bounded property batch at a time');
for(const row of rows){if(!/^[A-Za-z0-9_-]+$/.test(String(row.block_id)))throw Error('Block ID must be stable and URL safe');row.enabled=normalizeBool(row.enabled);if(row.enabled){const order=Number(row.block_order);if(!Number.isFinite(order))throw Error('Invalid block order');row.block_order=order;}}
const variants=[...new Set(rows.map(r=>r.variant_key))];if(variants.length>5||variants.some(v=>!v))throw Error('Use at most five explicit content variants per batch');
const require=createRequire(import.meta.url),lib=process.env.FIREBASE_TOOLS_LIB||'C:/Users/fukuhara/AppData/Roaming/npm-cache/_npx/ba4f1959e38407b5/node_modules/firebase-tools/lib/';
const {configstore}=require(lib+'configstore.js'),auth=require(lib+'auth.js');const token=await auth.getAccessToken(configstore.get('tokens')?.refresh_token,configstore.get('loginScopes')||[]);
const root='projects/univlife-kanri/databases/(default)/documents',base='https://firestore.googleapis.com/v1/'+root,headers={Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'};
const api=async(part,body,missing=false)=>{const res=await fetch(base+part,{headers,...(body?{method:'POST',body:JSON.stringify(body)}:{})});if(missing&&res.status===404)return null;if(!res.ok)throw Error('Scoped Firestore request failed '+res.status);return res.json();};
const encode=v=>typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?(Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v}):{stringValue:String(v)};
const property=await api('/properties_shiori/'+propertyNo+'?'+[...allowed].map(k=>'mask.fieldPaths='+encodeURIComponent(k)).join('&'),null,true);
const existing=[];for(const variant of variants){const result=await api(':runQuery',{structuredQuery:{from:[{collectionId:'content_blocks'}],where:{fieldFilter:{field:{fieldPath:'variant_key'},op:'EQUAL',value:{stringValue:variant}}},select:{fields:blockFields.map(k=>({fieldPath:k}))}}});existing.push(...result.filter(x=>x.document).map(x=>x.document));}
const changes=[];for(const row of rows){const matches=existing.filter(d=>d.fields.block_id?.stringValue===row.block_id);if(matches.length>1)throw Error('Duplicate existing block identity');const prior=matches[0]||null;const fields=Object.fromEntries(Object.entries(row).map(([k,v])=>[k,encode(v)]));if(prior&&Object.entries(fields).every(([k,v])=>(JSON.stringify(prior.fields[k])===JSON.stringify(v)||(prior.fields[k]===undefined&&v.stringValue===''))))continue;changes.push({name:prior?.name||root+'/content_blocks/'+row.block_id,fields,mask:blockFields,before:prior});}
const nextProperty=Object.fromEntries(Object.entries(propertyValues).map(([k,v])=>[k,encode(v)]));const changedFields=Object.keys(nextProperty).filter(k=>JSON.stringify(property?.fields?.[k])!==JSON.stringify(nextProperty[k]));
const current={project:'univlife-kanri',propertyNo,inputHash:hash,propertyBefore:property,propertyChangedFields:changedFields,propertyFields:nextProperty,blockChanges:changes,deletions:0,rulesChanged:false,sharedVariants:variants.filter(v=>v==='base'||v==='v4_common'),preflight:report};
if(mode==='prepare'){await fs.writeFile(planFile,JSON.stringify(current,null,2)+'\n');console.log(JSON.stringify({propertyNo,propertyFields:changedFields.length,blockUpdates:changes.filter(c=>c.before).length,newBlocks:changes.filter(c=>!c.before).length,deletions:0,sharedVariants:current.sharedVariants,prepared:true}));}
else{
 const plan=JSON.parse(await fs.readFile(planFile,'utf8'));if(plan.inputHash!==hash||plan.propertyNo!==propertyNo||plan.project!==current.project)throw Error('Prepared input changed');if(plan.propertyBefore?.updateTime!==property?.updateTime)throw Error('Property changed since prepare');
 if(JSON.stringify(plan.blockChanges)!==JSON.stringify(changes)||JSON.stringify(plan.propertyChangedFields)!==JSON.stringify(changedFields))throw Error('Content changed since prepare');
 const writes=changes.map(c=>({update:{name:c.name,fields:c.fields},updateMask:{fieldPaths:c.mask},currentDocument:c.before?{updateTime:c.before.updateTime}:{exists:false}}));
 if(changedFields.length)writes.push({update:{name:property?.name||root+'/properties_shiori/'+propertyNo,fields:Object.fromEntries(changedFields.map(k=>[k,nextProperty[k]]))},updateMask:{fieldPaths:changedFields},currentDocument:property?{updateTime:property.updateTime}:{exists:false}});
 if(!writes.length){console.log('No changes; data already matches.');process.exit(0);}if(writes.length>400)throw Error('Batch too large');const result=await api(':commit',{writes});if(result.writeResults?.length!==writes.length)throw Error('Unexpected commit result');
 for(const c of changes){const after=await api('/'+c.name.slice(root.length+1)+'?'+c.mask.map(k=>'mask.fieldPaths='+encodeURIComponent(k)).join('&'));for(const[k,v]of Object.entries(c.fields))if(JSON.stringify(after.fields[k])!==JSON.stringify(v))throw Error('Read-back mismatch');}
 if(changedFields.length){const after=await api('/properties_shiori/'+propertyNo+'?'+changedFields.map(k=>'mask.fieldPaths='+encodeURIComponent(k)).join('&'));for(const k of changedFields)if(JSON.stringify(after.fields[k])!==JSON.stringify(nextProperty[k]))throw Error('Property read-back mismatch');}
 await fs.writeFile(planFile+'.result.json',JSON.stringify({propertyNo,commitTime:result.commitTime,writes:writes.length,verified:true,deletions:0,rulesChanged:false},null,2));console.log(JSON.stringify({propertyNo,writes:writes.length,verified:true}));
}
