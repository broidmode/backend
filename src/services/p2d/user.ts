import { Binary, Db } from "mongodb";
import { eacnet } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { v } from "../../utils/kxml-value.js";
import { ITEM_LIST, MUSIC_LIST } from "./index.js";
import { PlayerMusicData, PlayerPlayData } from "../../database/index.js";

export class User {
  db: Db;

  get playDataCol() {
    return this.db.collection<PlayerPlayData>('player_play_data');
  }

  get playMusicCol() {
    return this.db.collection<PlayerMusicData>('player_music_data');
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

    await this.playDataCol
      .updateOne({ _id: uid }, {
        $set: {
          pdata: new Binary(pdata),
          checksum: checksum,
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
        pdata: v.bin(result.pdata.buffer),
      }
    }
  }

  @eacnet('p2d')
  async registPlayer(ctx: Context) {
    const uid = ctx.token;
    const { pdata, checksum } = ctx.body as { pdata: Buffer, checksum: string };

    await this.playDataCol
      .insertOne({ _id: uid, pdata: new Binary(pdata), checksum });

    // this.userDataSaveTemp.set(uid, { pdata, checksum });

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
        check_sum: v.str('f57959c468c9c59c47a4cead973f59fbec72eaa53a790c5b792222148e69c19d'),
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
      result: {
        music: MUSIC_LIST.map(music => ({
          music_id: music.music_id,
          score: v.s32([9999, 9999, 9999, 9999]),
          clear_flag: v.s32([7, 7, 7, 7]),
          miss_count: v.s32([0, 0, 0, 0]),
          play_num: v.s32([1, 1, 1 ,1]),
          clear_num: v.s32([1, 1, 1 ,1]),
        }))
      },
    }
  }

  @eacnet('p2d')
  async checkPlayData(ctx: Context) {
    const count = await this.playDataCol.countDocuments({ _id: ctx.token });

    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        infinitas_id: v.str(ctx.token),
        valid: v.bool(count),
        is_exist: v.bool(count),
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
