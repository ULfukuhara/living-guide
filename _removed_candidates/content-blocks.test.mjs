import assert from 'node:assert/strict';
import { normalizeBlocks, normalizeBlockStyles, selectSections } from '../v4/content.js';

const record = (overrides = {}) => ({ id: 'block', data: {
  block_id: 'block', section_key: 'delivery_box', variant_key: 'kotei_Num',
  block_order: 10, block_type: 'text', content: '宅配ボックスの手順', enabled: true,
  ...overrides
} });
const property = { shiori_enabled: true, delivery_box: 'kotei_Num' };
const masters = { delivery_box: { label_ja: '宅配ボックス' } };
const legacy = [{ key: 'delivery_box', variant: 'kotei_Num', body: '従来の本文', images: [] }];
const select = (records, contents = legacy, prop = property) => selectSections(prop, masters, contents, normalizeBlocks(records));

assert.equal(normalizeBlocks([record({enabled: 'FALSE'}), record({enabled: false})]).length, 0);
assert.equal(select([record({enabled: 'FALSE'})]).delivery_box.body, '従来の本文');
assert.equal(select([record({block_type: 'image', content: '', image_url: ''})]).delivery_box.body, '従来の本文');
assert.equal(normalizeBlocks([record({block_type: 'unknown'}), record({section_key: 'private'})]).length, 0);
const ordered = normalizeBlocks([
  record({block_id:'last',block_order:'20',block_type:'image',image_url:'https://example.com/image.png',alt_text:'操作方法'}),
  record({block_id:'first',block_order:'10',enabled:'TRUE', image_url:'https://example.com/unrelated.png'})
]);
assert.deepEqual(ordered.map(block => block.id), ['first','last']);
assert.equal(ordered[0].imageUrl, null);
assert.equal(ordered[1].alt, '操作方法');
assert.equal(select([record()], []).delivery_box.blocks.length, 1);
assert.equal(select([record({variant_key:'other'})]).delivery_box.body, '従来の本文');
assert.equal(select([record({variant_key:'base'})]).delivery_box.body, '従来の本文');
assert.equal(select([record({variant_key:'base'})], []).delivery_box.variant, 'base');
assert.deepEqual(select([record()], legacy, {...property,delivery_box:false}), {});
assert.deepEqual(select([record()], legacy, {...property,shiori_enabled:false}), {});
assert.equal(normalizeBlocks([record({block_type:'image',image_url:'javascript:alert(1)'})]).length, 0);
assert.equal(normalizeBlocks([record({action_label:'開く',action_url:'javascript:alert(1)'})])[0].actionUrl, null);
console.log('PASS: disabled rows, empty images, types, ordering, variant priority, legacy fallback, publication settings, safe links');
for (const type of ['heading','notice']) {
  assert.equal(normalizeBlocks([record({block_type:type})])[0].type,type);
  assert.equal(normalizeBlocks([record({block_type:type,content:''})]).length,0);
}
assert.equal(normalizeBlocks([record({block_type:'button',action_label:'問い合わせ',action_url:'https://example.com',style_key:'primary'})])[0].style,'primary');
assert.equal(normalizeBlocks([record({block_type:'button',action_label:'問い合わせ',action_url:''})]).length,0);
assert.equal(normalizeBlocks([record({style_key:'unexpected'})])[0].style,'default');
const styles=normalizeBlockStyles([{data:{block_type:'notice',style_key:'warning',enabled:'FALSE'}}]);
assert.equal(normalizeBlocks([record({block_type:'notice',style_key:'warning'})],styles)[0].style,'default');
assert.equal(normalizeBlocks([record({block_type:'notice',style_key:'warning'})])[0].style,'warning');
assert.equal(select([record({block_type:'heading',content:'検索対象の見出し'})]).delivery_box.body,'検索対象の見出し');
console.log('PASS: headings, notices, buttons, invalid actions, style allowlist, disabled styles, search text');
const savedProperty={shiori_enabled:true,delivery_box:'base',variant_key:'suita'};
const baseGuide=[{key:'delivery_box',variant:'base',body:'既存の宅配ボックス案内',images:[]}];
const preserved=selectSections(savedProperty,masters,baseGuide,normalizeBlocks([record()]));
assert.equal(preserved.delivery_box.variant,'base');
assert.equal(preserved.delivery_box.body,'既存の宅配ボックス案内');
assert.equal(preserved.delivery_box.label,'宅配ボックス');
assert.equal(savedProperty.delivery_box,'base');
console.log('PASS: property variant and section master preserved; unrelated blocks do not replace legacy body');
assert.equal(normalizeBlocks([record({block_type:'button',action_label:'電話',action_url:'tel:08001003311'})])[0].actionUrl,'tel:08001003311');
for (const url of ['tel:0800;ext=1','tel:0800?body=secret','javascript:alert(1)']) {
  assert.equal(normalizeBlocks([record({block_type:'button',action_label:'電話',action_url:url})]).length,0);
}
assert.equal(normalizeBlocks([record({block_type:'image',image_url:'tel:08001003311'})]).length,0);
console.log('PASS: telephone actions allowed; unsafe actions and telephone image URLs rejected');
