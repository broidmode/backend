import { p2d } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";

export class Game {
  @p2d()
  async getChampionshipInfo() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        championship_id: v.s32(-1),
        championship_state: v.s32(0),
        championship_name: v.str(''),
        entry_begin_clock: v.u64(0),
        championship_begin_clock: v.u64(0),
        championship_end_clock: v.u64(0),
        is_possible_play: v.bool(0),
        repertoire_list: {
          repertoire_num: v.s32(0),
        }
      }
    }
  }

  @p2d()
  async getServerValues() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        bit_boost_magnification: v.str('2'),
        debug_user_force_subscription: v.str('TRUE'),
        devline_ignore_maintenance: v.str('FALSE'),
        enable_file_upload: v.str('TRUE'),
        frame_bit_magnification: v.str('1'),
        open_bemani_linkage_hinabita2023: v.str('FALSE'),
        open_bemani_linkage_knst2024sp: v.str('FALSE'),
        open_bemani_linkage_mixup: v.str('FALSE'),
      }
    }
  }

  @p2d()
  async checkGameVersion() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        permission: v.s32(1),
      }
    };
  }

  @p2d()
  async getClearRate(ctx: Context) {
    const { play_style } = ctx.body as { play_style: number };
    return {
      status: v.s32(0),
      error: v.s32(0),
      play_style: v.s32(play_style),
      result: {},
    }
  }

  @p2d()
  async getGoodsList() {
    const goods = [{
      goods_id: v.str('G1000000'),
      item_id: v.str('I1000000'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }, {
      goods_id: v.str('G2000000'),
      item_id: v.str('I1000000'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }, {
      goods_id: v.str('G2000001'),
      item_id: v.str('I1000000'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }, {
      goods_id: v.str('G2000002'),
      item_id: v.str('I1000000'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }, {
      goods_id: v.str('G1000001'),
      item_id: v.str('I1000000'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }, {
      goods_id: v.str('G3000000'),
      item_id: v.str('I1000000'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }, {
      goods_id: v.str('G3000001'),
      item_id: v.str('I1000001'),
      use_priority: v.s32(1),
      price: v.s32(1),
    }];

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        goods_list: {
          goods_num: v.s32(goods.length),
          goods,
        }
      }
    };
  }
}
