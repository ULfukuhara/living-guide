import { db } from '/assets/firebase-init.js';
import { doc, getDoc, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { flattenGuides, normalizeBlocks, normalizeBlockStyles, selectSections, roomDetails, safeWebUrl, normalizeBool, SECTION_KEYS } from './content.js?v=20261005-1';
import { applyPropertyContent } from './property-content.js?v=20261005-1';

export async function loadGuide(search) {
  const params = new URLSearchParams(search);
  const token = params.get('token') || '';
  let propertyNo = params.get('propertyNo') || '';
  let room = '';
  let roomInfo = null;
  if (!token && !propertyNo) throw new Error('物件・お部屋専用のQRコードまたは案内URLからアクセスしてください。');
  if (token) {
    if (token.includes('/')) throw new Error('このURLは無効です。案内URLをご確認ください。');
    const snap = await getDoc(doc(db, 'postdials', token));
    roomInfo = roomDetails(snap.exists() ? snap.data() : null);
    ({ propertyNo, room } = roomInfo);
  }
  if (!propertyNo || propertyNo.includes('/')) throw new Error('物件番号を確認できません。案内URLをご確認ください。');
  const propertySnap = await getDoc(doc(db, 'properties_shiori', propertyNo));
  if (!propertySnap.exists()) throw new Error('この物件の入居のしおり設定が登録されていません。');
  const property = propertySnap.data();
  const title = String(property.canonicalName || property.propertyName || `物件No. ${propertyNo}`);
  if (!normalizeBool(property.shiori_enabled)) return { title, room, sections: {}, unpublished: true };
  const records = snap => snap.docs.map(item => ({ id: item.id, data: item.data() }));
  // Same collections and new/legacy priority as the current guide. No writes or persistence.
  const results = await Promise.allSettled([
    getDocs(collection(db, 'sections_master')),
    getDocs(collection(db, 'guides_master')),
    getDocs(collection(db, 'guides_master_raw')),
    getDocs(query(collection(db, 'content_blocks'), where('enabled', '==', true))),
    getDocs(collection(db, 'block_styles_master'))
  ]);
  if (results[0].status === 'rejected' || results.slice(1, 4).every(result => result.status === 'rejected')) {
    throw new Error('案内を読み込めませんでした。通信状況をご確認のうえ、再読み込みしてください。');
  }
  const masters = Object.fromEntries(records(results[0].value).filter(item => (SECTION_KEYS.includes(item.id) || (String(propertyNo) === '11300' && item.id === 'plumbing'))).map(item => [item.id, item.data]));
  const contents = flattenGuides(...results.slice(1, 3).map(result => result.status === 'fulfilled' ? records(result.value) : []));
  const styles = normalizeBlockStyles(results[4].status === 'fulfilled' ? records(results[4].value) : []);
  const blocks = normalizeBlocks(results[3].status === 'fulfilled' ? records(results[3].value) : [], styles);
  // Blocks are optional during migration; keep the existing guide usable.
  // Log only the error code, never the SDK message or record contents.
  if (results[3].status === 'rejected') console.warn('content_blocks: ' + (results[3].reason?.code || 'unavailable'));
  if (results[4].status === 'rejected') console.warn('block_styles_master: ' + (results[4].reason?.code || 'unavailable'));
  return { title, room, roomInfo, propertyNo,
    address: String(property.address || property['住所'] || ''),
    // Optional property photograph only; never substitute an unrelated property photograph.
    photo: safeWebUrl(property.photo_url || property.image_url || property.propertyPhotoUrl || ''),
    sections: applyPropertyContent(propertyNo, selectSections(String(propertyNo) === '11300' ? { ...property, drainage: property.water_area } : property, String(propertyNo) === '11300' ? { ...masters, heater: masters.heater || { label_ja: '暖房器具' }, drainage: masters.plumbing || { label_ja: '水まわり全般' } } : masters, contents, blocks)), partial: results.slice(0, 3).some(result => result.status === 'rejected') };
}
