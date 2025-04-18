import { inject, singleton } from "tsyringe";
import { Combine } from "../../utils/combine.js";
import { EacGeneric } from "../eac-generic.js";
import { User } from "./user.js";
import { generic } from "../../decorators/eacnet.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import { event, musicinfo } from "../../datas/gitadora.js";
import { UserService } from "../../services/gitadora/user.js";

@singleton()
export default class extends Combine(EacGeneric, User) {
  constructor(
    @inject(UserService) private readonly userService: UserService,
  ) {
    super();

    this.userService;
  }

  @generic()
  knst_playablemusic_get(): Serializable {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        knst_playablemusic: {
          $status: 0,
          musicinfo,
          hot: {
            major: v.s32(1),
            minor: v.s32(0),
          }
        },
      },
    };
  }

  @generic()
  knst_gameinfo_get(): Serializable {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        knst_gameinfo: {
          $status: 0,
          now_date: v.u64(Date.now()),
          extra: {
            extra_lv: v.u8(0),
            extramusic: {
              music: []
            }
          },
          unlock_challenge: {
            term: v.u8(0),
          },
          ctrl_movie: {},
          ng_jacket: {},
          // TODO: actual sort the musics by play count
          ranking: {
            skill_0_999: {},
            skill_1000_1499: {},
            skill_1500_1999: {},
            skill_2000_2499: {},
            skill_2500_2999: {},
            skill_3000_3499: {},
            skill_3500_3999: {},
            skill_4000_4499: {},
            skill_4500_4999: {},
            skill_5000_5499: {},
            skill_5500_5999: {},
            skill_6000_6499: {},
            skill_6500_6999: {},
            skill_7000_7499: {},
            skill_7500_7999: {},
            skill_8000_8499: {},
            skill_8500_9999: {},
            total: {},
            original: {},
            bemani: {},
            famous: {},
            anime: {},
            band: {},
            western: {},
          },
          processing_report_state: v.u8(0),
          data_ver_limit: {
            type: v.str('data_ver_limit'),
            term: v.u8(0),
            state: v.u8(0),
            start_date: v.str('1970-01-01 09:00:00'),
            end_date: v.str('1970-01-01 09:00:00'),
            start_date_ms: v.u64(0),
            end_date_ms: v.u64(0),
          },
          general_term: {},
          assert_report_state: v.u8(0),
          rockwave: {
            event_list: {
              event,
            }
          }
        }
      }
    };
  }
}
