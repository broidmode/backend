import { p2d } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { fromToken } from "../../utils/laochan-id.js";
import { UserService } from "../../services/p2d/user.js";
import { sha256 } from "../../utils/sha256.js";
import { toKBinXml } from "../../utils/kbinxml.js";
import { ITEM_LIST } from "./index.js";

export class User {
  userService: UserService;

  @p2d()
  async addPoint() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @p2d()
  async reserveChangePoint() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @p2d()
  async sendGradeCertificationLog(ctx: Context) {
    await this.userService.addCourseLog({
      player: ctx.token,
      ...ctx.body,
    });

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @p2d()
  async consumeItem(ctx: Context) {
    const { item_id } = ctx.body;
    const { items_count } = await this.userService.getCustomizeSetting(ctx.token);

    let free_count = 0;
    let not_free_count = 0;

    if (item_id === 'I1000000') {
      not_free_count = items_count.infinitas_ticket;
      free_count = items_count.infinitas_ticket_free;
    } else if (item_id === 'I1000001') {
      not_free_count = items_count.ldisc;
      free_count = 0;
    }

    free_count--;
    if (free_count < 0) {
      free_count = 0;
      not_free_count--;
    }

    if (not_free_count < 0) {
      not_free_count = 0;
    }

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        free_count: v.s32(free_count),
        not_free_count: v.s32(not_free_count),
      }
    };
  }

  @p2d()
  async reserveConsumeItem() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    };
  }

  @p2d()
  async getCustomizeSetting(ctx: Context) {
    const { customize, other_customize } = await this.userService.getCustomizeSetting(ctx.token);

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        customize: customize.map(c => ({
          item_category: v.s32(c.item_category),
          item_id: v.str(c.item_id),
        })),
        other_customize: other_customize.map(c => ({
          item_category: v.s32(c.item_category),
          item_id: v.str(c.item_id),
        })),
      }
    }
  }

  @p2d()
  async gameEnd() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @p2d()
  async getPointList(ctx: Context) {
    const customize = await this.userService.getCustomizeSetting(ctx.token);

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        point_count: v.s32(1),
        point: [{
          point_id: v.str('P0100000'),
          point_num: v.u32(customize.items_count.bit),
        }]
      }
    }
  }

  @p2d()
  async getPrivilegeClient() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        list_num: v.s32(0),
      }
    }
  }

  @p2d()
  async getPrivilegeServer() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        list_num: v.s32(0),
      }
    }
  }

  @p2d()
  async savePlayData(ctx: Context) {
    const { pdata, check_sum } = ctx.body as { pdata: Buffer, check_sum: string };
    const localChecksum = sha256(pdata);

    if (localChecksum != check_sum) {
      ctx.logger.error('pdata checksum unmatch - excepted %s, actual %s', check_sum, localChecksum);
    }

    await this.userService.upsertPDataBinary(ctx.token, pdata, check_sum);

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @p2d()
  async getPlayData(ctx: Context) {
    const result = await this.userService.getPDataBinary(ctx.token);

    if (!result) {
      return {
        status: v.s32(1),
        error: v.s32(404),
      }
    }

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        size: v.s32(result.pdata.length),
        rest_size: v.s32(0),
        check_sum: v.str(result.check_sum),
        pdata: v.bin(result.pdata),
      }
    }
  }

  @p2d()
  async registPlayer(ctx: Context) {
    const { pdata, check_sum } = ctx.body as { pdata: Buffer, check_sum: string };
    const localChecksum = sha256(pdata);

    if (localChecksum != check_sum) {
      ctx.logger.error('pdata checksum unmatch - excepted %s, actual %s', check_sum, localChecksum);
    }

    await this.userService.upsertPDataBinary(ctx.token, pdata, check_sum);

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @p2d()
  async checkPlayData(ctx: Context) {
    const { check_sum } = ctx.body as { check_sum: string };

    const checksum = await this.userService.getPDataChecksum(ctx.token);
    const id = fromToken(ctx.token);

    if (!checksum) {
      return {
        status: v.s32(0),
        error: v.s32(0),
        result: {
          infinitas_id: v.str(id),
          valid: v.bool(false),
          is_exist: v.bool(false),
        }
      };
    }

    if (checksum !== check_sum) {
      return {
        status: v.s32(0),
        error: v.s32(0),
        result: {
          infinitas_id: v.str(id),
          valid: v.bool(false),
          is_exist: v.bool(true),
        }
      };
    }

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        infinitas_id: v.str(id),
        valid: v.bool(true),
        is_exist: v.bool(true),
      }
    };
  }

  @p2d()
  async getRivalInfo(ctx: Context) {
    const rivalData = await this.userService.getPlayerRivalData(ctx.token);
    if (!rivalData.enabled) {
      return {
        status: v.s32(0),
        error: v.s32(0),
        result: {},
      }
    }

    const getRivalDetail = async (id: string, playStyle: number) => {
      const [pdata, musicDatas] = await Promise.all([
        this.userService.getPDataDecoded(id),
        this.userService.getMusicDatas(id, playStyle),
      ]);

      return {
        infinitas_id: v.str(pdata.player.infinitas_id),
        dj_name: v.str(pdata.player.djname),
        shop_name: v.str('Laochan Eacnet'),
        pref_id: v.s32(pdata.player.pref_id),
        grade_id_sp: v.s32(pdata.player.grade_id_sp),
        grade_id_dp: v.s32(pdata.player.grade_id_dp),
        music_data: {
          music: musicDatas.map(data => ({
            music_id: v.s32(data.music_id),
            score: v.s32(data.score),
            clear_flag: v.s32(data.clear_flag),
          })),
        },
        challenges: {},
        comment: {
          status_comment: v.str(''),
          rival_challenge_sweeping_victory: v.str(''),
          rival_challenge_narrow_victory: v.str(''),
        }
      }
    }

    const [spRival, dpRival] = await Promise.all([
      Promise.all(rivalData.sp.map(id => getRivalDetail(id, 0))),
      Promise.all(rivalData.dp.map(id => getRivalDetail(id, 1))),
    ]);

    const rivalInfo = {
      sp: {
        rival_num: v.s32(rivalData.sp.length),
        rival: spRival,
      },
      dp: {
        rival_num: v.s32(rivalData.dp.length),
        rival: dpRival,
      },
    };

    const rival_binary = Buffer.from(toKBinXml('rival_info', rivalInfo).data);
    const rival_checksum = sha256(rival_binary);

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        check_sum: v.str(rival_checksum),
        size: v.s32(rival_binary.length),
        rival_data: v.bin(rival_binary),
        rest_size: v.s32(0),
      },
    }
  }

  @p2d()
  async getCompeScoreData() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {},
    }
  }

  @p2d()
  async getItemList(ctx: Context) {
    const { items_count } = await this.userService.getCustomizeSetting(ctx.token);

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        item_list: {
          item_num: v.s32(2),
          item: [
            ...ITEM_LIST,
            {
              // infinitas ticket
              item_id: v.str('I1000000'),
              not_free_count: v.s32(items_count.infinitas_ticket),
              free_count: v.s32(items_count.infinitas_ticket_free),
            }, {
              // ldisc
              item_id: v.str('I1000001'),
              not_free_count: v.s32(items_count.ldisc),
              free_count: v.s32(0),
            }
          ]
        }
      }
    };
  }
}
