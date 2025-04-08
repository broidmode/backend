export interface PlayerPlayData {
  _id: string;
  name: string;
  bestClearLevel: number;
  singleGrade: number;
  doubleGrade: number;
  leagueClass: number;
  records: string[];
}

export interface PlayerMusicData {
  player: string;
  mcode: number;
  notes: string[];
}
