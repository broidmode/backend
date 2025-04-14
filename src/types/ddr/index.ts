export * from './db.js'

export type PlayerRecordType = 'COMMON' | 'OPTION' | 'LAST' | 'RIVAL';

export interface EventRecord {
  eventid: number;
  eventtype: number;
  eventno: number;
  comptime: number;
  savedata: number;
}

export interface NoteRecord {
  stagenum: number
  mcode: number
  notetype: number
  rank: number
  clearkind: number
  score: number
  exscore: number
  maxcombo: number
  life: number
  fastcount: number
  slowcount: number
  judge_marvelous: number
  judge_perfect: number
  judge_great: number
  judge_good: number
  judge_boo: number
  judge_miss: number
  judge_ok: number
  judge_ng: number
  calorie: number
  ghostsize: number
  ghost: string
  opt_speed: number
  opt_boost: number
  opt_appearance: number
  opt_turn: number
  opt_dark: number
  opt_scroll: number
  opt_arrowcolor: number
  opt_cut: number
  opt_freeze: number
  opt_jump: number
  opt_arrowshape: number
  opt_filter: number
  opt_guideline: number
  opt_gauge: number
  opt_judgepriority: number
  opt_timing: number
  basename: string
  title_b64: string
  artist_b64: string
  bpmMax: number
  bpmMin: number
  level: number
  series: number
  bemaniFlag: number
  genreFlag: number
  limited: number
  region: number
  gr_voltage: number
  gr_stringeam: number
  gr_chaos: number
  gr_freeze: number
  gr_air: number
  share: boolean
  endtime: number
  folder: number
  playstyle: number
  measurement: {
    skipped_level: number
    measured_point: string
    measured_level: string
    measured_level_result: number
    recommended: {
      mcode: number
      notetype: number
      priority: number
    }[];
  }
}

export interface UserGameDataReq {
  mode: string;
  refid: string;
  pcbid: string;
  locid: string;
  shoparea: string;
  gamesession: string;
}

export interface UserSaveReq extends UserGameDataReq {
  name: string;
  ddrcode: number;
  playide: number;
  playstyle: number;
  area: number;
  weight100: number;
  shopname: string;
  ispremium: boolean;
  iseapass: boolean;
  istakeover: boolean;
  isrepeater: boolean;
  isgameover: boolean;
  note: NoteRecord[];
  event: EventRecord[];
}

export interface ArcadeLoadReq extends UserGameDataReq {
  ac_releasecode: string;
}

export interface UserLoadReq extends UserGameDataReq {
  is_mat: boolean;
}
