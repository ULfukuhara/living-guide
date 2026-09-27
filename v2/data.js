import { attachPublishedBlocks } from './content-blocks.js?v=20260927-blocks';
import { db } from '/assets/firebase-init.js';
import { doc, getDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';
import { flattenGuides, selectSections, roomIdentity, normalizeBool, SECTION_KEYS } from './content.js?v=20260927-blocks';

export async function loadGuide(search) {
  const params = new URLSearchParams(search);
  const token = params.get('token') || '';
  let propertyNo = params.get('propertyNo') || '';
  let room = '';
  if (!token && !propertyNo) throw new Error('物件・お部屋専用のQRコードまたは案内URLからアクセスしてください。');
  if (token) {
    if (token.includes('/')) throw new Error('このURLは無効です。案内URLをご確認ください。');
    const snap = await getDoc(doc(db, 'postdials', token));
    ({ propertyNo, room } = roomIdentity(snap.exists() ? snap.data() : null));
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
    getDocs(collection(db, 'guides_master_raw'))
  ]);
  if (results[0].status === 'rejected' || (results[1].status === 'rejected' && results[2].status === 'rejected')) {
    throw new Error('案内を読み込めませんでした。通信状況をご確認のうえ、再読み込みしてください。');
  }
  const masters = Object.fromEntries(records(results[0].value).filter(item => SECTION_KEYS.includes(item.id)).map(item => [item.id, item.data]));
  const contents = flattenGuides(...results.slice(1).map(result => result.status === 'fulfilled' ? records(result.value) : []));
  const sections = selectSections(property, masters, contents);
  await attachPublishedBlocks(property, masters, sections, async id => {
    const snapshot = await getDoc(doc(db, 'guide_contents', id));
    return snapshot.exists() ? snapshot.data() : null;
  });
  return { title, room, propertyNo, sections, partial: results.some(result => result.status === 'rejected') };
}
