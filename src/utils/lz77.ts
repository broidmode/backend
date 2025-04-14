import {compress, decompress} from '@kamyu/lz77';

export class LZ77 {
  static compress(input: ArrayLike<number>) {
    return compress(Uint8Array.from(input));
  }

  static decompress(input: ArrayLike<number>) {
    return decompress(Uint8Array.from(input));
  }
}
