import { sdvx } from "../../decorators/eacnet.js";
import { UserService } from "../../services/sdvx/user.js";
import { Serializable, v } from "../../utils/kxml-value.js";

export class Music {
  userService: UserService;

  @sdvx()
  async sv6_load_r(): Promise<Serializable> {
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
  async sv6_load_m(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        game: {
          $status: 0,
          music: {
            info: []
          },
        }
      }
    };
  }
}
