import { Next } from 'koa';
import { Context } from '../types.js';
import { LZ77 } from '../utils/lz77.js';
import { fromKBinXml } from '../utils/kbinxml.js';

export async function eacnet(ctx: Context, next: Next): Promise<any> {
  const body = ctx.request.body as {
    request: string;
    p2d_token?: string;
  } | undefined;

  if (!body || !body.request) {
    return next();
  }

  const { request } = body;

  if (!request) {
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

  if (result['eacnet']) {
    const info = result['eacnet'].info;
    ctx.token = info.token;

    const request = result['eacnet'].request;
    if (!request) {
      return next();
    }

    ctx.service = {
      name: info.game_id,
      module: request.module,
      method: request.method,
    };

    ctx.body = request.data ?? {};
    ctx.eacnetRequest = request.service ? request : undefined;
    return next();
  }

  // for p2d
  const game = Object.keys(result)[0];

  if (result[game].params) {
    ctx.body = result.p2d.params;
  } else {
    ctx.body = {};
  }

  ctx.service = {
    name: game,
    module: 'p2d',
    method: result[game].method,
  }

  ctx.token = body.p2d_token;
  return next();
}
