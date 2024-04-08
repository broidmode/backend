import { Context } from '../types.js';
import { eacnet } from '../decorators/eacnet.js';
import { v } from '../utils/kxml-value.js';

export class DefaultService {
  async default(ctx: Context) {
    const descriptor = {
      value: () => ({
        status: v.s32(0),
        error: v.s32(0),
        result: {
          dummy: v.u8(0),
        }
      })
    };

    eacnet(ctx.service.name)(undefined, undefined, descriptor);
    return descriptor.value();
  }
}
