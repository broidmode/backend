import { Next } from 'koa';
import { Context } from '../types.js';
import { LZ77 } from '../utils/lz77.js';
import { fromKBinXml } from '../utils/kbinxml.js';

export async function eacnet(ctx: Context, next: Next): Promise<any> {
  const body = ctx.request.body as {
    request: string;
    p2d_token: string;
  } | undefined;

  if (!body || !body.request) {
    return next();
  }

  const { request, p2d_token: token } = body;

  if (!request || !token) {
    return next();
  }

  const buffer = Buffer.from(request
    .replaceAll(' ', '+')
    .replaceAll('-', '+')
    .replaceAll('_', '/') + '===',
    'base64'
  );

  const decoded = LZ77.decompress(buffer);
  const result = fromKBinXml(decoded);

  const game = Object.keys(result)[0];

  if (!(game in result)) {
    return next();
  }

  if (result[game].params) {
    ctx.body = result.p2d.params;
  } else {
    ctx.body = {};
  }

  ctx.service = {
    name: game,
    method: result[game].method,
  }

  ctx.token = token;
  return next();
}
