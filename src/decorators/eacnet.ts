import { LZ77 } from '../utils/lz77.js';
import { toKBinXml } from '../utils/kbinxml.js';

export function eacnet(topName: string, encoding: 'UTF-8' | 'SHIFT_JIS' = 'UTF-8'): MethodDecorator {
  return function (_target, _propertyKey, descriptor) {
    const orig = descriptor.value as Function;
    descriptor.value = async function (...args: any[]) {
      const obj = await orig.apply(this, args);
      const kxml = toKBinXml(topName, obj, encoding);
      const compressed = LZ77.compress(kxml.data);
      const result = Buffer.allocUnsafe(compressed.length + 0x2E);

      result.write('P2D:2015091800', 0, 'ascii');
      result.set(compressed, 0x2E);

      return result;
    } as unknown as any;
  }
}
