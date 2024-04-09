import { eacnet } from '../../decorators/eacnet.js';
import { Context } from '../../types.js';
import config from '../../utils/config.js';
import { v } from '../../utils/kxml-value.js';

export class Service {
  @eacnet('p2d')
  async sendLog() {
    return {
      status: v.s32(0),
      error: v.s32(0),
    };
  }

  @eacnet('p2d')
  async getServerState() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        server_state: v.s32(1),
        mainte_start_clock: v.u64(0),
        mainte_end_clock: v.u64(0),
      }
    }
  }

  @eacnet('p2d')
  async getServerClock() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        server_clock: v.u64(new Date().valueOf()),
      }
    }
  }

  @eacnet('p2d')
  async heartbeat(ctx: Context) {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        state: v.s32(1),
        next_clock: v.u64(new Date().valueOf() + 36e5),
        token: v.str(ctx.token),
        time_remain: v.s32(0x7fffffff),
        subscription_status: v.s32(1),
      }
    };
  }

  @eacnet('p2d')
  async checkSendLogAvailable() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        status: v.s32(1),
        daily_count: v.s32(999),
      }
    };
  }

  @eacnet('p2d')
  async getServices() {
    return {
      status: v.s32(0),
      error: v.s32(0),
      result: {
        service_num: v.s32(63),
        service: [
          {
            service_name: v.str(`addPoint`),
            url: v.str(`${config.selfUrl}/needAuth/AddPoint`),
          },
          {
            service_name: v.str(`addPointDirect`),
            url: v.str(`${config.selfUrl}/needAuth/AddPointDirect`),
          },
          {
            service_name: v.str(`cancelReserveChangePoint`),
            url: v.str(
              `${config.selfUrl}/needAuth/CancelReserveChangePoint`,
            ),
          },
          {
            service_name: v.str(`cancelReserveConsumeItem`),
            url: v.str(
              `${config.selfUrl}/needAuth/CancelReserveConsumeItem`,
            ),
          },
          {
            service_name: v.str(`checkChampionshipInfo`),
            url: v.str(
              `${config.selfUrl}/needlessAuth/CheckChampionshipInfo`,
            ),
          },
          {
            service_name: v.str(`checkGameStart`),
            url: v.str(`${config.selfUrl}/preProcess/CheckGameStart`),
          },
          {
            service_name: v.str(`checkGameVersion`),
            url: v.str(`${config.selfUrl}/needlessAuth/CheckGameVersion`),
          },
          {
            service_name: v.str(`checkPlayData`),
            url: v.str(`${config.selfUrl}/needAuth/CheckPlayData`),
          },
          {
            service_name: v.str(`checkPlayableMusicList`),
            url: v.str(
              `${config.selfUrl}/needAuth/CheckPlayableMusicList`,
            ),
          },
          {
            service_name: v.str(`checkSendLogAvailable`),
            url: v.str(
              `${config.selfUrl}/needlessAuth/CheckSendLogAvailable`,
            ),
          },
          {
            service_name: v.str(`checkTakeover`),
            url: v.str(`${config.selfUrl}/needAuth/CheckTakeover`),
          },
          {
            service_name: v.str(`checkUpdate`),
            url: v.str(`${config.selfUrl}/needlessAuth/CheckUpdate`),
          },
          {
            service_name: v.str(`checkVersion`),
            url: v.str(
              `${config.selfUrl}/needlessAuth/CheckLauncherVersion`,
            ),
          },
          {
            service_name: v.str(`consumeItem`),
            url: v.str(`${config.selfUrl}/needAuth/ConsumeItem`),
          },
          {
            service_name: v.str(`gameEnd`),
            url: v.str(`${config.selfUrl}/needAuth/GameEnd`),
          },
          {
            service_name: v.str(`getAdvertise`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetAdvertise`),
          },
          {
            service_name: v.str(`getChampionshipInfo`),
            url: v.str(
              `${config.selfUrl}/needlessAuth/GetChampionshipInfo`,
            ),
          },
          {
            service_name: v.str(`getChampionshipRank`),
            url: v.str(`${config.selfUrl}/needAuth/GetChampionshipRank`),
          },
          {
            service_name: v.str(`getChampionshipRecord`),
            url: v.str(`${config.selfUrl}/needAuth/GetChampionshipRecord`),
          },
          {
            service_name: v.str(`getClearRate`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetClearRate`),
          },
          {
            service_name: v.str(`getCompeScoreData`),
            url: v.str(`${config.selfUrl}/needAuth/GetCompeScoreData`),
          },
          {
            service_name: v.str(`getCustomizeSetting`),
            url: v.str(`${config.selfUrl}/needAuth/GetCustomizeSetting`),
          },
          {
            service_name: v.str(`getDownloadResource`),
            url: v.str(
              'https://d1rc4pwxnc0pe0.cloudfront.net/',
            ),
          },
          {
            service_name: v.str(`getGoodsList`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetGoodsList`),
          },
          {
            service_name: v.str(`getHash`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetHash`),
          },
          {
            service_name: v.str(`getInformation`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetInformation`),
          },
          {
            service_name: v.str(`getItemList`),
            url: v.str(`${config.selfUrl}/needAuth/GetItemList`),
          },
          {
            service_name: v.str(`getItemNum`),
            url: v.str(`${config.selfUrl}/needAuth/GetItemNum`),
          },
          {
            service_name: v.str(`getMusicData`),
            url: v.str(`${config.selfUrl}/needAuth/GetMusicData`),
          },
          {
            service_name: v.str(`getMusicGhost`),
            url: v.str(`${config.selfUrl}/needAuth/GetMusicGhost`),
          },
          {
            service_name: v.str(`getMusicList`),
            url: v.str(`${config.selfUrl}/needAuth/GetMusicList`),
          },
          {
            service_name: v.str(`getPackageList`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetPackageList`),
          },
          {
            service_name: v.str(`getPlayData`),
            url: v.str(`${config.selfUrl}/needAuth/GetPlayData`),
          },
          {
            service_name: v.str(`getPlayableMusicList`),
            url: v.str(`${config.selfUrl}/needAuth/GetPlayableMusicList`),
          },
          {
            service_name: v.str(`getPointList`),
            url: v.str(`${config.selfUrl}/needAuth/GetPointList`),
          },
          {
            service_name: v.str(`getPrivilegeClient`),
            url: v.str(`${config.selfUrl}/needAuth/GetPrivilegeClient`),
          },
          {
            service_name: v.str(`getPrivilegeServer`),
            url: v.str(`${config.selfUrl}/needAuth/GetPrivilegeServer`),
          },
          {
            service_name: v.str(`getResourceInfo`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetFile`),
          },
          {
            service_name: v.str(`getRival`),
            url: v.str(`${config.selfUrl}/needAuth/GetRival`),
          },
          {
            service_name: v.str(`getRivalChallenge`),
            url: v.str(`${config.selfUrl}/needAuth/GetRivalChallenge`),
          },
          {
            service_name: v.str(`getRivalInfo`),
            url: v.str(`${config.selfUrl}/needAuth/GetRivalInfo`),
          },
          {
            service_name: v.str(`getServerClock`),
            url: v.str(`${config.selfUrl}/preProcess/GetServerClock`),
          },
          {
            service_name: v.str(`getServerState`),
            url: v.str(`${config.selfUrl}/preProcess/GetServerState`),
          },
          {
            service_name: v.str(`getServerValues`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetServerValues`),
          },
          {
            service_name: v.str(`getServices`),
            url: v.str(`${config.selfUrl}/preProcess/GetServices`),
          },
          {
            service_name: v.str(`getTemporaryFiles`),
            url: v.str(`${config.selfUrl}/needlessAuth/GetTemporaryFiles`),
          },
          {
            service_name: v.str(`heartbeat`),
            url: v.str(`${config.selfUrl}/needAuth/Heartbeat`),
          },
          {
            service_name: v.str(`loginEX`),
            url: v.str(
              'https://p.eagate.573.jp/game/eac2dx/infinitas/API/page/loginEX.html',
            ),
          },
          {
            service_name: v.str(`registPlayer`),
            url: v.str(`${config.selfUrl}/needAuth/RegistPlayer`),
          },
          {
            service_name: v.str(`reportMusicResult`),
            url: v.str(`${config.selfUrl}/needAuth/ReportMusicResult`),
          },
          {
            service_name: v.str(`reserveChangePoint`),
            url: v.str(`${config.selfUrl}/needAuth/ReserveChangePoint`),
          },
          {
            service_name: v.str(`reserveConsumeItem`),
            url: v.str(`${config.selfUrl}/needAuth/ReserveConsumeItem`),
          },
          {
            service_name: v.str(`saveChampionshipRecord`),
            url: v.str(
              `${config.selfUrl}/needAuth/SaveChampionshipRecord`,
            ),
          },
          {
            service_name: v.str(`savePlayData`),
            url: v.str(`${config.selfUrl}/needAuth/SavePlayData`),
          },
          {
            service_name: v.str(`sendGradeCertificationLog`),
            url: v.str(
              `${config.selfUrl}/needAuth/SendGradeCertificationLog`,
            ),
          },
          {
            service_name: v.str(`sendLog`),
            url: v.str(`${config.selfUrl}/needlessAuth/SendLog`),
          },
          {
            service_name: v.str(`unlockMusic`),
            url: v.str(`${config.selfUrl}/needAuth/UnlockMusic`),
          },
          {
            service_name: v.str(`uploadFile`),
            url: v.str(
              `${config.selfUrl}/needlessAuth/UploadFileMultipart`,
            ),
          },
          {
            service_name: v.str(`urlAgreement`),
            url: v.str(
              'https://p.eagate.573.jp/game/infinitas/2/jump/agreement.html',
            ),
          },
          {
            service_name: v.str(`urlEaShop`),
            url: v.str('https://p.eagate.573.jp/game/eac2dx/jump/eashop.html'),
          },
          {
            service_name: v.str(`urlKAC5th`),
            url: v.str(
              'http://p.eagate.573.jp/game/kac5th/detail.html?id=infinitas&amp;group=outline&amp;lang=ja',
            ),
          },
          {
            service_name: v.str(`usePoint`),
            url: v.str(`${config.selfUrl}/needAuth/UsePoint`),
          },
          {
            service_name: v.str(`usePointDirect`),
            url: v.str(`${config.selfUrl}/needAuth/UsePointDirect`),
          },
        ],
      },
    };
  }
}
