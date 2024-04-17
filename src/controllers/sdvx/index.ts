import { sdvx } from "../../decorators/eacnet.js";
import { Combine } from "../../utils/combine.js";
import config from "../../utils/config.js";
import { v } from "../../utils/kxml-value.js";
import { AcRelay } from "./ac-relay.js";

export default class extends Combine(AcRelay) {
  @sdvx()
  async getItemList() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        item_num: v.s32(0),
      }
    };
  }

  @sdvx()
  async getGoodsList() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        goods_num: v.s32(0),
      }
    };
  }

  @sdvx()
  async getUserIDs() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        card_num: v.str('0123456789ABCDEF'),
        ref_id: v.str('0123456789ABCDEF'),
        data_id: v.str('0123456789ABCDEF'),
        sns_id: v.str('012345678'),
      }
    };
  }

  @sdvx()
  async getSubscriptionStatus() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        subscription: {
          name: v.str('test'),
        },
      }
    };
  }

  @sdvx()
  async heartbeat() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        state: v.s32(1),
        next_clock: v.u64(new Date().valueOf() + 36e5),
        server_state: v.s32(1),
        mainte_start_clock: v.u64(0),
        mainte_end_clock: v.u64(0),
        usta_boot_status: v.s32(1),
        usta_time_remain: v.s32(0),
      }
    };
  }

  @sdvx()
  async checkVersion() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        permission: v.s32(1),
      }
    };
  }

  @sdvx()
  async getServerClock() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        server_clock: v.u64(new Date().valueOf()),
      }
    }
  }

  @sdvx()
  async getServerState() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        server_state: v.s32(1),
        mainte_start_clock: v.u64(0),
        mainte_end_clock: v.u64(0),
      }
    }
  }

  @sdvx('SHIFT_JIS')
  async getServices() {
    return {
      status: v.s32(0),
      error_code: v.s32(0),
      response: {
        service_num: v.s32(18),
        service: [
          {
            service_name: v.str('acRelay'),
            url: v.str(`${config.selfUrl}/need_auth/AcRelay`),
          },
          {
            service_name: v.str('cancelReserveConsumeItem'),
            url: v.str(`${config.selfUrl}/need_auth/CancelReserveConsumeItem`),
          },
          {
            service_name: v.str('checkGameStart'),
            url: v.str(`${config.selfUrl}/need_auth/CheckGameStart`),
          },
          {
            service_name: v.str('checkVersion'),
            url: v.str(`${config.selfUrl}/needless_auth/CheckVersion`),
          },
          {
            service_name: v.str('consumeItem'),
            url: v.str(`${config.selfUrl}/need_auth/ConsumeItem`),
          },
          {
            service_name: v.str('getGoodsList'),
            url: v.str(`${config.selfUrl}/needless_auth/GetGoodsList`),
          },
          {
            service_name: v.str('getHash'),
            url: v.str(`${config.selfUrl}/needless_auth/GetHash`),
          },
          {
            service_name: v.str('getItemList'),
            url: v.str(`${config.selfUrl}/need_auth/GetItemList`),
          },
          {
            service_name: v.str('getLauncherData'),
            url: v.str(`${config.selfUrl}/needless_auth/GetLauncherData`),
          },
          {
            service_name: v.str('getResourceInfo'),
            url: v.str(`${config.selfUrl}/needless_auth/GetResourceInfo`),
          },
          {
            service_name: v.str('getServerClock'),
            url: v.str(`${config.selfUrl}/pre_process/GetServerClock`),
          },
          {
            service_name: v.str('getServerState'),
            url: v.str(`${config.selfUrl}/pre_process/GetServerStatus`),
          },
          {
            service_name: v.str('getServices'),
            url: v.str(`${config.selfUrl}/pre_process/GetServices`),
          },
          {
            service_name: v.str('getSubscriptionStatus'),
            url: v.str(`${config.selfUrl}/need_auth/GetSubscriptionStatus`),
          },
          {
            service_name: v.str('getUserIDs'),
            url: v.str(`${config.selfUrl}/need_auth/GetUserId`),
          },
          {
            service_name: v.str('heartbeat'),
            url: v.str(`${config.selfUrl}/need_auth/Heartbeat`),
          },
          {
            service_name: v.str('reserveConsumeItem'),
            url: v.str(`${config.selfUrl}/need_auth/ReserveConsumeItem`),
          },
          {
            service_name: v.str('uploadFile'),
            url: v.str(`${config.selfUrl}/needless_auth/UploadFile`),
          },

        ],
      }
    };
  }
}
