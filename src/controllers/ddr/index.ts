import { singleton } from "tsyringe";
import { Combine } from "../../utils/combine.js";
import { generic } from "../../decorators/eacnet.js";
import { Serializable, v } from "../../utils/kxml-value.js";
import config from "../../utils/config.js";
import { EacGeneric } from "../eac-generic.js";
import * as data from '../../datas/ddr.js'

@singleton()
export default class extends Combine(EacGeneric) {
  @generic()
  async getItemList(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        item_num: v.s32(1),
        item: {
          item_id: v.str('DDR_TICKET'),
          not_free_count: v.s32(0),
          free_count: v.s32(114514),
          buyable_point: v.s32(0),
        },
      }
    };
  }

  @generic()
  async log_2_save(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        log_2: {
          $status: 0,
        }
      }
    }
  }

  // Get Preview
  @generic()
  async getprev(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        fileinfo_2: {
          $status: 0,
          soundinfo: data.soundInfos,
        }
      }
    };
  }

  @generic()
  async getmusic(): Promise<Serializable> {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      xrpc_status_code: v.s32(0),
      xrpc_fault_code: v.s32(0),
      response: {
        data_2: {
          $status: 0,
          mdb: {
            music: data.musics,
          }
        }
      }
    };
  }
}
