import { generic } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import * as data from '../../datas/sdvx.js';
import { requestEa3 } from "../../utils/ea3.js";
import { SDVX_AC_MODEL } from "./index.js";
import { tokenToCardNumber } from '../../utils/laochan-id.js';
import { cache } from '../../decorators/cache.js';
import { writeFileSync } from "fs";

export class AcRelay {
  @generic()
  async acRelayCommon(ctx: Context): Promise<Serializable> {
    const { status, response } = await requestEa3(ctx.acRelayInfo, SDVX_AC_MODEL, ctx.token);

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(status),
      xrpc_fault_code: v.s32(status),
      response,
    };
  }

  async sv6_play_e(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_play_s(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_hiscore(ctx: Context) {
    return this.acRelayCommon(ctx);
  }

  async sv6_log(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  @cache('sv6_common')
  @generic()
  async sv6_common(ctx: Context): Promise<Serializable> {
    const { status, response } = await requestEa3(ctx.acRelayInfo, SDVX_AC_MODEL, ctx.token);

    // remove notice from response
    response['game']['extend']['info'] = response['game']['extend']['info']
      .filter(v => v['extend_id'].__value !== "1");

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(status),
      xrpc_fault_code: v.s32(status),
      response,
    };
  }

  async sv6_save_m(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_load_r(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_load_m(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_save_c(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_save(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_new(ctx: Context): Promise<Serializable> {
    return this.acRelayCommon(ctx);
  }

  async sv6_load(ctx: Context): Promise<Serializable> {
    // hack for maomani
    // chou xiang amao
    ctx.acRelayInfo.request['cardid'] = v.str(tokenToCardNumber(ctx.token));
    return this.acRelayCommon(ctx);
  }

  @generic()
  async sv6_music_url(ctx: Context): Promise<Serializable> {
    let { music_id } = ctx.body as { music_id: number | number[] };
    if (typeof music_id === 'number') {
      music_id = [music_id];
    }

    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          music: music_id.map(id => {
            const music = data.musicDownloadLinks[id];

            if (!music) {
              return {};
            }

            return {
              music_id: v.s32(id),
              url: v.str(music.url),
              hash: v.str(music.hash),
              size: v.s32(music.size),
            }
          }),
        }
      }
    };
  }
}
