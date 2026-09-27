import { sectionSetting } from './content.js?v=20260927-blocks';

const SECTION = 'delivery_box';
const VARIANT = 'kotei_Num';
const TYPES = new Set(['heading', 'text', 'image', 'notice', 'button']);
export function safeBlockUrl(value, image = false) {
  if (typeof value !== 'string' || /[\u0000-\u0020\\]/.test(value)) return null;
  if (!image && value.startsWith('/') && !value.startsWith('//')) return value;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; }
  catch { return null; }
}
export function validatedBlocks(data) {
  if (!data || data.schema_version !== 2 || data.section_key !== SECTION || data.variant_key !== VARIANT || !Array.isArray(data.blocks) || !data.blocks.length) return [];
  const ids = new Set(), orders = new Set();
  for (const b of data.blocks) {
    if (!b || typeof b.id !== 'string' || !b.id.trim() || ids.has(b.id) || !TYPES.has(b.type) || !Number.isSafeInteger(b.order) || b.order < 0 || orders.has(b.order)) return [];
    ids.add(b.id); orders.add(b.order);
    if (['heading','text','notice'].includes(b.type) && (typeof b.content !== 'string' || !b.content.trim())) return [];
    if (b.type === 'image' && (!safeBlockUrl(b.image_url, true) || typeof b.alt_text !== 'string' || !b.alt_text.trim())) return [];
    if (b.type === 'button' && (!safeBlockUrl(b.action_url) || typeof b.action_label !== 'string' || !b.action_label.trim())) return [];
  }
  return [...data.blocks].sort((a,b)=>a.order-b.order);
}
async function boundedRead(read) {
  let timer;
  try { return await Promise.race([read(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),5000);})]); }
  finally { clearTimeout(timer); }
}
// Called only by v2. Reuse the existing property -> variant selection, not the legacy fallback variant.
export async function attachPublishedBlocks(property, masters, sections, readDocument) {
  const setting = sectionSetting(property[SECTION]);
  if (!setting.enabled || !masters[SECTION] || (setting.variant || property.variant_key || 'base') !== VARIANT) return;
  try {
    const data = await boundedRead(()=>readDocument(`${SECTION}__${VARIANT}`));
    if (data?.preview) return; // Draft export must never become normal property content.
    const blocks = validatedBlocks(data);
    if (blocks.length) sections[SECTION] = {body:'',images:[],...sections[SECTION],label:masters[SECTION].label_ja || SECTION,selectedVariant:VARIANT,blocks};
  } catch { /* Retain legacy content on timeout, absent document or denied read. */ }
}
// Static, explicitly labelled preview. It does not change any property or enabled flag.
export async function loadPreview(fetcher = fetch) {
  const controller = new AbortController();
  try {
    return await boundedRead(async()=>{
      const response = await fetcher(new URL('./content-blocks-preview.json',import.meta.url), {cache:'no-store',signal:controller.signal});
      if (!response.ok) return [];
      const data = await response.json();
      return data.preview === true ? validatedBlocks(data) : [];
    });
  } catch { return []; }
  finally { controller.abort(); }
}
export function blocksToAiText(blocks) {
  return [...blocks].sort((a,b)=>a.order-b.order).filter(b=>['heading','text','notice'].includes(b.type))
    .map(b=>(b.type==='notice'?'注意：':'')+b.content).join('\n');
}
export function renderContentBlocks(blocks, internalHref = value=>value) {
  const root = document.createElement('div'); root.className='content-blocks';
  for (const b of blocks) {
    let node;
    if (b.type === 'image') {
      node=document.createElement('figure');
      const img=document.createElement('img'); img.src=safeBlockUrl(b.image_url,true); img.alt=b.alt_text; img.loading='lazy'; img.referrerPolicy='no-referrer';
      img.addEventListener('error',()=>{const error=document.createElement('p');error.className='notice';error.textContent='案内画像を読み込めませんでした。';img.replaceWith(error);});
      node.append(img);
      if (b.alt_text.startsWith('表示テスト用画像')) {const caption=document.createElement('figcaption');caption.textContent=b.alt_text;node.append(caption);}
    } else if (b.type === 'button') {
      node=document.createElement('p'); const a=document.createElement('a');const url=safeBlockUrl(b.action_url);
      a.className='button'; a.textContent=b.action_label; a.href=url.startsWith('/')?internalHref(url):url;
      if (!url.startsWith('/')) {a.target='_blank';a.rel='noopener noreferrer';} node.append(a);
    } else {
      node=document.createElement(b.type==='heading'?'h3':b.type==='notice'?'aside':'p');
      node.className=b.type==='notice'?'notice':'block-text'; node.textContent=b.content;
      if (b.type==='notice') node.setAttribute('aria-label','注意事項');
    }
    root.append(node);
  }
  return root;
}
