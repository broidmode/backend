import Router from '@koa/router';
import { Context } from '../index.js';
import {UserService} from '../../services/sdvx/user.js';
import { SaveData } from '../../types/sdvx/savedata.js';
import { PlayerMusicData } from '../../types/sdvx/index.js';
import { tokenToCardNumber } from '../../utils/laochan-id.js';
import { toObject } from '../../utils/kbinxml.js';
import { Serializable } from '../../utils/kxml-value.js';

interface SdvxDataExport {
  sdvx_profile: {
    "1": {
      card: string;
      pin: "0000";
      sdvx_id: string;
      version: {
        "6": SaveData;
      }
    }
  }
  sdvx_scores_best: Record<string, PlayerMusicData>;
  skill_scores_best: {};
}

const router = new Router({
  prefix: '/sdvx',
})
  .get('/data_export/:token', async (ctx: Context) => {
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    const userService = ctx.resolve(UserService);

    if (!await userService.hasPlayerData(token)){
      ctx.status = 404;
      return;
    }

    const [playerData, musicDatas] = await Promise.all([
      userService.getPlayerData(token),
      userService.getPlayerMusicDatas(token),
    ]);

    const scoreBests: Record<string, PlayerMusicData> = {};
    musicDatas.forEach((m, i) => {
      scoreBests[i.toString()] = m;
    })

    ctx.status = 200;
    ctx.body = {
      sdvx_profile: {
        "1": {
          card: tokenToCardNumber(token),
          pin: '0000',
          sdvx_id: playerData.sdvx_id.__value as string,
          version:{
            "6": toObject(playerData as unknown as Serializable),
          }
        }
      },
      sdvx_scores_best: scoreBests,
      skill_scores_best: {}
    } as SdvxDataExport;
  })

export const sdvxRoutes = router.routes();
