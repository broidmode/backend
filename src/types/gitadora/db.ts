import { ObjectId } from "mongodb";
import { Stage } from "./data.js";

export interface GameSave {
  // all s32
  playInfo: Record<string, number>;
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
  diffRecord: Record<string, number | number[]>;
}

export interface PlayerData {
  _id: string;
  gameSave: {
    [type: string]: GameSave
  };
  secretMusics: number[];
}

export interface MusicData {
  player: string;
  musicId: number;

  seqs: Record<number, {
    clear: boolean;
    fullcombo: boolean;
    excellent: boolean;
    skill: number;
    perc: number;
    rank: number;
    meter: bigint;
    meterProgress: number;
    bestRecord: ObjectId;
  }>;
}

export interface PlayRecord extends Stage {
  player: string;
}
