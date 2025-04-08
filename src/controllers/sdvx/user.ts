import * as data from '../../datas/sdvx.js';
import { tokenToCardNumber, tokenToHash, tokenToSnsId } from "../../utils/laochan-id.js";
import { Context } from "../../types.js";
import { generic } from '../../decorators/eacnet.js';
import { KValueG, Serializable, ValueTypes, v } from '../../utils/kxml-value.js';
import { UserService } from '../../services/sdvx/user.js';
import { Item, Param } from '../../types/sdvx/savedata.js';
import { dateToString } from '../../utils/time.js';

function trySet<T>(kvalue: KValueG<ValueTypes, T>, value: T) {
  if (value === undefined || value === null)
    return;

  kvalue.__value = value;
}

function tryAdd(kvalue: KValueG<ValueTypes, number>, value: number) {
  if (value === undefined || value === null)
    return;

  if (kvalue.__value instanceof Array)
    return;

  kvalue.__value += value;
}

export function tryMergeItem(params: Item[], newParams: object[]) {
  if (!params) {
    params = [];
  }

  if (!newParams) {
    return params;
  }

  if (!(newParams instanceof Array)) {
    newParams = [newParams];
  }

  for (const np of newParams) {
    const target = params.find(p => p.id.__value === np['id'] && p.type.__value === np['type']);

    if (target) {
      target.type = v.u8(np['type']);
      target.param = v.u32(np['param']);
      continue;
    }

    params.push({
      type: v.u8(np['type']),
      id: v.u32(np['id']),
      param: v.u32(np['param']),
    })
  }

  return params;
}

export function tryMergeParam(params: Param[], newParams: object[]) {
  if (!params) {
    params = [];
  }

  if (!newParams) {
    return params;
  }

  if (!(newParams instanceof Array)) {
    newParams = [newParams];
  }

  for (const np of newParams) {
    const target = params.find(p => p.id.__value === np['id'] && p.type.__value === np['type']);

    if (target) {
      target.param = v.s32(np['param']);
      continue;
    }

    params.push({
      type: v.s32(np['type']),
      id: v.s32(np['id']),
      param: v.s32(np['param']),
    })
  }

  return params;
}

export class User {
  userService: UserService;

  @generic()
  async sv6_save_c(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          play_id: v.u32(Math.floor(new Date().valueOf() / 6e4)),
        },
      }
    };
  }

  @generic()
  async sv6_save(ctx: Context): Promise<Serializable> {
    const playData = await this.userService.getPlayerData(ctx.token);
    if (!playData) {
      return {
        status: v.s32(0),
        error_code: v.s32(0),
        xrpc_status_code: v.s32(1),
        xrpc_fault_code: v.s32(404),
      };
    }

    const newData = ctx.body;

    trySet(playData.appeal_id, newData.appeal_id);

    trySet(playData.skill_level, newData.skill_level);
    trySet(playData.skill_base_id, newData.skill_base_id);
    trySet(playData.skill_name_id, newData.skill_name_id);

    tryAdd(playData.blaster_energy, newData.earned_blaster_energy);
    tryAdd(playData.gamecoin_packet, newData.earned_gamecoin_packet);
    tryAdd(playData.gamecoin_block, newData.earned_gamecoin_block);

    tryAdd(playData.play_count, 1);

    trySet(playData.hispeed, newData.hispeed);
    trySet(playData.lanespeed, newData.lanespeed);
    trySet(playData.gauge_option, newData.gauge_option);
    trySet(playData.ars_option, newData.ars_option);
    trySet(playData.notes_option, newData.notes_option);
    trySet(playData.early_late_disp, newData.early_late_disp);
    trySet(playData.draw_adjust, newData.draw_adjust);
    trySet(playData.eff_c_left, newData.eff_c_left);
    trySet(playData.eff_c_right, newData.eff_c_right);
    trySet(playData.last_music_id, newData.music_id);
    trySet(playData.last_music_type, newData.music_type);
    trySet(playData.sort_type, newData.sort_type);
    trySet(playData.narrow_down, newData.narrow_down);
    trySet(playData.headphone, newData.headphone);

    playData.item.info = tryMergeItem(playData.item.info, newData.item?.info);
    playData.item_infinite.info = tryMergeItem(playData.item_infinite.info, newData.item_infinite?.info);
    playData.param.info = tryMergeParam(playData.param.info, newData.param?.info);

    playData.last_date = v.str(dateToString(new Date()));

    if (!await this.userService.savePlayerData(ctx.token, playData)) {
      ctx.logger.error('play data save failed');
    }

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: { $status: 0 },
      }
    };
  }

  @generic()
  async sv6_new(ctx: Context): Promise<Serializable> {
    await this.userService.createEmptyPlayerData(ctx.token, ctx.body.name);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
        }
      }
    };
  }

  @generic()
  async sv6_load(ctx: Context): Promise<Serializable> {
    const playData = await this.userService.getPlayerData(ctx.token);

    if (!playData) {
      return {
        status: v.s32(0),
        error_code: v.s32(0),
        xrpc_status_code: v.s32(0),
        xrpc_fault_code: v.s32(0),
        response: {
          game: {
            $status: 0,
            result: v.u8(1),
          }
        }
      }
    }

    // blaster pass
    playData.ea_shop.blaster_pass_enable = v.bool(true);
    playData.ea_shop.blaster_pass_limit_date = v.u64(new Date().valueOf() + (30 * 60 * 60 * 1000));

    // unlock all navigaters
    playData.item.info = tryMergeItem(playData.item.info, data.charaItems);
    playData.start_date = v.str(dateToString(new Date()));

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          result: v.u8(0),
          ...playData,
        }
      }
    };
  }

  @generic()
  async getItemList(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        item_num: v.s32(data.itemList.length),
        item: data.itemList.map(id => ({
          item_id: v.str(id),
          not_free_count: v.s32(1),
          free_count: v.s32(0),
        })),
      }
    };
  }
}
