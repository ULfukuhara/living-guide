// PoC only: existing Firestore content remains the single source of truth.
export const SECTION_KEYS = ['gas', 'trash', 'kurasapo_connect', 'delivery_box'];

export function normalizeBool(value) {
  return value === true || value === 1 || (typeof value === 'string' && ['true', '1', 'yes', 'on'].includes(value.trim().toLowerCase()));
}

export function sectionSetting(raw) {
  if (raw === undefined || raw === null || raw === '') return { enabled: false };
  if (typeof raw === 'boolean') return { enabled: raw };
  if (typeof raw === 'number') return { enabled: raw !== 0 };
  const value = String(raw).trim();
  if (['false', '0', 'no', 'off'].includes(value.toLowerCase())) return { enabled: false };
  return { enabled: true, variant: ['true', '1', 'yes', 'on', 'base'].includes(value.toLowerCase()) ? null : value };
}

export function flattenGuides(current, legacy) {
  const result = [];
  for (const { id, data } of current) {
    const key = String(data.section_key || id || '').trim();
    if (!SECTION_KEYS.includes(key)) continue;
    const images = variant => Array.isArray(data.image_urls) ? data.image_urls : (Array.isArray(data.image_urls?.[variant]) ? data.image_urls[variant] : []);
    const add = (variant, text) => {
      if (text && String(text).trim()) result.push({ key, variant: String(variant || 'base').trim(), body: String(text), images: images(variant) });
    };
    for (const [variant, text] of Object.entries(data.bodies || {})) add(variant, text);
    add(data.variant_key || 'base', data.body_text);
  }
  for (const { data } of legacy) {
    const key = String(data.section_key || '').trim();
    if (SECTION_KEYS.includes(key) && String(data.body_text || '').trim()) {
      result.push({ key, variant: String(data.variant_key || 'base').trim(), body: String(data.body_text), images: Array.isArray(data.image_urls) ? data.image_urls : [] });
    }
  }
  return result;
}

export function selectSections(property, masters, contents) {
  if (!normalizeBool(property.shiori_enabled)) return {};
  const result = {};
  for (const key of SECTION_KEYS) {
    const setting = sectionSetting(property[key]);
    if (!setting.enabled || !masters[key]) continue;
    const variant = setting.variant || property.variant_key || 'base';
    const content = contents.find(item => item.key === key && item.variant === variant)
      || contents.find(item => item.key === key && item.variant === 'base');
    if (content?.body) result[key] = { ...content, label: masters[key].label_ja || key, selectedVariant: variant };
  }
  return result;
}

// Never return codes, passwords, names of residents, or the source document.
export function roomIdentity(data, now = Date.now()) {
  if (!data || data.tokenIsActive === false) throw new Error('このURLは無効か、有効期限が切れています。管理会社へお問い合わせください。');
  const expiry = data.tokenExpiresAt?.toDate ? data.tokenExpiresAt.toDate() : null;
  if (expiry && expiry.getTime() < now) throw new Error('このURLは無効か、有効期限が切れています。管理会社へお問い合わせください。');
  const propertyNo = String(data.propertyNo || '').trim();
  if (!propertyNo || propertyNo.includes('/')) throw new Error('物件情報を確認できませんでした。管理会社へお問い合わせください。');
  return { propertyNo, room: String(data.room || data.roomNo || '').replace(/号室$/, '').trim() };
}

export function safeWebUrl(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
