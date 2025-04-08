import { generic } from "../../decorators/eacnet.js";
import { UserService } from "../../services/sdvx/user.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import { Context } from "../../types.js";
import { PlayerMusicData, PlayerPlayLog } from "../../types/sdvx/index.js";

export class Music {
  userService: UserService;

  @generic()
  async sv6_save_m(ctx: Context): Promise<Serializable> {
    const { track } = ctx.body as { track: PlayerPlayLog };

    track.player = ctx.token;
    track.play_time = new Date();

    const mdata = (await this.userService.getPlayerMusicData(ctx.token, track.music_id, track.music_type)) ?? {
      player: ctx.token,
      music_id: track.music_id,
      music_type: track.music_type,
      score: 0, exscore: 0, clear_type: 0, score_grade: 0,
      max_chain: 0, play_count: 0,
      btn_rate: 0, long_rate: 0, vol_rate: 0,
      best_play_time: track.play_time,
    } as PlayerMusicData;

    if (track.score > mdata.score) {
      mdata.score = track.score;
      mdata.score_grade = track.score_grade;

      mdata.best_play_time = track.play_time;
      mdata.btn_rate = track.btn_rate;
      mdata.long_rate = track.long_rate;
      mdata.vol_rate = track.vol_rate;
    }

    if (track.exscore > mdata.score) {
      mdata.exscore = track.exscore;

      // if score is same, use exscore to compare
      if (track.score == mdata.score) {
        mdata.best_play_time = track.play_time;
        mdata.btn_rate = track.btn_rate;
        mdata.long_rate = track.long_rate;
        mdata.vol_rate = track.vol_rate;
      }
    }

    if (track.clear_type > mdata.clear_type) {
      mdata.clear_type = track.clear_type;
    }

    if (track.max_chain > mdata.max_chain) {
      mdata.max_chain = track.max_chain;
    }

    mdata.play_count++;

    await Promise.all([
      this.userService.insertPlayLog(track),
      this.userService.upsertMusicData(mdata),
    ]);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
        }
      }
    };
  }

  @generic()
  async sv6_load_r(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
        }
      }
    };
  }

  /*
   * music_id diff
   * score exscore clear_type score_grade max_chain play_count btn_rate long_rate vol_rate
   * 0 0 0 0 0 timestamp_s 0 0 0 0 0 0
   */
  @generic()
  async sv6_load_m(ctx: Context): Promise<Serializable> {
    const mdata = await this.userService.getPlayerMusicDatas(ctx.token);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          music: {
            info: mdata.map(d => ({
              date: d.best_play_time,
              param: v.u32([
                d.music_id, d.music_type,
                d.score, d.exscore, d.clear_type, d.score_grade, d.max_chain,
                d.play_count, d.btn_rate, d.long_rate, d.vol_rate,
                0, 0, 0, 0, 0,
                Math.floor(d.best_play_time.valueOf() / 1000),
                0, 0, 0, 0, 0, 0,
              ])
            }))
          },
        }
      }
    };
  }
}
