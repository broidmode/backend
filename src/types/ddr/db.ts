import { PlayerRecordType } from "./index.js";

export interface PlayerPlayData {
  _id: string;
  name: string;
  bestClearLevel: number;
  singleGrade: number;
  doubleGrade: number;
  leagueClass: number;
  records: Record<PlayerRecordType, string[]>;
}

export interface PlayerMusicData {
  player: string;
  mcode: number;
  notes: number[][];
}

export interface PlayerPlayRecord {
  player: string;
  mcode: number;
  noteType: number;
  playtime: number;
  playStyle: number;
  rank: number;
  clearKind: number;
  score: number
  exScore: number;
  maxCombo: number;
  life: number;
  judge: {
    fast: number;
    slow: number;
    marvelous: number;
    perfect: number;
    great: number;
    good: number;
    boo: number;
    miss: number;
    ok: number;
    ng: number
  };
  calorie: number;
  ghost: string;
}
