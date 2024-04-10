import { Binary, ObjectId } from "mongodb";

export interface PlayerPlayData {
  _id: string;
  // konami binary xml
  pdata: Binary;
  // sha256 to ^
  check_sum: string;
}

export interface PlayerMusicData {
  player: string;
  music_id: number;
  play_style: number;

  // 1 = B, 5 = L, etc
  score: number[];
  clear_flag: number[];
  miss_count: number[];
  play_num: number[];
  clear_num: number[];
}

export interface PlayerPlayLog {
  _id: ObjectId,
  player: string;
  clock: number,
  music_id: number,
  note_id: number,
  score: number,
  pgreat_count: number,
  great_count: number,
  miss_count: number,
  clear_flag: number,
  stage: number,
  groove_gauge: number,
  mode_id: number,
  mode_sub_id: number,
  fail_detail: number,
  ghost_check_sum: string,
  update_my_best_score: boolean,
  is_limit_score: boolean,
  rival_infinitas_id: string,
  is_compe: boolean,
  compe_id: number,
  compe_music_index: number
  valid_best_option: boolean,
  arrange_0: number,
  arrange_1: number,
  assist: number,
  flip: number,
  ghost: Buffer,
};

export interface PlayerCourseLog {
  _id: ObjectId,
  player: string;
  playstyle: number;
  kind: number;
  grade_id: number;
  stage: CourseStage;
  total: CourseResult;
}

export interface CourseStage {
  stage_num: number;
  clear_flag: number;
  dj_level: number;
  clear_rate: number;
  groove_gage: number;
}

export interface CourseResult {
  clear_type: number;
  max_combo: number;
  clear_rate: number;
  groove_gage: number;
}
