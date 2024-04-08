export class LZ77 {
  static compress(input: ArrayLike<number>) {
    const a = Uint8Array.from(input);
    const res = new Uint8Array(a.length + a.length / 8 + 3);
    let p = 0;
    for (let i = 0; i < a.length; ++i) {
      if (i % 8 === 0) {
        if (a.length - i < 8) {
          res[p] = (Math.pow(2, a.length - i) - 1);
        } else {
          res[p] = 255;
        }
        p++;
      }
      res[p] = a[i];
      p++;
    }
    res[p] = 0;
    res[p + 1] = 0;

    return Buffer.from(res);
  }

  static decompress(a: ArrayLike<number>) {
    const res = new Uint8Array(0x190000);
    let p = 0;
    let r = 0;
    let t = 0;
    let b = 8;
    let mask = 0;

    while (true) {
      if (b === 8) {
        mask = a[p];
        p++;
        b = 0;
      }
      if ((mask & 1) === 1) {
        res[r] = a[p];
        r++;
        p++;
      } else {
        let distance = a[p];
        let count = a[p + 1];
        if (distance === 0 && count === 0) break;
        p += 2;
        distance <<= 4;
        distance |= count >> 4;
        count = (count & 0x0F) + 3;
        t = r - distance;
        for (let i = 0; i < count; ++i) {
          res[r] = t < 0 ? 0x00 : res[t];
          r++;
          t++;
        }
      }
      mask >>= 1;
      b += 1;
    }

    const o = res.slice(0, r);
    return Buffer.from(o);
  }
}
