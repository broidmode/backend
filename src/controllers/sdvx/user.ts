import * as data from '../../datas/sdvx.js';
import { tokenToCardNumber, tokenToHash, tokenToSnsId } from "../../utils/laochan-id.js";
import { Context } from "../../types.js";
import { sdvx } from '../../decorators/eacnet.js';
import { KValueG, Serializable, ValueTypes, v } from '../../utils/kxml-value.js';
import { UserService } from '../../services/sdvx/user.js';

function trySave<T>(kvalue: KValueG<ValueTypes, T>, value: T) {
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

export class User {
  userService: UserService;

  @sdvx()
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

    trySave(playData.skill_level, newData.skill_level);
    trySave(playData.skill_base_id, newData.skill_base_id);
    trySave(playData.skill_name_id, newData.skill_name_id);

    tryAdd(playData.blaster_energy, newData.earned_blaster_energy);
    tryAdd(playData.gamecoin_packet, newData.earned_gamecoin_packet);
    tryAdd(playData.gamecoin_block, newData.earned_gamecoin_block);

    trySave(playData.hispeed, newData.hispeed);
    trySave(playData.lanespeed, newData.lanespeed);
    trySave(playData.gauge_option, newData.gauge_option);
    trySave(playData.ars_option, newData.ars_option);
    trySave(playData.notes_option, newData.notes_option);
    trySave(playData.early_late_disp, newData.early_late_disp);
    trySave(playData.draw_adjust, newData.draw_adjust);
    trySave(playData.eff_c_left, newData.eff_c_left);
    trySave(playData.eff_c_right, newData.eff_c_right);
    trySave(playData.last_music_id, newData.music_id);
    trySave(playData.last_music_type, newData.music_type);
    trySave(playData.sort_type, newData.sort_type);
    trySave(playData.narrow_down, newData.narrow_down);
    trySave(playData.headphone, newData.headphone);

    if (newData.item?.info instanceof Array) {
      playData.item.info = [
        ...(playData.item.info ?? []),
        ...newData.item.info.map((info: { id: number; type: number; param: number; }) => ({
          id: v.u8(info.id),
          type: v.u32(info.type),
          param: v.u32(info.param),
        }))
      ]
    }

    if (newData.item_infinite?.info instanceof Array) {
      playData.item_infinite.info = [
        ...(playData.item_infinite.info ?? []),
        ...newData.item_infinite.info.map((info: { id: number; type: number; param: number; }) => ({
          id: v.u8(info.id),
          type: v.u32(info.type),
          param: v.u32(info.param),
        }))
      ]
    }

    if (newData.param?.info instanceof Array) {
      playData.param.info = [
        ...(playData.param.info ?? []),
        ...newData.param.info.map((info: { id: number; type: number; param: number; }) => ({
          id: v.u8(info.id),
          type: v.u32(info.type),
          param: v.u32(info.param),
        }))
      ]
    }

    await this.userService.savePlayerData(ctx.token, playData);

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

  @sdvx()
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

  @sdvx()
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

    // update blaster pass date
    playData.ea_shop.blaster_pass_limit_date = v.u64(new Date().valueOf() + (30 * 60 * 60 * 1000));

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          ...playData,
        }
      }
    };
  }

  @sdvx()
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

  @sdvx()
  async getGoodsList(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        goods_num: v.s32(0),
      }
    };
  }

  @sdvx()
  async getUserIDs(ctx: Context): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        card_num: v.str(tokenToCardNumber(ctx.token)),
        ref_id: v.str(tokenToHash(ctx.token)),
        data_id: v.str(tokenToHash(ctx.token)),
        sns_id: v.str(tokenToSnsId(ctx.token)),
      }
    };
  }

  @sdvx()
  async getSubscriptionStatus(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        subscription: {
          name: v.str('eac_sdvx_basic'),
        },
      }
    };
  }

}
