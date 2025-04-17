
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
