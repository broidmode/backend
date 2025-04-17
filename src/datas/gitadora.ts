import { existsSync, readFileSync } from "node:fs";
import { parser, toObject } from "../utils/kbinxml.js";
import { Serializable, v } from "../utils/kxml-value.js";
import { Mdb } from "../types/gitadora/data.js";

export const musicinfo: Serializable = (() => {
  if (!existsSync('data/mdb_knst.xml')) {
    throw new Error('data/mdb_knst.xml not found!!');
  }

  const xml = readFileSync('data/mdb_knst.xml');
  const mdb = toObject(parser.parse(xml)).mdb as Mdb;

  return {
    $nr: mdb.mdb_data.length,
    music: mdb.mdb_data.map(m => ({
      id: v.s32(m.music_id),
      diff: v.u16(m.xg_diff_list),
      cont_gf: v.bool(!!m.contain_stat[0]),
      cont_dm: v.bool(!!m.contain_stat[1]),
      is_cont: v.bool(true),
      is_secret: v.bool(false),
      is_hot: v.bool(((m.contain_stat[0] & 1) != 0) || ((m.contain_stat[1] & 1) != 0)),
      data_ver: v.s32(m.data_ver),
      knst_pack: v.s32(0), // v.s32(m.knst_pack),
      ifs_ver: v.s32(m.ifs_ver),
    }))
  }
})();

export const event = [{
  data_id: v.s32(8),
  data_version: v.s32(200),
  event_id: v.s32(0),
  event_type: v.s32(18),
  start_date: v.u64(1615510800000),
  end_date: v.u64(4771493999000),
  is_open: v.bool(true),
  bg_no: v.s32(0),
  target_musicid: v.s32([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]),
  clear_border: v.s32(2),
  reward_musicid: v.s32([-1, -1, 2708, 2709]),
  reward_stickerid: v.s32(-1),
  firstbit: v.s32(0),
  event_skill_id: v.s32(0),
  quest_no: v.s32(0),
  url: v.str(''),
},
{
  data_id: v.s32(9),
  data_version: v.s32(200),
  event_id: v.s32(0),
  event_type: v.s32(18),
  start_date: v.u64(1618966800000),
  end_date: v.u64(4771493999000),
  is_open: v.bool(true),
  bg_no: v.s32(0),
  target_musicid: v.s32([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]),
  clear_border: v.s32(2),
  reward_musicid: v.s32([-1, -1, -1, 2710]),
  reward_stickerid: v.s32(-1),
  firstbit: v.s32(0),
  event_skill_id: v.s32(0),
  quest_no: v.s32(0),
  url: v.str(''),
},
{
  data_id: v.s32(87),
  data_version: v.s32(220),
  event_id: v.s32(0),
  event_type: v.s32(3),
  start_date: v.u64(1743469200000),
  end_date: v.u64(1745765999000),
  is_open: v.bool(true),
  bg_no: v.s32(0),
  target_musicid: v.s32([-1, -1, -1, -1, -1, -1, -1, -1, -1, -1]),
  clear_border: v.s32(25000000),
  reward_musicid: v.s32([-1, -1, -1, 1118]),
  reward_stickerid: v.s32(-1),
  firstbit: v.s32(0),
  event_skill_id: v.s32(0),
  quest_no: v.s32(62),
  url: v.str(''),
}];
