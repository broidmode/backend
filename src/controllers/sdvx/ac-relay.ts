import { sdvx } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import * as data from '../../datas/sdvx.js';

export class AcRelay {
  @sdvx()
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
