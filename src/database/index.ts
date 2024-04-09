import { Binary } from "mongodb";

export interface PlayerInfo {
  _id: string;
  rivals: string[];
  pointCount: number;
  customize: {
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    11: string;
    10: string;
  },
  otherCustomize: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
  }
}

export interface PlayerPlayData {
  _id: string;
  pdata: Binary;
  checksum: string;
}

export interface PlayerMusicData {
  player: string;
  musicId: string;
  clearFlag: {
    spb: number;
    spn: number;
    sph: number;
    spa: number;
    spl: number;
    dpb: number;
    dpn: number;
    dph: number;
    dpa: number;
    dpl: number;
  };
  score: {
    spb: number;
    spn: number;
    sph: number;
    spa: number;
    spl: number;
    dpb: number;
    dpn: number;
    dph: number;
    dpa: number;
    dpl: number;
  };
  missCount: {
    spb: number;
    spn: number;
    sph: number;
    spa: number;
    spl: number;
    dpb: number;
    dpn: number;
    dph: number;
    dpa: number;
    dpl: number;
  };
}
