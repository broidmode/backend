import { Context } from '../types.js';
import { p2d, sdvx } from '../decorators/eacnet.js';
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
    } else if (ctx.service.name === 'sdvx') {
      const result = {
        status: v.s32(0),
        error_code: v.s32(0),
        response: {},
      };

      // handle ac relay
      if (ctx.eacnetRequest) {
        result['xrpc_status_code'] = v.s32(0);
        result['xrpc_fault_code'] = v.s32(0);
        result['response'] = {
          [ctx.eacnetRequest.module]: {
            $status: 0,
          }
        }
      }

      const descriptor = {
        value: () => result,
      };

      sdvx()(undefined, undefined, descriptor);
      return descriptor.value();
    }

    throw new Error(`unsupported game ${ctx.service.name}`);
  }
}
