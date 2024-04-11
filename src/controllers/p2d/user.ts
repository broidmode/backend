import { eacnet } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { ITEM_LIST, MUSIC_LIST } from "./index.js";
import { PlayerPlayLog } from "../../database/index.js";
import { fromToken } from "../../utils/laochan-id.js";
import { UserService } from "../../services/p2d/user.js";

export class User {
  userService: UserService;


  @eacnet('p2d')
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

  @eacnet('p2d')
  async consumeItem() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        free_count: v.s32(1000),
        not_free_count: v.s32(1000),
      }
    };
  }

  @eacnet('p2d')
  async reserveConsumeItem() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    };
  }

  @eacnet('p2d')
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
        point_count: v.s32(1),
        point: [{
          point_id: v.str('P0100000'),
          point_num: v.u32(114514),
        }]
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
  async reportMusicResult(ctx: Context) {
    const result = ctx.body as PlayerPlayLog;
    result.player = ctx.token;

    let updateTask = Promise.resolve();

    const play_style = Math.floor(result.note_id / 5);
    const diff = result.note_id % 5;

    updateTask = (async () => {
      const musicData = await this.userService.getMusicData(result.player, result.music_id, play_style);

      if (result.clear_flag > musicData.clear_flag[diff])
        musicData.clear_flag[diff] = result.clear_flag;

      if (result.miss_count < musicData.miss_count[diff] || musicData.miss_count[diff] == -1)
        musicData.miss_count[diff] = result.miss_count;

      if (result.score > musicData.score[diff])
        musicData.score[diff] = result.score;

      if (result.clear_flag >= 2)
        musicData.clear_num[diff]++;

      musicData.play_num[diff]++;

      this.userService.upsertMusicData(musicData);
    })();

    await Promise.all([
      this.userService.addPlayLog(result),
      updateTask,
    ])

    return {
      status: v.s32(0),
      error: v.s32(0),
    };
  }

  @eacnet('p2d')
  async savePlayData(ctx: Context) {
    const { pdata, check_sum } = ctx.body as { pdata: Buffer, check_sum: string };

    await this.userService.upsertPDataBinary(ctx.token, pdata, check_sum);

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
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

  @eacnet('p2d')
  async registPlayer(ctx: Context) {
    const { pdata, check_sum } = ctx.body as { pdata: Buffer, check_sum: string };

    await this.userService.upsertPDataBinary(ctx.token, pdata, check_sum);

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
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
        check_sum: v.str('2e49eba0b6ca8b6898f5d684ea0c3bc1ed6f1d572a4d308cf32727d64069a588'),
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

    const musicDatas = await this.userService.getMusicDatas(ctx.token, play_style);

    return {
      status: v.s32(0),
      error: v.s32(0),
      play_style: v.s32(play_style),
      result: {
        music: musicDatas.map(data => ({
          music_id: v.s32(data.music_id),
          score: v.s32(data.score),
          clear_flag: v.s32(data.clear_flag),
          miss_count: v.s32(data.miss_count),
          play_num: v.s32(data.play_num),
          clear_num: v.s32(data.clear_num),
        }))
      },
    }
  }

  @eacnet('p2d')
  async getItemList() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        item_list: {
          item_num: v.s32(ITEM_LIST.length),
          item: ITEM_LIST.map(id => ({
            item_id: v.str(id),
            not_free_count: v.s32(1000),
            free_count: v.s32(1000),
          }))
        }
      }
    };
  }
}
