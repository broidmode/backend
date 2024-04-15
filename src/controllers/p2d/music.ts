import { PlayerPlayLog } from "../../types/index.js";
import { eacnet } from "../../decorators/eacnet.js";
import { UserService } from "../../services/p2d/user.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { MUSIC_LIST } from "./index.js";
import { Binary } from "mongodb";
import data from './data.json' with { type: "json" };

// user only needs to unlock omni music, which is temporary
const userUnlockMusic = new Map<string, number>();

export class Music {
  userService: UserService;

  @eacnet('p2d')
  async getMusicGhost(ctx: Context) {
    // playstyle is actually chart diff, game is sending wrong request
    // TODO: check game code and maybe patch it later
    const data = ctx.body as {
      music_id: number,
      note_id: number,
      playstyle: number,
      request_ghost: {
        kind: number,
        pref_id: number,
        grade_id: number,
        infinitas_id?: string,
      }[] | {
        kind: number,
        pref_id: number,
        grade_id: number,
        infinitas_id?: string,
      };
    };

    const { music_id, note_id } = data;
    const request_ghost = 'kind' in data.request_ghost ? [data.request_ghost] : data.request_ghost;

    const play_style = Math.floor(note_id / 5);
    const diff = note_id % 5;

    const ghost = await Promise.all(request_ghost.map(async req => {
      if (req.kind == 2) {
        const { player, djname } = await this.userService.findPlayerByInfasId(req.infinitas_id);

        if (!player) {
          return undefined;
        }

        const mdata = await this.userService.getMusicData(player, music_id, play_style);
        if (mdata.best_score_clock[diff] === -1) {
          return undefined;
        }

        const playlog = await this.userService.getPlayLog(player, mdata.best_score_clock[diff]);

        return {
          kind: v.s32(2),
          ex_score: v.s32(playlog.score),
          exist: v.bool(true),
          ghost_data: v.bin(Buffer.from(playlog.ghost.buffer)),
          dj_name: v.str(djname),
          best_option: {
            valid: v.bool(1),
            arrange_0: v.s32(playlog.arrange_0),
            arrange_1: v.s32(playlog.arrange_1),
            assist: v.s32(playlog.assist),
            flip: v.s32(playlog.flip),
          }
        }
      }

      return undefined;
    }));

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        music_id: v.s32(music_id),
        note_id: v.s32(note_id),
        ghost: ghost.filter(v => v),
      },
    };
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

      if (result.score > musicData.score[diff]) {
        musicData.score[diff] = result.score;
        musicData.best_score_clock[diff] = result.clock;
      }

      if (result.clear_flag >= 2)
        musicData.clear_num[diff]++;

      musicData.play_num[diff]++;

      this.userService.upsertMusicData(musicData);
    })();

    // @ts-expect-error ghost is Buffer now, convert it to binary
    result.ghost = new Binary(result.ghost);

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
  async unlockMusic(ctx: Context) {
    const { music: { music_id } } = ctx.body as { music: { music_id: number } };
    userUnlockMusic.set(ctx.token, music_id);

    console.log(music_id);

    return {
      status: v.s32(0),
      error: v.s32(0),
    };
  }

  @eacnet('p2d')
  async getMusicList(ctx: Context) {
    let music = [...MUSIC_LIST];

    if (userUnlockMusic.has(ctx.token)) {
      const targetMusic = userUnlockMusic.get(ctx.token);
      userUnlockMusic.delete(ctx.token);

      const bitData = data.omni_musics.find(v => v.id === targetMusic);

      music = music.filter(v => v.music_id['__value'] !== targetMusic);
      music.push({
        music_id: v.s32(bitData.id),
        kind: v.s32(1),
        note_bit: v.s32(bitData.noteBit),
        music_pack_item_id: v.str(''),
      });
    }

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        status: v.s32(0),
        check_sum: v.str(''),
        music_list: {
          music_num: v.s32(music.length),
          music,
        }
      },
    };
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
