import { Binary, Db } from "mongodb";
import { eacnet } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { ITEM_LIST, MUSIC_LIST } from "./index.js";
import { PlayerMusicData, PlayerPlayData, PlayerPlayLog } from "../../database/index.js";
import { fromToken } from "../../utils/laochan-id.js";

export class User {
  db: Db;

  get playDataCol() {
    return this.db.collection<PlayerPlayData>('player_play_data');
  }

  get musicDataCol() {
    return this.db.collection<PlayerMusicData>('player_music_data');
  }

  get playLogCol() {
    return this.db.collection<PlayerPlayLog>('player_play_log');
  }

  @eacnet('p2d')
  async getCustomizeSetting() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        customize: [
          { item_category: v.s32(2), item_id: v.str('I1100000') },
          { item_category: v.s32(3), item_id: v.str('I1200000') },
          { item_category: v.s32(4), item_id: v.str('I1300000') },
          { item_category: v.s32(5), item_id: v.str('I1400000') },
          { item_category: v.s32(6), item_id: v.str('I1500000') },
          { item_category: v.s32(7), item_id: v.str('I1600000') },
          { item_category: v.s32(8), item_id: v.str('I1700000') },
          { item_category: v.s32(11), item_id: v.str('I1300000') },
          { item_category: v.s32(10), item_id: v.str('I1900000') }
        ],
        other_customize: [
          { item_category: v.s32(1), item_id: v.str('C1000000') },
          { item_category: v.s32(2), item_id: v.str('C1100000') },
          { item_category: v.s32(3), item_id: v.str('C1200000') },
          { item_category: v.s32(4), item_id: v.str('C1300000') },
          { item_category: v.s32(5), item_id: v.str('C1400000') }
        ],
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
      const musicData = (await this.musicDataCol.findOne({
        player: result.player,
        music_id: result.music_id,
        play_style: play_style
      })) ?? {
        player: result.player,
        music_id: result.music_id,
        play_style: play_style,

        score: [0, 0, 0, 0, 0],
        clear_flag: [0, 0, 0, 0, 0],
        miss_count: [0, 0, 0, 0, 0],
        play_num: [0, 0, 0, 0, 0],
        clear_num: [0, 0, 0, 0, 0],
      };

      if (result.clear_flag > musicData.clear_flag[diff])
        musicData.clear_flag[diff] = result.clear_flag;

      if (result.miss_count < musicData.miss_count[diff])
        musicData.miss_count[diff] = result.miss_count;

      if (result.score > musicData.score[diff])
        musicData.score[diff] = result.score;

      if (result.clear_flag >= 2)
        musicData.clear_num[diff]++;

      musicData.play_num[diff]++;

      await this.musicDataCol.updateOne({
        player: result.player,
        music_id: result.music_id,
        play_style: play_style
      }, {
        $set: musicData
      }, {
        upsert: true
      });
    })();

    await Promise.all([
      this.playLogCol.insertOne(result),
      updateTask,
    ])

    return {
      status: v.s32(0),
      error: v.s32(0),
    };
  }

  @eacnet('p2d')
  async savePlayData(ctx: Context) {
    const uid = ctx.token;
    const { pdata, check_sum } = ctx.body as { pdata: Buffer, check_sum: string };

    await this.playDataCol
      .updateOne({ _id: uid }, {
        $set: {
          pdata: new Binary(pdata),
          check_sum,
        }
      });

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
  async getPlayData(ctx: Context) {
    const uid = ctx.token;

    const result = await this.playDataCol
      .findOne({ _id: uid });

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
        size: v.s32(result.pdata.length()),
        rest_size: v.s32(0),
        check_sum: v.str(result.check_sum),
        pdata: v.bin(result.pdata.buffer),
      }
    }
  }

  @eacnet('p2d')
  async registPlayer(ctx: Context) {
    const uid = ctx.token;
    const { pdata, check_sum } = ctx.body as { pdata: Buffer, check_sum: string };

    await this.playDataCol
      .insertOne({ _id: uid, pdata: new Binary(pdata), check_sum });

    return {
      status: v.s32(0),
      error: v.s32(0),
    }
  }

  @eacnet('p2d')
  async checkPlayData(ctx: Context) {
    const { check_sum } = ctx.body as { check_sum: string };

    const data = await this.playDataCol.findOne({ _id: ctx.token }, {
      projection: {
        check_sum: 1,
      }
    });

    const id = fromToken(ctx.token);

    if (!data) {
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

    if (data.check_sum !== check_sum) {
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
      result: {
        rival_data: [{

        }]
      },
    }
  }

  @eacnet('p2d')
  async getMusicList() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        status: v.s32(0),
        check_sum: v.str('adb004981ab29df534ef1d8b5e6216b447042f798010c2c1f233eebc058e1b67'),
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

    const musicDatas = await this.musicDataCol.find({
      player: ctx.token,
      play_style,
    }).toArray();

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
