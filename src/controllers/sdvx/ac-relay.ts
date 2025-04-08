import { generic } from "../../decorators/eacnet.js";
import { Context } from "../../types.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import * as data from '../../datas/sdvx.js';

export class AcRelay {
  @generic()
  async sv6_play_e(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
        },
      }
    };
  }

  @generic()
  async sv6_play_s(): Promise<Serializable> {
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
  async sv6_hiscore() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          sc: {},
        }
      }
    };
  }

  @generic()
  async sv6_log(): Promise<Serializable> {
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
  async sv6_common(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          music: {},
          event: {
            info: data.eventList.map(id => ({
              event_id: v.str(id),
            }))
          },
          extend: {
            info: data.extendInfos,
          },
          music_limited: {
            info: data.musicInfos,
          },
          skill_course: {
            info: data.skillCourses,
          },
          appealcard: {},
          valgene: {},
        }
      }
    }
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
