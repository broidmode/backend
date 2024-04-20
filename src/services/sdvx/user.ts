import { Binary, Db, FindOptions } from "mongodb";
import { inject, injectable } from "tsyringe";
import { PlayerMusicData, PlayerPlayData, PlayerPlayLog } from "../../types/sdvx/index.js";
import { tokenToCode, tokenToSdvxId } from "../../utils/laochan-id.js";
import { v } from "../../utils/kxml-value.js";
import { dateToString } from "../../utils/time.js";
import { brotliCompress, brotliDecompress } from "zlib";
import { promisify } from "util";
import { SaveData } from "../../types/sdvx/savedata.js";
import { writeFileSync } from "fs";

@injectable()
export class UserService {
  constructor(
    @inject(Db)
    private readonly db: Db,
  ) { }

  get playDataCol() {
    return this.db.collection<PlayerPlayData>('sdvx_player_data');
  }

  get musicDataCol() {
    return this.db.collection<PlayerMusicData>('sdvx_music_data');
  }

  get playLogCol() {
    return this.db.collection<PlayerPlayLog>('sdvx_play_log');
  }

  getPlayerMusicData(token: string, music_id: number, music_type: number) {
    return this.musicDataCol.findOne({ player: token, music_id, music_type });
  }

  getPlayerMusicDatas(token: string) {
    return this.musicDataCol.find({ player: token }).toArray();
  }

  async upsertMusicData(musicData: PlayerMusicData) {
    return await this.musicDataCol.updateOne({
      player: musicData.player,
      music_id: musicData.music_id,
      music_type: musicData.music_type,
    }, {
      $set: musicData
    }, {
      upsert: true
    });
  };

  async insertPlayLog(playlog: PlayerPlayLog) {
    return this.playLogCol.insertOne(playlog);
  }

  async hasPlayerData(token: string) {
    return !!await this.playDataCol.countDocuments({ _id: token });
  }

  async savePlayerData(token: string, data: SaveData, name?: string): Promise<boolean> {
    const bin = await promisify(brotliCompress)(JSON.stringify(data));
    const $set = {
      save_data: new Binary(bin),
    };

    if (name) {
      $set['name'] = name;
    }

    writeFileSync('pdata.json', await promisify(brotliDecompress)(bin));

    const result = await this.playDataCol.updateOne({ _id: token }, { $set }, { upsert: true })
    return !!(result.modifiedCount ? result.modifiedCount : result.upsertedCount);
  }

  async getPlayerData(token: string, options?: FindOptions): Promise<SaveData | undefined> {
    const result = await this.playDataCol.findOne({ _id: token }, options);
    if (!result)
      return undefined;

    const decompressed = await promisify(brotliDecompress)(result.save_data.buffer)
    return JSON.parse(decompressed.toString('utf-8'));
  }

  async createEmptyPlayerData(token: string, name: string) {
    const save_data = {
      code: v.str(tokenToCode(token)),
      name: v.str(name),
      sdvx_id: v.str(tokenToSdvxId(token)),
      creator_id: v.u32(0),
      gamecoin_block: v.u32(0),
      gamecoin_packet: v.u32(0),
      blaster_energy: v.u32(0),
      blaster_count: v.u32(0),
      appeal_id: v.u16(0),
      skill_level: v.s16(0),
      skill_base_id: v.s16(0),
      skill_name_id: v.s16(0),

      hispeed: v.s32(0),
      lanespeed: v.u32(0),
      gauge_option: v.u8(0),
      ars_option: v.u8(0),
      notes_option: v.u8(0),
      early_late_disp: v.u8(0),
      draw_adjust: v.s32(0),
      eff_c_left: v.u8(0),
      eff_c_right: v.u8(1),
      last_music_id: v.s32(0),
      last_music_type: v.u8(0),
      sort_type: v.u8(0),
      narrow_down: v.u8(0),
      headphone: v.u8(0),

      play_count: v.u32(0),
      day_count: v.u32(0),
      today_count: v.u32(0),
      play_chain: v.u32(0),
      max_play_chain: v.u32(0),
      week_count: v.u32(0),
      week_play_count: v.u32(0),
      week_chain: v.u32(0),
      max_week_chain: v.u32(0),

      last_date: v.str(dateToString(new Date())),
      start_date: v.str(dateToString(new Date())),

      item: {},
      item_cloud: {},
      item_infinite: {},
      skill: {},
      param: {},
      present: {},
      cloud: {
        relation: v.s8(1),
      },
      ea_shop: {
        shop_item: {},
      },
    } as SaveData;

    return this.savePlayerData(token, save_data, name);
  }
}
