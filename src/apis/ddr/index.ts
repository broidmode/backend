import { Logger } from "@cordisjs/logger";
import Router from "@koa/router";
import { Context } from "../index.js";
import { UserService } from "../../services/ddr/user.js";

const logger = new Logger('ddr-api');
const router = new Router({
  prefix: '/ddr',
})

  .get('/profile/:token', async (ctx: Context) => {
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    logger.info('request profile %s', token);
    const playData = await ctx.resolve(UserService).findPlayData(token);

    ctx.status = playData ? 200 : 404;
    ctx.body = playData ? { profile: playData } : {};
  })

  .get('/scores/:token', async (ctx: Context) => {
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    logger.info('request scores %s', token);
    const musicDatas = await ctx.resolve(UserService).findMusicDatas(token);

    ctx.status = 200;
    ctx.body = {
      scores: musicDatas,
    };
  })

  .get('/playlog/:token', async (ctx: Context) => {
    let { skip, limit } = ctx.query;
    const { token } = ctx.params;

    if (!token) {
      ctx.status = 400;
      return;
    }

    if (skip instanceof Array) {
      [skip] = skip;
    }

    if (limit instanceof Array) {
      [limit] = limit;
    }

    const skipNum = skip ? parseInt(skip) : 0;
    const limitNum = limit ? parseInt(limit) : 50;

    logger.info('request playlog %s skip=%d limit=%d', token, skipNum, limitNum);
    const records = await ctx.resolve(UserService).playRecordCol
      .find({ player: token })
      .sort({ playtime: -1 })
      .skip(skipNum)
      .limit(limitNum)
      .toArray();

    ctx.status = 200;
    ctx.body = {
      playLogs: records,
    };
  });

export const ddrRoutes = router.routes();
