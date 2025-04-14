import { inject, singleton } from 'tsyringe';
import { Combine } from '../../utils/combine.js';
import { generic } from '../../decorators/eacnet.js';
import { Serializable, v } from '../../utils/kxml-value.js';
import { EacGeneric } from '../eac-generic.js';
import * as data from '../../datas/ddr.js';
import { User } from './user.js';
import { UserService } from '../../services/ddr/user.js';
import { Context } from '../../types.js';

@singleton()
export default class extends Combine(User, EacGeneric) {
  constructor(
    @inject(UserService) private readonly userService: UserService,
  ) {
    super();

    this.userService;
  }

  @generic()
  async getItemList(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        item_num: v.s32(1),
        item: {
          item_id: v.str('DDR_TICKET'),
          not_free_count: v.s32(114514),
          free_count: v.s32(0),
          buyable_point: v.s32(9999999),
        },
      },
    };
  }

  @generic()
  async tabooword_2_check(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        tabooword_2: {
          $status: 0,
          is_taboo: v.bool(false),
        },
      },
    };
  }

  @generic()
  async log_2_save(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        log_2: {
          $status: 0,
        },
      },
    };
  }

  @generic()
  async getprev(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        fileinfo_2: {
          $status: 0,
          soundinfo: data.previewSoundInfos,
        },
      },
    };
  }

  @generic()
  async getmain(ctx: Context): Promise<Serializable> {
    const mcode = ctx.body.data.mcode as number;
    const result = data.mainSoundInfoMap.get(mcode);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        fileinfo_2: {
          $status: 0,
          soundinfo: result,
        },
      },
    };
  }

  @generic()
  async getmusic(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        data_2: {
          $status: 0,
          mdb: {
            music: data.musics,
          },
        },
      },
    };
  }

  @generic()
  async getGoodsList(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        goods_num: v.s32(3),
        goods: [{
          goods_id: v.str('G0000001'),
          item_id: v.str('DDR_TICKET'),
          price: v.s32(1),
        }, {
          goods_id: v.str('G0000002'),
          item_id: v.str('DDR_TICKET'),
          price: v.s32(1),
        }, {
          goods_id: v.str('G0000003'),
          item_id: v.str('DDR_TICKET'),
          price: v.s32(1),
        }],
      },
    };
  }
}
