import { Binary, Db } from "mongodb";
import { inject, injectable } from "tsyringe";
import { PlayerPlayData, PlayerMusicData, PlayerPlayLog, PlayerCourseLog, PlayerCustomizeSetting, PlayerRivalData } from "../../types/p2d/index.js";
import { Pdata } from "../../types/p2d/pdata.js";
import { fromKBinXml, toObject } from "../../utils/kbinxml.js";

@injectable()
export class UserService {
  constructor(
    @inject(Db)
    private readonly db: Db,
  ) { }

  get playDataCol() {
    return this.db.collection<PlayerPlayData>('p2d_play_data');
  }

  get musicDataCol() {
    return this.db.collection<PlayerMusicData>('p2d_music_data');
  }

  get playLogCol() {
    return this.db.collection<PlayerPlayLog>('p2d_play_log');
  }

  get courseLogCol() {
    return this.db.collection<PlayerCourseLog>('p2d_course_log');
  }

  get customizeSettingCol() {
    return this.db.collection<PlayerCustomizeSetting>('p2d_customize_setting');
  }

  get rivalDataCol() {
    return this.db.collection<PlayerRivalData>('p2d_rival_data');
  }

  addCourseLog(coruseLog: PlayerCourseLog) {
    return this.courseLogCol.insertOne(coruseLog);
  }

  addPlayLog(playLog: PlayerPlayLog) {
    return this.playLogCol.insertOne(playLog);
  }

  getPlayLogs(player: string, skip = 0, limit = 10) {
    return this.playLogCol.find({ player }, {
      sort: { player: 1, clock: -1 },
      skip, limit,
    }).toArray();
  }

  getCourseLogs(player: string, skip = 0, limit = 10) {
    return this.courseLogCol.find({ player }, {
      sort: { player: 1, _id: -1 },
      skip, limit,
    }).toArray();
  }

  upsertCustomizeSetting(customizeSetting: PlayerCustomizeSetting) {
    return this.customizeSettingCol.updateOne({ _id: customizeSetting._id }, {
      $set: customizeSetting
    }, { upsert: true });
  }

  async getCustomizeSetting(player: string): Promise<PlayerCustomizeSetting> {
    const result = await this.customizeSettingCol.findOne({ _id: player });
    if (result) {
      result.items_count ??= {
        bit: 15000,
        ldisc: 5,
        infinitas_ticket: 50,
        infinitas_ticket_free: 9,
      };

      if (!result.customize.find(v => v.item_category === 12)) {
        result.customize.push({ item_category: 12, item_id: 'I2100000' });
      }

      return result;
    }

    return {
      _id: player,
      items_count: {
        bit: 15000,
        ldisc: 5,
        infinitas_ticket: 50,
        infinitas_ticket_free: 9,
      },
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
        { item_category: 12, item_id: 'I2100000' },
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

  async findPlayerByInfasId(infinitas_id: string): Promise<{ player: string, djname: string } | undefined> {
    const result = await this.playDataCol.findOne({ infinitas_id }, {
      projection: {
        _id: 1, djname: 1,
      }
    });

    if (result)
      return { player: result._id, djname: result.djname };

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

    return toObject(fromKBinXml(binary.pdata)).pdata;
  }

  upsertPDataBinary(player: string, pdata: Buffer, check_sum: string) {
    const unpacked = toObject(fromKBinXml(pdata)) as { pdata: Pdata };
    const { djname, infinitas_id } = unpacked.pdata.player;

    return this.playDataCol
      .updateOne({ _id: player }, {
        $set: {
          djname, infinitas_id,

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

  getPlayLog(player: string, clock: number): Promise<PlayerPlayLog> {
    return this.playLogCol.findOne({
      player, clock,
    });
  }

  async getMusicData(player: string, music_id: number, play_style: number): Promise<PlayerMusicData> {
    const result = await this.musicDataCol.findOne({
      player,
      music_id,
      play_style,
    });

    if (result) {
      result.best_score_clock ??= [-1, -1, -1, -1, -1];
      return result;
    }

    return {
      player,
      music_id,
      play_style,

      score: [0, 0, 0, 0, 0],
      clear_flag: [0, 0, 0, 0, 0],
      miss_count: [-1, -1, -1, -1, -1],
      play_num: [0, 0, 0, 0, 0],
      clear_num: [0, 0, 0, 0, 0],
      best_score_clock: [-1, -1, -1, -1, -1],
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

  async getPlayerRivalData(player: string): Promise<PlayerRivalData> {
    const result = await this.rivalDataCol.findOne({ _id: player });

    if (result) {
      if (!result.dp) result.dp = [];
      if (!result.sp) result.sp = [];

      return result;
    }

    return {
      _id: player,
      enabled: false,
      sp: [],
      dp: [],
    }
  }

  upsertPlayerRivalData(rivalData: PlayerRivalData) {
    return this.rivalDataCol.updateOne({
      _id: rivalData._id
    }, {
      $set: rivalData
    }, {
      upsert: true,
    });
  }
}
