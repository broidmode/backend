import { createHash } from 'crypto';
import highwayHash from 'highwayhash';

export function tokenToInfinitasId(token: string) {
  const key = createHash('md5')
    .update(token, 'utf-8')
    .digest('hex');

  return ('LCHAN' + key).slice(0, 13);
}

const HIGHWAY_KEY = Buffer.from('LAOCHANID_HIGHWAY_KEY_NOTSECURE!');

export function tokenToHash(token: string) {
  const key = highwayHash.asHexString(HIGHWAY_KEY, Buffer.from(token));
  return key.toUpperCase();
}

export function tokenToCardNumber(token: string) {
  const hash = tokenToHash(token);
  return ('LCHAN' + hash.toUpperCase()).slice(0, 16);
}

export function tokenToCode(token: string) {
  const key = highwayHash.asUInt32Low(HIGHWAY_KEY, Buffer.from(token));
  return 'MOAI' + key.toString().padStart(9, '0').slice(0, 9);
}

export function tokenToSnsId(token: string) {
  const key = highwayHash.asUInt32Low(HIGHWAY_KEY, Buffer.from(token));
  return key.toString().padStart(8, '0');
}

export function tokenToSdvxId(token: string) {
  const snsId = tokenToSnsId(token);
  return 'SV-' + snsId.slice(0, 4) + '-' + snsId.slice(4, 8);
}
