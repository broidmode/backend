import { Binary, Db } from "mongodb";
import { inject, injectable } from "tsyringe";
import { PlayerPlayData, PlayerMusicData, PlayerPlayLog, PlayerCourseLog, PlayerCustomizeSetting } from "../../database/index.js";
import { Pdata } from "../../database/pdata.js";
import { fromKBinXml } from "../../utils/kbinxml.js";

@injectable()
export class UserService {
  /**
   *
   */
  constructor(
    @inject(Db)
    private readonly db: Db,
  ) { }

  get playDataCol() {
    return this.db.collection<PlayerPlayData>('player_play_data');
  }

  get musicDataCol() {
    return this.db.collection<PlayerMusicData>('player_music_data');
  }

  get playLogCol() {
    return this.db.collection<PlayerPlayLog>('player_play_log');
  }

  get courseLogCol() {
    return this.db.collection<PlayerCourseLog>('player_course_log');
  }

  get customizeSettingCol() {
    return this.db.collection<PlayerCustomizeSetting>('player_customize_setting');
  }

  addCourseLog(coruseLog: PlayerCourseLog) {
    return this.courseLogCol.insertOne(coruseLog);
  }

  addPlayLog(playLog: PlayerPlayLog) {
    return this.playLogCol.insertOne(playLog);
  }

  upsertCustomizeSetting(customizeSetting: PlayerCustomizeSetting) {
    return this.customizeSettingCol.updateOne({ _id: customizeSetting._id }, {
      $set: customizeSetting
    }, { upsert: true });
  }

  async getCustomizeSetting(player: string): Promise<PlayerCustomizeSetting> {
    const result = await this.customizeSettingCol.findOne({ _id: player });
    if (result)
      return result;

    return {
      _id: player,
      customize: [
        { item_category: 2, item_id: 'I1100000' },
        { item_category: 3, item_id: 'I1200000' },
        { item_category: 4, item_id: 'I1300000' },
        { item_category: 5, item_id: 'I1400000' },
        { item_category: 6, item_id: 'I1500000' },
        { item_category: 7, item_id: 'I1600000' },
        { item_category: 8, item_id: 'I1700000' },
        { item_category: 11, item_id: 'I1300000' },
        { item_category: 10, item_id: 'I1900000' },
      ],
      other_customize: [
        { item_category: 1, item_id: 'C1000000' },
        { item_category: 2, item_id: 'C1100000' },
        { item_category: 3, item_id: 'C1200000' },
        { item_category: 4, item_id: 'C1300000' },
        // change default to very short
        { item_category: 5, item_id: 'C1400002' },
      ]
    }
  }

  async getPDataChecksum(player: string): Promise<string | undefined> {
    const result = await this.playDataCol.findOne({ _id: player }, {
      projection: {
        check_sum: 1,
      }
    });

    if (result)
      return result.check_sum;

    return undefined;
  }

  async getPDataBinary(player: string): Promise<{ pdata: Buffer, check_sum: string } | undefined> {
    const result = await this.playDataCol.findOne({ _id: player });

    if (!result)
      return undefined;

    return {
      pdata: Buffer.from(result.pdata.buffer),
      check_sum: result.check_sum,
    };
  }

  async getPDataDecoded(player: string): Promise<Pdata | undefined> {
    const binary = await this.getPDataBinary(player);
    if (!binary) return undefined;

    return fromKBinXml(binary.pdata);
  }

  upsertPDataBinary(player: string, pdata: Buffer, check_sum: string) {
    return this.playDataCol
      .updateOne({ _id: player }, {
        $set: {
          pdata: new Binary(pdata),
          check_sum,
        }
      }, { upsert: true });
  }

  getMusicDatas(player: string, play_style: number): Promise<PlayerMusicData[]> {
    return this.musicDataCol.find({
      player, play_style,
    }).toArray();
  }

  async getMusicData(player: string, music_id: number, play_style: number): Promise<PlayerMusicData> {
    const result = await this.musicDataCol.findOne({
      player,
      music_id,
      play_style,
    });

    if (result)
      return result;

    return {
      player,
      music_id,
      play_style,

      score: [0, 0, 0, 0, 0],
      clear_flag: [0, 0, 0, 0, 0],
      miss_count: [-1, -1, -1, -1, -1],
      play_num: [0, 0, 0, 0, 0],
      clear_num: [0, 0, 0, 0, 0],
    };
  }

  upsertMusicData(musicData: PlayerMusicData) {
    return this.musicDataCol.updateOne({
      player: musicData.player,
      music_id: musicData.music_id,
      play_style: musicData.play_style
    }, {
      $set: musicData
    }, {
      upsert: true
    });
  }
}
