import { LZ77 } from '../utils/lz77.js';
import { toKBinXml } from '../utils/kbinxml.js';

export function eacnet(protocol_name: string, topName: string, dataOffset: number) {
  return (encoding: 'UTF-8' | 'SHIFT_JIS' = 'UTF-8') => {
    return function (_target, _propertyKey, descriptor) {
      const orig = descriptor.value as Function;
      descriptor.value = async function (...args: any[]) {
        const obj = await orig.apply(this, args);

        const kxml = toKBinXml(topName, obj, encoding);
        const compressed = LZ77.compress(kxml.data);
        const result = Buffer.allocUnsafe(compressed.length + dataOffset);

        result.write(protocol_name, 0, 'ascii');
        result.set(compressed, dataOffset);

        return result;
      } as unknown as any;
    }
  }
}

export const p2d = eacnet('P2D:2015091800', 'p2d', 0x2E);
export const generic = eacnet('2020090800', 'eacnet', 0x2A);
