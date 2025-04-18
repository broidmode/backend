import { UserService } from "../../services/gitadora/user.js";
import { Context } from "../../types.js";
import { Player } from "../../types/gitadora/data.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import { tokenToHash } from "../../utils/laochan-id.js";

export class User {
  userService: UserService;

  knst_cardutil_check(): Serializable {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        knst_cardutil: {
          $status: 0,
          player: {
            $no: 1,
            $state: 2,
          }
        },
      },
    };
  }

  getGameType(ctx: Context): 'gf' | 'dm' {
    if (typeof ctx.body.gametype !== 'string') {
      throw new Error('invaild request');
    }

    if (ctx.body.gametype == 'U32:J:A') {
      return 'gf';
    } else if (ctx.body.gametype == 'U32:J:B') {
      return 'dm';
    }

    throw new Error('unknown game type');
  }

  async knst_gametop_get(ctx: Context): Promise<Serializable> {
    const type = this.getGameType(ctx);
    const [data, musics] = await Promise.all([
      this.userService.findPlayer(ctx.token),
      this.userService.findMusicDatas(ctx.token, type),
    ]);

    const save = data.gameSave[type];

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        knst_gametop: {
          $status: 0,
          player: {
            now_date: v.u64(Date.now()),
            rq_key: v.str('dummy_rq_key'),
            player_info: {
              refid: v.str(tokenToHash(ctx.token)),
              did: v.s32(1),
              cardnumber: v.str(''),
              usercode: v.str(tokenToHash(ctx.token)),
              player_type: v.s8(0),
              name: v.str(''),
              title: v.str(''),
              charaid: v.s32(0),
            },
            playinfo: Object.fromEntries(
              Object.entries(save).map(kv => [kv[0], v.s32(kv[1])])
            ),
            reward: {
              status: v.s32(save.rewardStatus),
            },
            customdata: {
              playstyle: v.s32(save.customData.playStyle),
              custom: v.s32(save.customData.custom),
            },
            skilldata: {
              skill: v.s32(save.skill),
              all_skill: v.s32(data.gameSave.gf.skill + data.gameSave.dm.skill),
              old_skill: v.s32(-1),
              old_all_skill: v.s32(-1),
            },
            ranking: {
              skill: {
                rank: v.s32(1),
                total_nr: v.s32(1),
              },
              all_skill: {
                rank: v.s32(1),
                total_nr: v.s32(1),
              }
            },
            secretmusic: {},
            favoritemusic: {
              list_1: v.s32(save.favoriteMusic.list1),
              list_2: v.s32(save.favoriteMusic.list2),
              list_3: v.s32(save.favoriteMusic.list3),
            },
            information: {
              info: v.u32(save.information),
            },
            record: {
              gf: {
                max_record: Object.fromEntries(
                  Object.entries(data.gameSave.gf.maxRecord).map(kv => [kv[0], v.s32(kv[1])])
                ),
                diff_record: Object.fromEntries(
                  Object.entries(data.gameSave.gf.maxRecord).map(kv => [kv[0], v.s32(kv[1])])
                ),
              },
              dm: {
                max_record: Object.fromEntries(
                  Object.entries(data.gameSave.dm.maxRecord).map(kv => [kv[0], v.s32(kv[1])])
                ),
                diff_record: Object.fromEntries(
                  Object.entries(data.gameSave.dm.maxRecord).map(kv => [kv[0], v.s32(kv[1])])
                ),
              },
            },
            stage_result: {},
            rockwave: {},
            mp_list: {},
            musiclist: {
              $nr: musics.length,
              musicdata: musics.map(m => {
                let bestSeq = -1;
                let bestScore = -1;
                const mdata = [
                  -1,
                  -2, -2, -2, -2, -2, -2, -2, -2,
                  -1, -1, -1, -1, -1, -1, -1, -1,
                ];
                const meter = new Array(8).fill(0);
                const meterProg = new Array(8).fill(0);

                for (const seq in m.seqs) {
                  const rec = m.seqs[seq];
                  if (rec.score > bestScore) {
                    bestScore = rec.score;
                    bestSeq = +seq;
                  }

                  mdata[+seq] = rec.clear ? rec.perc : -1;
                  mdata[8 + seq] = rec.rank;
                  meter[+seq] = rec.meter;
                  meterProg[+seq] = rec.meterProgress;
                }

                return {
                  $musicid: m.musicId,
                  flag: v.u16([0, 0, 0, 0]),
                  sdata: v.s16([bestSeq, bestScore]),
                  mdata: v.s16(mdata),
                  meter: v.u64(meter),
                  meter_prog: v.s16(meterProg),
                }
              }),
            },
            finish: v.bool(true),
          },
        },
      },
    };
  }

  async knst_gameend_regist(ctx: Context): Promise<Serializable> {
    const type = this.getGameType(ctx);
    const player = ctx.body.player as Player;

    await Promise.all([
      this.userService.updateMusicData(ctx.token, ctx.body.player.stage, type),
      this.userService.upsertPlayer(ctx.token, {
        [type]: {
          playInfo: player.playinfo,
          rewardStatus: player.reward.status,
          customData: {
            playStyle: player.customdata.playstyle,
            custom: player.customdata.custom,
          },
          skill: player.skilldata.skill,
          favoriteMusic: {
            list1: player.favoritemusic.music_list_1,
            list2: player.favoritemusic.music_list_2,
            list3: player.favoritemusic.music_list_3,
          },
          information: player.information.info,
          maxRecord: player.record.max,
          diffRecord: player.record.diff,
        },
      })
    ]);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        knst_gameend: {
          $status: 0,
          gamemode: {
            $mode: 'game_mode',
          },
          player: {
            $no: 1,
            skill: {
              rank: v.s32(1),
              total_nr: v.s32(1),
            },
            all_skill: {
              rank: v.s32(1),
              total_nr: v.s32(1),
            }
          }
        },
      },
    }
  }
}
