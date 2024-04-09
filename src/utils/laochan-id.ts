import { createHash } from 'crypto';

export function fromToken(token: string) {
  const key = createHash('md5')
    .update(token, 'utf-8')
    .digest('hex');

  return ('LCHAN' + key).slice(0, 13);
}
