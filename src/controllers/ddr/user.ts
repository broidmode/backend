import { generic } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import { musicPackMax } from "../../datas/ddr.js";
import { constants } from "node:fs";

export class User {
  async _usernew(token: string): Promise<Serializable> {
    return {};
  }

  async _userload(token: string): Promise<Serializable> {
    return {};
  }

  async _ghostload(token: string): Promise<Serializable> {
    return {};
  }

  async _usersave(token: string, data: any): Promise<Serializable> {
    return {};
  }

  async _rivalload(token: string, data: any): Promise<Serializable> {
    return {};
  }

  async _inheritance(token: string, data: any): Promise<Serializable> {
    return {};
  }

  async _arcadeload(token: string, data: any): Promise<Serializable> {
    return {};
  }

  async _linkage_pre_playable(token: string, data: any): Promise<Serializable> {
    return {};
  }

  async _mpackload() {
    return {
      mpacklist: new Array(musicPackMax).map(() => ({
        pre_playable_id: v.str(''),
        permit_freeplay: v.bool(false),
        is_purchased: v.bool(true),
      })),
    }
  }

  @generic()
  async usergamedata_advanced(ctx: Context): Promise<Serializable> {
    const { data: { mode } } = ctx.body as {
      data: {
        mode: string,
        refid: string,
      }
    };

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        playerdata_2: await {
          'usernew': this._usernew,
          'userload': this._userload,
          'ghostload': this._ghostload,
          'usersave': this._usersave,
          'rivalload': this._rivalload,
          'inheritance': this._inheritance,
          'arcadeload': this._arcadeload,
          'mpackload': this._mpackload,
          'linkage_pre_playable': this._linkage_pre_playable,
        }[mode].apply(this, [ctx.token, ctx.body]),
      }
    }
  }
}
