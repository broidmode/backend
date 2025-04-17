import { Long } from "mongodb";

export interface PlayerData {
  _id: string;
  gameSave: Record<'gf' | 'dm', {
    playCount: number;
    playTime: number;
    playTerm: number;
    // all s32
    playInfo: Record<string, number>;
    tutorial: {
      progress: number;
      displayState: number;
    };
    rewardStatus: number[];
    customData: {
      playStyle: number[];
      custom: number[];
    };
    skill: number;
    favoriteMusic: {
      list1: number[];
      list2: number[];
      list3: number[];
    };
    information: number[];
    maxRecord: Record<string, number>;
    diffRecord: Record<string, number>;
  }>;
}

export interface MusicData {
  type: 'gf' | 'dm';
  player: string;
  musicId: number;

  clearStatus: number;
  rank: number;

  perfect: number;
  great: number;
  good: number;
  ok: number;
  miss: number;

  maxCombo: number;
  score: number;
  flags: number;
  point: number;
  percent: number;

  meter: Long;

  phrase: {
    count: number;
    addr: number[];
    type: number[];
    status: number[];
    endAddr: number;
    comboAerc: number;
  }
}
