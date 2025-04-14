import { Context } from '../types.js';
import { generic, p2d } from '../decorators/eacnet.js';
import { v } from '../utils/kxml-value.js';
import { singleton } from 'tsyringe';

@singleton()
export class DefaultService {
  async default(ctx: Context) {
    if (ctx.service.name === 'p2d') {
      const descriptor = {
        value: () => ({
          status: v.s32(0),
          error: v.s32(0),
          result: {},
        })
      };

      p2d()(undefined, undefined, descriptor);
      return descriptor.value();
    } else if (['sdvx', 'ddr'].includes(ctx.service.name)) {
      const result = {
        status: v.s32(0),
        error_code: v.s32(0),
        response: {},
      };

      // handle ac relay
      if (ctx.acRelayInfo) {
        result['xrpc_status_code'] = v.s32(0);
        result['xrpc_fault_code'] = v.s32(0);
        result['response'] = {
          [ctx.acRelayInfo.module]: {
            $status: 0,
          }
        }
      }

      const descriptor = {
        value: () => result,
      };

      generic()(undefined, undefined, descriptor);
      return descriptor.value();
    }

    throw new Error(`unsupported game ${ctx.service.name}`);
  }
}
