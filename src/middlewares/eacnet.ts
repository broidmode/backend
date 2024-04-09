import { Next } from 'koa';
import { Context } from '../types.js';
import { LZ77 } from '../utils/lz77.js';
import { to_xml } from '@kamyu/kbinxml';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  parseAttributeValue: false,
  attributeNamePrefix: '$',
  removeNSPrefix: true,
  numberParseOptions: {
    hex: false,
    leadingZeros: false,
    eNotation: false,
    skipLike: /.*/,
  },
});

function parseValue(node: { $__type: string; $__count?: unknown }): any {
  const isArray = '$__count' in node;

  if (
    [
      's8',
      'u8',
      's16',
      'u16',
      's32',
      'u32',
      's64',
      'u64',
    ].includes(node.$__type)
  ) {
    if (isArray) {
      return node['#text'].split(' ').map((v) => parseInt(v));
    }

    return parseInt(node['#text']);
  }

  if (['float', 'double'].includes(node.$__type)) {
    if (isArray) {
      return node['#text'].split(' ').map((v) => parseFloat(v));
    }

    return parseFloat(node['#text']);
  }

  if (['b', 'bool'].includes(node.$__type)) {
    return !!parseInt(node['#text']);
  }

  if (['bin', 'binary'].includes(node.$__type)) {
    return Buffer.from(node['#text'], 'hex');
  }

  if (['ip4', 'str', 'string'].includes(node.$__type)) {
    return node['#text'];
  }

  if (node.$__type == 'time') {
    return new Date(parseInt(node['#text']) * 1000);
  }

  return {
    type: node.$__type,
    value: node['#text'],
  };
}

function kxmlToObject(node: Record<string, unknown> | unknown[] | string): any {
  if (node instanceof Array) {
    return node.map((v) => kxmlToObject(v as Record<string, unknown>));
  }

  if (typeof node === 'string') {
    return {};
  }

  if ('$__type' in node) {
    return parseValue(node as { $__type: string; $__count?: unknown });
  }

  const obj: object = {};

  for (const key in node) {
    if (key == '?xml') continue;
    const value = node[key];

    if (key.startsWith('$')) {
      obj[key.substring(1)] = value;
      continue;
    }

    obj[key] = kxmlToObject(node[key] as Record<string, unknown>);
  }

  return obj;
}

export async function eacnet(ctx: Context, next: Next): Promise<any> {
  const body = ctx.request.body as {
    request: string;
    p2d_token: string;
  } | undefined;

  if (!body || !body.request) {
    return next();
  }

  const { request, p2d_token: token } = body;
  const buffer = Buffer.from(request
    .replaceAll(' ', '+')
    .replaceAll('-', '+')
    .replaceAll('_', '/') + '===',
    'base64'
  );
  const decoded = LZ77.decompress(buffer);
  const xml = to_xml(decoded).data;
  const parsedXml = parser.parse(xml);
  const xmlResult = kxmlToObject(parsedXml);

  const game = Object.keys(xmlResult)[0];

  if (!(game in xmlResult)) {
    return next();
  }

  if (xmlResult[game].params) {
    ctx.body = xmlResult.p2d.params;
  } else {
    ctx.body = {};
  }

  ctx.service = {
    name: game,
    method: xmlResult[game].method,
  }

  ctx.token = token;
  return next();
}
