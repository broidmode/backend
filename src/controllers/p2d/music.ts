import { PlayerPlayLog } from "../../database/index.js";
import { eacnet } from "../../decorators/eacnet.js";
import { UserService } from "../../services/p2d/user.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { MUSIC_LIST } from "./index.js";

export class Music {
  userService: UserService;

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
}
