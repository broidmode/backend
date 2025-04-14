import { AcRelayInfo } from '../types.js';
import { fromKBinXml, toKBinXml, toObject } from './kbinxml.js';
import { Serializable } from './kxml-value.js';
import { LZ77 } from './lz77.js';
import { tokenToCardNumber } from './laochan-id.js';
import config from './config.js';

const PCB_ID = '1A0C1A0C1A0C1A0C1A0C';

export async function requestEa3(info: AcRelayInfo, model: string, token: string, ea3Url: string = 'http://maomani.cn:573/'): Promise<{
  status: number,
  response: Serializable,
}> {
  if (config.isDev) {
    console.log('ea3 call:');
  }

  const request = toKBinXml('call', {
    [info.module]: {
      $method: info.method,
      $model: model,
      $cardid: tokenToCardNumber(token),
      $srcid: PCB_ID,
      ...info.request,
    },
  }, 'UTF-8', config.isDev);

  const compressed = LZ77.compress(request.data);
  const body = new Blob([compressed]);

  const result = await fetch(`${ea3Url}/?model=${model}&f=${info.module}.${info.method}`, {
    method: 'post',
    body,
    headers: {
      'X-Compress': 'lz77',
    },
  }).then(async r => {
    const raw = new Uint8Array(await r.arrayBuffer());
    if (r.headers.get('x-compress') === 'lz77') {
      return new Uint8Array(LZ77.decompress(raw));
    }

    return raw;
  });

  if (config.isDev) {
    console.log('ea3 response:');
  }

  const response = fromKBinXml(result, config.isDev);

  return {
    status: parseInt(response['response'][info.module]?.$status ?? '0'),
    response: response['response'],
  };
}

export async function requestEa3Typed<T>(info: AcRelayInfo, model: string, token: string, ea3Url?: string): Promise<T> {
  const { response } = await requestEa3(info, model, token, ea3Url);
  return toObject<T>(response);
}
