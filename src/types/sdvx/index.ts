import { Binary, ObjectId } from "mongodb";

export interface PlayerPlayData {
  _id: string;
  name: string;
  save_data: Binary;
}

export interface PlayerMusicData {
  _id: ObjectId;
  player: string;

  music_id: number;
  music_type: number;

  score: number;
  exscore: number;
  clear_type: number;
  score_grade: number;
  max_chain: number;
  play_count: number;
  btn_rate: number;
  long_rate: number;
  vol_rate: number;

  best_play_time: Date;
}

export interface PlayerPlayLog {
  _id: ObjectId;
  player: string;
  play_time: Date;
  play_id: number;
  track_no: number;
  music_id: number;
  music_type: number;
  score: number;
  exscore: number;
  clear_type: number;
  score_grade: number;
  max_chain: number;
  just: number;
  critical: number;
  near: number;
  error: number;
  effective_rate: number;
  btn_rate: number;
  long_rate: number;
  vol_rate: number;
  mode: number;
  gauge_type: number;
  notes_option: number;
  online_num: number;
  local_num: number;
  challenge_type: number;
  retry_cnt: number;
  pad_type: number;
  judge: number[];
  drop_frame: number;
  drop_frame_max: number;
  drop_count: number;
  etc: string;
  mix_id: number;
  mix_like: boolean;
  matching: {
    score: number;
  }[];
  is_blaster: boolean;
}
