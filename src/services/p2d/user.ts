import { eacnet } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { MUSIC_LIST } from "./index.js";

export class User {
  userDataSaveTemp = new Map<string, { pdata: Buffer, checksum: string }>();

  @eacnet('p2d')
  async getCustomizeSetting() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        customize: [{ item_category: v.s32(2), item_id: v.str('I1100000') }, { item_category: v.s32(3), item_id: v.str('I1200000') }, { item_category: v.s32(4), item_id: v.str('I1300000') }, { item_category: v.s32(5), item_id: v.str('I1400000') }, { item_category: v.s32(6), item_id: v.str('I1500000') }, { item_category: v.s32(7), item_id: v.str('I1600000') }, { item_category: v.s32(8), item_id: v.str('I1700000') }, { item_category: v.s32(11), item_id: v.str('I1300000') }, { item_category: v.s32(10), item_id: v.str('I1900000') }],
        other_customize: [{ item_category: v.s32(1), item_id: v.str('C1000000') }, { item_category: v.s32(2), item_id: v.str('C1100000') }, { item_category: v.s32(3), item_id: v.str('C1200000') }, { item_category: v.s32(4), item_id: v.str('C1300000') }, { item_category: v.s32(5), item_id: v.str('C1400000') },],
      }
    }
  }

  @eacnet('p2d')
  async gameEnd() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
  async getPointList() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        point_count: v.s32(114514),
      }
    }
  }

  @eacnet('p2d')
  async getPrivilegeClient() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        list_num: v.s32(0),
      }
    }
  }

  @eacnet('p2d')
  async getPrivilegeServer() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        list_num: v.s32(0),
      }
    }
  }

  @eacnet('p2d')
  async savePlayData(ctx: Context) {
    const uid = ctx.token;
    const { pdata, checksum } = ctx.body as { pdata: Buffer, checksum: string };

    this.userDataSaveTemp.set(uid, { pdata, checksum });

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
  async getPlayData(ctx: Context) {
    const uid = ctx.token;

    if (!this.userDataSaveTemp.has(uid)) {
      return {
        status: v.s32(1),
        error: v.s32(404),
      }
    }

    const { pdata } = this.userDataSaveTemp.get(uid);

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        pdata: v.bin(pdata),
      }
    }
  }

  @eacnet('p2d')
  async registPlayer(ctx: Context) {
    const uid = ctx.token;
    const { pdata, checksum } = ctx.body as { pdata: Buffer, checksum: string };

    this.userDataSaveTemp.set(uid, { pdata, checksum });

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
  async getRivalInfo() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {},
    }
  }

  @eacnet('p2d')
  async getMusicList() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        status: v.s32(0),
        check_sum: v.str('d4980d5c3436638d4802314993e66a1790075e13022b36979b081c494536d6aa'),
        music_list: {
          music_num: v.s32(MUSIC_LIST.length),
          music: MUSIC_LIST,
        }
      },
    }
  }

  @eacnet('p2d')
  async getCompeScoreData() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {},
    }
  }

  @eacnet('p2d')
  async getMusicData(ctx: Context) {
    const { play_style } = ctx.body as { play_style: number };

    return {
      status: v.s32(0),
      error: v.s32(0),
      play_style: v.s32(play_style),
      result: {},
    }
  }

  @eacnet('p2d')
  async checkPlayData(ctx: Context) {
    const exists = this.userDataSaveTemp.has(ctx.token)

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        infinitas_id: v.str(ctx.token),
        valid: v.bool(exists),
        is_exist: v.bool(exists),
      }
    };
  }

  @eacnet('p2d')
  async getItemList() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        item_list: {
          item_num: v.s32(2),
          item: [{
            item_id: v.str('I1000000'),
            not_free_count: v.s32(0),
            free_count: v.s32(1000),
          }, {
            item_id: v.str('I1000001'),
            not_free_count: v.s32(0),
            free_count: v.s32(1000),
          }]
        }
      }
    };
  }
}
