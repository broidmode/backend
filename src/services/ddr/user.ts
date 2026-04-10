import { inject, injectable } from 'tsyringe';
import { Db } from 'mongodb';
import { NoteRecord, PlayerMusicData, PlayerPlayData, PlayerPlayRecord } from '../../types/ddr/index.js';

@injectable()
export class UserService {
  constructor(
    @inject(Db)
    private readonly db: Db,
  ) {
  }

  get playDataCol() {
    return this.db.collection<PlayerPlayData>('ddr_play_data');
  }

  get playerMusicCol() {
    return this.db.collection<PlayerMusicData>('ddr_music_data');
  }

  get playRecordCol() {
    return this.db.collection<PlayerPlayRecord>('ddr_play_record');
  }

  findPlayData(token: string): Promise<PlayerPlayData> {
    return this.playDataCol.findOne({ _id: token });
  }

  async upsertPlayData(data: PlayerPlayData): Promise<void> {
    await this.playDataCol.updateOne({ _id: data._id }, {
      $set: data,
    }, { upsert: true });
  }

  async insertPlayRecords(records: PlayerPlayRecord[]): Promise<void> {
    if (!records.length) {
      return;
    }
    await this.playRecordCol.insertMany(records, {
      ordered: false,
    });
  }

  async updateMusicData(player: string, record: NoteRecord): Promise<void> {
    const data = await this.playerMusicCol.findOne({ player, mcode: record.mcode }) ?? {
      player,
      mcode: record.mcode,
      notes: [],
    } as PlayerMusicData;

    while (data.notes.length < record.notetype + 1) {
      data.notes.push([0, 0, 0, 0, 0]);
    }

    let [playCount, rank, clearKind, score] = data.notes[record.notetype];

    playCount++;
    rank = playCount === 1 ? record.rank : Math.min(record.rank, rank);
    clearKind = Math.max(record.clearkind, clearKind);
    score = Math.max(record.score, score);

    data.notes[record.notetype] = [playCount, rank, clearKind, score, 0];

    await this.playerMusicCol.updateOne({ player, mcode: record.mcode }, { $set: data }, { upsert: true });
  }

  findMusicDatas(player: string): Promise<PlayerMusicData[]> {
    return this.playerMusicCol.find({ player }).toArray();
  }
}
