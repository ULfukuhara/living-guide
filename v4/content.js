// Existing Firestore content remains the single source of truth.
export const SECTION_KEYS = ["key","mailbox","delivery_box","bicycle_space","room_equipment","special_note","moving","electricity","gas","water","internet","trash","common_area","pets","toilet","noise","drainage","ventilation","heater","air_conditioner","bike_parking","car_parking","sales","expenses","cancellation","management_other","kurasapo_connect","usac"];

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

export const BLOCK_STYLES = Object.freeze({
  text: ['default', 'lead'], heading: ['default', 'strong'],
  image: ['default', 'full'], notice: ['default', 'info', 'warning'],
  button: ['default', 'primary']
});

export function normalizeBlockStyles(records) {
  const styles = {};
  for (const { data } of records) {
    const type = String(data.block_type || '').trim();
    const style = String(data.style_key || 'default').trim();
    if (BLOCK_STYLES[type]?.includes(style)) styles[`${type}/${style}`] = normalizeBool(data.enabled);
  }
  return styles;
}

export function normalizeBlocks(records, styles = {}) {
  const blocks = [];
  for (const { id, data } of records) {
    const key = String(data.section_key || '').trim();
    const type = String(data.block_type || '').trim();
    if (!normalizeBool(data.enabled) || !SECTION_KEYS.includes(key) || !Object.hasOwn(BLOCK_STYLES, type)) continue;
    const content = String(data.content || '').trim();
    const imageUrl = safeWebUrl(data.image_url);
    const actionLabel = String(data.action_label || '').trim();
    const actionUrl = safeWebUrl(data.action_url);
    if ((['text', 'heading', 'notice'].includes(type) && !content)
      || (type === 'image' && !imageUrl) || (type === 'button' && (!actionLabel || !actionUrl))) continue;
    const requestedStyle = String(data.style_key || 'default').trim();
    const style = BLOCK_STYLES[type].includes(requestedStyle) && styles[`${type}/${requestedStyle}`] !== false
      ? requestedStyle : 'default';
    const order = Number(data.block_order);
    blocks.push({
      id: String(data.block_id || id || ''), key,
      variant: String(data.variant_key || 'base').trim(),
      order: Number.isFinite(order) ? order : 0, type, content, style,
      imageUrl: type === 'image' ? imageUrl : null,
      alt: String(data.alt_text || '').trim(),
      actionLabel, actionUrl
    });
  }
  return blocks.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function selectSections(property, masters, contents, blocks = []) {
  if (!normalizeBool(property.shiori_enabled)) return {};
  const result = {};
  for (const key of SECTION_KEYS) {
    const setting = sectionSetting(property[key]);
    if (!setting.enabled || !masters[key]) continue;
    const variant = setting.variant || property.variant_key || 'base';
    // Finish selecting the property's variant before falling back to base.
    // A base block must not override a variant-specific legacy guide.
    for (const selectedVariant of new Set([variant, 'base'])) {
      const selectedBlocks = blocks.filter(item => item.key === key && item.variant === selectedVariant);
      const content = contents.find(item => item.key === key && item.variant === selectedVariant);
      if (selectedBlocks.length) {
        result[key] = { key, variant: selectedVariant, blocks: selectedBlocks,
          body: selectedBlocks.map(block => block.type === 'image' ? block.alt : block.type === 'button' ? block.actionLabel : block.content).join('\n'),
          images: [], label: masters[key].label_ja || key };
        break;
      }
      if (content?.body) {
        result[key] = { ...content, label: masters[key].label_ja || key };
        break;
      }
    }
  }
  return result;
}

// Validate token identity before selecting any room-specific fields.
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

// Explicit allowlist. Never expose the source record or persist room information.
export function roomDetails(data, now = Date.now()) {
  const identity = roomIdentity(data, now);
  const pick = keys => {
    for (const key of keys) {
      const value = data[key];
      if ((typeof value === 'string' || typeof value === 'number') && String(value).trim()) return String(value).trim();
    }
    return '';
  };
  return { ...identity,
    mailbox: pick(['postdial', 'mailboxCode']),
    delivery: pick(['deliveryBox', 'deliveryBoxCode']),
    bicycle: pick(['bicycleParking', 'bicycleSpace']),
    wifiPassword: pick(['Wi-Fi_PASS', 'Wi-Fi PASS', 'WiFi_PASS', 'wifi_pass', 'wifiPass', 'password', 'PASS', 'Password', 'パスワード']),
    ssid: pick(['Wi-Fi_SSID', 'Wi-Fi SSID', 'WiFi_SSID', 'wifi_ssid', 'wifiSsid', 'ssid', 'SSID'])
  };
}
