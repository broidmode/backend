
export interface Mdb {
  header: {
    data: {
      id: number[];
      format: number;
      chksum: number;
      header_sz: number;
      record_sz: number;
      record_nr: number;
      course_sz: number;
      course_nr: number;
    }
  }
  mdb_data: MdbData[];
  mdb_course: MdbCourse[];
}

export interface MdbCourse {
  course_id: number;
  course_flag: number;
  music_id: number[];
  classics_diff_list: number[];
}

export interface MdbData {
  music_id: number;
  classics_diff_list: number[];
  xg_diff_list: number[];
  pad_diff: number;
  seq_flag: number;
  xg_seq_flag: number;
  contain_stat: number[];
  first_ver: number[];
  first_classic_ver: number[];
  b_long: boolean;
  b_eemall: boolean;
  b_konasta: boolean;
  bpm: number;
  bpm2: number;
  title_ascii?: string;
  order_ascii: number;
  order_kana: number;
  category_kana: number;
  artist_title_ascii?: string;
  artist_order_ascii: number;
  artist_order_kana: number;
  artist_category_kana: number;
  secret: number[];
  xg_secret: number[];
  b_session: boolean;
  xg_b_session: boolean;
  speed: number;
  life: number;
  gf_ofst: number;
  dm_ofst: number;
  chart_list: number[];
  origin: number;
  music_type: number;
  genre: number;
  xg_active_effect_type: number;
  xg_movie_disp_type: number;
  xg_movie_disp_id: number;
  is_remaster: number;
  title_name: string;
  license_disp: number;
  default_music: number[];
  disable_area: number[];
  type_category: number;
  data_ver: number;
  seq_id: number;
  is_classic_seq: number;
  knst_pack: number;
  ifs_ver: number;
  knst_course: number;
}

export interface Stage {
  date_ms: number;
  stage_no: number;
  musicid: number;
  seq: number;
  skill: number;
  new_skill: number;
  clear: boolean;
  auto_clear: boolean;
  fullcombo: boolean;
  excellent: boolean;
  medal: number;
  perc: number;
  new_perc: number;
  rank: number;
  score: number;
  combo: number;
  max_combo_perc: number;
  flags: number;
  phrase_combo_perc: number;
  perfect: number;
  great: number;
  good: number;
  ok: number;
  miss: number;
  perfect_perc: number;
  great_perc: number;
  good_perc: number;
  ok_perc: number;
  miss_perc: number;
  meter: number | bigint;
  meter_prog: number;
  before_meter: number;
  before_meter_prog: number;
  is_new_meter: boolean;
  phrase_data_num: number;
  phrase_addr: number[];
  phrase_type: number[];
  phrase_status: number[];
  phrase_end_addr: number;
  session: Record<'total' | 'gf1' | 'gf2' | 'dm', {
    perc: number;
    perfect: number;
    combo: number;
    synchro_meter: number;
  }>;
}

export interface Player {
  play_mode: number;
  rq_key: string;
  refid: string;
  charaid: number;
  used_app_point: number;
  card_no: string;
  customdata: Customdata;
  playinfo: { [key: string]: number };
  title_parts: TitleParts;
  secretmusic: Secretmusic;
  tutorial: Tutorial;
  information: Information;
  reward: Reward;
  skilldata: Skilldata;
  groove: Groove;
  record: {
    max: Record<string, number>;
    diff: Record<string, number | number[]>;
  };
  battledata: Battledata;
  sessiondata: Sessiondata;
  favoritemusic: Favoritemusic;
  recommend_musicid_list: number[];
  thanks_medal: ThanksMedal;
  skindata: Skindata;
  monthly_skill: MonthlySkill;
  event_skill: EventSkill;
  phrase_combo_challenge: PhraseComboChallenge;
  phrase_combo_challenge_2: PhraseComboChallenge;
  phrase_combo_challenge_3: PhraseComboChallenge;
  phrase_combo_challenge_4: PhraseComboChallenge;
  phrase_combo_challenge_5: PhraseComboChallenge;
  phrase_combo_challenge_6: PhraseComboChallenge;
  phrase_combo_challenge_7: PhraseComboChallenge;
  phrase_combo_challenge_8: PhraseComboChallenge;
  phrase_combo_challenge_9: PhraseComboChallenge;
  phrase_combo_challenge_10: PhraseComboChallenge;
  phrase_combo_challenge_11: PhraseComboChallenge;
  phrase_combo_challenge_12: PhraseComboChallenge;
  phrase_combo_challenge_13: PhraseComboChallenge;
  phrase_combo_challenge_14: PhraseComboChallenge;
  phrase_combo_challenge_15: PhraseComboChallenge;
  phrase_combo_challenge_16: PhraseComboChallenge;
  phrase_combo_challenge_17: PhraseComboChallenge;
  phrase_combo_challenge_18: PhraseComboChallenge;
  phrase_combo_challenge_19: PhraseComboChallenge;
  phrase_combo_challenge_20: PhraseComboChallenge;
  rockwave: Rockwave;
  stage: Stage;
  card: string;
  no: string;
}

export interface Battledata {
  info: Info;
  setting: Setting;
  score: BattledataScore;
}

export interface Info {
  orb: number;
  get_gb_point: number;
  send_gb_point: number;
}

export interface BattledataScore {
  battle_class: number;
  max_battle_class: number;
  battle_point: number;
  win: number;
  lose: number;
  draw: number;
  consecutive_win: number;
  max_consecutive_win: number;
  glorious_win: number;
  max_defeat_skill: number;
  latest_result: number;
}

export interface Setting {
  matching: number;
  info_level: number;
}

export interface Customdata {
  playstyle: number[];
  custom: number[];
}

export interface EventSkill {
  skill: number;
  target_skill_eventid: number[];
}

export interface Favoritemusic {
  music_list_1: number[];
  music_list_2: number[];
  music_list_3: number[];
}

export interface Groove {
  extra_gauge: number;
  encore_gauge: number;
  encore_cnt: number;
  encore_success: number;
  unlock_point: number;
}

export interface Information {
  info: number[];
}

export interface MonthlySkill {
  term: number;
  total_skill: number;
  target_score: TargetScore;
}

export interface TargetScore {
  music: TargetScoreMusic[];
}

export interface TargetScoreMusic {
  seq: number;
  perc: number;
  skill: number;
}

export interface PhraseComboChallenge {
  point: number;
}

export interface Reward {
  status: number[];
}

export interface Rockwave {
  score_list: ScoreList;
}

export interface ScoreList {
  score: ScoreElement[];
}

export interface ScoreElement {
  data_id: number;
  point: number[];
  mtime: number;
  play_cnt: number;
  is_clear: boolean;
}

export interface Secretmusic {
  music: SecretmusicMusic[];
}

export interface SecretmusicMusic {
  musicid: number;
  seq: number;
  kind: number;
}

export interface Sessiondata {
  date_ms: number;
  member: { [key: string]: Member };
}

export interface Member {
  did: number;
}

export interface Skilldata {
  skill: number;
  all_skill: number;
  exist: number[];
  new: number[];
}

export interface Skindata {
  skin: number[];
}

export interface ThanksMedal {
  medal: number;
  granted_total_medal: number;
}

export interface TitleParts {
}

export interface Tutorial {
  progress: number;
  disp_state: number;
}

