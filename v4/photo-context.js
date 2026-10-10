import { roomIdentity } from './content.js';
export async function resolvePhotoPropertyNo(search, readToken) {
  const params = new URLSearchParams(search);
  const token = params.get('token');
  if (!token) return params.get('propertyNo') || '';
  if (token.includes('/')) throw new Error('Invalid guide token');
  const snap = await readToken(token);
  return roomIdentity(snap.exists() ? snap.data() : null).propertyNo;
}
