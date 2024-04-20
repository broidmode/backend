import { KBoolean, KS16, KS32, KS8, KString, KU16, KU32, KU64, KU8 } from "../../utils/kxml-value.js";

export interface SaveData {
  code: KString;
  name: KString;
  sdvx_id: KString;

  creator_id: KU32;

  gamecoin_packet: KU32;
  gamecoin_block: KU32;

  blaster_energy: KU32;
  blaster_count: KU32;

  appeal_id: KU16;

  skill_level: KS16;
  skill_base_id: KS16;
  skill_name_id: KS16;

  hispeed: KS32;
  lanespeed: KU32;
  gauge_option: KU8;
  ars_option: KU8;
  notes_option: KU8;
  early_late_disp: KU8;
  draw_adjust: KS32;
  eff_c_left: KU8;
  eff_c_right: KU8;
  last_music_id: KS32;
  last_music_type: KU8;
  sort_type: KU8;
  narrow_down: KU8;
  headphone: KU8;

  play_count: KU32;
  day_count: KU32;
  today_count: KU32;
  play_chain: KU32;
  max_play_chain: KU32;
  week_count: KU32;
  week_play_count: KU32;
  week_chain: KU32;
  max_week_chain: KU32;
  last_date: KString;
  start_date: KString;

  item: { info?: Item[] };
  item_cloud: { info?: Item[] };
  item_infinite: { info?: Item[] };

  skill: { course?: Course[] };

  param: { info?: Param[] };

  present: { info?: Item[] };
  cloud: { relation: KS8 };
  ea_shop: EaShop;
}

export interface Course {
  ssnid: KS16;
  crsid: KS16;
  st: KS16;
  sc: KS32;
  ex: KS32;
  ct: KS16;
  gr: KS16;
  ar: KS16;
  cnt: KS16;
}

export interface EaShop {
  blaster_pass_enable: KBoolean;
  blaster_pass_limit_date: KU64;
  shop_item: {
    item?: Item[];
  }
}

export interface Item {
  type: KU8;
  id: KU32;
  param: KU32;
}

export interface Param {
  type: KS32;
  id: KS32;
  param: KS32;
}
