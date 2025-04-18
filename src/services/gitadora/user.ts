import { Db, UpdateResult } from "mongodb";
import { inject, injectable } from "tsyringe";
import { GameSave, MusicData, PlayerData, PlayRecord, Stage } from "../../types/gitadora/index.js";

@injectable()
export class UserService {
  constructor(
    @inject(Db)
    private readonly db: Db,
  ) { }

  get playerDataCol() {
    return this.db.collection<PlayerData>('gitadora_play_data');
  }

  musicDataCol(type: 'gf' | 'dm') {
    return this.db.collection<MusicData>('gitadora_' + type + '_music_data');
  }

  playRecordCol(type: 'gf' | 'dm') {
    return this.db.collection<PlayRecord>('gitadora_' + type + '_play_record');
  }

  private emptyGameSave(): GameSave {
    return {
      playInfo: {
        cabid: 0,
        play: 0,
        playtime: 0,
        playterm: 0,
        session_cnt: 0,
        matching_num: 0,
        extra_stage: 0,
        extra_play: 0,
        extra_clear: 0,
        encore_play: 0,
        encore_clear: 0,
        pencore_play: 0,
        pencore_clear: 0,
        max_clear_diff: 0,
        max_full_diff: 0,
        max_exce_diff: 0,
        clear_num: 0,
        full_num: 0,
        exce_num: 0,
        no_num: 0,
        e_num: 0,
        d_num: 0,
        c_num: 0,
        b_num: 0,
        a_num: 0,
        s_num: 0,
        ss_num: 0,
        last_category: 0,
        last_musicid: -1,
        last_seq: 0,
        disp_level: 0,
      },
      rewardStatus: new Array(50).fill(0),
      customData: {
        playStyle: new Array(50).fill(0),
        custom: new Array(50).fill(0),
      },
      skill: 0,
      favoriteMusic: {
        list1: new Array(100).fill(-1),
        list2: new Array(100).fill(-1),
        list3: new Array(100).fill(-1),
      },
      information: new Array(50).fill(0),
      maxRecord: {
        skill: 0,
        all_skill: 0,
        clear_diff: 0,
        full_diff: 0,
        exce_diff: 0,
        clear_music_num: 0,
        full_music_num: 0,
        exce_music_num: 0,
        clear_seq_num: 0,
        classic_all_skill: 0,
      },
      diffRecord: {
        diff_100_nr: 0,
        diff_150_nr: 0,
        diff_200_nr: 0,
        diff_250_nr: 0,
        diff_300_nr: 0,
        diff_350_nr: 0,
        diff_400_nr: 0,
        diff_450_nr: 0,
        diff_500_nr: 0,
        diff_550_nr: 0,
        diff_600_nr: 0,
        diff_650_nr: 0,
        diff_700_nr: 0,
        diff_750_nr: 0,
        diff_800_nr: 0,
        diff_850_nr: 0,
        diff_900_nr: 0,
        diff_950_nr: 0,
        diff_100_clear: new Array(7).fill(0),
        diff_150_clear: new Array(7).fill(0),
        diff_200_clear: new Array(7).fill(0),
        diff_250_clear: new Array(7).fill(0),
        diff_300_clear: new Array(7).fill(0),
        diff_350_clear: new Array(7).fill(0),
        diff_400_clear: new Array(7).fill(0),
        diff_450_clear: new Array(7).fill(0),
        diff_500_clear: new Array(7).fill(0),
        diff_550_clear: new Array(7).fill(0),
        diff_600_clear: new Array(7).fill(0),
        diff_650_clear: new Array(7).fill(0),
        diff_700_clear: new Array(7).fill(0),
        diff_750_clear: new Array(7).fill(0),
        diff_800_clear: new Array(7).fill(0),
        diff_850_clear: new Array(7).fill(0),
        diff_900_clear: new Array(7).fill(0),
        diff_950_clear: new Array(7).fill(0),
      }
    }
  }

  async findPlayer(token: string): Promise<PlayerData> {
    const player = await this.playerDataCol.findOne({ _id: token }) ?? {
      _id: token,
      gameSave: {}
    } as PlayerData;

    if (!player.gameSave.gf) {
      player.gameSave.gf = this.emptyGameSave();
    }

    if (!player.gameSave.dm) {
      player.gameSave.dm = this.emptyGameSave();
    }

    return player;
  }

  upsertPlayer(token: string, data: Partial<PlayerData>): Promise<UpdateResult<PlayerData>> {
    return this.playerDataCol.updateOne({ _id: token }, {
      $set: data,
    }, { upsert: true });
  }

  findMusicDatas(token: string, type: 'gf' | 'dm'): Promise<MusicData[]> {
    return this.musicDataCol(type).find({ player: token }, { useBigInt64: true }).toArray();
  }

  async updateMusicData(token: string, stage: Stage, type: 'gf' | 'dm'): Promise<void> {
    // make sure meter is bigint
    stage.meter = BigInt(stage.meter);

    const [data, result] = await Promise.all([
      (async () => await this.musicDataCol(type).findOne({
        player: token,
        musicId: stage.musicid,
      }, { useBigInt64: true }) ?? {
        player: token,
        musicId: stage.musicid,
      } as MusicData)(),
      this.playRecordCol(type).insertOne({
        player: token,
        ...stage
      }, { useBigInt64: true }),
    ]);

    if (stage.seq in data.seqs) {
      data.seqs[stage.seq] = {
        fullcombo: stage.fullcombo,
        excellent: stage.excellent,
        clear: stage.clear,
        score: stage.score,
        perc: stage.perc,
        rank: stage.rank,
        meter: stage.meter,
        meterProgress: stage.meter_prog,
        bestRecord: result.insertedId,
      }
    } else {
      const seqData = data.seqs[stage.seq];

      seqData.fullcombo = seqData.fullcombo || stage.fullcombo;
      seqData.excellent = seqData.excellent || stage.excellent;
      seqData.clear = seqData.clear || stage.clear;

      if (stage.perc > seqData.perc) {
        seqData.perc = stage.perc;
        seqData.bestRecord = result.insertedId;
      }

      seqData.rank = Math.max(seqData.rank, stage.rank);
      seqData.score = Math.max(seqData.score, stage.score);

      if (stage.meter_prog > seqData.meterProgress) {
        seqData.meterProgress = stage.meter_prog;
        seqData.meter = stage.meter;
      }
    }

    await this.musicDataCol(type).updateOne({ player: token, musicId: stage.musicid }, {
      $set: data,
    }, { useBigInt64: true });
  }
}
